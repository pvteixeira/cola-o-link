'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import './GradualBlur.css';

interface GradualBlurConfig {
  position?: 'top' | 'bottom' | 'left' | 'right';
  strength?: number;
  height?: string | number;
  width?: string | number;
  divCount?: number;
  exponential?: boolean;
  zIndex?: number;
  animated?: boolean | 'scroll';
  duration?: string;
  easing?: string;
  opacity?: number;
  curve?: 'linear' | 'bezier' | 'ease-in' | 'ease-out' | 'ease-in-out';
  responsive?: boolean;
  target?: 'parent' | 'page';
  className?: string;
  style?: React.CSSProperties;
  hoverIntensity?: number;
  onAnimationComplete?: () => void;
  preset?: string;
  ambientLight?: boolean;
  fadeToBackground?: boolean;
  backgroundColor?: string;
  [key: string]: any;
}

const DEFAULT_CONFIG: GradualBlurConfig = {
  position: 'bottom',
  strength: 2.5,
  height: '7rem',
  divCount: 6,
  exponential: true,
  zIndex: 40,
  animated: false,
  duration: '0.3s',
  easing: 'ease-out',
  opacity: 1,
  curve: 'bezier',
  responsive: false,
  target: 'page',
  className: '',
  style: {},
  ambientLight: true,
  fadeToBackground: true,
  backgroundColor: '#0B0F17'
};

const PRESETS: Record<string, Partial<GradualBlurConfig>> = {
  top: { position: 'top', height: '5rem' },
  bottom: { position: 'bottom', height: '7rem' },
  left: { position: 'left', height: '6rem' },
  right: { position: 'right', height: '6rem' },
  subtle: { height: '4rem', strength: 1.5, opacity: 0.8, divCount: 4 },
  intense: { height: '10rem', strength: 4, divCount: 8, exponential: true },
  smooth: { height: '8rem', curve: 'bezier', divCount: 8 },
  sharp: { height: '5rem', curve: 'linear', divCount: 4 },
  header: { position: 'top', height: '6rem', curve: 'ease-out' },
  footer: { position: 'bottom', height: '8rem', curve: 'ease-out' },
  'page-header': { position: 'top', height: '6rem', target: 'page', strength: 2.5 },
  'page-footer': { position: 'bottom', height: '7.5rem', target: 'page', strength: 3 }
};

const CURVE_FUNCTIONS: Record<string, (p: number) => number> = {
  linear: p => p,
  bezier: p => p * p * (3 - 2 * p),
  'ease-in': p => p * p,
  'ease-out': p => 1 - Math.pow(1 - p, 2),
  'ease-in-out': p => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2)
};

const mergeConfigs = (...configs: any[]) => configs.reduce((acc, c) => ({ ...acc, ...c }), {});

const getGradientDirection = (position?: string) =>
  ({
    top: 'to top',
    bottom: 'to bottom',
    left: 'to left',
    right: 'to right'
  })[position || 'bottom'] || 'to bottom';

const debounce = (fn: (...args: any[]) => void, wait: number) => {
  let t: any;
  return (...a: any[]) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), wait);
  };
};

const useResponsiveDimension = (responsive: boolean | undefined, config: any, key: string) => {
  const [value, setValue] = useState(config[key]);
  useEffect(() => {
    if (!responsive) return;
    const calc = () => {
      const w = window.innerWidth;
      let v = config[key];
      if (w <= 480 && config[`mobile${key[0].toUpperCase() + key.slice(1)}`])
        v = config[`mobile${key[0].toUpperCase() + key.slice(1)}`];
      else if (w <= 768 && config[`tablet${key[0].toUpperCase() + key.slice(1)}`])
        v = config[`tablet${key[0].toUpperCase() + key.slice(1)}`];
      else if (w <= 1024 && config[`desktop${key[0].toUpperCase() + key.slice(1)}`])
        v = config[`desktop${key[0].toUpperCase() + key.slice(1)}`];
      setValue(v);
    };
    const debounced = debounce(calc, 100);
    calc();
    window.addEventListener('resize', debounced);
    return () => window.removeEventListener('resize', debounced);
  }, [responsive, config, key]);
  return responsive ? value : config[key];
};

const useIntersectionObserver = (ref: React.RefObject<HTMLDivElement>, shouldObserve = false) => {
  const [isVisible, setIsVisible] = useState(!shouldObserve);

  useEffect(() => {
    if (!shouldObserve || !ref.current) return;

    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.1 });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, shouldObserve]);

  return isVisible;
};

export interface GradualBlurProps extends GradualBlurConfig {}

function GradualBlur(props: GradualBlurProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const config = useMemo(() => {
    const presetConfig = props.preset && PRESETS[props.preset] ? PRESETS[props.preset] : {};
    return mergeConfigs(DEFAULT_CONFIG, presetConfig, props);
  }, [props]);

  const responsiveHeight = useResponsiveDimension(config.responsive, config, 'height');
  const responsiveWidth = useResponsiveDimension(config.responsive, config, 'width');

  const isVisible = useIntersectionObserver(containerRef, config.animated === 'scroll');

  const blurDivs = useMemo(() => {
    const divs = [];
    const divCount = config.divCount || 6;
    const increment = 100 / divCount;
    const currentStrength =
      isHovered && config.hoverIntensity ? (config.strength || 2.5) * config.hoverIntensity : (config.strength || 2.5);

    const curveFunc = CURVE_FUNCTIONS[config.curve || 'bezier'] || CURVE_FUNCTIONS.bezier;
    const direction = getGradientDirection(config.position);

    for (let i = 1; i <= divCount; i++) {
      let progress = i / divCount;
      progress = curveFunc(progress);

      let blurValue: number;
      if (config.exponential) {
        blurValue = Math.pow(2, progress * 4) * 0.0625 * currentStrength;
      } else {
        blurValue = 0.0625 * (progress * divCount + 1) * currentStrength;
      }

      const p1 = Math.round((increment * i - increment) * 10) / 10;
      const p2 = Math.round(increment * i * 10) / 10;
      const p3 = Math.round((increment * i + increment) * 10) / 10;
      const p4 = Math.round((increment * i + increment * 2) * 10) / 10;

      let gradient = `transparent ${p1}%, black ${p2}%`;
      if (p3 <= 100) gradient += `, black ${p3}%`;
      if (p4 <= 100) gradient += `, transparent ${p4}%`;

      const divStyle: React.CSSProperties = {
        position: 'absolute',
        inset: '0',
        maskImage: `linear-gradient(${direction}, ${gradient})`,
        WebkitMaskImage: `linear-gradient(${direction}, ${gradient})`,
        backdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
        WebkitBackdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
        opacity: config.opacity,
        pointerEvents: 'none',
        transition:
          config.animated && config.animated !== 'scroll'
            ? `backdrop-filter ${config.duration} ${config.easing}`
            : undefined
      };

      divs.push(<div key={i} style={divStyle} />);
    }

    return divs;
  }, [config, isHovered]);

  const containerStyle = useMemo(() => {
    const isVertical = ['top', 'bottom'].includes(config.position || 'bottom');
    const isHorizontal = ['left', 'right'].includes(config.position || 'bottom');
    const isPageTarget = config.target === 'page';

    const baseStyle: React.CSSProperties = {
      position: isPageTarget ? 'fixed' : 'absolute',
      pointerEvents: config.hoverIntensity ? 'auto' : 'none',
      opacity: isVisible ? 1 : 0,
      transition: config.animated ? `opacity ${config.duration} ${config.easing}` : undefined,
      zIndex: config.zIndex !== undefined ? config.zIndex : (isPageTarget ? 40 : 10),
      ...config.style
    };

    if (isVertical) {
      baseStyle.height = responsiveHeight;
      baseStyle.width = responsiveWidth || '100%';
      (baseStyle as any)[config.position || 'bottom'] = 0;
      baseStyle.left = 0;
      baseStyle.right = 0;
    } else if (isHorizontal) {
      baseStyle.width = responsiveWidth || responsiveHeight;
      baseStyle.height = '100%';
      (baseStyle as any)[config.position || 'bottom'] = 0;
      baseStyle.top = 0;
      baseStyle.bottom = 0;
    }

    return baseStyle;
  }, [config, responsiveHeight, responsiveWidth, isVisible]);

  const { hoverIntensity, animated, onAnimationComplete, duration } = config;
  const direction = getGradientDirection(config.position);

  useEffect(() => {
    if (isVisible && animated === 'scroll' && onAnimationComplete) {
      const ms = parseFloat(duration || '0.3') * 1000;
      const t = setTimeout(() => onAnimationComplete(), ms);
      return () => clearTimeout(t);
    }
  }, [isVisible, animated, onAnimationComplete, duration]);

  const isBottom = config.position === 'bottom';

  return (
    <div
      ref={containerRef}
      className={`gradual-blur ${config.target === 'page' ? 'gradual-blur-page' : 'gradual-blur-parent'} ${config.className || ''}`}
      style={containerStyle}
      onMouseEnter={hoverIntensity ? () => setIsHovered(true) : undefined}
      onMouseLeave={hoverIntensity ? () => setIsHovered(false) : undefined}
    >
      {/* Ambient gradient lights shining through the blur */}
      {config.ambientLight && isBottom && (
        <div className="absolute inset-0 flex items-end justify-center pointer-events-none -z-10 overflow-hidden opacity-90">
          <div className="w-72 h-20 bg-purple-600/35 blur-[40px] rounded-full translate-y-10" />
          <div className="w-96 h-24 bg-cyan-400/40 blur-[36px] rounded-full translate-y-8" />
          <div className="w-72 h-20 bg-blue-600/35 blur-[40px] rounded-full translate-y-10" />
        </div>
      )}

      {config.ambientLight && !isBottom && (
        <div className="absolute inset-0 flex items-start justify-center pointer-events-none -z-10 overflow-hidden opacity-80">
          <div className="w-72 h-20 bg-purple-600/30 blur-[40px] rounded-full -translate-y-10" />
          <div className="w-96 h-24 bg-cyan-400/35 blur-[36px] rounded-full -translate-y-8" />
          <div className="w-72 h-20 bg-blue-600/30 blur-[40px] rounded-full -translate-y-10" />
        </div>
      )}

      {/* The stacked gradual blur filters */}
      <div
        className="gradual-blur-inner"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%'
        }}
      >
        {blurDivs}
      </div>

      {/* Progressive dissolution fade to canvas background */}
      {config.fadeToBackground && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(${direction}, transparent 0%, rgba(11, 15, 23, 0.25) 40%, rgba(11, 15, 23, 0.75) 80%, #0B0F17 100%)`
          }}
        />
      )}
    </div>
  );
}

const GradualBlurMemo: any = React.memo(GradualBlur);
GradualBlurMemo.displayName = 'GradualBlur';
GradualBlurMemo.PRESETS = PRESETS;
GradualBlurMemo.CURVE_FUNCTIONS = CURVE_FUNCTIONS;

export default GradualBlurMemo;
