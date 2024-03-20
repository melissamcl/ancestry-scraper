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

function parseGedcom(gedcomData, filename) {
  const arr = gedcomData.trim().split('\n');
  const json = [];
  let currentObj = [];

  const lines = new Stack();
  for (let i = arr.length - 1; i >= 0; i--) {
    lines.push(arr[i]);
  }

  while (!lines.isEmpty()) {
    // remove top value from stack, set as current line, split into parts
    const line = lines.pop();

    if (line.length < 2) {
      continue;
    }

    let [level, tag, ...valueParts] = line.split(' ');
    level = parseInt(level);
    let value;
    if (valueParts.length) {
      value = valueParts.join(' ');
    }

    if (tag[0] === '_') {
      tag = tag.slice(1);
    }

    // process lines containing ids wrapped in @ symbols
    if (line.includes('@')) {
      // process in reverse for the sake of the stack
      // extract id from current line string (value between @ signs)
      const regex = /@([^@]+)@/;
      const match = line.match(regex);

      // if @ matches the regex pattern, it appears to be an id
      if (match) {
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
    }

    // process lines that have both a value and additional properties in next lines
    if (value && lines.peek() && parseInt(lines.peek().split(' ')[0]) > level) {
      // push same line with level + 1 to process as a property of current tag
      lines.push(`${++level} ${tag} ${value}`);

      // push same line with level and tag only to insert an empty object for properties
      lines.push(`${--level} ${tag}`);
      continue;
    }

    // set value to empty obj if there is no text value
    if (!value) {
      value = {};
    }

    // process level 0
    if (level === 0) {
      // push existing outer obj onto json array
      if (currentObj.length) {
        json.push(currentObj[0]);
      }

      // reset currentObj
      currentObj = [{}];
    }

    // if tag doesn't already exist as a key, add it
    const valRef = currentObj[level][tag];
    if (!valRef) {
      currentObj[level][tag] = value;
    }

    // if key already exists, value should be an array
    else {
      // if not already an array, create it
      if (!Array.isArray(valRef)) {
        currentObj[level][tag] = [valRef];
      }

      // push value to end of array
      currentObj[level][tag].push(value);
    }

    // set currentObj reference for next level, if applicable
    if (typeof value === 'object') currentObj[level + 1] = value;
  }
  // return json;

  downloadJSON(json, filename);
  // console.log(json);
}

// const test = () => {
//   const fs = require('fs');

//   // Path to your text file
//   const filePath = 'test_files/test.ged';

//   // Read the file asynchronously
//   fs.readFile(filePath, 'utf8', (err, data) => {
//     if (err) {
//       console.error(err);
//       return;
//     }

//     // File contents are stored in the 'data' variable
//     parseGedcom(data);
//   });
// };

// test();
