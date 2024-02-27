// TODO: Set shared DNA filter

function scrapeMatches(minCmInput) {
  console.log('scrapeMatches start');
  const matchListUrl = window.location.href;

  // const allMatches = [];
  // const currBatch = [];

  filterMatches(minCmInput);

  function filterMatches(minCmInput, minCm = 30, maxCm = 3490) {
    console.log('filter matches minCm:', minCmInput);

    // base case: once minCm <= to min input, stop
    if (maxCm < minCmInput) {
      // process match list array
      console.log('matches processed');
    }

    // recursive case: reduce max/min and repeat
    else if (maxCm >= minCmInput) {
      minCm = Math.max(minCm, minCmInput);

      chrome.runtime.sendMessage({
        message: 'updateUrl',
        url: matchListUrl,
        minCm: minCm,
        maxCm: maxCm,
      });

      window.addEventListener('load', () => {
        console.log('content loaded');
        scrollToBottom(() => {
          console.log('Reached bottom of page');
          checkForMatchEntries();
        });

        // recursively call filterMatches
        let newMinCm;
        let newMaxCm;
        if (minCm > 20) {
          newMinCm = minCm - 5;
          newMaxCm = newMinCm + 4;
        } else {
          newMinCm = minCm - 1;
          newMaxCm = newMinCm;
        }

        filterMatches(minCmInput, newMinCm, newMaxCm);
      });
    }

    console.log('filter matches done');
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
}
