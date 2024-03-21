// This script gets injected into any opened page
// whose URL matches the pattern defined in the manifest
// (see "content_script" key).
// Several foreground scripts can be declared
// and injected into the same or different pages.

const downloadJSON = (obj, filename) => {
  console.log('downloading json');
  const json = JSON.stringify(obj);

  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  // Create a download link and click it to trigger the download
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.json`;
  document.body.appendChild(a);
  a.click();

  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // message from Scrape matches button in popup
  if (message.action === 'scrapeMatches') {
    console.log('Scrape matches message received, calling function');
    scrapeMatches(message.args[0]);
  }

  // message from Parse gedcom button in popup
  else if (message.action === 'parseGedcom') {
    console.log('Parse gedcom message received, calling function');
    // call parse gedcom with gedcom file reference and file name
    parseGedcom(message.args[0], message.args[1]);
  }

  // message from Get match button in popup
  else if (message.action === 'openMatch') {
    console.log('Open match message received, calling function');
    // call get match with test ids array as input
    openMatch(message.args[0]);
  }

  // message from Add match button in popup
  else if (message.action === 'addMatchToTree') {
    console.log('Add match to tree message received, calling function');
    const treeId = '195521292';
    const url = `https://www.ancestry.com/family-tree/tree/${treeId}`;

    chrome.runtime.sendMessage({
      action: 'openLinkAndExecuteScript',
      url: url,
      script: 'addMatchToTree',
    });
  }
});
