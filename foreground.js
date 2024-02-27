// This script gets injected into any opened page
// whose URL matches the pattern defined in the manifest
// (see "content_script" key).
// Several foreground scripts can be declared
// and injected into the same or different pages.

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'scrapeMatches') {
    console.log('scrapeMatches message received in foreground');
    const minCmInput = message.args[0];
    scrapeMatches(minCmInput);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'addMatchToTree') {
    addMatchToTree();
  }
});
