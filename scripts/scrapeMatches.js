// TODO: Set shared DNA filter

export function scrapeMatches() {
  scrollToBottom(() => {
    console.log('Reached bottom of page');
    checkForMatchEntries();
  });

  function scrollToBottom(callback) {
    let lastHeight = 0;
    let timeoutId = null;
    const interval = setInterval(() => {
      window.scrollTo(0, document.body.scrollHeight);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        const newHeight = document.body.scrollHeight;
        if (newHeight === lastHeight) {
          clearInterval(interval);
          callback();
        } else {
          lastHeight = newHeight;
        }
      }, 0); // Adjust the timeout as needed
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
