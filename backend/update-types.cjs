const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (file.endsWith('.controller.ts') || file.endsWith('.guard.ts') || file.endsWith('.interceptor.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;

      content = content.replace(/(@Request\(\)\s*req:\s*)any/g, '$1AuthenticatedRequest');
      content = content.replace(/(@Req\(\)\s*req:\s*)any/g, '$1AuthenticatedRequest');
      content = content.replace(/(\breq:\s*)any/g, '$1AuthenticatedRequest');
      content = content.replace(/(\brequest:\s*)any/g, '$1AuthenticatedRequest');

      if (content !== originalContent) {
        if (!content.includes('import { AuthenticatedRequest }')) {
          const relativePart = fullPath.replace(/\\/g, '/').split('src/')[1];
          const depth = relativePart.split('/').length - 1;
          const relativePrefix = depth === 0 ? './auth/interfaces/' : '../'.repeat(depth) + 'auth/interfaces/';
          const importStmt = `import { AuthenticatedRequest } from '${relativePrefix}authenticated-request.interface';\n`;
          
          const lines = content.split('\n');
          const firstImportIdx = lines.findIndex(l => l.startsWith('import'));
          if (firstImportIdx >= 0) {
            lines.splice(firstImportIdx, 0, importStmt);
          } else {
            lines.unshift(importStmt);
          }
          content = lines.join('\n');
        }

        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated ' + fullPath);
      }
    }
  }
}
processDir('src');
