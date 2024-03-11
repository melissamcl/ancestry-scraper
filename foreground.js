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

  // message from Parse gedcom button in popup
  else if (message.action === 'parseGedcom') {
    console.log('Parse gedcom message received, calling function');
    parseGedcom(message.args[0]);

    // const reader = new FileReader();
    // reader.onload = function (e) {
    //   const gedcomData = e.target.result;
    //   const parsedData = parseGedcom(gedcomData);
    //   document.getElementById('output').textContent = JSON.stringify(
    //     parsedData,
    //     null,
    //     2
    //   );
    // };
    // reader.readAsText(file);
  }

  // // message from Add match button in popup
  // else if (message.action === 'addMatchToTree') {
  //   addMatchToTree();
  // }
});
