'use client';

import { ReactNode } from 'react';
import { useAdaptiveRendering } from '../hooks/usePerformance';

interface OptimizedAnimationProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  fallbackClassName?: string;
}

export function OptimizedAnimation({
  children,
  className = '',
  style = {},
  fallbackClassName = ''
}: OptimizedAnimationProps) {
  const { shouldReduceAnimations } = useAdaptiveRendering();

  const optimizedClassName = shouldReduceAnimations()
    ? fallbackClassName || className.replace(/animate-\S+/g, '').trim()
    : className;

  const optimizedStyle = shouldReduceAnimations()
    ? { ...style, animationDuration: '0.01ms' }
    : style;

  return (
    <div className={optimizedClassName} style={optimizedStyle}>
      {children}
    </div>
  );
}

interface PerformanceAwareComponentProps {
  children: ReactNode;
  className?: string;
  highQualityClass?: string;
  lowQualityClass?: string;
}

export function PerformanceAwareComponent({
  children,
  className = '',
  highQualityClass = '',
  lowQualityClass = ''
}: PerformanceAwareComponentProps) {
  const { shouldReduceQuality } = useAdaptiveRendering();

  const finalClassName = shouldReduceQuality()
    ? `${className} ${lowQualityClass}`.trim()
    : `${className} ${highQualityClass}`.trim();

  return (
    <div className={finalClassName}>
      {children}
    </div>
  );
}
