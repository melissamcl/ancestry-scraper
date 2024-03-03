// This script gets injected into any opened page
// whose URL matches the pattern defined in the manifest
// (see "content_script" key).
// Several foreground scripts can be declared
// and injected into the same or different pages.

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // message from Scrape matches button in popup
  if (message.action === 'scrapeMatches') {
    console.log('Scrape matches message received, calling function');
    scrapeMatches(message.args[0]);
  }

  // // message from Add match button in popup
  // else if (message.action === 'addMatchToTree') {
  //   addMatchToTree();
  // }
});
