document.addEventListener('DOMContentLoaded', () => {
  const sendMessage = (action, ...args) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action, args });
    });
  };

  const scrapeBtn = document.getElementById('scrapeBtn');
  scrapeBtn.addEventListener('click', () => {
    const minCmInput = document.getElementById('minCmInput').value;
    console.log('Scrape button clicked');
    console.log('min cm input:', minCmInput);
    sendMessage('updateUrl', minCmInput);
    // TODO: add disabled download button and max input to handle backend servers taxed message
    // auto download on that message?
  });

  const mutualMatchesBtn = document.getElementById('mutualMatchesBtn');
  scrapeBtn.addEventListener('click', () => {
    console.log('Mutual matches button clicked');
    sendMessage('scrapeMutualMatches');
  });

  // const addToTreeBtn = document.getElementById('addToTreeBtn');
  // addToTreeBtn.addEventListener('click', () => {
  //   sendMessage('addMatchToTree');
  // });
});
