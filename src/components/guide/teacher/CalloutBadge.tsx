import React from 'react';

export interface CalloutBadgeProps {
  num: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
}

export const CalloutBadge: React.FC<CalloutBadgeProps> = ({
  num,
  top,
  left,
  right,
  bottom,
}) => {
  return (
    <span
      style={{
        position: 'absolute',
        top,
        left,
        right,
        bottom,
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: '#ef4444',
        color: '#ffffff',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '11px',
        fontWeight: 800,
        boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
        zIndex: 10,
        border: '1.5px solid #ffffff',
      }}
    >
      {num}
    </span>
  );
};
