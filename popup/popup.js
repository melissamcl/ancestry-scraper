async function populateTests() {
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

  async function populateDropdown(url) {
    let data = await fetchData(url);
    if (data) {
      let dropdown = document.getElementById('testDropdown');
      let samples = data.samples.complete;
      samples.forEach(function (item) {
        let option = document.createElement('option');
        option.text = item.displayName;
        option.value = item.testGuid;
        dropdown.add(option);
      });
    }
  }

  // URL to fetch JSON data
  let url = 'https://www.ancestry.com/discoveryui-matchesservice/api/samples/';

  // Populate the dropdown
  populateDropdown(url);
}
populateTests();

document.addEventListener('DOMContentLoaded', () => {
  const sendMessage = (action, ...args) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action, args });
    });
  };

  const scrapeBtn = document.getElementById('scrapeBtn');
  scrapeBtn.addEventListener('click', () => {
    console.log('Scrape button clicked');
    let dropdown = document.getElementById('testDropdown');
    sendMessage('scrapeMatches', dropdown.value);
  });

  const parseGedBtn = document.getElementById('parseGedBtn');
  parseGedBtn.addEventListener('click', () => {
    console.log('Parse gedcom button clicked');
    let fileInput = document.getElementById('gedInput');
    let file = fileInput.files[0];
    if (file) {
      let reader = new FileReader();
      reader.onload = function (event) {
        let gedcomData = event.target.result;
        sendMessage('parseGedcom', gedcomData);
      };
      reader.readAsText(file);
    } else {
      console.error('No file selected.');
    }
  });

  // const mutualMatchesBtn = document.getElementById('mutualMatchesBtn');
  // scrapeBtn.addEventListener('click', () => {
  //   console.log('Mutual matches button clicked');
  //   sendMessage('scrapeMutualMatches');
  // });

  // const addToTreeBtn = document.getElementById('addToTreeBtn');
  // addToTreeBtn.addEventListener('click', () => {
  //   sendMessage('addMatchToTree');
  // });
});
