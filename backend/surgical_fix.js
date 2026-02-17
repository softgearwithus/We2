const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'seed-skillforge.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove ALL backtick escapes: \` -> `
content = content.replace(/\\`/g, '`');

// 2. Identify Python modules to escape internally
const pythonModuleIds = [
    'programming-python-module-0',
    'programming-python-module-1',
    'programming-python-module-2',
    'programming-python-module-3',
    'programming-python-module-4',
    'programming-python-module-5',
    'programming-python-module-6',
    'programming-python-module-7'
];

pythonModuleIds.forEach(id => {
    const startMarker = `topicId: '${id}'`;
    const startIndex = content.indexOf(startMarker);
    if (startIndex === -1) return;

    const contentMarker = "content: `";
    const contentStart = content.indexOf(contentMarker, startIndex);
    if (contentStart === -1) return;

    const actualContentStartIndex = contentStart + contentMarker.length;

    let nextIndex = content.indexOf("topicId:", actualContentStartIndex);
    if (nextIndex === -1) {
        nextIndex = content.indexOf("]", actualContentStartIndex);
    }

    const blockToSearch = content.substring(actualContentStartIndex, nextIndex);
    const lastBacktickRelative = blockToSearch.lastIndexOf("`")
    if (lastBacktickRelative === -1) return;

    const closingBacktickIndex = actualContentStartIndex + lastBacktickRelative;

    const rawContent = content.substring(actualContentStartIndex, closingBacktickIndex);

    // Escape internal backticks
    let escaped = "";
    for (let char of rawContent) {
        if (char === "`") escaped += "\\`";
        else escaped += char;
    }

    content = content.substring(0, actualContentStartIndex) + escaped + content.substring(closingBacktickIndex);
});

fs.writeFileSync(filePath, content, 'utf8');
console.log("File cleaned and Python modules re-escaped.");
