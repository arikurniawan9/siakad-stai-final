import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text = 'Memuat data...'
}) => {
  const pixelSize = size === 'sm' ? 18 : size === 'lg' ? 36 : 24;

  return (
    <div className="flex flex-col items-center justify-center gap-3" style={{ padding: 'var(--space-8)' }}>
      <div 
        className="spinner" 
        style={{ width: `${pixelSize}px`, height: `${pixelSize}px` }} 
      />
      {text && <p className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>{text}</p>}
    </div>
  );
};

export const Skeleton: React.FC<{ width?: string; height?: string; borderRadius?: string; className?: string }> = ({
  width = '100%',
  height = '20px',
  borderRadius = 'var(--radius-sm)',
  className = ''
}) => (
  <div 
    className={`skeleton ${className}`} 
    style={{ width, height, borderRadius }} 
  />
);
