import React from 'react';

export default function GlassyBackground({ children, style }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative', 
        background: 'linear-gradient(135deg, #f8fff6 0%, #e6f7e6 100%)',
        fontFamily: 'Inter, Roboto, Open Sans, sans-serif',
        overflowX: 'hidden',
        overflowY: 'auto', 
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <svg style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40vw', height: '40vw', opacity: 0.18 }}>
          <circle cx="30%" cy="30%" r="180" fill="#7bc71e" />
        </svg>
        <svg style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40vw', height: '40vw', opacity: 0.13 }}>
          <rect x="20" y="20" width="220" height="220" rx="40" fill="#7bc71e" />
        </svg>
        <svg style={{ position: 'absolute', top: '60%', left: '5%', width: '20vw', height: '20vw', opacity: 0.10 }}>
          <ellipse cx="100" cy="80" rx="80" ry="60" fill="#7bc71e" />
        </svg>
        <svg style={{ position: 'absolute', bottom: '10%', left: '10%', width: '15vw', height: '15vw', opacity: 0.09 }}>
          <polygon points="0,100 100,0 200,100 100,200" fill="#7bc71e" />
        </svg>
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
} 