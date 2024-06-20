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

async function openMatch(testIds) {
  const els = document.getElementsByClassName('preferredEventDna');
  if (els && els[0]) {
    const matchId =
      els[0].getElementsByClassName('userCardComment')[0].innerText;

    for (const testId of testIds) {
      const matchData = await fetchData(
        `https://www.ancestry.com/discoveryui-geneticfamilyservice/api/probability/${testId}/to/${matchId}`
      );

      console.log('matchData fetched', matchData);
      // if matchData exists, open link in new tab
      if (matchData && Object.keys(matchData).length > 0) {
        chrome.runtime.sendMessage({
          action: 'openLink',
          url: `https://www.ancestry.com/discoveryui-matches/compare/${testId}/with/${matchId}`,
        });
      } else {
        console.log('no match');
      }
    }
  }
}
