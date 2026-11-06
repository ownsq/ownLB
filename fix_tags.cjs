const fs = require('fs');
let board = fs.readFileSync('src/components/directory/BoardView.tsx', 'utf8');

board = board.replace(/ {8}<\/div>\s*\{\/\* New Topic Modal \*\/\}/g, '        </div>\n      </div>\n\n      {/* New Topic Modal */}');

fs.writeFileSync('src/components/directory/BoardView.tsx', board);
