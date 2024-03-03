const testId = '5da195dd-94f8-47fc-8ea6-240a72f2d7e3';
// test ids and display names
const samples = `https://www.ancestry.com/discoveryui-matchesservice/api/samples/`;

// user details including user ids and test guids:
`https://www.ancestry.com/discoveryui-matchesservice/api/samples/${testId}/details`;

// tag definitions:
`https://www.ancestry.com/discoveryui-matchesservice/api/samples/${testId}/tags`;

let url = `https://www.ancestry.com/discoveryui-matchesservice/api/samples/${testId}/matches/list?page=1&sortby=RELATIONSHIP`;
page = page + 4;
let bookmarkData = url.bookmarkData;
if (bookmarkData.moreMatchesAvailable) {
  url = `https://www.ancestry.com/discoveryui-matchesservice/api/samples/${testId}/matches/list?bookmarkdata=${bookmarkData}&sortby=RELATIONSHIP`;
}

const testGuids = [
  'B74D9241-8509-4A43-9B3E-123E879838D1',
  '9D04EBAC-D0DC-49F8-B0AE-EB850E624C19',
];

const commonAncestors = `https://www.ancestry.com/discoveryui-matchesservice/api/samples/${testId}/matchesv2/additionalInfo?ids=${testGuids}&ancestors=true`;
const trees = `https://www.ancestry.com/discoveryui-matchesservice/api/samples/${testId}/matchesv2/additionalInfo?ids=${testGuids}&tree=true`;

const testGuid = 'BF136ED5-2E85-4AA7-ACCA-B17E94DF29F2';
const mutualMatchList = `https://www.ancestry.com/discoveryui-matchesservice/api/samples/${testId}/matches/list?page=1&relationguid=${testGuid}&sortby=RELATIONSHIP&_t=1709438017089`;
// same logic as original match list
