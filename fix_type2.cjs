const fs = require('fs');
let content = fs.readFileSync('src/components/directory/MessagesView.tsx', 'utf8');
content = content.replace(
  "import { useState } from 'react';",
  "import React, { useState } from 'react';"
);
fs.writeFileSync('src/components/directory/MessagesView.tsx', content);
