/**
 * Detects whether the PWA is currently running in standalone mode —
 * i.e. the user already installed it to their home screen and launched
 * it from there. When true, we should never show the install prompt.
 */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;

  // Modern browsers
  if (window.matchMedia?.('(display-mode: standalone)').matches) return true;
  if (window.matchMedia?.('(display-mode: fullscreen)').matches) return true;
  if (window.matchMedia?.('(display-mode: minimal-ui)').matches) return true;

  // iOS Safari legacy
  const navAny = window.navigator as Navigator & { standalone?: boolean };
  if (navAny.standalone === true) return true;

  return false;
}
