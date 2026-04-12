/**
 * Lightweight haptic feedback for iOS/Android using Vibration API.
 * iOS Safari does not fully support Vibration, but PWAs running standalone
 * often do. Silently no-ops on unsupported platforms.
 */
type Style = 'light' | 'medium' | 'heavy' | 'success' | 'warning';

const patterns: Record<Style, number | number[]> = {
  light: 8,
  medium: 14,
  heavy: 22,
  success: [10, 40, 14],
  warning: [20, 60, 20],
};

export function haptic(style: Style = 'light') {
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate(patterns[style]);
    }
  } catch {
    // silent
  }
}
