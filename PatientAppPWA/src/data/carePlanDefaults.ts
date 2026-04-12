// Default care plan data for CHF/COPD patients.
// TODO: Replace with patient-specific data from the API when available.

export interface MedItem {
  id: string;
  name: string;
  dose: string;
  timing: string;
  time: string;
  checked: boolean;
}

export interface HabitItem {
  id: string;
  label: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  checked: boolean;
}

export interface PlanItem {
  id: string;
  label: string;
  sub: string;
  icon: string;
  iconTint: string;
  iconBg: string;
  done: boolean;
  dueTime?: string;
}

export const INITIAL_MEDS: MedItem[] = [
  {
    id: 'med-1',
    name: 'Lisinopril',
    dose: '10 mg',
    timing: 'With breakfast',
    time: '8:00 AM',
    checked: true,
  },
  {
    id: 'med-2',
    name: 'Furosemide',
    dose: '20 mg',
    timing: 'Once daily',
    time: '9:00 AM',
    checked: false,
  },
  {
    id: 'med-3',
    name: 'Metoprolol',
    dose: '25 mg',
    timing: 'Evening',
    time: '6:00 PM',
    checked: false,
  },
];

export const INITIAL_HABITS: HabitItem[] = [
  {
    id: 'hab-1',
    label: 'Hydration',
    description: '6 to 8 glasses of water',
    icon: 'water_drop',
    iconColor: '#1E73BE',
    iconBg: '#EBF3FA',
    checked: false,
  },
  {
    id: 'hab-2',
    label: 'Gentle movement',
    description: '10-minute walk',
    icon: 'directions_walk',
    iconColor: '#D97706',
    iconBg: '#FDF4E7',
    checked: false,
  },
  {
    id: 'hab-3',
    label: 'Elevate feet',
    description: '15 minutes after lunch',
    icon: 'airline_seat_recline_normal',
    iconColor: '#16A34A',
    iconBg: '#EDFAF0',
    checked: false,
  },
];

export const PLAN_ITEMS: PlanItem[] = [
  {
    id: 'med',
    label: 'Morning medication',
    sub: 'With breakfast',
    icon: 'pill',
    iconTint: '#053027',
    iconBg: '#E6EEEC',
    done: true,
    dueTime: '8:00 AM',
  },
  {
    id: 'hydrate',
    label: 'Hydrate',
    sub: 'Two glasses of water',
    icon: 'water_drop',
    iconTint: '#1E73BE',
    iconBg: '#EBF3FA',
    done: false,
    dueTime: '11:00 AM',
  },
  {
    id: 'walk',
    label: 'Light walk',
    sub: 'Five minutes indoors',
    icon: 'directions_walk',
    iconTint: '#D97706',
    iconBg: '#FDF4E7',
    done: false,
    dueTime: '2:00 PM',
  },
];
