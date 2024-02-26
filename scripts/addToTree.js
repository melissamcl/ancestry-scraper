function addMatchToTree() {
  const treeId = '195521292';
  const url = `https://www.ancestry.com/family-tree/tree/${treeId}`;

  window.location.href = url;
  window.addEventListener('load', function () {
    console.log('window loaded');
    const homeButton = document.getElementById('homePerson');
    console.log(homeButton);
    homeButton.click();
  });
}
