const fs = require('fs');
let code = fs.readFileSync('src/pages/Restaurants.tsx', 'utf8');

code = code.replace(
  "className={\\`absolute top-3 right-3 px-2.5 py-1 rounded-md text-xs font-bold shadow-sm backdrop-blur-sm \\${restaurant.status === 'Open Now' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'}\\`}",
  "className={`absolute top-3 right-3 px-2.5 py-1 rounded-md text-xs font-bold shadow-sm backdrop-blur-sm ${restaurant.status === 'Open Now' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'}`}"
);

fs.writeFileSync('src/pages/Restaurants.tsx', code);
