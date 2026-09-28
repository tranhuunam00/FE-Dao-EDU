import React from 'react';

export interface BrandLogoProps {
  size?: number;
  showText?: boolean;
  title?: string;
  subtitle?: string;
  textColor?: string;
  subtitleColor?: string;
  style?: React.CSSProperties;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 38,
  showText = false,
  title = 'DAO EDU',
  subtitle,
  textColor,
  subtitleColor,
  style,
  className,
}) => {
  return (
    <div
      className={`brand-logo-container ${className || ''}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: Math.max(8, Math.round(size * 0.28)),
        userSelect: 'none',
        ...style,
      }}
    >
      {/* BRAND ICON: EMBEDDED HIGH RESOLUTION VECTOR */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.26),
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(4, 120, 87, 0.25)',
        }}
      >
        <img
          src="/logo.svg"
          alt="DAO EDU Logo"
          style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
        />
      </div>

      {/* BRAND TEXT */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
          <div
            style={{
              fontSize: Math.max(14, Math.round(size * 0.42)),
              fontWeight: 800,
              fontFamily: 'var(--font-display, "Outfit", sans-serif)',
              letterSpacing: '0.04em',
              color: textColor || 'var(--text-primary, #0f172a)',
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: Math.max(10, Math.round(size * 0.25)),
                fontWeight: 600,
                color: subtitleColor || 'var(--text-secondary, #64748b)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginTop: 1,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
