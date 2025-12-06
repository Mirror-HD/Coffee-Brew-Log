import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

export const CoffeeBeanIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 3c-4.5 0-8 4-8 9s4.5 9 8 9 9-4 9-9c0-5-3-9-9-9z" />
    <path d="M7.5 10.5c1.5 2 3.5 2.5 4.5 2.5s3 .5 4.5 2.5" />
    <path d="M12 3v18" opacity="0.1" />
  </svg>
);

export const HandGrinderIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Body Container */}
    <path d="M7 11h10v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-9z" />
    {/* Lid/Top */}
    <path d="M6 11h12" />
    <path d="M8 11l2-4h4l2 4" />
    {/* Handle Shaft */}
    <path d="M12 7V3" />
    {/* Handle Arm */}
    <path d="M12 3h6" />
    {/* Knob */}
    <circle cx="18" cy="3" r="1.5" />
    {/* Window/Detail */}
    <rect x="9" y="14" width="6" height="4" rx="1" strokeOpacity="0.5" />
  </svg>
);

export const V60Icon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 5h18" /> 
    <path d="M5 5l7 14 7-14" />
    <path d="M9 10h6" strokeOpacity="0.3" />
    <path d="M10 14h4" strokeOpacity="0.3" />
  </svg>
);

export const ScaleIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="4" y="8" width="16" height="12" rx="2" />
    <line x1="16" y1="16" x2="17" y2="16" strokeLinecap="round" />
    <rect x="7" y="11" width="8" height="6" rx="1" fill="currentColor" fillOpacity="0.1" />
    <path d="M4 8l2-4h12l2 4" opacity="0.5" />
  </svg>
);
