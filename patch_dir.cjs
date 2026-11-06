const fs = require('fs');
let code = fs.readFileSync('src/pages/Directory.tsx', 'utf8');

if (!code.includes('GoogleAd')) {
  code = code.replace(
    'import { useState } from "react";',
    'import { useState, useEffect } from "react";'
  );

  code = code.replace(
    'export function Directory() {',
    `const GoogleAd = ({ client, slot, format }: { client: string, slot: string, format: string }) => {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('Google Ads error:', e);
    }
  }, [slot, client, format]);

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden p-2">
      <div className="text-center">
        <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-2 font-bold">Advertisement</span>
      </div>
      <div className="min-h-[100px] bg-neutral-50 rounded-lg flex items-center justify-center relative overflow-hidden">
        {/* Placeholder for preview when ads don't load */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <span className="text-sm font-bold text-neutral-500">Google Ad Placement</span>
        </div>
        <ins className="adsbygoogle relative z-10"
          style={{ display: 'block', width: '100%' }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true" />
      </div>
    </div>
  );
};\n\nexport function Directory() {`
  );

  code = code.replace(
    `{/* Advertisement */}
          {adConfig.isActive && (
            <a href={adConfig.linkUrl} target="_blank" rel="noreferrer" className="block bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl overflow-hidden relative group cursor-pointer shadow-sm">
              <img referrerPolicy="no-referrer" src={adConfig.imageUrl} alt={adConfig.title} className="w-full h-40 object-cover mix-blend-overlay opacity-40 group-hover:opacity-50 transition-opacity" />
              <div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-black/30 px-2 py-1 rounded backdrop-blur-sm">Sponsored</span>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1 leading-tight">{adConfig.title}</h4>
                  <p className="text-sm text-indigo-100 mb-3 line-clamp-2">{adConfig.description}</p>
                  <span className="inline-flex items-center text-xs font-bold bg-white text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-50 transition-colors">
                    {adConfig.linkText}
                  </span>
                </div>
              </div>
            </a>
          )}`,
    `{/* Advertisements */}
          <div className="space-y-4">
            {adConfig.isCustomAdActive && (
              <a href={adConfig.linkUrl} target="_blank" rel="noreferrer" className="block bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl overflow-hidden relative group cursor-pointer shadow-sm">
                <img referrerPolicy="no-referrer" src={adConfig.imageUrl} alt={adConfig.title} className="w-full h-40 object-cover mix-blend-overlay opacity-40 group-hover:opacity-50 transition-opacity" />
                <div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-black/30 px-2 py-1 rounded backdrop-blur-sm">Sponsored</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1 leading-tight">{adConfig.title}</h4>
                    <p className="text-sm text-indigo-100 mb-3 line-clamp-2">{adConfig.description}</p>
                    <span className="inline-flex items-center text-xs font-bold bg-white text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-50 transition-colors">
                      {adConfig.linkText}
                    </span>
                  </div>
                </div>
              </a>
            )}
            
            {adConfig.isGoogleAdActive && (
              <GoogleAd 
                client={adConfig.googleAdClient} 
                slot={adConfig.googleAdSlot} 
                format={adConfig.googleAdFormat} 
              />
            )}
          </div>`
  );
  fs.writeFileSync('src/pages/Directory.tsx', code);
}
