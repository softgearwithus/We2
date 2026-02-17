const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'seed-skillforge.ts');
let content = fs.readFileSync(filePath, 'utf8');

// The markers for start of content strings
const markers = ["content: \`", "theory: \`", "desc: \`"];

let totalFixed = 0;

// Algorithm:
// For each marker, find starts.
// For each start, find the closing backtick.
// How to find CLOSING backtick? It's followed by , or } or ] or newline + whitespace + ,
// In our file it's usually `\n            },` or `,\n`

// Actually, we can use a state machine or just go through markers.
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

    // Append everything up to the marker + the marker itself
    newContent += content.substring(currentIndex, earliestMarker + foundMarker.length);
    let searchIndex = earliestMarker + foundMarker.length;

    // Now find the closing backtick.
    // In this file, content blocks end with ` followed by optional whitespace and then } or ] or ,
    // BUT internally there are backticks.
    // However, the CLOSING backtick is followed by something like \n            },
    // We can search for `\n\s*[`}\],]`
    const tailRegex = /`(\s*[\}\],])/;
    const tailMatch = content.substring(searchIndex).match(tailRegex);

    if (!tailMatch) {
        // Should not happen in well formed file.
        newContent += content.substring(searchIndex);
        break;
    }

    const relativeEndIdx = tailMatch.index;
    const innerContent = content.substring(searchIndex, searchIndex + relativeEndIdx);

    // Escape ALL backticks in innerContent
    let escapedInner = "";
    for (let char of innerContent) {
        if (char === "`") {
            escapedInner += "\\`";
            totalFixed++;
        } else {
            escapedInner += char;
        }
    }

    newContent += escapedInner;
    newContent += "`"; // The closing backtick we matched

    currentIndex = searchIndex + relativeEndIdx + 1; // Start after the closing backtick
}

fs.writeFileSync(filePath, newContent, 'utf8');
console.log(`Global fix finished. Escaped ${totalFixed} internal backticks.`);
