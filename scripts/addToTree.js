function checkElement(elId, intId) {
  console.log('here');
  if (document.readyState !== 'complete') {
    return;
  }

  let element = document.getElementById(elId);
  if (element) {
    clearInterval(intId);
    return element;
  }
}

function addMatchToTree() {
  const treeId = '195521292';
  const url = `https://www.ancestry.com/family-tree/tree/${treeId}`;

  window.location.href = url;

  const int1 = setInterval(() => {
    console.log('seeking home btn');
    const homeBtn = checkElement('homePerson', int1);
    if (homeBtn) {
      homeBtn.click();
    }
  }, 500);

  // setTimeout(() => {
  //   // wait 3 sec for home person to load, then click add relative
  //   let addRel;
  //   while (!addRel) {
  //     addRel = document.getElementById('tvAddRelative');
  //   }
  //   addRel.click();

  //   // wait another second, then attempt to click add child, retry until el exists
  //   setTimeout(() => {
  //     let addChild;
  //     while (!addChild) {
  //       addChild = document.getElementById('addChildBtn');
  //     }
  //     addChild.click();

  //     // wait another 3 sec, then attempt to locate save btn
  //     // once save button exists, fill out form and save
  //     setTimeout(() => {
  //       let saveBtn;
  //       while (!saveBtn) {
  //         saveBtn = document.getElementById('saveAddNew');
  //       }

  //       const fName = 'FIRST';
  //       const lName = 'LAST';
  //       const gender = 'Female';

  //       const fNameField = document.getElementById('fname');
  //       const lNameField = document.getElementById('lname');
  //       const genderBtn = document.getElementById(`m_gender${gender}`);

  //       fNameField.value = fName;
  //       lNameField.value = lName;
  //       genderBtn.click();
  //       saveBtn.click();

  //       this.setTimeout(() => {
  //         let alert;
  //         while (!alert) {
  //           alert = document.getElementsByClassName('alertSuccess');
  //         }

  //         const str = alert[0].children[1].innerHTML;

  //         const regex = /href="([^"]*)"/;
  //         const match = str.match(regex);

  //         if (match && match.length > 1) {
  //           const url = match[1];
  //           console.log(url);

  //           chrome.runtime.sendMessage({
  //             action: 'openLink',
  //             url: url,
  //           });
  //         } else {
  //           console.log('URL not found in the string.');
  //         }
  //       }, 3000);
  //     }, 3000);
  //   }, 1000);
  // }, 3000);
}
