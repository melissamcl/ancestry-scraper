// This is the service worker script, which executes in its own context
// when the extension is installed or refreshed (or when you access its console).
// It would correspond to the background script in chrome extensions v2.

// Importing and using functionality from external files is also possible.
// If you want to import a file that is deeper in the file hierarchy of your
// extension, simply do `importScripts('path/to/file.js')`.
// The path should be relative to the file `manifest.json`.

console.log('Background script running');

// listen for message to update url
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateUrl') {
    console.log('update url message received');
    const { url, minCm, maxCm } = message;
    const newUrl = `${url}?minshareddna=${minCm}&maxshareddna=${maxCm}`;

    chrome.tabs.update(sender.tab.id, { url: newUrl });

    return true;
  }
});

// once URL changes and page is loaded, send message to scrape matches
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      // only send if there are min/max and before scrolling
      if (tab && tab.url && tab.url.indexOf('?') > -1) {
        chrome.tabs.sendMessage(tabId, { action: 'scrapeMatches' });
        console.log('url updated, scrape matches message sent');
        incrementCounter();
        console.log(`Counter value: ${counter}`);
      }
    });
  }
});
