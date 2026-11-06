const fs = require('fs');
let content = fs.readFileSync('src/pages/GroupDetail.tsx', 'utf8');

if (!content.includes('useNavigate')) {
  content = content.replace("useLocation } from 'react-router-dom';", "useLocation, useNavigate } from 'react-router-dom';");
}

if (!content.includes('toastMessage')) {
  content = content.replace("const [isJoined, setIsJoined] = useState(true);", 
  "const [isJoined, setIsJoined] = useState(true);\n  const [toastMessage, setToastMessage] = useState('');\n  const navigate = useNavigate();");
}

const saveButtonCode = `onClick={() => {
                        const updated = {...group, ...editForm};
                        setGroup(updated);
                        navigate('.', { state: { group: updated }, replace: true });
                        setToastMessage("Group settings saved successfully.");
                        setTimeout(() => setToastMessage(""), 3000);
                      }}`;

content = content.replace(/onClick=\{\(\) => setGroup\(\{\.\.\.group, \.\.\.editForm\}\)\}/, saveButtonCode);

const toastUI = `return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-neutral-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage("")} className="text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}`;
      
if (!content.includes('Toast Notification')) {
  content = content.replace(/return \(\s*<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">/, toastUI);
}

if (!content.includes('X } from')) {
  content = content.replace("Image as ImageIcon2", "Image as ImageIcon2, X");
}

fs.writeFileSync('src/pages/GroupDetail.tsx', content);
