# CLAUDE.md — Avyay Health Coordinator Dashboard

> This file is the single source of truth for any AI assistant helping build the
> Avyay Health hospital coordinator dashboard. Read this entire file before
> writing a single line of code.

---

## 1. What This Is

The **Avyay Health Coordinator Dashboard** is a browser-based web application
used by hospital care coordinators to monitor post-discharge patients enrolled
in the Avyay Health 30-day AI check-in program.

It is NOT a patient-facing app. It is a clinical operations tool used by trained
hospital staff — care coordinators, discharge nurses, and quality directors —
who need fast, actionable information about their patient population.

The coordinator logs in at the start of their shift, reviews flagged patients,
takes action, and logs out. The dashboard must work in under 3 seconds, show
the most urgent patients first, and require zero training to understand.

---

## 2. Company Context

**Company:** Avyay Health, Inc.
**Product:** Post-discharge conversational AI platform
**How it works:** Patients receive daily SMS and/or PWA check-ins for 30 days
after discharge. An AI (Claude via AWS Bedrock) classifies each reply as
Red, Yellow, or Green risk. This dashboard shows coordinators the result.

**Target hospitals:** Community hospitals, 200–400 beds, CHF and COPD patients
**Beachhead condition:** Heart Failure (CHF) and COPD (Phase 1)
**Care coordinator workflow:** Log in → review Red alerts → check Yellow patients
→ scan overall population metrics → log out

---

## 3. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | React 18 + TypeScript | Strict TypeScript throughout |
| Styling | Tailwind CSS | No custom CSS files unless unavoidable |
| State management | Zustand | Lightweight, no Redux |
| Data fetching | React Query (TanStack Query) | Caching + auto-refetch |
| Routing | React Router v6 | |
| Charts | Recharts | Engagement trends, SDOH flags |
| Icons | Lucide React | Consistent icon set |
| Date handling | date-fns | No moment.js |
| HTTP client | Axios | With interceptors for auth |
| Auth | JWT tokens stored in memory (NOT localStorage) | HIPAA requirement |
| Build tool | Vite | Fast dev + build |
| Testing | Vitest + React Testing Library | |

**Do NOT use:**
- localStorage or sessionStorage for any PHI or tokens (HIPAA violation)
- moment.js (use date-fns)
- Redux (use Zustand)
- inline styles (use Tailwind)
- `any` TypeScript type

---

## 4. Design System

### Brand Colors
```css
--color-forest:     #27500A;   /* Primary brand — used for headers, primary buttons */
--color-forest-light: #3A6E12; /* Hover states */
--color-off-white:  #F9F7F2;   /* Page background */
--color-orange:     #E85D27;   /* Accent — use sparingly */

/* Risk colors — these are clinical signals, never decorative */
--color-red:        #DC2626;   /* Red alert background */
--color-red-bg:     #FEF2F2;   /* Red alert card background */
--color-red-border: #FECACA;   /* Red alert card border */
--color-yellow:     #D97706;   /* Yellow watch */
--color-yellow-bg:  #FFFBEB;   /* Yellow card background */
--color-yellow-border: #FDE68A;
--color-green:      #16A34A;   /* Green stable */
--color-green-bg:   #F0FDF4;   /* Green card background */
--color-green-border: #BBF7D0;

/* Neutral UI */
--color-text-primary:   #1E293B;
--color-text-secondary: #64748B;
--color-text-muted:     #94A3B8;
--color-border:         #E2E8F0;
--color-surface:        #FFFFFF;
--color-surface-hover:  #F8FAFC;
```

### Typography
- **Display / headings:** `DM Serif Display` (Google Fonts)
- **Body / UI:** `DM Sans` (Google Fonts)
- **Monospace (IDs, codes):** `JetBrains Mono`

```html
<!-- Add to index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Spacing & Layout
- Sidebar: 240px fixed width
- Main content: fluid, max-width 1400px
- Card padding: 24px
- Section gap: 24px
- Border radius: 8px for cards, 6px for buttons, 4px for badges

### Component Principles
- **Density over decoration.** This is a clinical tool. Coordinators need
  information fast. No hero sections, no large whitespace, no marketing copy.
- **Red first.** Red patients must always appear at the top of every list,
  regardless of sort order.
- **One action per row.** Each patient row has one primary action button.
  No dropdowns, no menus within the table.
- **No icons without labels.** Every icon must have a text label or tooltip.
  Clinical tools cannot rely on icon recognition alone.
- **Auto-refresh every 2 minutes.** Patient data changes. The dashboard must
  reflect live state without requiring a manual refresh.

---

## 5. Application Architecture

```
src/
├── api/                    # All API calls live here
│   ├── patients.ts         # Patient CRUD + check-in history
│   ├── alerts.ts           # Alert management
│   ├── auth.ts             # Login / logout / token refresh
│   └── sdoh.ts             # SDOH screening data
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx     # Navigation sidebar
│   │   ├── TopBar.tsx      # Header with hospital name + user
│   │   └── Layout.tsx      # Page wrapper
│   ├── patients/
│   │   ├── PatientTable.tsx        # Main patient list
│   │   ├── PatientRow.tsx          # Single patient row
│   │   ├── PatientDetailPanel.tsx  # Slide-over detail panel
│   │   ├── RiskBadge.tsx           # Red/Yellow/Green badge component
│   │   └── ConversationThread.tsx  # SMS conversation display
│   ├── metrics/
│   │   ├── MetricCard.tsx          # Summary stat card
│   │   ├── EngagementChart.tsx     # Daily response rate trend
│   │   └── SDOHFlagsList.tsx       # SDOH flags summary
│   ├── alerts/
│   │   ├── AlertBanner.tsx         # Top-of-page urgent alerts
│   │   └── AlertLog.tsx            # Historical alert log
│   └── shared/
│       ├── Button.tsx
│       ├── Badge.tsx
│       ├── Spinner.tsx
│       ├── EmptyState.tsx
│       └── ErrorBoundary.tsx
├── hooks/
│   ├── usePatients.ts      # React Query hook for patient list
│   ├── useAlerts.ts        # React Query hook for active alerts
│   ├── useAuth.ts          # Auth state from Zustand
│   └── useAutoRefresh.ts   # 2-minute polling logic
├── pages/
│   ├── Dashboard.tsx       # Main view — metrics + patient table
│   ├── PatientDetail.tsx   # Full patient page (route: /patients/:id)
│   ├── Alerts.tsx          # Alert history page
│   ├── Reports.tsx         # Engagement + outcomes reports
│   └── Login.tsx           # Auth page
├── store/
│   └── authStore.ts        # Zustand auth store
├── types/
│   └── index.ts            # All TypeScript interfaces
└── utils/
    ├── riskUtils.ts        # Risk classification helpers
    ├── dateUtils.ts        # Date formatting with date-fns
    └── hipaaUtils.ts       # PHI masking helpers
```

---

## 6. TypeScript Interfaces

These are the core data types. Use these exactly — do not invent new field names.

```typescript
// types/index.ts

export type RiskLevel = 'red' | 'yellow' | 'green' | 'not_started';

export type Condition = 'chf' | 'copd' | 'pneumonia' | 'ami' | 'hip_knee' | 'cabg';

export type SDOHDomain =
  | 'food_insecurity'
  | 'housing_instability'
  | 'transportation'
  | 'utility_difficulty'
  | 'interpersonal_safety';

export interface Patient {
  id: string;                          // UUID — use this, never expose SSN
  first_name: string;
  last_name: string;
  age: number;
  sex: 'M' | 'F' | 'Other';
  condition: Condition;
  discharge_date: string;              // ISO 8601
  enrollment_date: string;             // ISO 8601
  days_in_program: number;             // Calculated field
  risk_level: RiskLevel;
  last_checkin_at: string | null;      // ISO 8601 or null if no check-in yet
  last_reply_summary: string | null;   // AI-generated 1-sentence summary
  coordinator_id: string;              // FK to coordinator
  hospital_id: string;                 // FK to hospital — ALWAYS filter by this
  phone_last_four: string;             // Last 4 digits only — never full number
  channel: 'sms' | 'app' | 'both';
  sdoh_flags: SDOHDomain[];            // Domains with positive screens
  adi_national_rank: number | null;    // 1-100, higher = more deprived
  checkin_completion_rate: number;     // 0-1, percentage of check-ins completed
  is_active: boolean;
}

export interface CheckIn {
  id: string;
  patient_id: string;
  sent_at: string;                     // ISO 8601
  replied_at: string | null;
  patient_message: string | null;      // Raw patient reply — PHI
  ai_summary: string | null;           // AI-generated summary
  risk_level: RiskLevel;
  escalated: boolean;
  escalation_reason: string | null;
  sdoh_domain_screened: SDOHDomain | null;
  sdoh_response: string | null;
}

export interface Alert {
  id: string;
  patient_id: string;
  patient_name: string;                // Denormalized for display
  created_at: string;
  risk_level: 'red';                   // Alerts are only created for Red
  reason: string;                      // e.g. "Reported ankle swelling + shortness of breath"
  acknowledged: boolean;
  acknowledged_at: string | null;
  acknowledged_by: string | null;      // Coordinator display name
  action_taken: string | null;
}

export interface Coordinator {
  id: string;
  display_name: string;
  email: string;
  hospital_id: string;
  hospital_name: string;
  role: 'coordinator' | 'supervisor' | 'admin';
}

export interface DashboardMetrics {
  total_active_patients: number;
  red_count: number;
  yellow_count: number;
  green_count: number;
  not_started_count: number;
  daily_response_rate: number;         // 0-1
  checkin_completion_rate: number;     // 0-1
  sdoh_flags_today: number;
  unacknowledged_alerts: number;
}
```

---

## 7. API Endpoints

All requests go to the FastAPI backend at `VITE_API_BASE_URL`.
All requests include `Authorization: Bearer <token>` header.
The backend enforces `hospital_id` filtering — coordinators only ever
see their own hospital's patients.

```typescript
// Patient endpoints
GET    /api/v1/patients                    // List all patients for hospital
GET    /api/v1/patients/:id                // Single patient detail
GET    /api/v1/patients/:id/checkins       // Full check-in history
POST   /api/v1/patients/:id/note          // Add coordinator note

// Alert endpoints
GET    /api/v1/alerts                      // All active alerts for hospital
GET    /api/v1/alerts?acknowledged=false   // Unacknowledged only
PATCH  /api/v1/alerts/:id/acknowledge      // Mark alert as acknowledged

// Dashboard metrics
GET    /api/v1/dashboard/metrics           // Summary stats for the day

// Auth
POST   /api/v1/auth/login                 // Returns JWT
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh               // Refresh access token
```

### Error handling pattern
Every API call must handle these cases:
- `401` → clear token, redirect to `/login`
- `403` → show "Access denied" — never expose why
- `422` → show field validation errors
- `500` → show generic error, log to console, never expose stack trace
- Network error → show retry button, do NOT show raw error message

---

## 8. Authentication & Session Management

**HIPAA requirement: JWT tokens must NEVER be stored in localStorage or sessionStorage.**

Use Zustand in-memory store only. Token is lost on page refresh — user must
re-authenticate. This is intentional.

```typescript
// store/authStore.ts
import { create } from 'zustand';

interface AuthState {
  token: string | null;
  coordinator: Coordinator | null;
  setAuth: (token: string, coordinator: Coordinator) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  coordinator: null,
  setAuth: (token, coordinator) => set({ token, coordinator }),
  clearAuth: () => set({ token: null, coordinator: null }),
}));
```

**Session timeout:** After 15 minutes of inactivity, clear auth state and
redirect to login. Implement with a `useInactivityTimer` hook that resets
on any mouse move, click, or keypress.

---

## 9. HIPAA Rules for This Codebase

These are non-negotiable. Every PR must be reviewed against these rules.

### What is PHI in this dashboard
- Patient full name
- Patient phone number (even last four — show only in detail view)
- Patient message content (raw SMS replies)
- Diagnosis / condition
- Any combination that could identify a patient

### Rules
1. **Never log PHI to the browser console.** Use a custom logger that
   strips PHI fields before logging.

2. **Never include PHI in URL parameters.** Routes use patient UUID only:
   `/patients/550e8400-e29b-41d4-a716-446655440000` ✅
   `/patients?name=Maria&dob=1955-03-12` ❌

3. **Never cache PHI in React Query beyond the session.** Set
   `cacheTime: 0` and `staleTime: 0` for any query returning patient messages.

4. **Mask phone numbers.** Display as `***-***-XXXX` in the patient table.
   Show last four only in the detail panel.

5. **Audit log every PHI access.** When a coordinator opens a patient
   detail panel, fire `POST /api/v1/audit/access` with patient_id,
   coordinator_id, timestamp, and action type. This is a background call
   — never block the UI for it.

6. **Auto-logout after 15 minutes of inactivity.** Show a 60-second warning
   modal before logging out. Let the user extend the session.

7. **No copy-paste of patient messages.** The conversation thread component
   must set `user-select: none` on raw patient message content and
   `onCopy` must be intercepted to show a warning. Coordinators can read
   but not easily extract raw patient data.

---

## 10. The Main Dashboard View

This is the primary view coordinators see when they log in.

### Layout
```
┌─────────────────────────────────────────────────────┐
│ TopBar: Hospital name | Coordinator name | Logout   │
├──────────┬──────────────────────────────────────────┤
│          │  Alert Banner (if unacknowledged reds)    │
│ Sidebar  ├──────────────────────────────────────────┤
│          │  Metric Cards Row (5 cards)               │
│ - Home   ├──────────────────────────────────────────┤
│ - Alerts │  Patient Table                           │
│ - Reports│  - Sorted: Red → Yellow → Green          │
│ - Settings  - Columns: Patient | Condition | Risk   │
│          │             Last check-in | Last reply    │
│          │             Action                       │
│          │  - Clicking a row opens detail panel     │
└──────────┴──────────────────────────────────────────┘
```

### Metric Cards (5 cards in a row)
```
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│   47    │ │    3    │ │    8    │ │   36    │ │   78%   │
│ Active  │ │  Red    │ │ Yellow  │ │  Green  │ │ Engage- │
│patients │ │ alerts  │ │ watch   │ │ stable  │ │  ment   │
└─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘
```
- Red card has red background when count > 0
- Clicking Red card filters table to red patients only
- Clicking Yellow card filters to yellow
- Clicking Green card filters to green
- Clicking Active resets filter

### Patient Table Columns
| Column | Notes |
|---|---|
| Patient | Last, First — Age — Sex |
| Condition | "Heart Failure" / "COPD" |
| Risk | RiskBadge component |
| Days in program | e.g. "Day 12 of 30" |
| Last check-in | Relative time: "2 hrs ago" |
| Last reply | Truncated AI summary — max 60 chars |
| SDOH | Flag icons if any domains flagged |
| Action | "Call now" (red) / "Follow up" (yellow) / "View" (green) |

### Patient Table Behavior
- Default sort: Red first, then Yellow, then Green, then by last check-in recency
- No pagination for pilots (max 200 patients) — use virtual scrolling if > 100
- Clicking a row opens `PatientDetailPanel` as a slide-over from the right
- Search by patient name (client-side filter — no API call)
- Filter by condition (CHF / COPD / All)
- Auto-refresh every 2 minutes — show "Updated just now" timestamp
- New red alerts animate in with a subtle highlight pulse

---

## 11. Patient Detail Panel

Slide-over panel from the right side. Width: 480px. Does not navigate away
from the main table — coordinator can see both simultaneously.

### Sections (top to bottom)
1. **Patient header** — name, age, condition, discharge date, days in program,
   channel (SMS/App/Both), ADI score if available
2. **Current risk** — large risk badge + last reply summary
3. **Action buttons** — "Log a call" | "Mark as reviewed" | "Escalate"
4. **SDOH flags** — if any domains flagged, show which ones + referral status
5. **Conversation thread** — full 30-day SMS/app conversation history,
   newest first. AI messages on left (dark background), patient replies
   on right (light background). Each message shows timestamp.
6. **Check-in completion chart** — small bar chart showing daily response
   pattern over 30 days
7. **Coordinator notes** — text area to add notes. Notes are timestamped and
   append-only (no editing or deleting).

---

## 12. Alert System

### Alert Banner
When there are unacknowledged Red alerts, show a sticky banner at the top
of the main content area:

```
⚠ 3 patients need immediate attention   [Review Alerts]
```

Red background, white text. Disappears when all alerts are acknowledged.

### Alert Acknowledgment Flow
1. Coordinator clicks "Review Alerts" or the Red metric card
2. Modal shows each unacknowledged alert with patient name, reason, timestamp
3. Coordinator can click "I've called the patient" or "Escalated to physician"
   and enter a free-text action note
4. `PATCH /api/v1/alerts/:id/acknowledge` is called with action_taken field
5. Alert disappears from banner
6. Alert is preserved in the alert log with coordinator name + action

---

## 13. RiskBadge Component

The most important visual component. Used everywhere. Must be consistent.

```tsx
// components/shared/RiskBadge.tsx
interface RiskBadgeProps {
  risk: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

// Red: bg-red-100 text-red-700 border border-red-200 — "RED"
// Yellow: bg-yellow-50 text-yellow-700 border border-yellow-200 — "YELLOW"
// Green: bg-green-50 text-green-700 border border-green-200 — "GREEN"
// Not started: bg-gray-100 text-gray-500 border border-gray-200 — "NOT STARTED"

// Size sm: text-xs px-2 py-0.5
// Size md: text-sm px-3 py-1 (default)
// Size lg: text-base px-4 py-1.5 font-semibold
```

---

## 14. SDOH Display Rules

SDOH data is sensitive. Display rules:

- In the patient table: show small flag icons for each flagged domain only
  (no text labels — space is limited). Icons use Lucide: Home (housing),
  Apple (food), Car (transport), Zap (utilities), Shield (safety).
- In the detail panel: show full domain name + whether a referral was made
- Interpersonal safety flags: NEVER show the raw screening response in the UI.
  Only show "Safety concern flagged — coordinator follow-up required."
  Route to human coordinator immediately, never display details.
- ADI score: show as "Neighborhood disadvantage: High (Rank 87/100)" — never
  show raw number alone without context label.

---

## 15. Empty States

Every list view must have a designed empty state. Never show a blank page.

- No patients: "No patients enrolled yet. Patients will appear here once
  enrolled at discharge."
- No red alerts: "No urgent alerts right now. All patients are stable or
  being monitored." (Show green checkmark icon)
- No check-in history: "No check-ins yet. This patient's first check-in
  will be sent within 24 hours of discharge."
- Loading: Use skeleton loaders (animated gray bars), not spinners, for
  table rows. Use spinner for the detail panel.

---

## 16. Accessibility Requirements

This is a clinical tool used in hospital settings. Accessibility is required,
not optional.

- All interactive elements must be keyboard navigable
- Focus ring must be visible (use Tailwind `focus:ring-2 focus:ring-forest`)
- Risk badges must not rely on color alone — always include text label
- All images and icons must have `aria-label` or `aria-hidden`
- Error messages must be announced to screen readers via `role="alert"`
- Auto-refresh must not steal focus or disrupt keyboard navigation
- Minimum font size: 14px for body text, 12px for captions
- Contrast ratio: minimum 4.5:1 for all text

---

## 17. Performance Rules

- Patient table must render < 200 rows in < 100ms
- Detail panel must open in < 200ms (data pre-fetched on row hover)
- Auto-refresh must not cause visible flash or layout shift
- Images: none. This dashboard has no decorative images.
- Bundle size target: < 400KB gzipped

---

## 18. Environment Variables

```bash
VITE_API_BASE_URL=https://api.avyayhealth.com/api/v1   # Backend URL
VITE_APP_ENV=development                                 # development | staging | production
VITE_SESSION_TIMEOUT_MINUTES=15                          # HIPAA session timeout
VITE_REFRESH_INTERVAL_MS=120000                          # 2 minutes auto-refresh
```

---

## 19. What NOT to Build

Do not build these — they are out of scope for Phase 1:

- Patient messaging from the dashboard (coordinators do not initiate SMS)
- Medication management or prescription features
- Diagnostic tools or clinical decision support
- Patient scheduling or appointment booking
- Billing or CMS code documentation (Phase 2)
- EHR write-back (Phase 2 — read only for now)
- Multi-hospital admin view (Phase 2)
- Analytics and population health reports (Phase 3)
- Mobile app for coordinators (browser only for Phase 1)

---

## 20. Prompting This File

When starting a new feature, paste the relevant sections of this file into
your Claude or Copilot context window along with your specific request.

Example prompt pattern:
> "I am building the Avyay Health coordinator dashboard (see CLAUDE.md context
> above). Build the PatientTable component using the Patient interface from
> Section 6, following the column structure from Section 10, with the
> RiskBadge component from Section 13. Use Tailwind CSS and the design
> system colors from Section 4."

The more specific your prompt, the less correction is needed. Always reference
the relevant section numbers.
