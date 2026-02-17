const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'seed-skillforge.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove all backslash-backtick sequences (including multiple backslashes)
content = content.replace(/\\+`/g, '`');

// 2. We also need to be careful about escaped backslashes in the original content?
// In our file, we mostly care about backticks.

const markers = ["content: `", "theory: `", "desc: `"];

let currentIndex = 0;
let newContent = "";

while (currentIndex < content.length) {
    let earliestMarker = -1;
    let foundMarker = "";

    markers.forEach(m => {
        const idx = content.indexOf(m, currentIndex);
        if (idx !== -1 && (earliestMarker === -1 || idx < earliestMarker)) {
            earliestMarker = idx;
            foundMarker = m;
        }
    });

    if (earliestMarker === -1) {
        newContent += content.substring(currentIndex);
        break;
    }

    // Append up to marker
    newContent += content.substring(currentIndex, earliestMarker + foundMarker.length);
    let searchIndex = earliestMarker + foundMarker.length;

    // Find closing backtick
    // Closest ` followed by \n\s*[}\],]
    const tailRegex = /`(\s*[\}\],])/;
    const tailMatch = content.substring(searchIndex).match(tailRegex);

    if (!tailMatch) {
        newContent += content.substring(searchIndex);
        break;
    }

    const relativeEndIdx = tailMatch.index;
    const innerContent = content.substring(searchIndex, searchIndex + relativeEndIdx);

    // Escape EVERY backtick
    const escapedInner = innerContent.replace(/`/g, "\\`").replace(/\$\{/g, "\\${");

    newContent += escapedInner;
    newContent += "`";
    currentIndex = searchIndex + relativeEndIdx + 1;
}

fs.writeFileSync(filePath, newContent, 'utf8');
console.log("Ultimate fix applied.");
