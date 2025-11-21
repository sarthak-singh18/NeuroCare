import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './MagicBento.css';

const ACCENT_MAP = {
  indigo: '#6366F1',
  violet: '#A78BFA',
  fuchsia: '#D946EF',
  sky: '#38BDF8',
  emerald: '#34D399',
  amber: '#FBBF24',
  rose: '#FB7185'
};

export default function MagicBento({
  children,
  className = '',
  contentClassName = '',
  accent = 'indigo',
  intensity = 0.35,
  shimmer = 'soft',
  glow = true,
  variant = 'aurora',
  interactive = false,
  as: Component = 'div',
  ...rest
}) {
  const wrapperRef = useRef(null);
  const reduceMotionRef = useRef(false);
  const coarsePointerRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    reduceMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    coarsePointerRef.current = window.matchMedia('(pointer: coarse)').matches;
  }, []);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return undefined;
    const accentColor = ACCENT_MAP[accent] || accent || ACCENT_MAP.indigo;

    const ctx = gsap.context(() => {
      gsap.set(el, {
        '--mb-spot-x': '50%',
        '--mb-spot-y': '30%',
        '--mb-spot-opacity': 0,
        '--mb-accent': accentColor
      });
      gsap.fromTo(
        el,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.05 }
      );
    }, el);

    return () => ctx.revert();
  }, [accent]);

  function handlePointerMove(event) {
    if (!interactive || reduceMotionRef.current || coarsePointerRef.current) return;
    const el = wrapperRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = x - rect.width / 2;
    const centerY = y - rect.height / 2;
    const rotateX = (-centerY / rect.height) * 10 * intensity;
    const rotateY = (centerX / rect.width) * 10 * intensity;

    gsap.to(el, {
      '--mb-spot-x': `${x}px`,
      '--mb-spot-y': `${y}px`,
      '--mb-spot-opacity': 0.9,
      rotateX,
      rotateY,
      transformPerspective: 900,
      duration: 0.55,
      ease: 'expo.out',
      overwrite: true
    });
  }

  function resetPointer() {
    if (!interactive || reduceMotionRef.current) return;
    const el = wrapperRef.current;
    if (!el) return;

    gsap.to(el, {
      '--mb-spot-opacity': 0,
      rotateX: 0,
      rotateY: 0,
      duration: 0.65,
      ease: 'expo.out'
    });
  }

  const pointerHandlers = interactive && !reduceMotionRef.current && !coarsePointerRef.current
    ? {
        onPointerMove: handlePointerMove,
        onPointerLeave: resetPointer,
        onPointerCancel: resetPointer
      }
    : {};

  const rootClassName = [
    'magic-bento',
    `magic-bento--${variant}`,
    interactive ? 'magic-bento--interactive' : 'magic-bento--static',
    `magic-bento--${shimmer}`,
    glow ? 'magic-bento--glow' : '',
    className
  ]
    .filter(Boolean)
    .join(' ');
  const bodyClassName = ['magic-bento__content', contentClassName].filter(Boolean).join(' ');

  return (
    <Component ref={wrapperRef} className={rootClassName} data-accent={accent} {...pointerHandlers} {...rest}>
      <div className="magic-bento__halo" aria-hidden="true" />
      <div className="magic-bento__glare" aria-hidden="true" />
      <div className="magic-bento__border" aria-hidden="true" />
      <div className={bodyClassName}>{children}</div>
    </Component>
  );
}
