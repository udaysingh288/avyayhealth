import type { RiskLevel, Condition } from '../types';

export function riskSortOrder(risk: RiskLevel): number {
  const order: Record<RiskLevel, number> = {
    red: 0,
    yellow: 1,
    green: 2,
    not_started: 3,
  };
  return order[risk] ?? 99;
}

export function conditionLabel(condition: Condition): string {
  const labels: Record<Condition, string> = {
    chf: 'Heart Failure',
    copd: 'COPD',
    pneumonia: 'Pneumonia',
    ami: 'Heart Attack',
    hip_knee: 'Hip/Knee',
    cabg: 'CABG',
  };
  return labels[condition];
}

export function riskLabel(risk: RiskLevel): string {
  const labels: Record<RiskLevel, string> = {
    red: 'RED',
    yellow: 'YELLOW',
    green: 'GREEN',
    not_started: 'NOT STARTED',
  };
  return labels[risk];
}

export function actionLabel(risk: RiskLevel): string {
  if (risk === 'red') return 'Call now';
  if (risk === 'yellow') return 'Follow up';
  return 'View';
}
