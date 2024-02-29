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

// Once URL changes and page is loaded, send message to scrape matches
// function setupUrlUpdateListener() {
//   let messageSent = false;

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // if (changeInfo.status === 'complete' && !messageSent) {
  if (changeInfo.status === 'complete') {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tab.url.indexOf('?') > -1) {
        chrome.tabs.sendMessage(tabId, { action: 'scrapeMatches' });
        console.log('url updated, scrape matches message sent');
        // messageSent = true;
      }
    });
  }
  // else {
  //   messageSent = false;
  // }
});
// }
// setupUrlUpdateListener();

// chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
//   if (message.message === 'updateUrl') {
//     const { minCm, maxCm, url } = message;
//     const newUrl = `${url}?minshareddna=${minCm}&maxshareddna=${maxCm}`;

//     console.log('new url', newUrl);

//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//       const currentTab = tabs[0];
//       chrome.tabs.update(currentTab.id, { url: newUrl }, () => {
//         console.log('URL updated');
//       });

//       // Listen for the tab to finish loading
//       chrome.tabs.onUpdated.addListener(function listener(
//         tabId,
//         changeInfo,
//         updatedTab
//       ) {
//         if (tabId === currentTab.id && changeInfo.status === 'complete') {
//           // The tab has finished loading, so we can now send the response
//           console.log('Page reloaded with new URL');
//           sendResponse({ success: true });
//           console.log('response sent');

//           // Remove the listener to avoid multiple executions
//           chrome.tabs.onUpdated.removeListener(listener);
//         }
//       });
//     });

//     // Return true to indicate that sendResponse will be called asynchronously
//     return true;
//   }
// });
