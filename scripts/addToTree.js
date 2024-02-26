chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'addMatchToTree') {
    const treeId = '195521292';
    const url = `https://www.ancestry.com/family-tree/tree/${treeId}`;

    window.location.href = url;
    window.onload = function () {
      const homeButton = document.querySelector('#homePerson');
      homeButton.click();
    };
  }
});
