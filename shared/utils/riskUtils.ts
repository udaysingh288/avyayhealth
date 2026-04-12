/** Risk level and condition display helpers. */

import type { RiskLevel, Condition } from '../types';
import { CONDITION_LABELS } from '../constants/clinical';

export function riskSortOrder(risk: RiskLevel): number {
  const order: Record<RiskLevel, number> = {
    red: 0,
    yellow: 1,
    green: 2,
    not_started: 3,
  };
  return order[risk];
}

export function conditionLabel(condition: Condition): string {
  return CONDITION_LABELS[condition] ?? condition;
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
