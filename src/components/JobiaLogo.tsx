import React from 'react';

export interface JobiaLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  onClick?: () => void;
  clickable?: boolean;
}

export const JobiaLogo: React.FC<JobiaLogoProps> = ({ 
  className = '', 
  size = 'md',
  onClick,
  clickable = true
}) => {
  const sizeMap = {
    xs: { height: 22, width: 88 },
    sm: { height: 28, width: 112 },
    md: { height: 38, width: 152 },
    lg: { height: 48, width: 192 },
    xl: { height: 64, width: 256 },
    '2xl': { height: 82, width: 328 },
  };

  const current = sizeMap[size as keyof typeof sizeMap] || sizeMap.md;

  const handleClick = (e: React.MouseEvent) => {
    if (!clickable) return;
    
    if (onClick) {
      onClick();
      return;
    }

    // Default SPA navigation to root if not provided
    if (window.location.pathname !== '/' || window.location.search !== '') {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (clickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      handleClick(e as any);
    }
  };

  return (
    <div
      role={clickable ? 'button' : 'img'}
      tabIndex={clickable ? 0 : undefined}
      aria-label="jobia.az - Ana səhifə"
      onClick={clickable ? handleClick : undefined}
      onKeyDown={clickable ? handleKeyDown : undefined}
      className={`inline-flex items-center select-none transition-transform active:scale-[0.98] ${
        clickable ? 'cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md' : ''
      } ${className}`}
      style={{ height: current.height, maxWidth: '100%' }}
    >
      <svg
        viewBox="0 0 540 140"
        height={current.height}
        style={{ width: 'auto', maxHeight: '100%' }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-2xs"
      >
        <style>
          {`
            .jobia-brand-text {
              font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
              font-size: 130px;
              font-weight: 900;
              letter-spacing: -0.04em;
            }
          `}
        </style>
        
        {/* Full vector jobia.az text with exact colors: job(green), ia.(navy), az(green) */}
        <text x="10" y="106" className="jobia-brand-text">
          <tspan fill="#00a859">job</tspan>
          <tspan fill="#0b1b2b">ia.</tspan>
          <tspan fill="#00a859">az</tspan>
        </text>
      </svg>
      {/* Hidden text for screen readers and SEO */}
      <span className="sr-only">jobia.az</span>
    </div>
  );
};

// Also export as HireMeLogo for full backwards compatibility
export const HireMeLogo = JobiaLogo;

export default JobiaLogo;
