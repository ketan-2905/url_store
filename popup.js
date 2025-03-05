async function deleteUrl(key, title) {
  try {
    const result = await chrome.storage.local.get(null);

    if (!result[key]) {
      console.error("Key does not exist");
      return;
    }

    result[key] = result[key].filter((tab) => tab.title !== title);

    if (result[key].length > 0) {
      await chrome.storage.local.set({ [key]: result[key] });
    } else {
      await chrome.storage.local.remove(key);
    }

    render(await chrome.storage.local.get(null));
  } catch (error) {
    console.error("Error deleting URL:", error);
  }
}

function render(result, preservedStates = {}) {
  const urlsTitle = document.getElementById("urls-titles");
  urlsTitle.innerHTML = "";

  Object.entries(result).forEach(([key, data]) => {
    if (!Array.isArray(data)) return;

    const favIcons = [...new Set(data.map((item) => item.favIconUrl))];

    const titleDiv = document.createElement("div");
    titleDiv.className = `title ${preservedStates[key] ? 'show' : ''}`;
    titleDiv.innerHTML = `
        <div class="title-name" data-key="${key}">
          <div class="titlefav">${key} 
          <div class="favicons">${favIcons
            .map((favIcon) => `<img width="16" src=${favIcon}>`)
            .join("")}
          </div>
          </div>
          <div>
            <button class="btn open" aria-label="Open all tabs"></button>
            <button class="btn dropdown" aria-label="Toggle dropdown"></button>
          </div>
        </div>
        <ul class="title-list">
          ${data
            .map(
              (item) => `
            <li>
              <div class="favtitlediv" data-url="${item.url}">
                <img src="${item.favIconUrl}" class="favicon" alt="Favicon">
                <div class="title">${item.title}</div>
              </div>
              <button class="btn remove" aria-label="Remove tab"></button>
            </li>
          `
            )
            .join("")}
        </ul>
      `;

    urlsTitle.appendChild(titleDiv);
  });
}

function attachEventListeners() {
  const urlsTitle = document.getElementById("urls-titles");
  const preservedStates = {};

  urlsTitle.addEventListener("click", async (event) => {
    const openButton = event.target.closest(".btn.open");
    const dropdownButton = event.target.closest(".btn.dropdown");
    const removeButton = event.target.closest(".btn.remove");
    const tabItem = event.target.closest(".favtitlediv");
    const titleNameDiv = event.target.closest(".title-name");

    if (openButton) {
      const key = titleNameDiv.dataset.key;
      const tabs = await chrome.storage.local.get(null);
      await chrome.runtime.sendMessage({
        action: "createTabs",
        tabs: tabs[key],
      });
    }

    if (removeButton) {
      const listItem = removeButton.closest("li");
      const titleDiv = listItem.closest(".title");
      const key = titleDiv.querySelector(".title-name").dataset.key;
      const title = listItem.querySelector(".title").textContent;
      
      preservedStates[key] = titleDiv.classList.contains('show');
      
      await deleteUrl(key, title);
      
      render(await chrome.storage.local.get(null), preservedStates);
      return;
    }

    if (dropdownButton) {
      const titleDiv = dropdownButton.closest(".title");
      const key = titleDiv.querySelector(".title-name").dataset.key;
      
      titleDiv.classList.toggle("show");
      preservedStates[key] = titleDiv.classList.contains('show');

      if (titleDiv.classList.contains("show")) {
        dropdownButton.style.transform = "rotate(180deg)";
      } else {
        dropdownButton.style.transform = "rotate(0deg)";
      }
    }

    if (tabItem) {
      await chrome.runtime.sendMessage({
        action: "createTab",
        tab: tabItem.dataset.url,
      });
    }
  });

  document.querySelector(".theme").addEventListener("click", () => {
    document.body.classList.toggle("dark");
    document.body.classList.toggle("light");
  });

  const input = document.getElementById("urls-group-title");
  const inputButton = document.getElementById("input-btn");

  inputButton.addEventListener("click", async () => {
    if (input.value.trim()) {
      await chrome.runtime.sendMessage({ title: input.value.trim() });
      render(await chrome.storage.local.get(null));
      input.value = "";
    }
  });
}

function init() {
  chrome.storage.local.get(null, render);
  attachEventListeners();
}

document.addEventListener("DOMContentLoaded", init);