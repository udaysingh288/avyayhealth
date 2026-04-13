import { describe, it, expect } from 'vitest';
import { classify } from '../classify';

describe('classify', () => {
  // ─── Emergency (highest priority) ──────────────────────────────

  describe('emergency intent', () => {
    it('detects "can\'t breathe"', () => {
      const r = classify("can't breathe");
      expect(r.intent).toBe('emergency');
      expect(r.severity).toBe('red');
      expect(r.sentiment).toBe('negative');
    });

    it('detects "cannot breathe"', () => {
      expect(classify('cannot breathe').intent).toBe('emergency');
    });

    it('detects "chest pain"', () => {
      const r = classify('chest pain');
      expect(r.intent).toBe('emergency');
      expect(r.severity).toBe('red');
    });

    it('detects "blue lips"', () => {
      expect(classify('blue lips').intent).toBe('emergency');
    });

    it('detects "blue fingers"', () => {
      expect(classify('blue fingers').intent).toBe('emergency');
    });

    it('detects "passed out"', () => {
      expect(classify('passed out').intent).toBe('emergency');
    });

    it('detects "heart attack"', () => {
      expect(classify('heart attack').intent).toBe('emergency');
    });

    it('detects "not breathing"', () => {
      expect(classify('not breathing').intent).toBe('emergency');
    });

    it('detects "call 911"', () => {
      expect(classify('should I call 911?').intent).toBe('emergency');
    });

    it('detects embedded emergency in longer text', () => {
      expect(classify('I cannot breathe right now please help').intent).toBe('emergency');
    });

    it('is case-insensitive for emergencies', () => {
      expect(classify('CHEST PAIN').intent).toBe('emergency');
      expect(classify('Cannot Breathe').intent).toBe('emergency');
    });
  });

  // ─── Specific symptoms ────────────────────────────────────────

  describe('specific_symptom intent', () => {
    it('detects breathing symptoms', () => {
      const r = classify('short of breath');
      expect(r.intent).toBe('specific_symptom');
      expect(r.symptoms).toContain('breathing');
      expect(r.severity).toBe('yellow');
    });

    it('detects swelling symptoms', () => {
      const r = classify('my ankles are swollen');
      expect(r.intent).toBe('specific_symptom');
      expect(r.symptoms).toContain('swelling');
      expect(r.severity).toBe('yellow');
    });

    it('detects fatigue at green severity', () => {
      const r = classify("I'm so tired today");
      expect(r.intent).toBe('specific_symptom');
      expect(r.symptoms).toContain('fatigue');
      expect(r.severity).toBe('green');
    });

    it('detects fever', () => {
      const r = classify('I have a fever');
      expect(r.intent).toBe('specific_symptom');
      expect(r.symptoms).toContain('fever');
    });

    it('detects dizziness', () => {
      const r = classify("I'm dizzy");
      expect(r.intent).toBe('specific_symptom');
      expect(r.symptoms).toContain('dizziness');
    });

    it('detects nausea', () => {
      const r = classify('feeling nauseous');
      expect(r.intent).toBe('specific_symptom');
      expect(r.symptoms).toContain('nausea');
    });

    it('detects cough', () => {
      const r = classify('coughing a lot');
      expect(r.intent).toBe('specific_symptom');
      expect(r.symptoms).toContain('cough');
    });

    it('detects multiple symptoms in one message', () => {
      const r = classify('short of breath and ankles swollen');
      expect(r.intent).toBe('specific_symptom');
      expect(r.symptoms).toContain('breathing');
      expect(r.symptoms).toContain('swelling');
      expect(r.severity).toBe('yellow');
    });

    it('escalates to yellow when any symptom is yellow', () => {
      // fatigue is green, breathing is yellow — result should be yellow
      const r = classify("I'm tired and short of breath");
      expect(r.severity).toBe('yellow');
    });

    it('detects wheezing', () => {
      const r = classify("I'm wheezing");
      expect(r.intent).toBe('specific_symptom');
      expect(r.symptoms).toContain('breathing');
    });

    it('detects vomiting', () => {
      const r = classify('throwing up');
      expect(r.intent).toBe('specific_symptom');
      expect(r.symptoms).toContain('nausea');
    });

    it('sets sentiment to negative for symptoms', () => {
      expect(classify('I have swelling').sentiment).toBe('negative');
    });
  });

  // ─── Medication intents ───────────────────────────────────────

  describe('medication intents', () => {
    it('classifies "took all my meds" as medication_yes', () => {
      const r = classify('took all my meds');
      expect(r.intent).toBe('medication_yes');
      expect(r.sentiment).toBe('positive');
    });

    it('classifies "taking them every day" as medication_yes', () => {
      expect(classify('taking them every day').intent).toBe('medication_yes');
    });

    it('classifies "missed a dose" as medication_no', () => {
      const r = classify('missed a dose');
      expect(r.intent).toBe('medication_no');
      expect(r.sentiment).toBe('negative');
    });

    it('classifies "forgot to take it" as medication_no', () => {
      expect(classify('forgot to take it').intent).toBe('medication_no');
    });

    it('classifies "skipped my pills" as medication_no', () => {
      expect(classify('skipped my pills').intent).toBe('medication_no');
    });

    it('classifies "need a refill" as medication_issue', () => {
      const r = classify('need a refill');
      expect(r.intent).toBe('medication_issue');
      expect(r.sentiment).toBe('negative');
    });

    it('classifies "pills make me dizzy" as specific_symptom (dizziness has higher priority)', () => {
      // "dizzy" triggers SYMPTOM_RULES before MED_ISSUE_PATTERNS
      expect(classify('pills make me dizzy').intent).toBe('specific_symptom');
      expect(classify('pills make me dizzy').symptoms).toContain('dizziness');
    });

    it('classifies "ran out of my prescription" as medication_issue', () => {
      expect(classify('ran out of my prescription').intent).toBe('medication_issue');
    });

    it('classifies "too expensive" as medication_issue', () => {
      expect(classify("can't afford my medication").intent).toBe('medication_issue');
    });

    it('medication_issue has higher priority than medication_no', () => {
      // "ran out" could trigger both — issue should win
      expect(classify('ran out of pills').intent).toBe('medication_issue');
    });
  });

  // ─── Affirmative / Negative short ─────────────────────────────

  describe('affirmative intent', () => {
    // Note: "yes/yeah/yep/sure/👍" match MED_YES_PATTERNS which has higher
    // priority than AFFIRMATIVE_PATTERNS. Only words NOT in MED_YES hit affirmative.
    it('"yes" matches medication_yes (higher priority than affirmative)', () => {
      expect(classify('yes').intent).toBe('medication_yes');
    });

    it('"yeah" matches medication_yes', () => {
      expect(classify('yeah').intent).toBe('medication_yes');
    });

    it('"yep" matches medication_yes', () => {
      expect(classify('yep').intent).toBe('medication_yes');
    });

    it('"ok" matches affirmative (not in MED_YES)', () => {
      expect(classify('ok').intent).toBe('affirmative');
    });

    it('"sure" matches medication_yes', () => {
      expect(classify('sure').intent).toBe('medication_yes');
    });

    it('standalone 👍 matches medication_yes', () => {
      expect(classify('👍').intent).toBe('medication_yes');
    });

    it('"mhm" matches affirmative (not in MED_YES)', () => {
      expect(classify('mhm').intent).toBe('affirmative');
    });

    it('"exactly" matches affirmative', () => {
      expect(classify('exactly').intent).toBe('affirmative');
    });
  });

  describe('negative_short intent', () => {
    it('classifies "no" as negative_short', () => {
      expect(classify('no').intent).toBe('negative_short');
    });

    it('classifies "nope" as negative_short', () => {
      expect(classify('nope').intent).toBe('negative_short');
    });

    it('classifies "nah" as negative_short', () => {
      expect(classify('nah').intent).toBe('negative_short');
    });

    it('classifies "not really" as negative_short', () => {
      expect(classify('not really').intent).toBe('negative_short');
    });
  });

  // ─── Frustration ──────────────────────────────────────────────

  describe('frustration intent', () => {
    it('detects "stop texting me"', () => {
      expect(classify('stop texting me').intent).toBe('frustration');
    });

    it('detects "leave me alone"', () => {
      expect(classify('leave me alone').intent).toBe('frustration');
    });

    it('detects "this is stupid"', () => {
      expect(classify('this is stupid').intent).toBe('frustration');
    });

    it('detects "unsubscribe"', () => {
      expect(classify('unsubscribe').intent).toBe('frustration');
    });

    it('detects "waste of time"', () => {
      expect(classify('waste of time').intent).toBe('frustration');
    });
  });

  // ─── Negative feeling ─────────────────────────────────────────

  describe('negative_feeling intent', () => {
    it('detects "not good"', () => {
      const r = classify('not good');
      expect(r.intent).toBe('negative_feeling');
      expect(r.sentiment).toBe('negative');
    });

    it('detects "feeling terrible"', () => {
      expect(classify('feeling terrible').intent).toBe('negative_feeling');
    });

    it('detects "feeling worse"', () => {
      expect(classify('feeling worse').intent).toBe('negative_feeling');
    });

    it('detects "having a rough day"', () => {
      expect(classify('having a rough day').intent).toBe('negative_feeling');
    });

    it('detects sad emoji', () => {
      expect(classify('😢').intent).toBe('negative_feeling');
    });
  });

  // ─── Emotional ────────────────────────────────────────────────

  describe('emotional intent', () => {
    it('detects "I\'m scared"', () => {
      expect(classify("I'm scared").intent).toBe('emotional');
    });

    it('detects "feeling lonely"', () => {
      expect(classify('feeling lonely').intent).toBe('emotional');
    });

    it('detects "feeling anxious"', () => {
      expect(classify('feeling anxious').intent).toBe('emotional');
    });

    it('detects "all alone"', () => {
      expect(classify('all alone').intent).toBe('emotional');
    });

    it('"I miss my wife" matches medication_no ("miss" triggers MED_NO)', () => {
      // "miss" in MED_NO_PATTERNS has higher priority than EMOTIONAL_PATTERNS
      expect(classify('I miss my wife').intent).toBe('medication_no');
    });

    it('detects "feeling overwhelmed"', () => {
      expect(classify('feeling overwhelmed').intent).toBe('emotional');
    });
  });

  // ─── Positive feeling ─────────────────────────────────────────

  describe('positive_feeling intent', () => {
    it('detects "feeling good"', () => {
      const r = classify('feeling good');
      expect(r.intent).toBe('positive_feeling');
      expect(r.sentiment).toBe('positive');
    });

    it('detects "I\'m fine"', () => {
      expect(classify("I'm fine").intent).toBe('positive_feeling');
    });

    it('detects "doing great"', () => {
      expect(classify('doing great').intent).toBe('positive_feeling');
    });

    it('detects "much better"', () => {
      expect(classify('much better').intent).toBe('positive_feeling');
    });

    it('"no pain" matches specific_symptom (pain keyword detected first)', () => {
      // "pain" in SYMPTOM_RULES fires before POSITIVE_PATTERNS "no pain"
      expect(classify('no pain').intent).toBe('specific_symptom');
    });

    it('detects "no issues at all"', () => {
      expect(classify('no issues at all').intent).toBe('positive_feeling');
    });

    it('detects "getting better"', () => {
      expect(classify('getting better').intent).toBe('positive_feeling');
    });

    it('detects 😊 emoji', () => {
      expect(classify('😊').intent).toBe('positive_feeling');
    });

    it('detects "went for a walk"', () => {
      expect(classify('went for a walk').intent).toBe('positive_feeling');
    });
  });

  // ─── Question ─────────────────────────────────────────────────

  describe('question intent', () => {
    it('detects questions ending with ?', () => {
      expect(classify('when is my appointment?').intent).toBe('question');
    });

    it('detects "what should I do"', () => {
      expect(classify('what should I do').intent).toBe('question');
    });

    it('detects "is that normal"', () => {
      expect(classify('is that normal').intent).toBe('question');
    });

    it('detects "am I supposed to take this"', () => {
      expect(classify('am I supposed to take this').intent).toBe('question');
    });
  });

  // ─── Greeting ─────────────────────────────────────────────────

  describe('greeting intent', () => {
    it('detects "hello"', () => {
      expect(classify('hello').intent).toBe('greeting');
    });

    it('detects "hi"', () => {
      expect(classify('hi').intent).toBe('greeting');
    });

    it('"good morning" matches positive_feeling ("good" triggers positive first)', () => {
      // POSITIVE_PATTERNS \b(good)\b fires before GREETING_PATTERNS
      expect(classify('good morning').intent).toBe('positive_feeling');
    });

    it('detects "hi" as greeting', () => {
      expect(classify('hi').intent).toBe('greeting');
    });
  });

  // ─── Goodbye ──────────────────────────────────────────────────

  describe('goodbye intent', () => {
    it('detects "goodbye"', () => {
      expect(classify('goodbye').intent).toBe('goodbye');
    });

    it('detects "thank you"', () => {
      expect(classify('thank you').intent).toBe('goodbye');
    });

    it('"good night" matches positive_feeling ("good" triggers positive first)', () => {
      expect(classify('good night').intent).toBe('positive_feeling');
    });

    it('detects "bye" as goodbye', () => {
      expect(classify('bye').intent).toBe('goodbye');
    });
  });

  // ─── Life update ──────────────────────────────────────────────

  describe('life_update intent', () => {
    it('detects "my daughter visited"', () => {
      expect(classify('my daughter visited').intent).toBe('life_update');
    });

    it('detects "went to the store"', () => {
      expect(classify('went to the store').intent).toBe('life_update');
    });

    it('detects "made dinner"', () => {
      expect(classify('made dinner').intent).toBe('life_update');
    });
  });

  // ─── Edge cases ───────────────────────────────────────────────

  describe('edge cases', () => {
    it('returns unclear for empty string', () => {
      const r = classify('');
      expect(r.intent).toBe('unclear');
      expect(r.severity).toBe('green');
      expect(r.sentiment).toBe('neutral');
    });

    it('returns unclear for single character', () => {
      expect(classify('a').intent).toBe('unclear');
    });

    it('returns unclear for whitespace only', () => {
      expect(classify('   ').intent).toBe('unclear');
    });

    it('returns unclear for unrecognizable text', () => {
      expect(classify('asdfghjkl').intent).toBe('unclear');
    });

    it('preserves raw text in result', () => {
      expect(classify('  hello  ').raw).toBe('hello');
    });

    it('symptoms array is empty for non-symptom intents', () => {
      expect(classify('feeling good').symptoms).toEqual([]);
    });
  });

  // ─── Priority ordering ────────────────────────────────────────

  describe('priority ordering', () => {
    it('emergency takes priority over symptoms', () => {
      // "chest pain" is both an emergency pattern and could be a symptom
      expect(classify('chest pain').intent).toBe('emergency');
    });

    it('symptoms take priority over medication', () => {
      // "makes me dizzy" could be medication_issue, but dizziness is a symptom
      const r = classify("I'm dizzy and forgot my pills");
      expect(r.intent).toBe('specific_symptom');
    });

    it('frustration takes priority over negative feeling', () => {
      expect(classify("stop bothering me I feel bad").intent).toBe('frustration');
    });

    it('negative_feeling takes priority over positive (e.g. "not good")', () => {
      // "not good" contains "good" but negative_feeling is checked first
      expect(classify('not good').intent).toBe('negative_feeling');
    });

    it('negative_feeling takes priority over emotional', () => {
      expect(classify('feeling terrible and scared').intent).toBe('negative_feeling');
    });
  });
});
