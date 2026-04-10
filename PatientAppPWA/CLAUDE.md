# CLAUDE.md — Avyay Health Patient PWA
# Location: avyayhealth/PatientAppPWA/CLAUDE.md

> Read this entire file before writing any code.
> This is the patient-facing Progressive Web App for Avyay Health.
> It is NOT the coordinator dashboard (see HospitalDashboard/CLAUDE.md).
> It is NOT the marketing website (see AvyayHealthClientWebsite/CLAUDE.md).

---

## 1. What This Is

The **Avyay Health Patient PWA** is a mobile-first Progressive Web App used
by recently discharged hospital patients to complete daily AI-guided health
check-ins for 30 days after leaving the hospital.

**The patient is typically:**
- 60–80 years old
- Recently discharged with CHF or COPD
- Not tech-savvy
- On a smartphone (iPhone or Android)
- Possibly alone, possibly anxious about their recovery

**Design principle above all others:**
One screen. One question. One big button. If a 75-year-old CHF patient
cannot use this on their first try without instructions, we have failed.

**This app does NOT use SMS.** Push notifications replace SMS in Phase 1.
Patients install via browser "Add to Home Screen" — no App Store required.

---

## 2. How This Fits in the Monorepo

```
avyayhealth/
├── HospitalDashboard/       ← Coordinator-facing React app (separate CLAUDE.md)
├── AvyayHealthClientWebsite/ ← Marketing website (separate CLAUDE.md)
└── PatientAppPWA/           ← THIS REPO
    ├── CLAUDE.md            ← You are here
    ├── public/
    │   ├── manifest.json    ← PWA manifest
    │   └── sw.js            ← Service worker (Workbox generated)
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── pages/
    │   ├── hooks/
    │   ├── store/
    │   ├── types/
    │   └── utils/
    ├── index.html
    ├── vite.config.ts
    └── package.json
```

The PatientAppPWA shares the same FastAPI backend as HospitalDashboard.
They hit the same API but use different authentication and different
endpoints. Patient auth uses secure tokens embedded in enrollment links,
not username/password.

---

## 3. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | React 18 + TypeScript | Strict TypeScript |
| Styling | Tailwind CSS | Mobile-first, large touch targets |
| State | Zustand | Lightweight store |
| Data fetching | React Query (TanStack Query) | |
| Routing | React Router v6 | |
| PWA | Vite PWA Plugin (vite-plugin-pwa) | Wraps Workbox |
| Push notifications | Web Push API (browser native) | pywebpush on backend |
| Icons | Lucide React | Simple, clear icons |
| Animations | Framer Motion | Subtle transitions only |
| Build | Vite | |

**Do NOT use:**
- localStorage for any PHI or patient tokens (HIPAA)
- sessionStorage for tokens
- Any third-party chat widget or SDK
- Twilio (Phase 2 only)
- Complex navigation patterns — max 2 levels deep

---

## 4. Design System

### Brand Colors
```css
--color-forest:       #27500A;   /* Primary — headers, primary buttons */
--color-forest-light: #3A6E12;   /* Button hover */
--color-forest-pale:  #EEF4E8;   /* Light backgrounds, selected states */
--color-off-white:    #F9F7F2;   /* Page background */
--color-orange:       #E85D27;   /* Accent — CTAs, highlights */
--color-orange-pale:  #FDF0EB;   /* Orange tint backgrounds */

/* Risk — never use these decoratively */
--color-red:          #DC2626;
--color-red-bg:       #FEF2F2;
--color-yellow:       #D97706;
--color-yellow-bg:    #FFFBEB;
--color-green:        #16A34A;
--color-green-bg:     #F0FDF4;

/* Text */
--color-text-primary:   #1E293B;
--color-text-secondary: #64748B;
--color-text-muted:     #94A3B8;

/* UI */
--color-border:       #E2E8F0;
--color-surface:      #FFFFFF;
```

### Typography
```html
<!-- index.html -->
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```
- **Headings:** `DM Serif Display` — warm, trustworthy, not clinical
- **Body / UI:** `DM Sans` — clean and readable
- **Minimum font size:** 16px body, 14px captions — elderly users need larger text
- **Line height:** 1.6 minimum — readability for older eyes

### Touch Target Rules
- Every tappable element: minimum 48x48px
- Primary action buttons: full width, 56px height minimum
- Spacing between tappable elements: minimum 8px
- No tiny close buttons, no small checkboxes

### Spacing
- Page padding: 20px horizontal
- Section gap: 32px
- Card padding: 20px
- Border radius: 16px for cards, 12px for buttons, 8px for badges

---

## 5. Application Architecture

```
src/
├── api/
│   ├── checkins.ts         # Check-in flow API calls
│   ├── enrollment.ts       # Patient enrollment
│   ├── patient.ts          # Patient profile + history
│   ├── push.ts             # Push notification subscription
│   └── sdoh.ts             # SDOH screening responses
├── components/
│   ├── checkin/
│   │   ├── QuestionCard.tsx        # The main AI question display
│   │   ├── ReplyInput.tsx          # Text input for patient reply
│   │   ├── ConversationBubble.tsx  # Single message bubble
│   │   ├── CheckInComplete.tsx     # Completion screen
│   │   └── EscalationAlert.tsx     # Emergency warning screen
│   ├── enrollment/
│   │   ├── WelcomeScreen.tsx       # First launch screen
│   │   ├── EnrollmentForm.tsx      # Name + DOB verification
│   │   └── AddToHomePrompt.tsx     # PWA install prompt
│   ├── history/
│   │   ├── TimelineCalendar.tsx    # 30-day recovery calendar
│   │   └── DayDetail.tsx          # Tap a day to see that check-in
│   ├── sdoh/
│   │   ├── SDOHQuestion.tsx        # SDOH screening question
│   │   └── ResourceCard.tsx        # Referral resource display
│   ├── education/
│   │   ├── ConditionGuide.tsx      # CHF or COPD guide
│   │   └── WarningSigns.tsx        # When to call 911
│   └── shared/
│       ├── BottomNav.tsx           # 4-tab bottom navigation
│       ├── TopBar.tsx              # Simple header with back button
│       ├── PrimaryButton.tsx       # Full-width primary button
│       ├── Spinner.tsx
│       └── ErrorScreen.tsx
├── hooks/
│   ├── usePatientAuth.ts           # Token-based patient auth
│   ├── useCheckin.ts               # Today's check-in state
│   ├── usePushNotifications.ts     # Register push subscription
│   └── useInactivityTimer.ts       # 30-min auto-lock
├── pages/
│   ├── Enroll.tsx                  # /enroll/[hospital-code]
│   ├── Home.tsx                    # / — today's check-in or completion
│   ├── Timeline.tsx                # /timeline — 30-day history
│   ├── CareTeam.tsx                # /care-team — coordinator contact
│   ├── Learn.tsx                   # /learn — condition education
│   └── Resources.tsx               # /resources — SDOH referrals
├── store/
│   └── patientStore.ts             # Zustand — patient session state
├── types/
│   └── index.ts                    # TypeScript interfaces
└── utils/
    ├── tokenUtils.ts               # JWT decode, validate
    ├── pushUtils.ts                # Push subscription helpers
    └── dateUtils.ts                # date-fns helpers
```

---

## 6. TypeScript Interfaces

```typescript
// types/index.ts

export type RiskLevel = 'red' | 'yellow' | 'green';
export type Condition = 'chf' | 'copd' | 'pneumonia' | 'ami';
export type CheckInStatus = 'pending' | 'completed' | 'missed' | 'escalated';

export type SDOHDomain =
  | 'food_insecurity'
  | 'housing_instability'
  | 'transportation'
  | 'utility_difficulty'
  | 'interpersonal_safety';

export interface PatientSession {
  patient_id: string;           // UUID
  first_name: string;           // First name only — never show full name in UI
  condition: Condition;
  discharge_date: string;       // ISO 8601
  days_in_program: number;      // 1–30
  total_days: number;           // Always 30
  hospital_name: string;
  coordinator_first_name: string;
  token: string;                // JWT — stored in memory only, never localStorage
}

export interface TodayCheckin {
  checkin_id: string;
  day_number: number;           // 1–30
  status: CheckInStatus;
  question: string;             // Current AI question to display
  conversation: Message[];      // Full conversation so far today
  completed_at: string | null;
}

export interface Message {
  id: string;
  role: 'ai' | 'patient';
  content: string;
  sent_at: string;              // ISO 8601
  risk_level: RiskLevel | null; // Only set on AI classification messages
}

export interface DayHistory {
  day_number: number;
  date: string;                 // ISO 8601
  status: CheckInStatus;
  risk_level: RiskLevel | null;
  summary: string | null;       // AI-generated 1-sentence summary
}

export interface SDOHResource {
  id: string;
  domain: SDOHDomain;
  name: string;                 // e.g. "City Harvest Food Bank"
  description: string;
  phone: string | null;
  website: string | null;
  referral_made: boolean;
  referral_date: string | null;
}

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}
```

---

## 7. API Endpoints

Base URL: `VITE_API_BASE_URL/api/v1/patient`

All requests include `Authorization: Bearer <patient_token>` header.
Patient tokens are scoped — a patient can only access their own data.

```typescript
// Enrollment
POST   /enroll                        // Verify name + DOB, return patient token
POST   /push-subscription             // Register push notification subscription

// Today's check-in
GET    /checkin/today                 // Get today's question + conversation
POST   /checkin/reply                 // Submit a reply
                                      // body: { checkin_id, message }
                                      // returns: { ai_response, risk_level, next_question }

// History
GET    /checkin/history               // All 30 days with status
GET    /checkin/history/:day          // Specific day detail

// Profile
GET    /profile                       // Patient name, condition, days in program
GET    /care-team                     // Coordinator name + hospital contact info

// SDOH
GET    /sdoh/resources                // Resources patient has been referred to

// Health check
GET    /health                        // 200 if token valid, 401 if expired
```

### Auth flow for patients
Patients do not have a username or password. They authenticate via:

1. **Enrollment link** — nurse gives patient `app.avyayhealth.com/enroll/[hospital-code]`
2. Patient enters first name + date of birth
3. Backend verifies against patient record, returns a long-lived JWT (30 days)
4. Token stored in Zustand memory only
5. On app reopen after token loss — patient re-enters name + DOB

This is intentional. No passwords for elderly patients to forget.

---

## 8. PWA Configuration

### manifest.json
```json
{
  "name": "Avyay Health",
  "short_name": "Avyay",
  "description": "Your daily health check-in after discharge",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F9F7F2",
  "theme_color": "#27500A",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### vite.config.ts PWA plugin
```typescript
import { VitePWA } from 'vite-plugin-pwa';

VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'icons/*.png'],
  manifest: false,                    // Use public/manifest.json directly
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.avyayhealth\.com\/api\/v1\/patient\/checkin\/today/,
        handler: 'NetworkFirst',       // Always try network, fall back to cache
        options: { cacheName: 'checkin-cache', expiration: { maxAgeSeconds: 300 } }
      }
    ]
  }
})
```

### Push notification registration
```typescript
// hooks/usePushNotifications.ts
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export function usePushNotifications() {
  const registerPush = async (patientToken: string) => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return; // Silently skip — older devices
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    // Send subscription to backend
    await api.post('/push-subscription', subscription.toJSON());
  };

  return { registerPush };
}
```

---

## 9. The Check-in Conversation — Core Feature

This is the most important screen in the app. Build it with extreme care.

### Flow
```
Patient opens app
    ↓
GET /checkin/today
    ↓
Show today's question in a card (large text, warm tone)
    ↓
Patient types reply in text input
    ↓
Patient taps "Send"
    ↓
POST /checkin/reply
    ↓
Show loading state (pulsing dots)
    ↓
Backend: Claude classifies → saves → returns next question or completion
    ↓
Show AI response
    ↓
If more questions: show next question
If complete: show CheckInComplete screen
If RED: show EscalationAlert screen immediately
```

### QuestionCard component rules
- Question text: `text-xl` minimum, `DM Serif Display`, `#1E293B`
- Warm tone label: "Avyay Health · Day 12" in small muted text above
- Card has soft shadow, `border-radius: 16px`, white background
- Never show the risk classification to the patient — they see "Thank you"
  not "You have been classified Red"
- If today's check-in is already completed — show completion state with
  summary of what they reported, not the full conversation

### ReplyInput component rules
- Full width text area, minimum 3 rows, grows to fit content
- Placeholder: "Type how you're feeling..."
- Font size: 16px minimum (prevents iOS zoom on focus)
- Send button: full width below input, `#27500A` background, white text,
  56px height, "Send" with arrow icon
- Disable send button while loading

### EscalationAlert — shown when patient triggers RED keywords
```
⚠️  This sounds urgent.

Please call 911 or go to your nearest
emergency room right away.

Your care team at [Hospital Name]
has also been notified.

[Call 911]          [I'm okay, continue]
```
- Full screen overlay, red background tint
- Large text, impossible to miss
- "Call 911" button opens `tel:911`
- "I'm okay" logs the dismissal and continues check-in
- This screen fires BEFORE any other response is shown

---

## 10. The Add to Home Screen Flow

Show the install prompt on the enrollment completion screen and once
more on day 2 if not yet installed. Never show it more than twice.

```typescript
// hooks/useInstallPrompt.ts
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    return outcome; // 'accepted' or 'dismissed'
  };

  return { promptInstall, isInstalled, canInstall: !!deferredPrompt };
}
```

### iOS instructions (no beforeinstallprompt on Safari)
Detect iOS Safari and show manual instructions:
```
To add to your home screen:
1. Tap the Share button (□↑) at the bottom
2. Tap "Add to Home Screen"
3. Tap "Add"
```
Show this as a bottom sheet with illustrated steps.

---

## 11. Navigation Structure

4-tab bottom navigation. Simple. Always visible after enrollment.

```
┌─────────────────────────────────┐
│                                 │
│         Page Content            │
│                                 │
│                                 │
├──────┬──────┬──────┬────────────┤
│ Home │ Days │ Learn│  Resources │
│  🏠  │  📅  │  📖  │    🤝      │
└──────┴──────┴──────┴────────────┘
```

- **Home** — Today's check-in (red dot badge if not completed)
- **Days** — 30-day recovery timeline calendar
- **Learn** — Condition education (CHF or COPD)
- **Resources** — SDOH referrals + care team contact

No hamburger menus. No nested navigation. No settings page in Phase 1.

---

## 12. HIPAA Rules for This Codebase

### Patient token storage
```typescript
// CORRECT — Zustand in-memory only
const usePatientStore = create<PatientState>((set) => ({
  token: null,
  session: null,
  setSession: (token, session) => set({ token, session }),
  clearSession: () => set({ token: null, session: null }),
}));

// WRONG — never do this
localStorage.setItem('patient_token', token);    // ❌ HIPAA violation
sessionStorage.setItem('patient_token', token);  // ❌ HIPAA violation
```

### What is PHI in this app
- Patient first name (shown in UI — that is fine, but never log it)
- Patient replies / messages (PHI — never log to console)
- Condition (CHF, COPD — PHI)
- Any combination of above

### Rules
1. Never `console.log` any patient message content
2. Never put patient name or condition in URL parameters
3. Patient token in URL only during enrollment handoff, then immediately
   moved to memory — URL is replaced with `window.history.replaceState`
4. If token is lost (app closed, phone restarted) — patient re-enters
   name + DOB. This is the intended flow. Do not fight it.
5. Auto-lock after 30 minutes of inactivity — show re-auth screen
   (name + DOB again). Shorter lock time than coordinator dashboard
   because phones are shared in some households.

---

## 13. Offline Behavior

The PWA must be usable when the patient has intermittent connectivity.

### What works offline
- Viewing today's question (cached by service worker)
- Reading previous check-in history (cached)
- Viewing educational content (fully cached)
- Viewing care team contact info (cached)

### What requires connectivity
- Submitting a reply (POST request — cannot be deferred, clinical data)
- Push notification registration

### Offline UI pattern
When patient tries to submit a reply with no connection:
```
"No internet connection right now.
Your reply will be sent when
you're back online."

[Try again]
```
Do NOT queue the reply silently — patient must explicitly retry.
Clinical data cannot be sent without confirmation.

---

## 14. Condition-Specific Content

The app shows different educational content based on `PatientSession.condition`.

### CHF (Heart Failure) — warning signs to show
- Sudden weight gain (2+ lbs in a day, 5+ lbs in a week)
- Swelling in feet, ankles, or legs
- Shortness of breath at rest or when lying flat
- New or worsening cough
- Feeling more tired than usual

### COPD — warning signs to show
- Increased breathlessness
- Change in mucus color (yellow or green)
- Increased mucus production
- Chest tightness
- Waking up at night due to breathing trouble

### When to call 911 (both conditions)
- Severe chest pain
- Cannot breathe at all
- Lips or fingertips turning blue
- Sudden confusion or inability to speak

This content is static — build it as hardcoded React components,
not fetched from the API. It must work offline.

---

## 15. Environment Variables

```bash
VITE_API_BASE_URL=https://api.avyayhealth.com
VITE_APP_ENV=development
VITE_VAPID_PUBLIC_KEY=                   # Generated once, stored here
VITE_SESSION_TIMEOUT_MINUTES=30          # Patient session timeout
VITE_HOSPITAL_SUPPORT_PHONE=             # Fallback phone number
```

---

## 16. Screen-by-Screen Summary

| Route | Screen | Key behavior |
|---|---|---|
| `/enroll/:code` | Enrollment | Name + DOB form. Verify against DB. Issue token. Show install prompt. |
| `/` | Home | Today's check-in conversation. Red dot if incomplete. |
| `/timeline` | 30-day calendar | Green/yellow/red dots per day. Tap to see summary. |
| `/learn` | Condition guide | CHF or COPD. Warning signs. When to call 911. Fully offline. |
| `/resources` | SDOH resources | Resources patient has been referred to. Care team contact. |
| `/care-team` | Care team | Coordinator first name. Hospital name. Tap-to-call button. |

---

## 17. What NOT to Build in Phase 1

- Two-way chat initiated by the patient (they reply to AI questions only)
- Video or voice calls
- Medication tracking or pill reminders
- Appointment scheduling
- Patient-to-coordinator messaging
- Account settings or profile editing
- Multiple language support (English only for Phase 1)
- Biometric login (Face ID / Touch ID) — defer to Phase 2
- SMS fallback — Twilio added in Phase 2
- Family member access

---

## 18. Prompting Pattern

When asking Claude or Copilot to build a feature, use this pattern:

> "I am building the Avyay Health Patient PWA (see CLAUDE.md).
> Build [ComponentName] from Section [X].
> Use the PatientSession and TodayCheckin interfaces from Section 6.
> Follow the design system from Section 4 — DM Sans font, forest green
> primary color #27500A, large touch targets (48px minimum).
> The patient is elderly — font size minimum 16px, one action per screen.
> Use Tailwind CSS only, no custom CSS files."

Always remind Claude of the elderly patient constraint. It changes
every design decision — font size, button size, copy tone, complexity.
