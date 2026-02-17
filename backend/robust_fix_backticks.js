const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'seed-skillforge.ts');
let fileContent = fs.readFileSync(filePath, 'utf8');

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

let totalFixed = 0;

pythonModuleIds.forEach(id => {
    const startMarker = `topicId: '${id}'`;
    const startIndex = fileContent.indexOf(startMarker);
    if (startIndex === -1) return;

    // Find the 'content: `' start within this block
    const contentMarker = "content: `";
    const contentStart = fileContent.indexOf(contentMarker, startIndex);
    if (contentStart === -1) return;

    const actualContentStartIndex = contentStart + contentMarker.length;

    // Find the end of this module object to bound the search for the closing backtick
    // The next topicId or the end of the array
    let nextIndex = fileContent.indexOf("topicId:", actualContentStartIndex);
    if (nextIndex === -1) {
        nextIndex = fileContent.indexOf("]", actualContentStartIndex);
    }

    // Now find the LAST backtick before nextIndex. This should be the closing backtick.
    const blockToSearch = fileContent.substring(actualContentStartIndex, nextIndex);
    const lastBacktickRelative = blockToSearch.lastIndexOf("`")
    if (lastBacktickRelative === -1) return;

    const closingBacktickIndex = actualContentStartIndex + lastBacktickRelative;

    // Extract the raw content string
    const rawContent = fileContent.substring(actualContentStartIndex, closingBacktickIndex);

    // Escape every backtick in rawContent if not already escaped.
    // Also escape ${ to prevent template interpolation if any.
    let escapedContent = "";
    for (let i = 0; i < rawContent.length; i++) {
        const char = rawContent[i];
        const prevChar = i > 0 ? rawContent[i - 1] : "";

        if (char === "`") {
            if (prevChar !== "\\") {
                escapedContent += "\\`";
                totalFixed++;
            } else {
                escapedContent += char;
            }
        } else if (char === "$" && i < rawContent.length - 1 && rawContent[i + 1] === "{") {
            // Escape ${ to prevent interpolation errors
            if (prevChar !== "\\") {
                escapedContent += "\\$";
                totalFixed++;
            } else {
                escapedContent += char;
            }
        } else {
            escapedContent += char;
        }
    }

    // Replace in fileContent
    fileContent = fileContent.substring(0, actualContentStartIndex) + escapedContent + fileContent.substring(closingBacktickIndex);
});

fs.writeFileSync(filePath, fileContent, 'utf8');
console.log(`Finished. Fixed ${totalFixed} occurrences.`);
