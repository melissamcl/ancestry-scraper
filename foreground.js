// This script gets injected into any opened page
// whose URL matches the pattern defined in the manifest
// (see "content_script" key).
// Several foreground scripts can be declared
// and injected into the same or different pages.

function updateUrl(minCmInput) {
  const url = window.location.href;

  // extract parameters from url if list is already filtered
  const matchListUrl = url.split('?')[0];
  const urlParams = new URLSearchParams(url.split('?')[1]);
  const minCmApplied = urlParams.get('minshareddna');
  const maxCmApplied = urlParams.get('maxshareddna');

  // stop recursion at the max of 6 or minCmInput
  const stopAtCm = Math.max(6, minCmInput);

  // update parameters accordingly
  // initialize parameters for first filter
  if (!minCmApplied && !maxCmApplied) {
    newMinCm = Math.max(minCmInput, 30);
    newMaxCm = 3490;
  }
  // if max of minCmApplied/maxCmApplied <= stopAtCm, stop
  // maxCm may be null when the max is really 3490
  else if (Math.max(minCmApplied, maxCmApplied) <= stopAtCm) {
    return;
  }
  // This batching logic attempts to load 500-1000 matches at a time
  // if current min is > 20, reduce new min by 5, but don't go below minCmInput
  else if (minCmApplied > 20) {
    newMaxCm = minCmApplied - 1;
    newMinCm = Math.max(minCmInput, minCmApplied - 5);
  }
  // if current min is 20 or below, reduce by 1cm at a time
  else if (minCmApplied <= 20) {
    newMinCm = minCmApplied - 1;
    newMaxCm = newMinCm;
  }

  // send message to bg to update url
  chrome.runtime.sendMessage({
    action: 'updateUrl',
    url: matchListUrl,
    minCm: newMinCm,
    maxCm: newMaxCm,
    minCmInput: minCmInput,
  });
}

function scrapeMatches() {
  console.log('Message received to scrape matches');

  function loadMatches() {
    const matches = document.getElementsByClassName('matchGrid');
    console.log('matches count:', matches.length);
    if (matches.length >= 100) {
      console.log('Matches loaded');
      return true;
    }

    setTimeout(function () {
      loadMatches();
    }, 1000);
  }

  function scrollToBottom(callback) {
    let lastHeight = 0;
    let count = 0;
    const maxCount = 3; // Max attempts before determining end of page has been reached
    const interval = setInterval(() => {
      window.scrollTo(0, document.body.scrollHeight);
      const newHeight = document.body.scrollHeight;
      if (newHeight === lastHeight) {
        count++;
        if (count >= maxCount) {
          clearInterval(interval);
          callback();
        }
      } else {
        lastHeight = newHeight;
        count = 0; // Reset count
      }
    }, 1000); // Adjust the interval as needed
  }

  function checkForMatchEntries() {
    const matchEntries = document.querySelectorAll('.matchGrid');
    if (matchEntries.length > 0) {
      console.log('Match entries found:', Array.from(matchEntries));
    } else {
      console.log('No match entries found');
    }

    for (const matchEntry of matchEntries) {
      const matchId = matchEntry.id.substring(5);
      const fullName = matchEntry.childNodes[0].innerText.split('\n');
      const name = fullName[0];
      let manager = '';
      if (fullName[1]) {
        manager = fullName[1].replace('Managed by ', '');
      }
      const relationship = matchEntry.childNodes[3].childNodes[0].innerText;
      const sharedDNA =
        matchEntry.childNodes[3].childNodes[2].innerText.split(' cM | ');
      const sharedCM = sharedDNA[0].replace(',', '');
      const sharedPercent = sharedDNA[1].replace('% shared DNA', '');
      const side = matchEntry.childNodes[3].childNodes[5].innerText;
      const trees = matchEntry.childNodes[4].children[0].innerText;
      let commonAncestor = false;
      if (matchEntry.childNodes[4].children[1]) {
        commonAncestor = true;
      }
      const notes = matchEntry.childNodes[7].innerText;
      let tags = [];
      if (matchEntry.childNodes[8].childNodes[0].childNodes[1].children[0]) {
        for (const child of matchEntry.childNodes[8].childNodes[0].childNodes[1]
          .children) {
          tags.push(child.ariaLabel.replace('In group ', ''));
        }
      }

      // if number of matches in previous batch is modular 100 redo it (just keep going without changing url?)
      //  in this case if the number still doesn't change after continuing assume it is correct

      console.log(
        `
        id: ${matchId},
        name: ${name},
        manager: ${manager},
        relationship: ${relationship},
        sharedCM: ${sharedCM},
        shared%: ${sharedPercent},
        side: ${side},
        trees: ${trees},
        commonAncestor: ${commonAncestor},
        notes: ${notes}
        tags: ${tags}
        `
      );
    }
  }

  loadMatches();
  scrollToBottom(() => {
    console.log('Reached bottom of page');
    checkForMatchEntries();
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // message from Scrape matches button in popup
  if (message.action === 'updateUrl') {
    console.log('Scrape matches pressed, updating URL');
    const minCmInput = message.args[0];
    updateUrl(minCmInput);
  }
  // message following url update from background
  else if (message.action === 'scrapeMatches') {
    console.log('Url updated, scraping matches');
    scrapeMatches();
  }

  // // message from Add match button in popup
  // else if (message.action === 'addMatchToTree') {
  //   addMatchToTree();
  // }
});
