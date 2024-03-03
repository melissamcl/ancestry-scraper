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
    downloadMatchesAndResetUrl();
    return;
  }
  // This batching logic attempts to load 500-1000 matches at a time
  // if current min is > 20, reduce new min by 5, but don't go below minCmInput (range 25-30)
  else if (minCmApplied > 25) {
    newMaxCm = minCmApplied - 1;
    newMinCm = Math.max(minCmInput, minCmApplied - 5);
  }
  // if current min is 20-24, ranges 23-24, 21-22
  else if (minCmApplied > 20) {
    newMaxCm = minCmApplied - 1;
    newMinCm = Math.max(minCmInput, minCmApplied - 2);
  }
  // if current min is 20 or below, reduce by 1cm at a time
  else if (minCmApplied <= 20) {
    newMinCm = minCmApplied - 1;
    newMaxCm = newMinCm;
  }

  // get page title for match name
  const matchListName = document
    .getElementsByClassName('pageTitle')[0]
    .innerText.replace("'s DNA Matches", '');

  // send message to bg to update url
  chrome.runtime.sendMessage({
    action: 'updateUrl',
    url: matchListUrl,
    minCm: newMinCm,
    maxCm: newMaxCm,
    minCmInput: minCmInput,
    matchListName: matchListName,
  });
}

function scrapeMatches() {
  console.log('Message received to scrape matches');

  function loadMatches() {
    const matches = document.getElementsByClassName('matchGrid');
    console.log('matches count:', matches.length);
    // TODO: if no matches found proceed
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
    const maxCount = 5; // Max attempts before determining end of page has been reached
    const interval = setInterval(() => {
      window.scrollTo(0, document.body.scrollHeight);
      const newHeight = document.body.scrollHeight;
      // check for "Our backend services are overtaxed..." warning and stop
      const matchWarning = document.getElementsByClassName('noMatchDisplay');

      if (newHeight === lastHeight && matchWarning.length === 0) {
        count++;
        console.log('scroll attempts', count);
        if (count >= maxCount) {
          clearInterval(interval);
          callback();
        } else if (matchWarning.length > 0) {
          // handle error - can we reset without losing previously stored matches?
          console.log('Ancestry error');
        }
      } else {
        lastHeight = newHeight;
        count = 0; // Reset count
      }
    }, 800); // Adjust the interval as needed
  }

  function getMatches() {
    const matches = document.querySelectorAll('.matchGrid');
    const matchInfo = [];

    if (matches.length > 0) {
      console.log('Match entries found:', Array.from(matches));
    } else {
      console.log('No match entries found');
    }

    for (const match of matches) {
      const matchId = match.id.substring(5);
      const fullName = match.childNodes[0].innerText.split('\n');
      const name = fullName[0];
      let manager = '';
      if (fullName[1]) {
        manager = fullName[1].replace('Managed by ', '');
      }
      const relationship = match.childNodes[3].childNodes[0].innerText;
      const sharedDNA =
        match.childNodes[3].childNodes[2].innerText.split(' cM | ');
      const sharedCm = sharedDNA[0].replace(',', '');
      const sharedPercent = sharedDNA[1].replace('% shared DNA', '');
      const side = match.childNodes[3].childNodes[5].innerText;
      const trees = match.childNodes[4].children[0].innerText;
      let commonAncestor = false;
      if (match.childNodes[4].children[1]) {
        commonAncestor = true;
      }
      const notes = match.childNodes[7].innerText;
      let tags = [];
      if (match.childNodes[8].childNodes[0].childNodes[1].children[0]) {
        for (const child of match.childNodes[8].childNodes[0].childNodes[1]
          .children) {
          tags.push(child.ariaLabel.replace('In group ', ''));
        }
      }

      matchInfo.push({
        id: matchId,
        name: name,
        manager: manager,
        relationship: relationship,
        sharedCm: sharedCm,
        sharedPercent: sharedPercent,
        side: side,
        trees: trees,
        commonAncestor: commonAncestor,
        notes: notes,
        tags: tags,
      });
    }

    // send message to bg to store matches
    chrome.runtime.sendMessage({
      action: 'storeMatches',
      matches: matchInfo,
    });

    console.log(matchInfo);
  }

  return new Promise((resolve, reject) => {
    loadMatches();
    scrollToBottom(() => {
      console.log('Reached bottom of page');
      getMatches();
      resolve();
    });
  });
}

function downloadMatchesAndResetUrl() {
  const url = window.location.href;
  const matchListUrl = url.split('?')[0];

  console.log('Download matches started');
  chrome.runtime.sendMessage(
    { action: 'getAllMatches', url: matchListUrl },
    (response) => {
      console.log('download message sent');
      if (response && response.matchList) {
        const json = JSON.stringify(response.matchList);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // Create a download link and click it to trigger the download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'matchList.json';
        document.body.appendChild(a);
        a.click();

        // Clean up
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }
  );
}
