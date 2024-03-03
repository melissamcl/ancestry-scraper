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
  let matches = [];
  let matchesForExport = [];

  async function getNextBatch(url) {
    let data = await fetchData(url);

    for (const group of data.matchGroups) {
      matches = matches.concat(group.matches);
    }

    if (
      data.bookmarkData &&
      data.bookmarkData.moreMatchesAvailable &&
      data.bookmarkData.lastMatchesServicePageIdx < 10
    ) {
      const bookmarkData = JSON.stringify(data.bookmarkData);
      url = `https://www.ancestry.com/discoveryui-matchesservice/api/samples/${testId}/matches/list?bookmarkdata=${bookmarkData}&sortby=RELATIONSHIP`;

      console.log(data.bookmarkData.lastMatchesServicePageIdx);

      await getNextBatch(url);
    } else {
      return;
    }
  }

  let url = `https://www.ancestry.com/discoveryui-matchesservice/api/samples/${testId}/matches/list?page=1&sortby=RELATIONSHIP`;
  await getNextBatch(url);

  // parse out relevant pieces of data for export
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

  const userDetails = await fetchData(
    `https://www.ancestry.com/discoveryui-matchesservice/api/samples/${testId}/details`
  );

  const { displayName, userId } = userDetails;

  downloadMatches({
    name: displayName,
    userId: userId,
    testId: testId,
    matches: matchesForExport,
  });
}

function downloadMatches(matches) {
  console.log('Download matches started');
  const json = JSON.stringify(matches);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  // Create a download link and click it to trigger the download
  const a = document.createElement('a');
  a.href = url;
  a.download = `${matches.name}.json`;
  document.body.appendChild(a);
  a.click();

  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
