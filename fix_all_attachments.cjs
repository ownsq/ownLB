const fs = require('fs');
let content = fs.readFileSync('src/components/directory/FeedView.tsx', 'utf8');

// Update state and imports
content = content.replace(
  'const [attachment, setAttachment] = useState<string | null>(null);',
  `const [attachment, setAttachment] = useState<string | null>(null);
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [feeling, setFeeling] = useState("Happy");`
);

content = content.replace(
  'const [posts, setPosts] = useState([',
  'const [posts, setPosts] = useState<any[]>(['
);

content = content.replace(
  /const newPost = \{\s*id: Date\.now\(\),\s*author: user\?\.name \|\| "Saminda Fernando",\s*authorImg: user\?\.avatar \|\| "https:\/\/i\.pravatar\.cc\/150\?u=saminda",\s*group: "",\s*time: "Just now",\s*loc: "Los Angeles, USA",\s*content: postContent,\s*hasImages: attachment === "Photo"\s*\};/m,
  `const newPost = {
      id: Date.now(),
      author: user?.name || "Saminda Fernando",
      authorImg: user?.avatar || "https://i.pravatar.cc/150?u=saminda",
      group: "",
      time: "Just now",
      loc: "Los Angeles, USA",
      content: postContent,
      hasImages: attachment === "Photo",
      hasVideo: attachment === "Video",
      poll: attachment === "Poll" ? pollOptions.filter(o => o.trim()) : null,
      event: attachment === "Event" ? { date: eventDate, location: eventLocation } : null,
      feeling: attachment === "Feeling" ? feeling : null
    };`
);

content = content.replace(
  'setAttachment(null);',
  'setAttachment(null);\n    setPollOptions(["", ""]);\n    setEventDate("");\n    setEventLocation("");\n    setFeeling("Happy");'
);

// Add the attachment UI in "Create Post"
const attachmentUI = `
          {attachment === 'Photo' && (
            <div className="mt-3 p-4 border border-dashed border-neutral-300 rounded-xl bg-neutral-50 flex items-center justify-center text-sm text-neutral-500">
              <ImageIcon className="w-5 h-5 mr-2 text-neutral-400" /> Click to upload a photo (simulation)
            </div>
          )}
          {attachment === 'Video' && (
            <div className="mt-3 p-4 border border-dashed border-neutral-300 rounded-xl bg-neutral-50 flex items-center justify-center text-sm text-neutral-500">
              <Video className="w-5 h-5 mr-2 text-neutral-400" /> Click to upload a video (simulation)
            </div>
          )}
          {attachment === 'Poll' && (
            <div className="mt-3 space-y-2">
              {pollOptions.map((opt, idx) => (
                <input 
                  key={idx}
                  type="text"
                  placeholder={\`Option \${idx + 1}\`}
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...pollOptions];
                    newOpts[idx] = e.target.value;
                    setPollOptions(newOpts);
                  }}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-2 text-sm text-neutral-900 outline-none focus:bg-white focus:border-blue-300"
                />
              ))}
              <button onClick={() => setPollOptions([...pollOptions, ""])} className="text-sm text-blue-600 font-medium hover:underline">
                + Add Option
              </button>
            </div>
          )}
          {attachment === 'Event' && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <input 
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-2 text-sm text-neutral-900 outline-none focus:bg-white focus:border-orange-300"
              />
              <input 
                type="text"
                placeholder="Location"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-2 text-sm text-neutral-900 outline-none focus:bg-white focus:border-orange-300"
              />
            </div>
          )}
          {attachment === 'Feeling' && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-neutral-600">Feeling:</span>
              <select value={feeling} onChange={(e) => setFeeling(e.target.value)} className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-2 text-sm text-neutral-900 outline-none focus:bg-white focus:border-amber-300">
                <option value="Happy">😊 Happy</option>
                <option value="Excited">🤩 Excited</option>
                <option value="Blessed">😇 Blessed</option>
                <option value="Loved">🥰 Loved</option>
                <option value="Sad">😢 Sad</option>
              </select>
            </div>
          )}
`;

content = content.replace(
  '            />\n          </div>\n          <div className="flex items-center justify-between mt-4 px-2">',
  '            />\n          </div>' + attachmentUI + '\n          <div className="flex items-center justify-between mt-4 px-2">'
);

// Add feeling to post author line
content = content.replace(
  '                      {post.author} \n                      {post.group',
  '                      {post.author} \n                      {post.feeling && <span className="text-neutral-500 font-normal">is feeling {post.feeling}</span>}\n                      {post.group'
);


const postAttachmentsUI = `
              {post.hasVideo && (
                <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center h-48">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-white text-xl">▶</span>
                  </div>
                </div>
              )}
              {post.poll && post.poll.length > 0 && (
                <div className="space-y-2 mt-2">
                  {post.poll.map((opt: string, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <input type="radio" name={\`poll-\${post.id}\`} className="w-4 h-4 text-blue-600" />
                      <div className="flex-1 bg-neutral-100 rounded-lg p-2 text-sm text-neutral-800">
                        {opt}
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-neutral-500 mt-1">0 votes</p>
                </div>
              )}
              {post.event && post.event.date && (
                <div className="mt-2 border border-neutral-200 rounded-xl p-3 flex items-center gap-4 bg-orange-50">
                  <div className="bg-white text-orange-600 rounded-lg p-2 text-center w-14 shadow-sm">
                    <div className="text-xs font-bold uppercase">{new Date(post.event.date).toLocaleString('default', { month: 'short' })}</div>
                    <div className="text-lg font-bold leading-none">{new Date(post.event.date).getDate()}</div>
                  </div>
                  <div>
                    <h5 className="font-bold text-neutral-900 text-sm">Community Event</h5>
                    <p className="text-xs text-neutral-600">{post.event.location}</p>
                  </div>
                </div>
              )}
`;

content = content.replace(
  /                  <\/div>\n                <\/div>\n              \)}\s*<div className="flex items-center justify-between text-xs text-neutral-500 pt-2">/m,
  '                  </div>\n                </div>\n              )}' + postAttachmentsUI + '\n              <div className="flex items-center justify-between text-xs text-neutral-500 pt-2">'
);

fs.writeFileSync('src/components/directory/FeedView.tsx', content);
