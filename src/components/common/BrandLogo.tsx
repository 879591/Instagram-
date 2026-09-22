/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showTagline = false,
  clickable = false,
  onClick,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  return (
    <div
      id="brand-logo"
      onClick={clickable ? onClick : undefined}
      className={`flex items-center gap-2.5 select-none ${clickable ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Original S Emblem Squircle */}
      <div
        className={`relative ${iconSizes[size]} shrink-0 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-purple-700 p-0.5 shadow-md shadow-rose-950/30 flex items-center justify-center`}
      >
        <div className="w-full h-full bg-zinc-950/30 backdrop-blur-xs rounded-[14px] flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-[68%] h-[68%] text-white fill-none stroke-current" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
            {/* Elegant original geometric S ribbon */}
            <path d="M72 32 C72 20, 58 16, 42 16 C26 16, 20 26, 20 36 C20 54, 38 58, 54 62 C70 66, 80 72, 80 84 C80 96, 66 100, 48 100 C30 100, 20 92, 20 92" />
            <circle cx="78" cy="32" r="5" className="fill-rose-300 stroke-none" />
            <circle cx="22" cy="92" r="4.5" className="fill-purple-300 stroke-none" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col">
        <span
          className={`font-extrabold tracking-tight bg-gradient-to-r from-rose-400 via-rose-200 to-white bg-clip-text text-transparent font-display ${textSizes[size]}`}
          style={{ letterSpacing: '-0.03em' }}
        >
          SUPRIYA
        </span>
        {showTagline && (
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 -mt-1">
            Connect · Create · Share
          </span>
        )}
      </div>
    </div>
  );
};
