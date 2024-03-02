// This script gets injected into any opened page
// whose URL matches the pattern defined in the manifest
// (see "content_script" key).
// Several foreground scripts can be declared
// and injected into the same or different pages.

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // message from Scrape matches button in popup
  if (message.action === 'updateUrl') {
    console.log('Scrape matches pressed, updating URL');
    const minCmInput = message.args[0];
    updateUrl(minCmInput);
  }
  // message following url update from background
  else if (message.action === 'scrapeMatches') {
    async function scrapeAndDownloadMatches() {
      console.log('Url updated, scraping matches');
      await scrapeMatches();

      console.log('Running download matches');
      downloadMatchesAndResetUrl();
    }

    scrapeAndDownloadMatches();
  }

  // // message from Add match button in popup
  // else if (message.action === 'addMatchToTree') {
  //   addMatchToTree();
  // }
});
