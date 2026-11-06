const fs = require('fs');
let board = fs.readFileSync('src/components/directory/BoardView.tsx', 'utf8');

board = board.replace('import { useState } from \'react\';', 'import React, { useState } from \'react\';');

fs.writeFileSync('src/components/directory/BoardView.tsx', board);
