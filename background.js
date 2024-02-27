// This is the service worker script, which executes in its own context
// when the extension is installed or refreshed (or when you access its console).
// It would correspond to the background script in chrome extensions v2.

// Importing and using functionality from external files is also possible.
// If you want to import a file that is deeper in the file hierarchy of your
// extension, simply do `importScripts('path/to/file.js')`.
// The path should be relative to the file `manifest.json`.

console.log('Background script running');

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.message === 'updateUrl') {
    const { minCm, maxCm, url } = message;
    const newUrl = `${url}?minshareddna=${minCm}&maxshareddna=${maxCm}`;

    console.log('new url', newUrl);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];

      chrome.tabs.update(currentTab.id, { url: newUrl });
    });
  }
});