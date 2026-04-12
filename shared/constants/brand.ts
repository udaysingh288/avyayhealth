/** Brand colors and app-wide timeouts. */

export const COLORS = {
  /** Primary forest green — headers, primary buttons */
  primary: '#27500A',
  /** Darker forest green used in some SVGs */
  primaryDark: '#053027',
  /** Lighter forest green for hover states */
  primaryLight: '#3A6E12',
  /** Warm off-white page background */
  offWhite: '#F9F7F2',
  /** Accent teal */
  teal: '#0D6B56',
  /** Orange accent */
  accent: '#E85D27',

  /** Risk: RED — used only for clinical risk indicators */
  riskRed: '#DC2626',
  riskRedBg: '#FEF2F2',
  /** Risk: YELLOW */
  riskYellow: '#D97706',
  riskYellowBg: '#FFFBEB',
  /** Risk: GREEN */
  riskGreen: '#16A34A',
  riskGreenBg: '#F0FDF4',

  /** Text */
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',

  /** UI surfaces */
  surface: '#FFFFFF',
  border: '#E2E8F0',
} as const;

export const TIMEOUTS = {
  /** Patient inactivity timeout before re-auth (ms). */
  patientInactivityMs: 30 * 60 * 1000,
  /** Coordinator inactivity timeout before warning (ms). */
  coordinatorInactivityMs: 15 * 60 * 1000,
  /** Warning shown N ms before auto-logout. */
  warningBeforeLogoutMs: 60 * 1000,
  /** Dashboard auto-refresh interval (ms). */
  dashboardRefreshMs: 120_000,
} as const;
