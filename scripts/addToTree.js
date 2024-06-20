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

function parseName(inputName, inputInitials) {
  const names = inputName.replace(/[.,0123456789]/g, '').split(' ');
  const initials = inputInitials.split('.').slice(0, 2);

  // if display name is initials, return first initial/last initial as first/last name
  if (inputName === inputInitials) return initials;
  // if there is only one word in the full name, treat it as a username
  // TODO: check for multiple caps to attempt to parse last name from username, e.g. LauraDavis1953 from Jack's matches
  else if (names.length === 1) {
    names[0] = names[0].toUpperCase();
    names[1] = '?';
  }
  // if there are two or more words in the full name, capitalize names
  else if (names.length === 2) {
    for (let i = 0; i < 2; i++) {
      names[i] = names[i].toUpperCase();
    }
  }
  // if there are more than two words, additional logic to parse
  else if (names.length > 2) {
    // check if last name is a common suffix
    const suffixes = [
      'SR',
      'JR',
      'I',
      'II',
      'III',
      'IV',
      'V',
      'VI',
      'VII',
      'VIII',
      'IX',
      'X',
    ];
    let suffix = '';
    if (suffixes.includes(names[names.length - 1].toUpperCase())) {
      suffix = names[names.length - 1].toUpperCase();

      // if length including suffix is 3, replace the suffix with reformatted and return name list
      if (names.length === 3) {
        names[2] = suffix;
        return names;
      }

      names.pop();
    }

    // process remaining names excluding suffix
    // match with initials starting with last name/last initial
    let fName;
    let lName;
    for (let i = names.length - 1; i >= 0; i--) {
      if (names[i].charAt(0) === initials[1]) {
        lName = names.slice(i, names.length).join(' ');
        fName = names.slice(0, i).join(' ');

        return [fName, lName, suffix];
      }
    }
  }

  return names;
}

async function addMatchToTree(matchUrl) {
  console.log('script continuing');

  console.log(matchUrl);

  const pattern = /\/([0-9a-f-]+)\/with\/([0-9a-f-]+)/i;
  const match = matchUrl.match(pattern);

  if (match) {
    const id1 = match[1];
    const id2 = match[2];

    const dataUrl = `https://www.ancestry.com/discoveryui-matchesservice/api/samples/${id1}/matches/${id2}/details`;
    const data = await fetchData(dataUrl);

    let gender = data.subjectGender;
    gender = gender === 'f' ? 'Female' : 'Male';

    const dnaId = data.testGuid;
    const fullName = data.displayName;
    const initials = data.displayInitials;
    const names = parseName(fullName, initials);
    const fName = names[0];
    const lName = names[1];
    const sName = names[2] || '';

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
          const sNameField = document.getElementById('sufname');
          let genderBtn = 'm_genderPerson';
          console.log(gender);
          if (gender) {
            genderBtn = document.getElementById(`m_gender${gender}`);
          }
          fNameField.value = fName;
          lNameField.value = lName;
          sNameField.value = sName;
          genderBtn.click();
          saveBtn.click();
        }
      }, 500);

      // wait 2 sec to allow alert info to populate
      setTimeout(() => {
        const int5 = setInterval(() => {
          console.log('seeking success alert');
          const alert = checkElement('alertSuccess', int5, true);
          console.log(alert);
          if (alert) {
            const str = alert[0].children[1].innerHTML;

            const regex = /href="([^"]*)"/;
            const match = str.match(regex);

            if (match && match.length > 1) {
              const url = match[1];
              console.log(url);

              const regex = /\/person\/([^/]+)\/facts/;
              const idMatch = url.match(regex);
              const treePersonId = idMatch[1];

              chrome.runtime.sendMessage({
                action: 'openLinkAndExecuteScript',
                url: url,
                script: 'populateMatchDetails',
                args: [dnaId, matchUrl, treePersonId],
                close: true,
              });
            } else {
              console.log('URL not found in the string.');
            }
          }
        }, 500);
      }, 3000);
    }, 1000);
  }
}

function populateMatchDetails(dnaId, matchUrl, treePersonId) {
  console.log(dnaId);

  const int1 = setInterval(() => {
    console.log('seeking add fact btn');
    const addFact = checkElement('iconAdd optionsButtonFacts', int1, true);
    if (addFact) {
      // add tags
      const tags = document.getElementById('addtag');
      // const custTags = document.getElementById('CustomTagsBtn');
      // const dnaTags = document.getElementById('DNATagsBtn');
      const unknownTag = document.getElementById('UnknownconnectionButton');
      const dnaMatchTag = document.getElementById('DNAMatchButton');
      tags.click();
      // custTags.click();
      // dnaTags.click();
      unknownTag.click();
      dnaMatchTag.click();

      addFact[0].click();
    }
  }, 500);

  const int2 = setInterval(() => {
    console.log('seeking add fact dropdown');
    const addFactSel = checkElement('addFactSelect', int2);
    if (addFactSel) {
      const optionToSelect = document.getElementById('dna');

      // Create and dispatch a mouse click event on the option
      const event = new MouseEvent('mousedown', {
        view: window,
        bubbles: true,
        cancelable: true,
      });
      optionToSelect.dispatchEvent(event);

      // Manually update the selected property of the option
      optionToSelect.selected = true;

      // Create and dispatch a change event on the dropdown
      const changeEvent = new Event('change', {
        bubbles: true,
        cancelable: true,
      });
      addFactSel.dispatchEvent(changeEvent);
    }
  }, 500);

  const int3 = setInterval(() => {
    console.log('seeking description field');
    const desc = checkElement('description', int3);
    if (desc) {
      desc.value = `${dnaId} `;
    }
  }, 500);

  setTimeout(() => {
    console.log(treePersonId);
    chrome.runtime.sendMessage({
      action: 'openLinkAndExecuteScript',
      url: matchUrl,
      script: 'addTreeIdToMatchNote',
      args: [treePersonId],
      close: false,
    });
  }, 1000);
}

function addTreeIdToMatchNote(treePersonId) {
  console.log(treePersonId);

  const int1 = setInterval(() => {
    console.log('seeking add note btn');
    const addNote = checkElement('iconNote', int1, true);
    if (addNote) {
      addNote[0].click();
    }
  }, 500);

  const int2 = setInterval(() => {
    console.log('seeking note field');
    const note = checkElement('note', int2);
    if (note) {
      note.value = `${treePersonId} ${note.value}`;
    }
  }, 500);
}

// Listen for message to execute script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'execute_addMatchToTree') {
    console.log('message received to execute add match to tree');
    addMatchToTree(...message.args);
  } else if (message.action === 'execute_populateMatchDetails') {
    console.log('message received to execute populate match details');
    populateMatchDetails(...message.args);
  } else if (message.action === 'execute_addTreeIdToMatchNote') {
    console.log('message received to execute add person id to match');
    addTreeIdToMatchNote(...message.args);
  }
});
