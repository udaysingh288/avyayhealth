import { describe, it, expect } from 'vitest';
import {
  RED_KEYWORDS,
  EMERGENCY_PATTERNS,
  SYMPTOM_RULES,
  CONDITION_LABELS,
  containsRedKeyword,
} from '../clinical';

describe('containsRedKeyword', () => {
  it('matches exact red keywords', () => {
    expect(containsRedKeyword('cannot breathe')).toBe(true);
    expect(containsRedKeyword("can't breathe")).toBe(true);
    expect(containsRedKeyword('cant breathe')).toBe(true);
    expect(containsRedKeyword('chest pain')).toBe(true);
    expect(containsRedKeyword('blue lips')).toBe(true);
    expect(containsRedKeyword('passed out')).toBe(true);
    expect(containsRedKeyword('heart attack')).toBe(true);
    expect(containsRedKeyword('not breathing')).toBe(true);
    expect(containsRedKeyword('unconscious')).toBe(true);
    expect(containsRedKeyword('dying')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(containsRedKeyword('CANNOT BREATHE')).toBe(true);
    expect(containsRedKeyword('Cannot Breathe')).toBe(true);
    expect(containsRedKeyword('CHEST PAIN')).toBe(true);
    expect(containsRedKeyword('Blue Lips')).toBe(true);
  });

  it('matches keywords embedded in longer text', () => {
    expect(containsRedKeyword('I cannot breathe right now')).toBe(true);
    expect(containsRedKeyword('my husband is having chest pain')).toBe(true);
    expect(containsRedKeyword('I think I passed out earlier')).toBe(true);
  });

  it('does not match benign text', () => {
    expect(containsRedKeyword("I'm feeling fine")).toBe(false);
    expect(containsRedKeyword('Breathing is good today')).toBe(false);
    expect(containsRedKeyword('No pain at all')).toBe(false);
    expect(containsRedKeyword('I feel great')).toBe(false);
    expect(containsRedKeyword('Had a good day')).toBe(false);
  });

  it('handles edge cases', () => {
    expect(containsRedKeyword('')).toBe(false);
    expect(containsRedKeyword(' ')).toBe(false);
    expect(containsRedKeyword('hello')).toBe(false);
  });
});

describe('RED_KEYWORDS', () => {
  it('has at least 15 emergency keywords', () => {
    expect(RED_KEYWORDS.length).toBeGreaterThanOrEqual(15);
  });

  it('includes critical breathing emergencies', () => {
    expect(RED_KEYWORDS).toContain('cannot breathe');
    expect(RED_KEYWORDS).toContain("can't breathe");
    expect(RED_KEYWORDS).toContain('hard to breathe');
    expect(RED_KEYWORDS).toContain('very short of breath');
  });

  it('includes cardiac emergencies', () => {
    expect(RED_KEYWORDS).toContain('chest pain');
    expect(RED_KEYWORDS).toContain('heart attack');
  });

  it('includes consciousness-related emergencies', () => {
    expect(RED_KEYWORDS).toContain('passed out');
    expect(RED_KEYWORDS).toContain('fainted');
    expect(RED_KEYWORDS).toContain('unconscious');
  });
});

describe('EMERGENCY_PATTERNS', () => {
  it('matches breathing emergencies', () => {
    expect(EMERGENCY_PATTERNS.some(p => p.test("can't breathe"))).toBe(true);
    expect(EMERGENCY_PATTERNS.some(p => p.test('cannot breathe'))).toBe(true);
    expect(EMERGENCY_PATTERNS.some(p => p.test('hard to breathe'))).toBe(true);
  });

  it('matches cardiac emergencies', () => {
    expect(EMERGENCY_PATTERNS.some(p => p.test('chest pain'))).toBe(true);
    expect(EMERGENCY_PATTERNS.some(p => p.test('chest hurts'))).toBe(true);
    expect(EMERGENCY_PATTERNS.some(p => p.test('severe chest'))).toBe(true);
  });

  it('matches cyanosis', () => {
    expect(EMERGENCY_PATTERNS.some(p => p.test('blue lips'))).toBe(true);
    expect(EMERGENCY_PATTERNS.some(p => p.test('blue fingers'))).toBe(true);
    expect(EMERGENCY_PATTERNS.some(p => p.test('blue nails'))).toBe(true);
  });

  it('matches 911 references', () => {
    expect(EMERGENCY_PATTERNS.some(p => p.test('call 911'))).toBe(true);
    expect(EMERGENCY_PATTERNS.some(p => p.test('should I call 911?'))).toBe(true);
  });

  it('does not false-positive on benign text', () => {
    expect(EMERGENCY_PATTERNS.some(p => p.test('I can breathe fine'))).toBe(false);
    expect(EMERGENCY_PATTERNS.some(p => p.test('feeling good'))).toBe(false);
    expect(EMERGENCY_PATTERNS.some(p => p.test('no pain'))).toBe(false);
  });
});

describe('SYMPTOM_RULES', () => {
  it('detects breathing symptoms', () => {
    const breathing = SYMPTOM_RULES.filter(r => r.type === 'breathing');
    expect(breathing.length).toBeGreaterThan(0);
    expect(breathing.some(r => r.pattern.test('short of breath'))).toBe(true);
    expect(breathing.some(r => r.pattern.test('shortness of breath'))).toBe(true);
    expect(breathing.some(r => r.pattern.test('harder to breathe'))).toBe(true);
    expect(breathing.some(r => r.pattern.test('winded'))).toBe(true);
    expect(breathing.some(r => r.pattern.test('wheezing'))).toBe(true);
    expect(breathing.every(r => r.severity === 'yellow')).toBe(true);
  });

  it('detects swelling symptoms', () => {
    const swelling = SYMPTOM_RULES.filter(r => r.type === 'swelling');
    expect(swelling.some(r => r.pattern.test('swelling'))).toBe(true);
    expect(swelling.some(r => r.pattern.test('swollen'))).toBe(true);
    expect(swelling.some(r => r.pattern.test('puffy'))).toBe(true);
    expect(swelling.some(r => r.pattern.test('bloated'))).toBe(true);
    expect(swelling.every(r => r.severity === 'yellow')).toBe(true);
  });

  it('detects fatigue at green severity', () => {
    const fatigue = SYMPTOM_RULES.filter(r => r.type === 'fatigue');
    expect(fatigue.some(r => r.pattern.test('tired'))).toBe(true);
    expect(fatigue.some(r => r.pattern.test('exhausted'))).toBe(true);
    expect(fatigue.some(r => r.pattern.test('no energy'))).toBe(true);
    expect(fatigue.every(r => r.severity === 'green')).toBe(true);
  });

  it('detects fever at yellow severity', () => {
    const fever = SYMPTOM_RULES.filter(r => r.type === 'fever');
    expect(fever.some(r => r.pattern.test('fever'))).toBe(true);
    expect(fever.some(r => r.pattern.test('chills'))).toBe(true);
  });

  it('distinguishes cough severity levels', () => {
    const cough = SYMPTOM_RULES.filter(r => r.type === 'cough');
    const greenCough = cough.filter(r => r.severity === 'green');
    const yellowCough = cough.filter(r => r.severity === 'yellow');
    expect(greenCough.some(r => r.pattern.test('coughing'))).toBe(true);
    expect(yellowCough.some(r => r.pattern.test('coughing worse'))).toBe(true);
  });

  it('detects dizziness', () => {
    const dizziness = SYMPTOM_RULES.filter(r => r.type === 'dizziness');
    expect(dizziness.some(r => r.pattern.test('dizzy'))).toBe(true);
    expect(dizziness.some(r => r.pattern.test('lightheaded'))).toBe(true);
    expect(dizziness.some(r => r.pattern.test('vertigo'))).toBe(true);
  });

  it('detects nausea', () => {
    const nausea = SYMPTOM_RULES.filter(r => r.type === 'nausea');
    expect(nausea.some(r => r.pattern.test('nauseous'))).toBe(true);
    expect(nausea.some(r => r.pattern.test('throwing up'))).toBe(true);
    expect(nausea.some(r => r.pattern.test('vomiting'))).toBe(true);
  });

  it('covers all expected symptom types', () => {
    const types = new Set(SYMPTOM_RULES.map(r => r.type));
    expect(types).toContain('breathing');
    expect(types).toContain('swelling');
    expect(types).toContain('chest_pain');
    expect(types).toContain('cough');
    expect(types).toContain('fatigue');
    expect(types).toContain('pain');
    expect(types).toContain('fever');
    expect(types).toContain('dizziness');
    expect(types).toContain('nausea');
    expect(types).toContain('sleep');
    expect(types).toContain('appetite');
    expect(types).toContain('confusion');
    expect(types).toContain('mucus');
    expect(types).toContain('weight_gain');
  });
});

describe('CONDITION_LABELS', () => {
  it('maps all conditions to human-readable labels', () => {
    expect(CONDITION_LABELS.chf).toBe('Heart Failure');
    expect(CONDITION_LABELS.copd).toBe('COPD');
    expect(CONDITION_LABELS.pneumonia).toBe('Pneumonia');
    expect(CONDITION_LABELS.ami).toBe('Heart Attack');
    expect(CONDITION_LABELS.hip_knee).toBe('Hip/Knee');
    expect(CONDITION_LABELS.cabg).toBe('CABG');
  });
});
