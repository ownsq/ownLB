const fs = require('fs');
let content = fs.readFileSync('src/components/directory/FeedView.tsx', 'utf8');

// Add handleVote function
const handleVoteFunc = `  const handleVote = (postId: number, optionIndex: number) => {
    setPosts(posts.map(p => {
      if (p.id === postId && p.poll && p.poll.votedIndex === null) {
        const newOptions = [...p.poll.options];
        newOptions[optionIndex] = { ...newOptions[optionIndex], votes: newOptions[optionIndex].votes + 1 };
        return {
          ...p,
          poll: {
            ...p.poll,
            options: newOptions,
            totalVotes: p.poll.totalVotes + 1,
            votedIndex: optionIndex
          }
        };
      }
      return p;
    }));
  };`;

content = content.replace(
  '  const handlePost = () => {',
  handleVoteFunc + '\n\n  const handlePost = () => {'
);

// Update poll creation in newPost
content = content.replace(
  'poll: attachment === "Poll" ? pollOptions.filter(o => o.trim()) : null',
  'poll: attachment === "Poll" ? { options: pollOptions.filter(o => o.trim()).map(opt => ({ text: opt, votes: 0 })), totalVotes: 0, votedIndex: null } : null'
);

// Update poll render
const pollRender = `              {post.poll && post.poll.options && (
                <div className="space-y-2 mt-2">
                  {post.poll.options.map((opt: any, i: number) => {
                    const isVoted = post.poll.votedIndex !== null;
                    const isSelected = post.poll.votedIndex === i;
                    const percentage = post.poll.totalVotes > 0 ? Math.round((opt.votes / post.poll.totalVotes) * 100) : 0;
                    return (
                      <div 
                        key={i} 
                        className={\`relative flex items-center gap-3 p-2 rounded-lg transition-colors overflow-hidden \${isVoted ? '' : 'hover:bg-neutral-50 bg-neutral-100 cursor-pointer'}\`}
                        onClick={() => !isVoted && handleVote(post.id, i)}
                      >
                        {isVoted && (
                          <div 
                            className={\`absolute inset-y-0 left-0 opacity-20 \${isSelected ? 'bg-blue-600' : 'bg-neutral-400'}\`}
                            style={{ width: \`\${percentage}%\` }}
                          />
                        )}
                        <div className="relative flex-1 flex items-center justify-between text-sm text-neutral-800 z-10 px-1">
                          <div className="flex items-center gap-2">
                            {!isVoted && (
                              <input 
                                type="radio" 
                                name={\`poll-\${post.id}\`} 
                                className="w-4 h-4 text-blue-600 pointer-events-none"
                                checked={false}
                                readOnly
                              />
                            )}
                            <span className={isSelected ? 'font-medium' : ''}>{opt.text}</span>
                            {isSelected && <span className="text-blue-600 text-xs font-bold">✓</span>}
                          </div>
                          {isVoted && (
                            <span className="text-neutral-600 font-medium">{percentage}%</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-xs text-neutral-500 mt-1">{post.poll.totalVotes} vote{post.poll.totalVotes !== 1 ? 's' : ''}</p>
                </div>
              )}`;

const regex = /\{post\.poll && post\.poll\.length > 0 && \([\s\S]*?<\/div>\s*\)\}/;
content = content.replace(regex, pollRender);

fs.writeFileSync('src/components/directory/FeedView.tsx', content);
