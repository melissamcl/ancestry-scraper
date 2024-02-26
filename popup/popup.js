document.addEventListener('DOMContentLoaded', () => {
  const sendMessage = (action) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: action },
        function (response) {
          console.log(`Message sent: ${action}`);
        }
      );
    });
  };

  const scrapeBtn = document.getElementById('scrapeBtn');
  scrapeBtn.addEventListener('click', () => {
    console.log('Scrape button clicked');
    sendMessage('scrapeMatches');
  });

  const addToTreeBtn = document.getElementById('addToTreeBtn');
  addToTreeBtn.addEventListener('click', () => {
    sendMessage('addMatchToTree');
  });
});
