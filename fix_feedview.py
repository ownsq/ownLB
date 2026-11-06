import re

with open('src/components/directory/FeedView.tsx', 'r') as f:
    content = f.read()

if 'import { GROUPS }' not in content:
    content = content.replace("import { useState } from 'react';", "import { useState } from 'react';\nimport { GROUPS } from './GroupsView';")

pattern = re.compile(r'\{\[\s*\{ title: "Buddhist Dhamma Network".*?\}\s*\]\.map\(\(group, i\) => \(', re.DOTALL)
content = pattern.sub('{GROUPS.map((group, i) => (', content)

with open('src/components/directory/FeedView.tsx', 'w') as f:
    f.write(content)
