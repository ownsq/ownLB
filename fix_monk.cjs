const fs = require('fs');

let monk = fs.readFileSync('src/pages/MonkDetail.tsx', 'utf8');
monk = monk.replace(
  'import { Link, useParams } from "react-router-dom";',
  'import { Link, useParams } from "react-router-dom";\nimport { useState } from "react";\nimport { X } from "lucide-react";'
);
monk = monk.replace(
  'export function MonkDetail() {\n  const { id } = useParams();',
  'export function MonkDetail() {\n  const { id } = useParams();\n  const [toastMessage, setToastMessage] = useState("");\n  const showToast = (msg: string) => {\n    setToastMessage(msg);\n    setTimeout(() => setToastMessage(""), 3000);\n  };'
);

fs.writeFileSync('src/pages/MonkDetail.tsx', monk);
