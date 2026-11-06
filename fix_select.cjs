const fs = require('fs');
let code = fs.readFileSync('src/components/directory/PeopleView.tsx', 'utf8');

const oldSelect = `<select 
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="bg-white border border-neutral-200 rounded-lg pl-3 pr-8 py-2 text-sm font-medium outline-none text-neutral-700 min-w-[140px]"
          >
            <option>All Countries</option>
            <option>Japan</option>
            <option>UK</option>
            <option>Australia</option>
            </select>
            <option>All Countries</option>
            <option>USA</option>
            <option>Australia</option>
            <option>UK</option>
          </select>`;

const newSelect = `<select 
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="bg-white border border-neutral-200 rounded-lg pl-3 pr-8 py-2 text-sm font-medium outline-none text-neutral-700 min-w-[140px]"
          >
            <option>All Countries</option>
            <option>Japan</option>
            <option>UK</option>
            <option>Australia</option>
            <option>USA</option>
            <option>Canada</option>
          </select>`;

code = code.replace(oldSelect, newSelect);

fs.writeFileSync('src/components/directory/PeopleView.tsx', code);
