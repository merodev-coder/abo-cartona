import React from 'react';

interface DividerProps {
  type?: 'visible' | 'solid';
  className?: string;
}

export default function Divider({ type = 'visible', className = '' }: DividerProps) {
  return (
    <div
      className={`divider-${type} ${className}`}
      role="separator"
      aria-orientation="horizontal"
    />
  );
}
