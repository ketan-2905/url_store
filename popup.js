const body = document.querySelector("body")
const theme = document.querySelector(".theme")

function handleThemeChange(){
    body.classList.toggle("dark")
    body.classList.toggle("light")
}

theme.addEventListener("click",handleThemeChange)

const input = document.getElementById("urls-group-title")
const inputButton = document.getElementById("input-btn")
const titleList = document.getElementById("title-list")


inputButton.addEventListener("click", function () {
    if(input.value){
        chrome.runtime.sendMessage({ title: input.value });
        input.value = ''

        chrome.storage.local.get(null, (result) => {
            const urlsTitle = document.getElementById('urls-titles'); // Assuming you have a container element
            
            // Clear existing content
            urlsTitle.innerHTML = '';
            
            // Process each key in the result
            Object.keys(result).forEach(key => {
                const data = result[key];
                console.log(data);
                
                // Create the title element
                const titleDiv = document.createElement('div');
                titleDiv.className = 'title';
                
                // Create the title name element
                const titleNameDiv = document.createElement('div');
                titleNameDiv.className = 'title-name';
                titleNameDiv.textContent = key + ' ';
                
                // Create the dropdown button
                const dropdownButton = document.createElement('button');
                dropdownButton.className = 'btn dropdown';
                titleNameDiv.appendChild(dropdownButton);
                
                // Create the title list
                const titleList = document.createElement('ul');
                titleList.className = 'title-list';
                
                // Process each item in the array
                if (Array.isArray(data)) {
                    data.map((item, index) => {
                        const listItem = document.createElement('li');
                        
                        // Create favicon image
                        const faviconImg = document.createElement('img');
                        faviconImg.src = item.favIconUrl
                        faviconImg.className = 'favicon';
                        
                        // Create the title div
                        const itemTitleDiv = document.createElement('div');
                        itemTitleDiv.className = 'title';
                        itemTitleDiv.textContent = item.url;
                        
                        // Create remove button
                        const removeButton = document.createElement('button');
                        removeButton.className = 'btn remove';
                        
                        // Append elements to list item
                        listItem.appendChild(faviconImg);
                        listItem.appendChild(itemTitleDiv);
                        listItem.appendChild(removeButton);
                        
                        // Append list item to title list
                        titleList.appendChild(listItem);
                    });
                }
                
                // Assemble the title element
                titleDiv.appendChild(titleNameDiv);
                titleDiv.appendChild(titleList);
                
                // Add the complete element to the container
                urlsTitle.appendChild(titleDiv);
            });
        });       
        return
    }
    return
  });
  