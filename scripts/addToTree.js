function checkElement(elId, intId, getByClass = false) {
  let element;
  if (getByClass) {
    element = document.getElementsByClassName(elId);
  } else {
    element = document.getElementById(elId);
  }

  if (element) {
    clearInterval(intId);
    return element;
  }
}

function addMatchToTree() {
  console.log('script continuing');
  const fName = 'FIRST';
  const lName = 'LAST';
  const gender = 'Female';
  const dnaId = 'xxx';

  const int1 = setInterval(() => {
    console.log('seeking home btn');
    const homeBtn = checkElement('homePerson', int1);
    if (homeBtn) {
      homeBtn.click();
    }
  }, 500);

  // wait 1 sec to allow add rel link to reset to home person
  setTimeout(() => {
    const int2 = setInterval(() => {
      console.log('seeking add relative btn');
      const addRel = checkElement('tvAddRelative', int2);
      if (addRel) {
        addRel.click();
      }
    }, 500);

    const int3 = setInterval(() => {
      console.log('seeking add child btn');
      const addChild = checkElement('addChildBtn', int3);
      if (addChild) {
        addChild.click();
      }
    }, 500);

    const int4 = setInterval(() => {
      console.log('seeking save btn');
      const saveBtn = checkElement('saveAddNew', int4);
      if (saveBtn) {
        // add details and save

        const fNameField = document.getElementById('fname');
        const lNameField = document.getElementById('lname');
        const genderBtn = document.getElementById(`m_gender${gender}`);
        fNameField.value = fName;
        lNameField.value = lName;
        genderBtn.click();
        saveBtn.click();
      }
    }, 500);

    // wait 2 sec to allow alert info to populate
    setTimeout(() => {
      const int5 = setInterval(() => {
        console.log('seeking success alert');
        const alert = checkElement('alertSuccess', int5, true);
        if (alert) {
          const str = alert[0].children[1].innerHTML;

          const regex = /href="([^"]*)"/;
          const match = str.match(regex);

          if (match && match.length > 1) {
            const url = match[1];
            console.log(url);

            chrome.runtime.sendMessage({
              action: 'openLinkAndExecuteScript',
              url: url,
              script: 'populateMatchDetails',
              args: [dnaId],
            });
          } else {
            console.log('URL not found in the string.');
          }
        }
      }, 500);
    }, 2000);
  }, 1000);
}

function populateMatchDetails(dnaId) {
  console.log(dnaId);

  const int1 = setInterval(() => {
    console.log('seeking add fact btn');
    const addFact = checkElement('iconAdd optionsButtonFacts', int1, true);
    if (addFact) {
      addFact[0].click();
    }
  }, 500);

  const int2 = setInterval(() => {
    console.log('seeking add fact dropdown');
    const addFactSel = checkElement('addFactSelect', int2);
    if (addFactSel) {
      var optionToSelect = document.getElementById('dna');

      // Create and dispatch a mouse click event on the option
      var event = new MouseEvent('mousedown', {
        view: window,
        bubbles: true,
        cancelable: true,
      });
      optionToSelect.dispatchEvent(event);

      // Manually update the selected property of the option
      optionToSelect.selected = true;

      // Create and dispatch a change event on the dropdown
      var changeEvent = new Event('change', {
        bubbles: true,
        cancelable: true,
      });
      addFactSel.dispatchEvent(changeEvent);
    }
  }, 500);
}

// Listen for message to execute script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'execute_addMatchToTree') {
    console.log('message received to execute add match to tree');
    addMatchToTree();
  } else if (message.action === 'execute_populateMatchDetails') {
    console.log('message received to execute populate match details');
    populateMatchDetails(...message.args);
  }
});
