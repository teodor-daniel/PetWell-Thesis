import React from 'react';
import { Paper } from '@mantine/core';


export default function GlassyCard({ children, style, ...props }) {
  return (
    <Paper
      withBorder
      shadow="xl"
      radius="lg"
      p="xl"
      style={{
        background: 'rgba(255,255,255,0.92)',
        border: '1px solid rgba(123,199,30,0.10)',
        boxShadow: '0 8px 32px 0 rgba(123,199,30,0.10)',
        backdropFilter: 'blur(16px) saturate(180%)',
        borderRadius: '1.5rem',
        transition: 'box-shadow 0.2s, transform 0.2s',
        ...style,
      }}
      {...props}
    >
      {children}
    </Paper>
  );
} 