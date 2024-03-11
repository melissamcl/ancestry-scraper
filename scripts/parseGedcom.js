// if level >= previous level:
//   add new key, value pair to current object:
//     key = tag
//     value =
//       if next level <= current level and value exists, value
//       if next level > current value and value exists, object containing value and set first key as current tag with value
//       if next level > current value and no value, empty object
//     if value is object, set current object pointer to value
//   if key already exists in current object, set existing value to array (if not already) and push new value to end of array

// if level < previous level:
//   change current object to parent object for each -1 difference
class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class Stack {
  constructor() {
    this.top = null;
    this.size = 0;
  }

  push(value) {
    let newNode = new Node(value);
    newNode.next = this.top;
    this.top = newNode;
    this.size++;
  }

  pop() {
    if (!this.isEmpty()) {
      let poppedValue = this.top.value;
      this.top = this.top.next;
      this.size--;
      return poppedValue;
    }
    return null;
  }

  peek() {
    if (!this.isEmpty()) {
      return this.top.value;
    }
    return null;
  }

  isEmpty() {
    return this.size === 0;
  }
}

function parseGedcom(gedcomData) {
  const arr = gedcomData.trim().split('\n');
  const json = [];
  let currentObject;

  const lines = new Stack();
  for (let i = arr.length - 1; i >= 0; i--) {
    lines.push(arr[i]);
  }

  while (!lines.isEmpty()) {
    // remove top value from stack, set as current line, split into parts
    const line = lines.pop();
    let [level, tag, ...valueParts] = line.split(' ');
    level = parseInt(level);
    let value;
    if (valueParts.length) {
      value = valueParts.join(' ');
    }

    // process lines containing ids wrapped in @ symbols
    if (line.includes('@')) {
      // process in reverse for the sake of the stack
      // extract id from current line string (value between @ signs)
      const regex = /@([^@]+)@/;
      const match = line.match(regex);

      // push second line onto stack with incremented level and tag as ID
      lines.push(`${++level} ID ${match[1]}`);

      // get correct value for tag (sometimes id is listed first as in the case of INDI)
      // push tag at current level onto stack
      if (tag.includes('@')) {
        tag = value;
      }
      lines.push(`${--level} ${tag}`);
      continue;
    }

    // if next level > current level, value should be an object and currentObject should point there
    const nextLevel = parseInt(lines.peek().split(' ')[0]);
    if (nextLevel > level) {
      if (value) {
        // value = { tag: value }
        // currentObject update
      } else {
        // value = {}
        // currentObject update
      }
    } else if (nextLevel === level) {
      //
    }

    console.log(line);
  }
  // return json;

  // console.log(json);
}

const ged = `
0 HEAD
1 SUBM @SUBM1@
1 SOUR Ancestry.com Family Trees
2 NAME Ancestry.com Member Trees
2 VERS 2024.01
2 _TREE Griffin research tree
3 RIN 195521292
3 _ENV prd
2 CORP Ancestry.com
3 PHON 801-705-7000
3 WWW www.ancestry.com
3 ADDR 1300 West Traverse Parkway
4 CONT Lehi, UT  84043
4 CONT USA
1 DATE 6 Mar 2024
2 TIME 19:21:59
1 GEDC
2 VERS 5.5.1
2 FORM LINEAGE-LINKED
1 CHAR UTF-8
0 @SUBM1@ SUBM
1 NAME Ancestry.com Member Trees Submitter
0 @I182543578728@ INDI
1 NAME JOHN WESLEY /O'BRIEN/
2 GIVN JOHN WESLEY
2 SURN O'BRIEN
1 SEX M
1 FAMC @F337@
1 EVEN
2 TYPE DNA Id
2 NOTE e5ac19ad48144ef0a869d125b09f0b54
1 _WLNK
2 TITL DNA match
2 NOTE https://www.ancestry.com/discoveryui-matches/compare/5DA195DD-94F8-47FC-8EA6-240A72F2D7E3/with/E5AC19AD-4814-4EF0-A869-D125B09F0B54
1 NOTE e5ac19ad48144ef0a869d125b09f0b54
1 _MTTAG @T167412@
1 _MTTAG @T10@
0 @I182542006990@ INDI
1 NAME CASWELL MITCHELL /JONES/ Jr
2 GIVN CASWELL MITCHELL
2 SURN JONES
2 NSFX Jr
2 SOUR @S508133080@
3 _APID 1,1732::84059512
2 SOUR @S508133064@
3 PAGE Texas Department of State Health Services; Austin, Texas
3 _APID 1,8794::3000625352
2 SOUR @S508133090@
3 _APID 1,62209::8834802
1 SEX M
1 FAMC @F101@
1 FAMS @F270@
1 FAMS @F34@
1 BIRT
2 DATE 20 Dec 1970
2 SOUR @S508133080@
3 _APID 1,1732::84059512
2 SOUR @S508133064@
3 PAGE Texas Department of State Health Services; Austin, Texas
3 _APID 1,8794::3000625352
2 SOUR @S508133090@
3 _APID 1,62209::8834802
1 RESI
2 DATE 2000-2020
2 PLAC Katy, Texas, USA
2 SOUR @S508133090@
3 _APID 1,62209::8834802
1 RESI
2 DATE 2006-2019
2 PLAC Katy, Texas, USA
2 SOUR @S508133090@
3 _APID 1,62209::8834802
1 RESI
2 DATE 2017-2020
2 PLAC Houston, Texas, USA
2 SOUR @S508133090@
3 _APID 1,62209::8834802
1 RESI
2 PLAC New Orleans, Louisiana, USA
2 SOUR @S508133080@
3 _APID 1,1732::84059512
1 SOUR @S508133080@
2 _APID 1,1732::84059512
1 SOUR @S508133064@
2 PAGE Texas Department of State Health Services; Austin, Texas
2 _APID 1,8794::3000625352
1 SOUR @S508133090@
2 _APID 1,62209::8834802
1 NOTE Grandson of Myrtle Griffin, adopted out.  Parents noted here turned out to be adoptive parents
1 _MTTAG @T167411@
1 _MTTAG @T10@
1 _MTTAG @T2@
1 _MTTAG @T1@
`;

parseGedcom(ged);

// `0 @I182543578728@ INDI
// 1 NAME JOHN WESLEY /OBRIEN/
// 2 GIVN JOHN WESLEY
// 2 SURN OBRIEN
// 1 SEX M
// 1 FAMC @F337@
// 1 EVEN
// 2 TYPE DNA Id
// 2 NOTE e5ac19ad48144ef0a869d125b09f0b54
// 1 _WLNK
// 2 TITL DNA match
// 2 NOTE https://www.ancestry.com/discoveryui-matches/compare/5DA195DD-94F8-47FC-8EA6-240A72F2D7E3/with/E5AC19AD-4814-4EF0-A869-D125B09F0B54
// 1 NOTE e5ac19ad48144ef0a869d125b09f0b54
// 1 _MTTAG @T167412@
// 1 _MTTAG @T10@
// 0 @I182542007414@ INDI
// 1 NAME Caswell Jonathan /JONES/
// 2 GIVN Caswell Jonathan
// 2 SURN JONES
// 2 SOUR @S508133867@
// 3 PAGE National Archives at St. Louis; St. Louis, Missouri; Wwii Draft Registration Cards For Louisiana, 10/16/1940 - 03/31/1947; Record Group: Records of the Selective Service System, 147
// 3 _APID 1,2238::4915864
// 2 SOUR @S508133358@
// 3 PAGE Year: 1940; Census Place: New Orleans, Orleans, Louisiana; Roll: m-t0627-01436; Page: 12B; Enumeration District: 36-462
// 3 _APID 1,2442::123805664
// 2 SOUR @S508133358@
// 3 _APID 1,2442::126781092
// 2 SOUR @S508133295@
// 3 PAGE Year: 1920; Census Place: New Orleans Ward 17, Orleans, Louisiana; Roll: T625_624; Page: 22A; Enumeration District: 269
// 3 _APID 1,6061::50830432
// 2 SOUR @S508133193@
// 3 _APID 1,60901::636541941
// 2 SOUR @S508133224@
// 3 PAGE National Archives at Washington, DC; Washington, D.C.; Seventeenth Census of the United States, 1950; Year: 1950; Census Place: Alexandria, Rapides, Louisiana; Roll: 6219; Page: 41; Enumeration District: 40-1
// 3 _APID 1,62308::77918048
// 1 SEX M
// 1 FAMC @F197@
// 1 FAMS @F4@
// 1 BIRT
// 2 DATE 26 Oct 1909
// 2 PLAC New Orleans, Louisiana
// 2 SOUR @S508133867@
// 3 PAGE National Archives at St. Louis; St. Louis, Missouri; Wwii Draft Registration Cards For Louisiana, 10/16/1940 - 03/31/1947; Record Group: Records of the Selective Service System, 147
// 3 _APID 1,2238::4915864
// 2 SOUR @S508133358@
// 3 PAGE Year: 1940; Census Place: New Orleans, Orleans, Louisiana; Roll: m-t0627-01436; Page: 12B; Enumeration District: 36-462
// 3 _APID 1,2442::123805664
// 2 SOUR @S508133358@
// 3 _APID 1,2442::126781092
// 2 SOUR @S508133295@
// 3 PAGE Year: 1920; Census Place: New Orleans Ward 17, Orleans, Louisiana; Roll: T625_624; Page: 22A; Enumeration District: 269
// 3 _APID 1,6061::50830432
// 2 SOUR @S508133224@
// 3 PAGE National Archives at Washington, DC; Washington, D.C.; Seventeenth Census of the United States, 1950; Year: 1950; Census Place: Alexandria, Rapides, Louisiana; Roll: 6219; Page: 41; Enumeration District: 40-1
// 3 _APID 1,62308::77918048
// 1 RESI
// 2 DATE 1920
// 2 PLAC New Orleans Ward 17, Orleans, Louisiana, USA
// 2 SOUR @S508133295@
// 3 PAGE Year: 1920; Census Place: New Orleans Ward 17, Orleans, Louisiana; Roll: T625_624; Page: 22A; Enumeration District: 269
// 3 _APID 1,6061::50830432
// 2 NOTE Marital Status: Single; Relation to Head: Grandson
// 1 RESI
// 2 DATE 1935
// 2 PLAC New Orleans, Orleans, Louisiana
// 2 SOUR @S508133358@
// 3 PAGE Year: 1940; Census Place: New Orleans, Orleans, Louisiana; Roll: m-t0627-01436; Page: 12B; Enumeration District: 36-462
// 3 _APID 1,2442::123805664
// 2 SOUR @S508133358@
// 3 _APID 1,2442::126781092
// 1 RESI
// 2 DATE 1940
// 2 PLAC New Orleans, Orleans, Louisiana, USA
// 2 SOUR @S508133358@
// 3 PAGE Year: 1940; Census Place: New Orleans, Orleans, Louisiana; Roll: m-t0627-01436; Page: 12B; Enumeration District: 36-462
// 3 _APID 1,2442::123805664
// 2 SOUR @S508133358@
// 3 _APID 1,2442::126781092
// 2 NOTE Marital Status: Married; Relation to Head: Head
// 1 RESI
// 2 DATE 1950
// 2 PLAC Alexandria, Rapides, Louisiana, USA
// 2 SOUR @S508133224@
// 3 PAGE National Archives at Washington, DC; Washington, D.C.; Seventeenth Census of the United States, 1950; Year: 1950; Census Place: Alexandria, Rapides, Louisiana; Roll: 6219; Page: 41; Enumeration District: 40-1
// 3 _APID 1,62308::77918048
// 2 NOTE Relation to Head: Head; Marital Status: Married
// 1 RESI
// 2 PLAC New Orleans, Louisiana
// 2 SOUR @S508133867@
// 3 PAGE National Archives at St. Louis; St. Louis, Missouri; Wwii Draft Registration Cards For Louisiana, 10/16/1940 - 03/31/1947; Record Group: Records of the Selective Service System, 147
// 3 _APID 1,2238::4915864
// 2 NOTE Relative Relation to Head: Wife
// 1 DEAT
// 2 DATE 25 Jan 1958
// 2 PLAC Oberlin, Allen, Louisiana, USA
// 1 SOUR @S508133867@
// 2 PAGE National Archives at St. Louis; St. Louis, Missouri; Wwii Draft Registration Cards For Louisiana, 10/16/1940 - 03/31/1947; Record Group: Records of the Selective Service System, 147
// 2 _APID 1,2238::4915864
// 1 SOUR @S508133358@
// 2 PAGE Year: 1940; Census Place: New Orleans, Orleans, Louisiana; Roll: m-t0627-01436; Page: 12B; Enumeration District: 36-462
// 2 _APID 1,2442::123805664
// 1 SOUR @S508133358@
// 2 _APID 1,2442::126781092
// 1 SOUR @S508133295@
// 2 PAGE Year: 1920; Census Place: New Orleans Ward 17, Orleans, Louisiana; Roll: T625_624; Page: 22A; Enumeration District: 269
// 2 _APID 1,6061::50830432
// 1 SOUR @S508133193@
// 2 _APID 1,60901::636541941
// 1 SOUR @S508133224@
// 2 PAGE National Archives at Washington, DC; Washington, D.C.; Seventeenth Census of the United States, 1950; Year: 1950; Census Place: Alexandria, Rapides, Louisiana; Roll: 6219; Page: 41; Enumeration District: 40-1
// 2 _APID 1,62308::77918048
// `;

// const result = {
//   INDI: [
//     {
//       ID: 'I182543578728',
//       NAME: {
//         GIVN: 'JOHN WESLEY',
//         SURN: 'OBRIEN',
//       },
//       SEX: 'M',
//       FAMC: {
//         ID: 'F337',
//       },
//       EVEN: {
//         TYPE: 'DNA Id',
//         NOTE: 'e5ac19',
//       },
//       WLNK: {
//         TITL: 'DNA match',
//         NOTE: 'https://www.ancestry.com/discoveryui-matches/compare/5DA195DD',
//       },
//       NOTE: 'e5ac19',
//       MTTAG: {
//         ID: ['T167412', 'T10'],
//       },
//     },
//     {
//       ID: 'I182542007414',
//       NAME: {
//         GIVN: 'Caswell Jonathan',
//         SURN: 'JONES',
//         SOUR: [
//           {
//             ID: 'S508133867',
//             PAGE: 'National Archives at St. Louis; St. Louis, Missouri; Wwii Draft Registration Cards For Louisiana, 10/16/1940 - 03/31/1947; Record Group: Records of the Selective Service System, 147',
//             APID: '1,2238::4915864',
//           },
//           {
//             ID: 'S508133358',
//             PAGE: 'Year: 1940; Census Place: New Orleans, Orleans, Louisiana; Roll: m-t0627-01436; Page: 12B; Enumeration District: 36-462',
//             APID: '1,2442::123805664',
//           },
//           {
//             ID: 'S508133358',
//             APID: '1,2442::126781092',
//           },
//           {
//             ID: 'S508133295',
//             PAGE: 'Year: 1920; Census Place: New Orleans Ward 17, Orleans, Louisiana; Roll: T625_624; Page: 22A; Enumeration District: 269',
//             APID: '1,6061::50830432',
//           },
//           {
//             ID: 'S508133193',
//             APID: '1,60901::636541941',
//           },
//           ,
//           {
//             ID: 'S508133224',
//             PAGE: 'National Archives at Washington, DC; Washington, D.C.; Seventeenth Census of the United States, 1950; Year: 1950; Census Place: Alexandria, Rapides, Louisiana; Roll: 6219; Page: 41; Enumeration District: 40-1',
//             APID: '1,62308::77918048',
//           },
//         ],
//       },
//       SEX: 'M',
//       FAMC: {
//         ID: 'F197',
//       },
//       FAMS: {
//         ID: 'F4',
//       },
//       BIRT: {
//         DATE: '26 Oct 1909',
//         PLAC: 'New Orleans, Louisiana',
//         SOUR: [
//           {
//             ID: 'S508133867',
//             PAGE: 'National Archives at St. Louis; St. Louis, Missouri; Wwii Draft Registration Cards For Louisiana, 10/16/1940 - 03/31/1947; Record Group: Records of the Selective Service System, 147',
//             APID: '1,2238::4915864',
//           },
//           {
//             ID: 'S508133358',
//             PAGE: 'Year: 1940; Census Place: New Orleans, Orleans, Louisiana; Roll: m-t0627-01436; Page: 12B; Enumeration District: 36-462',
//             APID: '1,2442::123805664',
//           },
//           {
//             ID: 'S508133358',
//             APID: '1,2442::126781092',
//           },
//           {
//             ID: 'S508133295',
//             PAGE: 'Year: 1920; Census Place: New Orleans Ward 17, Orleans, Louisiana; Roll: T625_624; Page: 22A; Enumeration District: 269',
//             APID: '1,6061::50830432',
//           },
//           {
//             ID: 'S508133224',
//             PAGE: 'National Archives at Washington, DC; Washington, D.C.; Seventeenth Census of the United States, 1950; Year: 1950; Census Place: Alexandria, Rapides, Louisiana; Roll: 6219; Page: 41; Enumeration District: 40-1',
//             APID: '1,62308::77918048',
//           },
//         ],
//       },
//       RESI: [
//         {
//           DATE: '1920',
//           PLAC: 'New Orleans Ward 17, Orleans, Louisiana, USA',
//           SOUR: {
//             ID: 'S508133295',
//             PAGE: 'Year: 1920; Census Place: New Orleans Ward 17, Orleans, Louisiana; Roll: T625_624; Page: 22A; Enumeration District: 269',
//             APID: '1,6061::50830432',
//           },
//           NOTE: 'Marital Status: Single; Relation to Head: Grandson',
//         },
//       ],
//       EVEN: {
//         TYPE: '',
//         NOTE: '',
//       },
//     },
//   ],
// };

// /*
// separate all lines into an array
// split line by spaces: 0 = level, 1 = tag, 2+ = values

// iterate as a stack
// json = []

// 0 @I182543578728@ INDI ->
//   0 INDI
//   1 ID I182543578728

// level 0:
// push new object onto end of array
// key = tag
// value = value or {}
// 0 INDI ->
//   INDI: {}

// level +1 from previous level:
// add new key, value pair to current object
// key = tag
// value =
//   if next level <= current level and value exists, value
//   if next level > current value and value exists, object containing value and set first key as current tag with value
//   if next level > current value and no value, empty object
// if value is object, set current object pointer to value
// 1 ID I182543578728 ->
//   INDI: {
//     ID: 'I182543578728'
//   }

// level same as previous level:
// add new key, value pair to current object
// 1 NAME JOHN WESLEY /OBRIEN/ ->
//   INDI: {
//     ID: 'I182543578728'
//     NAME: 'JOHN WESLEY /OBRIEN/'
//   }

// level +1 from previous level
// 2 GIVN JOHN WESLEY ->
//   INDI: {
//     ID: 'I182543578728'
//     NAME: {
//       NAME: 'JOHN WESLEY /OBRIEN/'
//       GIVN: 'JOHN WESLEY'
//     }
//   }
// 2 SURN OBRIEN ->
//   INDI: {
//     ID: 'I182543578728'
//     NAME: {
//       NAME: 'JOHN WESLEY /OBRIEN/'
//       GIVN: 'JOHN WESLEY'
//       SURN: OBRIEN
//     }
//   }

// if line contains @:
//   add 2 lines to top of stack:
//     1. level = level
//        tag = if @ not in tag, tag, else value
//        value = null
//     2. level = level++,
//        tag = 'ID',
//        value = data between @ signs, e.g., @VALUE@

// if level >= previous level:
//   add new key, value pair to current object:
//     key = tag
//     value =
//       if next level <= current level and value exists, value
//       if next level > current value and value exists, object containing value and set first key as current tag with value
//       if next level > current value and no value, empty object
//     if value is object, set current object pointer to value
//   if key already exists in current object, set existing value to array (if not already) and push new value to end of array

// if level < previous level:
//   change current object to parent object for each -1 difference
// */

// `0 @I182543578728@ INDI
// 1 NAME JOHN WESLEY /OBRIEN/
// 2 GIVN JOHN WESLEY
// 2 SURN OBRIEN
// 1 SEX M
// 1 FAMC @F337@
// 1 EVEN
// 2 TYPE DNA Id
// 2 NOTE e5ac19ad48144ef0a869d125b09f0b54
// 1 _WLNK
// 2 TITL DNA match
// 2 NOTE https://www.ancestry.com/discoveryui-matches/compare/5DA195DD-94F8-47FC-8EA6-240A72F2D7E3/with/E5AC19AD-4814-4EF0-A869-D125B09F0B54
// 1 NOTE e5ac19ad48144ef0a869d125b09f0b54
// 1 _MTTAG @T167412@
// 1 _MTTAG @T10@
// 0 @I182542007414@ INDI
// 1 NAME Caswell Jonathan /JONES/
// 2 GIVN Caswell Jonathan
// 2 SURN JONES
// 2 SOUR @S508133867@
// 3 PAGE National Archives at St. Louis; St. Louis, Missouri; Wwii Draft Registration Cards For Louisiana, 10/16/1940 - 03/31/1947; Record Group: Records of the Selective Service System, 147
// 3 _APID 1,2238::4915864
// 2 SOUR @S508133358@
// 3 PAGE Year: 1940; Census Place: New Orleans, Orleans, Louisiana; Roll: m-t0627-01436; Page: 12B; Enumeration District: 36-462
// 3 _APID 1,2442::123805664
// 2 SOUR @S508133358@
// 3 _APID 1,2442::126781092
// 2 SOUR @S508133295@
// 3 PAGE Year: 1920; Census Place: New Orleans Ward 17, Orleans, Louisiana; Roll: T625_624; Page: 22A; Enumeration District: 269
// 3 _APID 1,6061::50830432
// 2 SOUR @S508133193@
// 3 _APID 1,60901::636541941
// 2 SOUR @S508133224@
// 3 PAGE National Archives at Washington, DC; Washington, D.C.; Seventeenth Census of the United States, 1950; Year: 1950; Census Place: Alexandria, Rapides, Louisiana; Roll: 6219; Page: 41; Enumeration District: 40-1
// 3 _APID 1,62308::77918048
// 1 SEX M
// 1 FAMC @F197@
// 1 FAMS @F4@
// 1 BIRT
// 2 DATE 26 Oct 1909
// 2 PLAC New Orleans, Louisiana
// 2 SOUR @S508133867@
// 3 PAGE National Archives at St. Louis; St. Louis, Missouri; Wwii Draft Registration Cards For Louisiana, 10/16/1940 - 03/31/1947; Record Group: Records of the Selective Service System, 147
// 3 _APID 1,2238::4915864
// 2 SOUR @S508133358@
// 3 PAGE Year: 1940; Census Place: New Orleans, Orleans, Louisiana; Roll: m-t0627-01436; Page: 12B; Enumeration District: 36-462
// 3 _APID 1,2442::123805664
// 2 SOUR @S508133358@
// 3 _APID 1,2442::126781092
// 2 SOUR @S508133295@
// 3 PAGE Year: 1920; Census Place: New Orleans Ward 17, Orleans, Louisiana; Roll: T625_624; Page: 22A; Enumeration District: 269
// 3 _APID 1,6061::50830432
// 2 SOUR @S508133224@
// 3 PAGE National Archives at Washington, DC; Washington, D.C.; Seventeenth Census of the United States, 1950; Year: 1950; Census Place: Alexandria, Rapides, Louisiana; Roll: 6219; Page: 41; Enumeration District: 40-1
// 3 _APID 1,62308::77918048
// 1 RESI
// 2 DATE 1920
// 2 PLAC New Orleans Ward 17, Orleans, Louisiana, USA
// 2 SOUR @S508133295@
// 3 PAGE Year: 1920; Census Place: New Orleans Ward 17, Orleans, Louisiana; Roll: T625_624; Page: 22A; Enumeration District: 269
// 3 _APID 1,6061::50830432
// 2 NOTE Marital Status: Single; Relation to Head: Grandson
// 1 RESI
// 2 DATE 1935
// 2 PLAC New Orleans, Orleans, Louisiana
// 2 SOUR @S508133358@
// 3 PAGE Year: 1940; Census Place: New Orleans, Orleans, Louisiana; Roll: m-t0627-01436; Page: 12B; Enumeration District: 36-462
// 3 _APID 1,2442::123805664
// 2 SOUR @S508133358@
// 3 _APID 1,2442::126781092
// 1 RESI
// 2 DATE 1940
// 2 PLAC New Orleans, Orleans, Louisiana, USA
// 2 SOUR @S508133358@
// 3 PAGE Year: 1940; Census Place: New Orleans, Orleans, Louisiana; Roll: m-t0627-01436; Page: 12B; Enumeration District: 36-462
// 3 _APID 1,2442::123805664
// 2 SOUR @S508133358@
// 3 _APID 1,2442::126781092
// 2 NOTE Marital Status: Married; Relation to Head: Head
// 1 RESI
// 2 DATE 1950
// 2 PLAC Alexandria, Rapides, Louisiana, USA
// 2 SOUR @S508133224@
// 3 PAGE National Archives at Washington, DC; Washington, D.C.; Seventeenth Census of the United States, 1950; Year: 1950; Census Place: Alexandria, Rapides, Louisiana; Roll: 6219; Page: 41; Enumeration District: 40-1
// 3 _APID 1,62308::77918048
// 2 NOTE Relation to Head: Head; Marital Status: Married
// 1 RESI
// 2 PLAC New Orleans, Louisiana
// 2 SOUR @S508133867@
// 3 PAGE National Archives at St. Louis; St. Louis, Missouri; Wwii Draft Registration Cards For Louisiana, 10/16/1940 - 03/31/1947; Record Group: Records of the Selective Service System, 147
// 3 _APID 1,2238::4915864
// 2 NOTE Relative Relation to Head: Wife
// 1 DEAT
// 2 DATE 25 Jan 1958
// 2 PLAC Oberlin, Allen, Louisiana, USA
// 1 SOUR @S508133867@
// 2 PAGE National Archives at St. Louis; St. Louis, Missouri; Wwii Draft Registration Cards For Louisiana, 10/16/1940 - 03/31/1947; Record Group: Records of the Selective Service System, 147
// 2 _APID 1,2238::4915864
// 1 SOUR @S508133358@
// 2 PAGE Year: 1940; Census Place: New Orleans, Orleans, Louisiana; Roll: m-t0627-01436; Page: 12B; Enumeration District: 36-462
// 2 _APID 1,2442::123805664
// 1 SOUR @S508133358@
// 2 _APID 1,2442::126781092
// 1 SOUR @S508133295@
// 2 PAGE Year: 1920; Census Place: New Orleans Ward 17, Orleans, Louisiana; Roll: T625_624; Page: 22A; Enumeration District: 269
// 2 _APID 1,6061::50830432
// 1 SOUR @S508133193@
// 2 _APID 1,60901::636541941
// 1 SOUR @S508133224@
// 2 PAGE National Archives at Washington, DC; Washington, D.C.; Seventeenth Census of the United States, 1950; Year: 1950; Census Place: Alexandria, Rapides, Louisiana; Roll: 6219; Page: 41; Enumeration District: 40-1
// 2 _APID 1,62308::77918048
// ``
// 1 RESI
// 2 DATE 1935
// 2 PLAC New Orleans, Orleans, Louisiana
// 2 SOUR @S508133358@
// 3 PAGE Year: 1940; Census Place: New Orleans, Orleans, Louisiana; Roll: m-t0627-01436; Page: 12B; Enumeration District: 36-462
// 3 _APID 1,2442::123805664
// 2 SOUR @S508133358@
// 3 _APID 1,2442::126781092
// 1 RESI
// 2 DATE 1940
// 2 PLAC New Orleans, Orleans, Louisiana, USA
// 2 SOUR @S508133358@
// 3 PAGE Year: 1940; Census Place: New Orleans, Orleans, Louisiana; Roll: m-t0627-01436; Page: 12B; Enumeration District: 36-462
// 3 _APID 1,2442::123805664
// 2 SOUR @S508133358@
// 3 _APID 1,2442::126781092
// 2 NOTE Marital Status: Married; Relation to Head: Head
// 1 RESI
// 2 DATE 1950
// 2 PLAC Alexandria, Rapides, Louisiana, USA
// 2 SOUR @S508133224@
// 3 PAGE National Archives at Washington, DC; Washington, D.C.; Seventeenth Census of the United States, 1950; Year: 1950; Census Place: Alexandria, Rapides, Louisiana; Roll: 6219; Page: 41; Enumeration District: 40-1
// 3 _APID 1,62308::77918048
// 2 NOTE Relation to Head: Head; Marital Status: Married
// 1 RESI
// 2 PLAC New Orleans, Louisiana
// 2 SOUR @S508133867@
// 3 PAGE National Archives at St. Louis; St. Louis, Missouri; Wwii Draft Registration Cards For Louisiana, 10/16/1940 - 03/31/1947; Record Group: Records of the Selective Service System, 147
// 3 _APID 1,2238::4915864
// 2 NOTE Relative Relation to Head: Wife
// 1 DEAT
// 2 DATE 25 Jan 1958
// 2 PLAC Oberlin, Allen, Louisiana, USA
// 1 SOUR @S508133867@
// 2 PAGE National Archives at St. Louis; St. Louis, Missouri; Wwii Draft Registration Cards For Louisiana, 10/16/1940 - 03/31/1947; Record Group: Records of the Selective Service System, 147
// 2 _APID 1,2238::4915864
// 1 SOUR @S508133358@
// 2 PAGE Year: 1940; Census Place: New Orleans, Orleans, Louisiana; Roll: m-t0627-01436; Page: 12B; Enumeration District: 36-462
// 2 _APID 1,2442::123805664
// 1 SOUR @S508133358@
// 2 _APID 1,2442::126781092
// 1 SOUR @S508133295@
// 2 PAGE Year: 1920; Census Place: New Orleans Ward 17, Orleans, Louisiana; Roll: T625_624; Page: 22A; Enumeration District: 269
// 2 _APID 1,6061::50830432
// 1 SOUR @S508133193@
// 2 _APID 1,60901::636541941
// 1 SOUR @S508133224@
// 2 PAGE National Archives at Washington, DC; Washington, D.C.; Seventeenth Census of the United States, 1950; Year: 1950; Census Place: Alexandria, Rapides, Louisiana; Roll: 6219; Page: 41; Enumeration District: 40-1
// 2 _APID 1,62308::77918048
// `;
