async function getTabCount() {
    return new Promise((resolve, reject) => {
      try {
        chrome.tabs.query({ currentWindow: true }, (tabs) => {
          const validTabs = tabs.filter((tab) => !tab.url.startsWith("chrome://"));
          resolve(validTabs.length);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
  
  async function isTabPresent(targetUrl) {
    return new Promise((resolve) => {
      chrome.tabs.query({ currentWindow: true }, (tabs) => {
        const targetTab = tabs.find((tab) => tab.url.includes(targetUrl));
  
        if (targetTab) {
          chrome.tabs.update(targetTab.id, { active: true });
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }
  
  function deduplicateUrls(urls) {
    const seen = new Set();
    return urls.filter((obj) => {
      if (seen.has(obj.url)) return false;
      seen.add(obj.url);
      return true;
    });
  }
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.title) {
      chrome.windows.getCurrent({ populate: true }, (window) => {
        const urls = window.tabs.filter((t) => !t.url.startsWith("chrome://"));
        
        let currentUrls = urls.map((t) => ({
          url: t.url,
          favIconUrl: t.favIconUrl,
          title: t.title,
        }));
  
        currentUrls = deduplicateUrls(currentUrls);
  
        chrome.storage.local.get([request.title], (result) => {
          const storedUrls = Array.isArray(result[request.title]) ? result[request.title] : [];
  
          const filterResults = storedUrls.filter(
            (t) => !currentUrls.some((c) => c.url === t.url)
          );
          const value = [...filterResults, ...currentUrls];
  
          chrome.storage.local.set({ [request.title]: value }, () => {
            sendResponse({ success: true });
          });
        });
      });
  
      return true;
    }
  
    if (request.action === "createTab") {
      isTabPresent(request.tab).then((isPresent) => {
        if (isPresent) return;
  
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs.length > 0) {
            const currentTab = tabs[0];
            const tabCreateOptions = { 
              url: request.tab,
              ...(currentTab.url.startsWith("chrome://") ? {} : {})
            };
  
            chrome.tabs.create(tabCreateOptions, (newWindow) => {
              sendResponse({ success: true });
            });
          }
        });
      });
  
      return true;
    }
  
    if (request.action === "createTabs") {
      const urls = request.tabs.map((tab) => tab.url);
      getTabCount().then((count) => {
        if (count > 0) {
          chrome.windows.create(
            {
              url: urls,
              type: "normal",
            },
            (newWindow) => {
              sendResponse({ success: true });
            }
          );
        } else {
          urls.forEach((url) => {
            chrome.tabs.create({ url });
          });
        }
      });
  
      return true;
    }
  });