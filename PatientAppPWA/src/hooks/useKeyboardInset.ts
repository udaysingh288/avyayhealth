import { useEffect, useState } from 'react';

/**
 * Tracks the iOS software keyboard height using visualViewport.
 * Returns a CSS variable `--kb` in pixels; consume via the `.kb-aware`
 * utility class for smooth offsetting of footers/composers.
 */
export function useKeyboardInset() {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      // Height of the keyboard = window height - visible viewport height
      const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setInset(kb);
      document.documentElement.style.setProperty('--kb', `${kb}px`);
    };

    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      document.documentElement.style.setProperty('--kb', '0px');
    };
  }, []);

  return inset;
}
