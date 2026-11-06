import React from 'react';

export function LogoIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Swoosh background layer */}
      <path d="M 15 95 C 40 115 80 105 105 85 C 80 100 45 105 15 95 Z" fill="#D27D2D" />
      <path d="M 20 85 C 45 105 85 95 105 75 C 85 90 45 95 20 85 Z" fill="#65350F" />
      
      {/* Dharmachakra (Wheel) */}
      <g transform="translate(60, 50)">
        <circle cx="0" cy="0" r="28" stroke="#D27D2D" strokeWidth="4"/>
        <circle cx="0" cy="0" r="22" stroke="#D27D2D" strokeWidth="2"/>
        <circle cx="0" cy="0" r="10" stroke="#D27D2D" strokeWidth="3" fill="#F4B150"/>
        <circle cx="0" cy="0" r="3" fill="#65350F"/>
        
        {/* Spokes */}
        {[0, 45, 90, 135].map(angle => (
          <line key={`spoke-${angle}`} x1="0" y1="-26" x2="0" y2="26" stroke="#D27D2D" strokeWidth="3" transform={`rotate(${angle})`} />
        ))}
        
        {/* Outer Knobs */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
          <circle key={`knob-${angle}`} cx="0" cy="-31" r="3" fill="#D27D2D" transform={`rotate(${angle})`} />
        ))}
      </g>
      
      {/* Branch */}
      <path d="M 35 85 C 25 70 28 45 35 30" stroke="#65350F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M 32 55 C 25 55 20 60 15 65" stroke="#65350F" strokeWidth="2" strokeLinecap="round" fill="none" />
      
      {/* Top Bodhi Leaf */}
      <path d="M 35 15 C 20 10 5 25 15 40 C 20 45 32 45 35 45 C 35 45 45 30 40 20 C 38 16 35 15 35 15 Z" fill="#4A7C32" stroke="#FFF" strokeWidth="1.5" />
      <path d="M 23 41 L 35 15" stroke="#FFF" strokeWidth="1" fill="none" />
      
      {/* Left Bodhi Leaf */}
      <path d="M 12 45 C -5 45 -10 65 0 75 C 5 80 18 75 22 70 C 22 70 30 55 20 48 C 18 46 15 45 12 45 Z" fill="#4A7C32" stroke="#FFF" strokeWidth="1.5" />
      <path d="M 20 69 L 10 45" stroke="#FFF" strokeWidth="1" fill="none" />
      
      {/* Right Bottom Bodhi Leaf */}
      <path d="M 75 75 C 65 85 75 105 90 105 C 100 105 105 90 100 80 C 95 70 85 70 75 75 Z" fill="#4A7C32" stroke="#FFF" strokeWidth="1.5" />
      <path d="M 98 81 L 75 75" stroke="#FFF" strokeWidth="1" fill="none" />
    </svg>
  );
}

export function LogoText({ className = "text-lg", showTagline = true, light = false, align = "start" }: { className?: string, showTagline?: boolean, light?: boolean, align?: "start" | "center" }) {
  return (
    <div className={`flex flex-col ${align === 'center' ? 'items-center' : 'items-start'}`}>
      <h1 className={`font-bold leading-tight ${className}`}>
        <span className={light ? "text-white" : "text-[#65350F]"}>LankaBuddhist</span>
        <span className={light ? "text-amber-400" : "text-[#D27D2D]"}>.com</span>
      </h1>
      {showTagline && (
        <p className={`text-[10px] sm:text-xs font-medium tracking-wide ${light ? "text-neutral-400" : "text-[#4A7C32]"}`}>
          Connecting Sri Lankans. Sharing Dhamma.
        </p>
      )}
    </div>
  );
}

export function Logo({ className = "w-10 h-10", textClassName = "text-xl", showTagline = true, light = false, layout = "row" }: { className?: string, textClassName?: string, showTagline?: boolean, light?: boolean, layout?: "row" | "col" }) {
  return (
    <div className={`flex ${layout === 'col' ? 'flex-col items-center justify-center text-center' : 'items-center gap-3'}`}>
      <LogoIcon className={className} />
      <LogoText className={textClassName} showTagline={showTagline} light={light} align={layout === 'col' ? 'center' : 'start'} />
    </div>
  );
}
