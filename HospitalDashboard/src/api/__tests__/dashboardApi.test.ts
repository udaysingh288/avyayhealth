import { describe, it, expect, vi } from 'vitest';
import { fetchDashboardData, updatePatientRiskOverride } from '../dashboardApi';

// ─── Supabase mock factory ───────────────────────────────────────

interface MockRow { [key: string]: any }

// Apply the selected columns, including nested message fields, like PostgREST.
// Returning entire fixtures would hide regressions caused by missing projections.
function projectRow(row: MockRow, columns: string): MockRow {
  return Object.fromEntries(columns.split(/,(?![^()]*\))/).map((column) => {
    const nested = column.trim().match(/^(\w+)\s*\((.*)\)$/s);
    if (nested) {
      const [, name, fields] = nested;
      return [name, (row[name] ?? []).map((entry: MockRow) => projectRow(entry, fields))];
    }
    const name = column.trim();
    return [name, row[name]];
  }));
}

function createMockSupabase(tables: Record<string, MockRow[]>) {
  // Chainable query builder that filters stored table data
  function makeBuilder(tableName: string) {
    let rows = [...(tables[tableName] ?? [])];
    const filters: Array<(rows: MockRow[]) => MockRow[]> = [];
    let orderCol: string | null = null;
    let orderAsc = true;
    let selectedColumns: string | undefined;

    const builder: any = {
      select: (columns?: string) => {
        selectedColumns = columns;
        return builder;
      },
      eq: (col: string, val: any) => {
        filters.push(r => r.filter(row => row[col] === val));
        return builder;
      },
      is: (col: string, val: any) => {
        filters.push(r => r.filter(row => row[col] === val));
        return builder;
      },
      order: (col: string, opts?: { ascending?: boolean }) => {
        orderCol = col;
        orderAsc = opts?.ascending ?? true;
        return builder;
      },
      then: (resolve: (val: any) => void) => {
        let result = rows;
        for (const f of filters) result = f(result);
        if (orderCol) {
          const col = orderCol;
          const asc = orderAsc;
          result.sort((a, b) => {
            if (a[col] < b[col]) return asc ? -1 : 1;
            if (a[col] > b[col]) return asc ? 1 : -1;
            return 0;
          });
        }
        resolve({
          data: selectedColumns ? result.map(row => projectRow(row, selectedColumns!)) : result,
          error: null,
        });
      },
    };
    return builder;
  }

  return {
    from: (table: string) => makeBuilder(table),
  } as any;
}

// ─── Test data ───────────────────────────────────────────────────

const HOSPITAL_ID = 'hosp-1';

function makePatient(overrides: Partial<MockRow> = {}): MockRow {
  return {
    id: 'pat-1',
    first_name: 'Maria',
    last_name: 'Torres',
    dob: '1958-03-15',
    condition: 'chf',
    discharge_date: '2026-03-01',
    days_in_program: 10,
    total_days: 30,
    phone: '+15551234567',
    status: 'active',
    coordinator_id: 'coord-1',
    hospital_id: HOSPITAL_ID,
    created_at: '2026-03-01T12:00:00Z',
    risk_override: null,
    ...overrides,
  };
}

function makeCheckin(overrides: Partial<MockRow> = {}): MockRow {
  return {
    id: 'ci-1',
    patient_id: 'pat-1',
    day_number: 10,
    date: new Date().toISOString().slice(0, 10),
    status: 'completed',
    risk_level: 'green',
    summary: 'Patient reports feeling well',
    completed_at: '2026-03-11T14:00:00Z',
    created_at: '2026-03-11T08:00:00Z',
    messages: [
      { id: 'msg-1', role: 'ai', content: 'How are you?', risk_level: null, sent_at: '2026-03-11T08:00:00Z' },
      { id: 'msg-2', role: 'patient', content: 'Feeling good', risk_level: null, sent_at: '2026-03-11T08:05:00Z' },
    ],
    ...overrides,
  };
}

// ─── Tests ───────────────────────────────────────────────────────

describe('fetchDashboardData', () => {
  it('returns empty snapshot for a hospital with no patients', async () => {
    const supabase = createMockSupabase({
      patients: [],
      check_ins: [],
      sdoh_flags: [],
      direct_messages: [],
    });

    const result = await fetchDashboardData(supabase, HOSPITAL_ID);
    expect(result.patients).toEqual([]);
    expect(result.metrics.total_active_patients).toBe(0);
    expect(result.metrics.red_count).toBe(0);
    expect(result.alerts).toEqual([]);
  });

  it('maps basic patient fields correctly', async () => {
    const supabase = createMockSupabase({
      patients: [makePatient()],
      check_ins: [],
      sdoh_flags: [],
      direct_messages: [],
    });

    const result = await fetchDashboardData(supabase, HOSPITAL_ID);
    expect(result.patients).toHaveLength(1);
    const p = result.patients[0];
    expect(p.first_name).toBe('Maria');
    expect(p.last_name).toBe('Torres');
    expect(p.condition).toBe('chf');
    expect(p.hospital_id).toBe(HOSPITAL_ID);
    expect(p.phone_last_four).toBe('4567');
  });

  it('patient with no check-ins gets risk_level=not_started', async () => {
    const supabase = createMockSupabase({
      patients: [makePatient()],
      check_ins: [],
      sdoh_flags: [],
      direct_messages: [],
    });

    const result = await fetchDashboardData(supabase, HOSPITAL_ID);
    expect(result.patients[0].risk_level).toBe('not_started');
  });

  it('risk_override takes precedence over check-in risk', async () => {
    const supabase = createMockSupabase({
      patients: [makePatient({ risk_override: 'red' })],
      check_ins: [makeCheckin({ risk_level: 'green' })],
      sdoh_flags: [],
      direct_messages: [],
    });

    const result = await fetchDashboardData(supabase, HOSPITAL_ID);
    expect(result.patients[0].risk_level).toBe('red');
  });

  it('uses latest check-in risk_level when no override', async () => {
    const supabase = createMockSupabase({
      patients: [makePatient()],
      check_ins: [makeCheckin({ risk_level: 'yellow' })],
      sdoh_flags: [],
      direct_messages: [],
    });

    const result = await fetchDashboardData(supabase, HOSPITAL_ID);
    expect(result.patients[0].risk_level).toBe('yellow');
  });

  it('pending check-in with no risk defaults to green', async () => {
    const supabase = createMockSupabase({
      patients: [makePatient()],
      check_ins: [makeCheckin({ status: 'pending', risk_level: null })],
      sdoh_flags: [],
      direct_messages: [],
    });

    const result = await fetchDashboardData(supabase, HOSPITAL_ID);
    expect(result.patients[0].risk_level).toBe('green');
  });

  it('calculates age from DOB', async () => {
    const now = new Date();
    const birthYear = now.getFullYear() - 70;
    const dob = `${birthYear}-01-01`;
    const supabase = createMockSupabase({
      patients: [makePatient({ dob })],
      check_ins: [],
      sdoh_flags: [],
      direct_messages: [],
    });

    const result = await fetchDashboardData(supabase, HOSPITAL_ID);
    expect(result.patients[0].age).toBeGreaterThanOrEqual(69);
    expect(result.patients[0].age).toBeLessThanOrEqual(70);
  });

  it('phone_last_four is "—" when phone is null', async () => {
    const supabase = createMockSupabase({
      patients: [makePatient({ phone: null })],
      check_ins: [],
      sdoh_flags: [],
      direct_messages: [],
    });

    const result = await fetchDashboardData(supabase, HOSPITAL_ID);
    expect(result.patients[0].phone_last_four).toBe('—');
  });

  it('counts risk levels in metrics correctly', async () => {
    const supabase = createMockSupabase({
      patients: [
        makePatient({ id: 'p1', risk_override: 'red' }),
        makePatient({ id: 'p2', risk_override: 'yellow' }),
        makePatient({ id: 'p3', risk_override: 'green' }),
      ],
      check_ins: [],
      sdoh_flags: [],
      direct_messages: [],
    });

    const result = await fetchDashboardData(supabase, HOSPITAL_ID);
    expect(result.metrics.red_count).toBe(1);
    expect(result.metrics.yellow_count).toBe(1);
    expect(result.metrics.green_count).toBe(1);
    expect(result.metrics.total_active_patients).toBe(3);
  });

  it('counts unresolved SDOH flags', async () => {
    const supabase = createMockSupabase({
      patients: [makePatient()],
      check_ins: [],
      sdoh_flags: [
        { id: 's1', patient_id: 'pat-1', domain: 'transportation', resolved: false },
        { id: 's2', patient_id: 'pat-1', domain: 'food_insecurity', resolved: true },
        { id: 's3', patient_id: 'pat-1', domain: 'housing_instability', resolved: false },
      ],
      direct_messages: [],
    });

    const result = await fetchDashboardData(supabase, HOSPITAL_ID);
    expect(result.patients[0].sdoh_flags).toEqual(['transportation', 'housing_instability']);
    expect(result.metrics.sdoh_flags_today).toBe(2);
  });

  it('generates alerts from escalated check-ins', async () => {
    const supabase = createMockSupabase({
      patients: [makePatient()],
      check_ins: [makeCheckin({ status: 'escalated', summary: 'Cannot breathe' })],
      sdoh_flags: [],
      direct_messages: [],
    });

    const result = await fetchDashboardData(supabase, HOSPITAL_ID);
    expect(result.alerts).toHaveLength(1);
    expect(result.alerts[0].risk_level).toBe('red');
    expect(result.alerts[0].reason).toBe('Cannot breathe');
    expect(result.alerts[0].patient_name).toBe('Torres, Maria');
  });

  it('calculates daily response rate', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const supabase = createMockSupabase({
      patients: [
        makePatient({ id: 'p1' }),
        makePatient({ id: 'p2' }),
      ],
      check_ins: [
        makeCheckin({ patient_id: 'p1', date: today, status: 'completed' }),
        makeCheckin({ patient_id: 'p2', date: today, status: 'pending' }),
      ],
      sdoh_flags: [],
      direct_messages: [],
    });

    const result = await fetchDashboardData(supabase, HOSPITAL_ID);
    expect(result.metrics.daily_response_rate).toBe(0.5);
  });

  it('extracts last patient reply from messages', async () => {
    const supabase = createMockSupabase({
      patients: [makePatient()],
      check_ins: [makeCheckin({
        summary: 'Custom summary',
        messages: [
          { id: 'm1', role: 'ai', content: 'How are you?', risk_level: null, sent_at: '2026-03-11T08:00:00Z' },
          { id: 'm2', role: 'patient', content: 'Ankle swollen', risk_level: null, sent_at: '2026-03-11T08:05:00Z' },
        ],
      })],
      sdoh_flags: [],
      direct_messages: [],
    });

    const result = await fetchDashboardData(supabase, HOSPITAL_ID);
    // Uses summary when available over raw content
    expect(result.patients[0].last_reply_summary).toBe('Custom summary');
    expect(result.patients[0].last_checkin_at).toBe('2026-03-11T08:05:00Z');
  });

  it('counts unread DMs per patient', async () => {
    const supabase = createMockSupabase({
      patients: [makePatient({ id: 'p1' })],
      check_ins: [],
      sdoh_flags: [],
      direct_messages: [
        { id: 'dm1', patient_id: 'p1', sender_type: 'patient', read_at: null },
        { id: 'dm2', patient_id: 'p1', sender_type: 'patient', read_at: null },
      ],
    });

    const result = await fetchDashboardData(supabase, HOSPITAL_ID);
    expect(result.patients[0].unread_dm_count).toBe(2);
  });

  it('includes uploaded image details from the selected message fields', async () => {
    const classification = {
      risk_level: 'yellow',
      injury_type: 'wound',
      description: 'Wound redness requires follow-up',
      recommendations: 'Review wound photo',
      confidence: 'high',
    };
    const supabase = createMockSupabase({
      patients: [makePatient()],
      check_ins: [makeCheckin({
        messages: [{
          id: 'image-1',
          role: 'patient',
          content: 'Wound photo',
          sent_at: '2026-03-11T08:05:00Z',
          message_type: 'image',
          image_storage_path: 'pat-1/wound.jpg',
          image_classification: classification,
        }],
      })],
      sdoh_flags: [],
      direct_messages: [],
    });

    const result = await fetchDashboardData(supabase, HOSPITAL_ID);
    expect(result.checkinsMap['pat-1'][0]).toMatchObject({
      image_storage_path: 'pat-1/wound.jpg',
      image_classification: classification,
    });
  });

  it('builds checkinsMap keyed by patient_id', async () => {
    const supabase = createMockSupabase({
      patients: [makePatient()],
      check_ins: [
        makeCheckin({ id: 'ci-1', day_number: 10 }),
        makeCheckin({ id: 'ci-2', day_number: 9 }),
      ],
      sdoh_flags: [],
      direct_messages: [],
    });

    const result = await fetchDashboardData(supabase, HOSPITAL_ID);
    expect(result.checkinsMap['pat-1']).toHaveLength(2);
  });
});

describe('updatePatientRiskOverride', () => {
  it.each(['red', 'yellow', 'green'] as const)('sets a %s override through the authorized RPC', async (risk) => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: null });
    const supabase = { rpc } as any;

    await updatePatientRiskOverride(supabase, 'pat-1', risk);
    expect(rpc).toHaveBeenCalledWith('set_patient_risk_override', {
      p_patient_id: 'pat-1',
      p_risk: risk,
    });
  });

  it.each(['not_started', null] as const)('clears the override when %s is passed', async (risk) => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: null });
    const supabase = { rpc } as any;

    await updatePatientRiskOverride(supabase, 'pat-1', risk);
    expect(rpc).toHaveBeenCalledWith('set_patient_risk_override', {
      p_patient_id: 'pat-1',
      p_risk: null,
    });
  });

  it('propagates denied overrides instead of reporting success', async () => {
    const error = { code: '42501', message: 'Not authorized to update this patient' };
    const supabase = {
      rpc: vi.fn().mockResolvedValue({ data: null, error }),
    } as any;

    await expect(updatePatientRiskOverride(supabase, 'other-hospital-patient', 'red'))
      .rejects.toBe(error);
  });
});
