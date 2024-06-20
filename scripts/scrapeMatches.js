async function fetchDataWithRetries(url) {
  let retries = 0;
  const maxRetries = 3;
  let delayRange = [2000, 5000]; // Initial delay range 1-3s

  while (retries < maxRetries) {
    let delay =
      Math.floor(Math.random() * (delayRange[1] - delayRange[0] + 1)) +
      delayRange[0];

    await new Promise((resolve) => setTimeout(resolve, delay));

    try {
      let response = await fetch(url);
      let data = await response.json();
      return data;
    } catch (error) {
      retries++;

      // Increase the delay range for the next retry
      delayRange = [delayRange[0] * 2, delayRange[1] * 2]; // Double the range
    }
  }

  throw new Error('Failed to fetch data after max retries'); // Throw error if max retries reached
}

// TODO: add check for match added date for periodic scrapes (sory by date?)
// &closematches=true &sortby=DATE
// add dropdown with query options?
// TODO: add some functionality to allow pausing script and picking up later
// add download option to popup to get matches earlier
//  add and trigger a listener at the end of for loop
//  export txt file containing options to pick up where it left off next time / figure out how to integrate
// TODO: add visible progress bar that updates

async function scrapeMatches(testId) {
  console.log(`Scrape matches function running for test ${testId}`);

  // get user details for inclusion in jsons
  const userDetails = await fetchDataWithRetries(
    `https://www.ancestry.com/discoveryui-matchesservice/api/samples/${testId}/details`
  );
  const { displayName, userId } = userDetails;

  async function getMatches(
    relationguid = undefined,
    matches = [],
    bookmarkData = undefined
  ) {
    let url = `https://www.ancestry.com/discoveryui-matchesservice/api/samples/${testId}/matches/list?sortby=RELATIONSHIP`;

    // handle mutual matches request
    if (relationguid) {
      url = `${url}&relationguid=${relationguid}`;
    }

    // handle recursive call by going to correct bookmark point in data
    if (bookmarkData) {
      url = `${url}&bookmarkdata=${bookmarkData}`;
    }
    // console.log(url);

    // fetch data (add timestamp for api/caching)
    const unixTime = Math.floor(Date.now() / 1000);
    let data = await fetchDataWithRetries(`${url}&_t=${unixTime}`);

    // extract matches from result
    for (const matchGroup of data.matchGroups) {
      matches = matches.concat(matchGroup.matches);
    }

    // set next bookmark and call recursively, or return result if no more matches
    if (
      data.bookmarkData &&
      data.bookmarkData.moreMatchesAvailable &&
      data.bookmarkData.lastMatchesServicePageIdx < 1
      // && data.matchGroups[0].matches[0].relationship.sharedCentimorgans < 1000
    ) {
      const bookmarkData = JSON.stringify(data.bookmarkData);
      console.log(data.bookmarkData.lastMatchesServicePageIdx);

      return await getMatches(relationguid, matches, bookmarkData);
    } else {
      console.log('done scraping');
      return matches;
    }
  }

  // parse all matches from an array of matches
  function parseData(matches) {
    // parse out relevant pieces of data for export

    let matchesForExport = [];

    if (matches && matches.length) {
      for (const match of matches) {
        const {
          displayName,
          userId,
          adminDisplayName,
          adminUcdmId,
          testGuid,
          subjectGender,
          relationship,
          createdDate,
          tags,
          note,
          maternal,
          paternal,
          mothersSide,
          fathersSide,
          relationshipLabel,
        } = match;

        const matchForExport = {
          name: displayName,
          userId: userId,
          adminName: adminDisplayName,
          adminId: adminUcdmId,
          testId: testGuid,
          gender: subjectGender,
          dna: relationship,
          createdDate: createdDate,
          tags: tags,
          note: note,
          calculatedMaternal: maternal,
          calculatedPaternal: paternal,
          userLabeledMaternal: mothersSide,
          userLabeledPaternal: fathersSide,
          relationshipLabel: relationshipLabel,
        };

        matchesForExport.push(matchForExport);
      }
    }
    return matchesForExport;
  }

  // get primary match data
  try {
    const primaryMatches = await getMatches();
    const primaryMatchesForExport = {
      matchId: testId, //match.testGuid,
      matches: parseData(primaryMatches),
    };

    downloadMatches(primaryMatchesForExport, displayName, userId, testId);

    // Function to send the guids to the background script
    chrome.runtime.sendMessage({
      action: 'getMutualMatches',
      guid1: testId,
      guid2: primaryMatches[0].testGuid,
    });

    // get mutual matches
    // const mutualMatches = [];
    // let i = 0;
    // for (const match of primaryMatches) {
    //   if (i >= 3) {
    //     break;
    //   }
    //   console.log(`${++i} ${match.displayName}`);
    //   try {
    //     const mutualMatchData = await getMatches(match.testGuid);
    //     mutualMatches.push({
    //       matchId: match.testGuid,
    //       matches: parseData(mutualMatchData),
    //     });
    //   } catch (error) {
    //     console.error('Error while getting mutual matches:', error);
    //   }
    // }

    // console.log(mutualMatches);

    // downloadMatches(
    //   mutualMatches,
    //   displayName,
    //   userId,
    //   testId,
    //   'mutual_matches'
    // );
  } catch (error) {
    console.error('Error while getting matches:', error);
  }
}

function downloadMatches(matches, name, userId, testId, description = '') {
  console.log('Download matches started');

  if (description) {
    description = `_${description}`;
  }
  const matchObj = {
    name: name,
    userId: userId,
    testId: testId,
    matches: matches,
  };

  downloadJSON(matches, `${name}${description}`);

  // const json = JSON.stringify(matches);

  // const blob = new Blob([json], { type: 'application/json' });
  // const url = URL.createObjectURL(blob);

  // // Create a download link and click it to trigger the download
  // const a = document.createElement('a');
  // a.href = url;
  // a.download = `${name}${description}.json`;
  // document.body.appendChild(a);
  // a.click();

  // // Clean up
  // document.body.removeChild(a);
  // URL.revokeObjectURL(url);
}
