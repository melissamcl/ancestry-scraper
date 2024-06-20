// This is the service worker script, which executes in its own context
// when the extension is installed or refreshed (or when you access its console).
// It would correspond to the background script in chrome extensions v2.

// Importing and using functionality from external files is also possible.
// If you want to import a file that is deeper in the file hierarchy of your
// extension, simply do `importScripts('path/to/file.js')`.
// The path should be relative to the file `manifest.json`.

console.log('Background script running');

// Listen for the extension being installed or updated
chrome.runtime.onInstalled.addListener(() => {
  // Add event listeners for debugger events and detachment
  chrome.debugger.onEvent.addListener(onEvent);
  chrome.debugger.onDetach.addListener(onDetach);
});

// Listen for messages from content scripts or other parts of the extension

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openLink') {
    let { url, close } = message;
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      const currentTab = tabs[0];
      const newIndex = currentTab.index + 1;

      if (close) {
        chrome.tabs.remove(currentTab.id);
      }

      chrome.tabs.create({ url: url, index: newIndex });
    });
  }

  // open in new tab and run script
  else if (message.action === 'openLinkAndExecuteScript') {
    let { url, script, args, close } = message;
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      const currentTab = tabs[0];
      const newIndex = currentTab.index + 1;

      if (close) {
        chrome.tabs.remove(currentTab.id);
      }

      chrome.tabs.create({ url: url, index: newIndex }, function (newTab) {
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
    });

    return true;
  }

  // download mutual matches by intercepting data from chrome debugger
  else if (message.action === 'getMutualMatches') {
    const { guid1, guid2 } = message;

    // Attach the debugger to the current tab
    chrome.debugger.attach({ tabId: sender.tab.id }, '1.0', () => {
      // Enable network monitoring
      chrome.debugger.sendCommand({ tabId: sender.tab.id }, 'Network.enable');

      // Navigate to the specific URL
      chrome.tabs.update(sender.tab.id, {
        url: `https://www.ancestry.com/discoveryui-matches/compare/${guid1}/with/${guid2}/matchesofmatches`,
      });
    });
  }
});

// Event handler for debugger events
function onEvent(debuggeeId, message, params) {
  if (message === 'Network.responseReceived') {
    const { response } = params;
    const matchListUrlPattern = new RegExp(
      `https://www.ancestry.com/discoveryui-matches/parents/list/api/matchList/.+/with/.+`
    );

    if (
      response.mimeType === 'application/json' &&
      matchListUrlPattern.test(response.url)
    ) {
      // Retrieve the response body for the matching request
      chrome.debugger.sendCommand(
        { tabId: debuggeeId.tabId },
        'Network.getResponseBody',
        { requestId: params.requestId },
        (responseBody) => {
          const blob = new Blob([responseBody.body], {
            type: 'application/json',
          });
          const url = URL.createObjectURL(blob);
          chrome.downloads.download({
            url: url,
            filename: getFileNameFromUrl(response.url), // Extract the filename from the URL
          });
        }
      );
    }
  }
}

// Helper function to extract the filename from a URL
function getFileNameFromUrl(url) {
  return url.split('/').pop().split('?')[0];
}

// Event handler for when the debugger is detached from the tab
function onDetach(debuggeeId) {
  console.log('Debugger detached from tab', debuggeeId.tabId);
}
