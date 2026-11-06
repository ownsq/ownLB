const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let code = fs.readFileSync(fullPath, 'utf8');
      if (code.includes('href="#"')) {
        code = code.replace(/href="#"/g, 'href="#" onClick={(e) => e.preventDefault()}');
        fs.writeFileSync(fullPath, code);
      }
    }
  }
}

processDir('./src');
