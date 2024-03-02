// This is the service worker script, which executes in its own context
// when the extension is installed or refreshed (or when you access its console).
// It would correspond to the background script in chrome extensions v2.

// Importing and using functionality from external files is also possible.
// If you want to import a file that is deeper in the file hierarchy of your
// extension, simply do `importScripts('path/to/file.js')`.
// The path should be relative to the file `manifest.json`.

console.log('Background script running');
// initialize variable as false to allow updateListener to fire once
let matchListUrlUpdated = false;

function messageListener() {
  matchList = [];

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // listen for message to update url
    if (message.action === 'updateUrl') {
      console.log('update url message received');
      const { url, minCm, maxCm } = message;
      const newUrl = `${url}?minshareddna=${minCm}&maxshareddna=${maxCm}`;

      // reset vatiable to false to allow updateListener to fire once in response to url filter change
      matchListUrlUpdated = false;

      chrome.tabs.update(sender.tab.id, { url: newUrl });

      return true;
    }
    // listen for message to store matches
    else if (message.action === 'storeMatches') {
      matchList = matchList.concat(message.matches);
      console.log(`Matches stored: ${matchList.length}`);
    }
    // listen for request to send matches
    else if (message.action === 'getAllMatches') {
      // reset url to top of list
      chrome.tabs.update(sender.tab.id, { url: message.url });
      sendResponse({ matches: matchList });
    }
  });
}

messageListener();

function updateListener(tabId, changeInfo, tab) {
  // once URL changes and page is loaded, send message to scrape matches
  if (
    !matchListUrlUpdated &&
    changeInfo.status === 'complete' &&
    tab.url &&
    tab.url.indexOf('?') > -1
  ) {
    chrome.tabs.sendMessage(tabId, { action: 'scrapeMatches' });

    // set variable to true so updateListener won't re-fire each time scrolling changes the url
    matchListUrlUpdated = true;
    console.log('url updated, scrape matches message sent');
  }
}

chrome.tabs.onUpdated.addListener(updateListener);
