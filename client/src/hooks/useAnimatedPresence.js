import { useEffect, useState } from 'react';

export function useAnimatedPresence(isOpen, duration = 280) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [animationState, setAnimationState] = useState(isOpen ? 'entered' : 'exited');

  useEffect(() => {
    let timeout;
    let raf;

    if (isOpen) {
      setShouldRender(true);
      setAnimationState('entering');
      raf = window.requestAnimationFrame(() => {
        setAnimationState('entered');
      });
    } else if (shouldRender) {
      setAnimationState('exiting');
      timeout = window.setTimeout(() => {
        setShouldRender(false);
        setAnimationState('exited');
      }, duration);
    }

    return () => {
      if (timeout) window.clearTimeout(timeout);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [isOpen, duration, shouldRender]);

  return { shouldRender, animationState };
}
