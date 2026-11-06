const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminPanel.tsx', 'utf8');

code = code.replace(
  "import { useState } from 'react';",
  "import React, { useState } from 'react';"
);

fs.writeFileSync('src/pages/AdminPanel.tsx', code);
