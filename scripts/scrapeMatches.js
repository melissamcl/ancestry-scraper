const { isIterable } = require('es-iter');

async function fetchData(url) {
  try {
    let response = await fetch(url);
    let data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching JSON:', error);
    return null;
  }
}

async function scrapeMatches(testId) {
  console.log(`Scrape matches function running for test ${testId}`);

  // get user details for inclusion in jsons
  const userDetails = await fetchData(
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

    // fetch data (add timestamp for api/caching)
    const unixTime = Math.floor(Date.now() / 1000);
    let data = await fetchData(`${url}&_t=${unixTime}`);

    // extract matches from result
    for (const matchGroup of data.matchGroups) {
      matches = matches.concat(matchGroup.matches);
    }

    // set next bookmark and call recursively, or return result if no more matches
    if (
      data.bookmarkData &&
      data.bookmarkData.moreMatchesAvailable &&
      data.bookmarkData.lastMatchesServicePageIdx < 1
    ) {
      const bookmarkData = JSON.stringify(data.bookmarkData);
      console.log(data.bookmarkData.lastMatchesServicePageIdx);

      // add delay to avoid api issues:
      const delay = Math.floor(Math.random() * 3000) + 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return await getMatches(relationguid, matches, bookmarkData);
    } else {
      return matches;
    }
  }

  function parseData(matches) {
    // parse out relevant pieces of data for export
    let matchesForExport = [];

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

    return matchesForExport;
  }

  // get primary match data
  try {
    const primaryMatches = await getMatches();
    const primaryMatchesForExport = parseData(primaryMatches);
    downloadMatches(primaryMatchesForExport, displayName, userId, testId);

    // get mutual matches
    const mutualMatches = [];
    for (const match of primaryMatches) {
      console.log(`processing match ${match.displayName}`);
      const mutualMatchData = await getMatches(match.testGuid);
      mutualMatches.push({
        mutualMatchId: match.testId,
        matches: mutualMatchData,
      });
    }

    // TODO: refactor parseData to work with mutualMatches format
    const mutualMatchesForExport = parseData(mutualMatches);
    downloadMatches(
      mutualMatchesForExport,
      displayName,
      userId,
      testId,
      'mutual_matches'
    );
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

  const json = JSON.stringify(matches);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  // Create a download link and click it to trigger the download
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}${description}.json`;
  document.body.appendChild(a);
  a.click();

  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
