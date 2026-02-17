const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'seed-skillforge.ts');
let content = fs.readFileSync(filePath, 'utf8');

// We need to find ``` that are NOT escaped.
// Since we are inside a template string in the file (starting with ` content: `...), any ``` inside must be escaped as \`\`\`.
// However, the file itself is code.
// regex: find newline followed by ```
// content = content.replace(/\n```/g, '\n\\```');
// But handle if it's already escaped?
// content.replace(/\n(?<!\\)```/g, '\n\\```');
// Node check for lookbehind support. 
// Safer: match \n``` and check if preceding char is \.

// Actually, we can just look for the specific pattern we inserted.
// We inserted `\`\`\`text` which became `\`\`\`text`.
// We want `\`\`\`text` to become `\`\`\`text`. wait.
// We want `\` + `` ` `` + `` ` `` + `` ` ``.
// So replace `\n``` ` with `\n\``` `.

// Let's rely on a function to check.
let escapedCount = 0;
// Regex: Matches newline, then optional whitespace, then 3 backticks.
// We capture potential backslash before backticks.
const regex = /(\n\s*)(\\?)(`{3})/g;

content = content.replace(regex, (match, prefix, backslash, backticks) => {
    // If backslash exists, it's already escaped (hopefully).
    // But wait, our script might have produced `\`\`\`` (one backslash + 3 backticks).
    // If the file view showed `\`\`\`text`, it meant `\`\`\`text`.
    // We want `\`\`\`text`.
    // Wait, if line 209 is `\`\`\`text` (Step 1782), does it mean NO backslash?
    // Step 1782 line 209 says `209: \`\`\`text`.
    // Step 1782 line 199 says `199:                 content: \`# 🐍 Module 0: Python Internals`.
    // Line 199 starts with backtick.
    // Line 209 starts with 3 backticks.
    // IF line 209 has no backslash, then the first backtick closes the string opened at 199.
    // So `text` is outside string.
    // So YES, we need to escape them.

    // Check if backslash is present.
    if (backslash === '\\') {
        // It's matched `\ ``` `
        // Do we need double backslash? `\\``` `?
        // No, `\` escapes the backtick in syntax.
        // So `\` alone is sufficient.
        // But previously I deduced they were missing.
        // If they are missing, `backslash` will be empty string.
        return match;
    } else {
        // Missing backslash. Add it.
        escapedCount++;
        return prefix + '\\' + backticks;
    }
});

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Fixed ${escapedCount} unescaped code blocks.`);
