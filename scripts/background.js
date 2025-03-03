chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.title) {
        const title = request.title;
        
        chrome.windows.getCurrent({ populate: true }, (window) => {
            const urls = window.tabs.filter(t => !t.url.startsWith("chrome://"));
            console.log(urls);
            
            const currentUrls = urls.map(t => ({ url: t.url, favIconUrl: t.favIconUrl, title: t.title }));

            console.log(currentUrls);
            chrome.storage.local.get([title], (result) => {
                console.log("Stored Data:", result);

                // Ensure the stored result is an array
                const storedUrls = Array.isArray(result[title]) ? result[title] : [];

                // Filter out duplicates
                const filterResults = storedUrls.filter(t => !currentUrls.some(c => c.url === t.url));
                const value = [...filterResults, ...currentUrls];

                chrome.storage.local.set({ [title]: value }, () => {
                    console.log("Data saved:", title, value);
                    sendResponse({ success: true }); // Move inside callback
                });
            });
        });

        return true; // Keeps the async listener alive
    }
});
