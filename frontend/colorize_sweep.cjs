const fs = require('fs');
const path = require('path');

function replaceColors(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceColors(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;
            
            // Replace generic indigo and purple background/text with slate to enforce monochrome
            if (content.match(/indigo|purple/g)) {
                
                // Specific high-contrast mappings
                content = content.replace(/bg-indigo-600/g, 'bg-slate-800');
                content = content.replace(/bg-indigo-700/g, 'bg-slate-900');
                content = content.replace(/bg-indigo-900/g, 'bg-slate-900');
                content = content.replace(/text-indigo-600/g, 'text-slate-800');
                content = content.replace(/text-indigo-500/g, 'text-slate-700');
                content = content.replace(/text-indigo-700/g, 'text-slate-900');
                
                // Soft backgrounds
                content = content.replace(/bg-indigo-50/g, 'bg-slate-50');
                content = content.replace(/bg-indigo-100/g, 'bg-slate-100');
                
                // Borders & Shadows
                content = content.replace(/border-indigo-600/g, 'border-slate-800');
                content = content.replace(/border-indigo-500/g, 'border-slate-400');
                content = content.replace(/border-indigo-100/g, 'border-slate-200');
                content = content.replace(/border-indigo-200/g, 'border-slate-200');
                
                content = content.replace(/shadow-indigo-\d+(\/\d+)?/g, 'shadow-slate-200');
                content = content.replace(/ring-indigo-\d+(\/\d+)?/g, 'ring-slate-200');
                
                // Purple maps
                content = content.replace(/from-indigo-500 to-purple-500/g, 'from-brand-orange to-amber-500');
                content = content.replace(/from-indigo-500/g, 'from-slate-700');
                content = content.replace(/to-purple-500/g, 'to-slate-900');
                
                content = content.replace(/bg-purple-600/g, 'bg-slate-800');
                content = content.replace(/bg-purple-700/g, 'bg-slate-900');
                content = content.replace(/bg-purple-50/g, 'bg-slate-50');
                content = content.replace(/bg-purple-100/g, 'bg-slate-100');
                content = content.replace(/text-purple-600/g, 'text-slate-800');
                content = content.replace(/text-purple-700/g, 'text-slate-900');
                
                // Catch any remaining indigo/purple dynamically
                content = content.replace(/indigo-(\d+)/g, 'slate-$1');
                content = content.replace(/purple-(\d+)/g, 'slate-$1');

                if (content !== originalContent) {
                    fs.writeFileSync(fullPath, content);
                    console.log(`Updated: ${fullPath}`);
                }
            }
        }
    }
}

console.log("Starting color sweep...");
replaceColors(path.join(__dirname, 'app'));
console.log("Sweep complete.");
