const fs = require('fs');

const path = 'C:\\Users\\LGU CATBALOGAN\\.gemini\\antigravity\\brain\\93dd4c7a-d588-4583-a9d9-f063fc737987\\.system_generated\\logs\\overview.txt';
const log = fs.readFileSync(path, 'utf8');

const splitIdx = log.lastIndexOf('make it same as this, make the UI beautiful');
const pastLog = log.substring(0, splitIdx);

const extractCode = (filename) => {
  const searchStr = '"TargetFile":"c:\\\\Users\\\\LGU CATBALOGAN\\\\Desktop\\\\POBLAGO\\\\src\\\\pages\\\\' + filename.split('.')[0] + '\\\\' + filename + '"';
  let idx = pastLog.lastIndexOf(searchStr);
  
  if (idx === -1) {
    // try different slash types
    const searchStr2 = '"TargetFile":"c:/Users/LGU CATBALOGAN/Desktop/POBLAGO/src/pages/' + filename.split('.')[0] + '/' + filename + '"';
    idx = pastLog.lastIndexOf(searchStr2);
  }

  if (idx !== -1) {
    const codeIdx = pastLog.lastIndexOf('"CodeContent":"', idx);
    if (codeIdx !== -1) {
      const start = codeIdx + 15;
      let end = pastLog.indexOf('","Description"', start);
      if (end === -1) {
        end = pastLog.indexOf('","IsArtifact"', start);
      }
      let content = pastLog.substring(start, end);
      
      try {
        content = JSON.parse('"' + content + '"');
        fs.writeFileSync('C:\\Users\\LGU CATBALOGAN\\Desktop\\POBLAGO\\src\\pages\\' + filename.split('.')[0] + '\\' + filename, content);
        console.log('Restored ' + filename);
      } catch (e) {
        console.log('Error parsing JSON for ' + filename + ': ' + e.message);
      }
    }
  } else {
    console.log('Could not find TargetFile log for ' + filename);
  }
};

['Login.jsx', 'Login.css', 'Home.jsx', 'Home.css', 'Cart.jsx', 'Cart.css'].forEach(extractCode);
