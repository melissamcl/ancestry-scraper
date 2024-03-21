// This is the service worker script, which executes in its own context
// when the extension is installed or refreshed (or when you access its console).
// It would correspond to the background script in chrome extensions v2.

// Importing and using functionality from external files is also possible.
// If you want to import a file that is deeper in the file hierarchy of your
// extension, simply do `importScripts('path/to/file.js')`.
// The path should be relative to the file `manifest.json`.

console.log('Background script running');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openLink') {
    chrome.tabs.create({ url: message.url });
  }

  // open in new tab and run script
  else if (message.action === 'openLinkAndExecuteScript') {
    let { url, script, args } = message;

    chrome.tabs.create({ url: url }, function (newTab) {
      chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
        if (tabId === newTab.id && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener); // Remove the listener
          console.log(`sending message execute_${script}`);
          chrome.tabs.sendMessage(newTab.id, {
            action: `execute_${script}`,
            args: args,
          });
        }
      });
    });

    return true;
  }
});
