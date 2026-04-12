# CLAUDE.md — Avyay Health Patient iOS App
# Location: avyayhealth/PatientAppiOS/CLAUDE.md

> Read this entire file before writing any code.
> This is the native iOS (Swift/SwiftUI) patient app for Avyay Health.
> It mirrors the PWA (PatientAppPWA) in functionality, design, and API integration.

---

## 1. What This Is

The **Avyay Health Patient iOS App** is a native Swift/SwiftUI app that replicates
the PatientAppPWA for patients who prefer a native App Store experience.

Same user, same constraints:
- 60–80 years old, recently discharged with CHF or COPD
- Not tech-savvy, on an iPhone
- Possibly alone, possibly anxious about recovery

**Design principle:** One screen. One question. One big button.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | SwiftUI (iOS 16+) |
| State | ObservableObject + @EnvironmentObject |
| Networking | URLSession (async/await) |
| Haptics | UIImpactFeedbackGenerator / UINotificationFeedbackGenerator |
| Build | Xcode 15+ / xcodegen |
| Target | iPhone only (portrait) |

---

## 3. Architecture

```
AvyayHealth/
├── AvyayHealthApp.swift          # Entry point + tab navigation
├── Models/
│   ├── Types.swift               # All data models (mirrors PWA types)
│   └── PatientStore.swift        # In-memory state (HIPAA compliant)
├── Services/
│   └── APIClient.swift           # All Supabase edge function calls
├── Engine/
│   ├── ClinicalConstants.swift   # RED keywords, symptom rules, SDOH
│   ├── ConversationEngine.swift  # Intent classification + state
│   └── PhaseHandlers.swift       # Phase-specific response logic
├── Utils/
│   ├── Colors.swift              # Brand color palette
│   ├── DateUtils.swift           # Date formatting
│   └── Haptics.swift             # Haptic feedback
└── Views/
    ├── Enrollment/               # 3-step enrollment flow
    ├── Home/                     # Dashboard + check-in launch
    ├── CheckIn/                  # Chat UI, bubbles, typing, escalation
    ├── Timeline/                 # 30-day recovery calendar
    ├── CarePlan/                 # Medications, habits, warning signs
    └── CareTeam/                 # Contact directory
```

---

## 4. API Integration

Uses the same Supabase edge functions as the PWA:
- `enroll-patient` — verify name + DOB, get session token
- `chat-reply` — AI conversation via Claude (falls back to local engine)
- `save-checkin-message` — persist each message
- `complete-checkin` — mark check-in done with risk + summary
- `send-message` — patient sends DM to coordinator
- `get-messages` — fetch coordinator DM thread (polled every 8s)

All API calls go through `APIClient.swift` — the single adapter layer.

---

## 5. HIPAA Rules

- Patient token stored in-memory only (PatientStore) — NEVER UserDefaults, Keychain, or disk
- No PHI in console logs
- No patient name or condition in URLs
- On app close or 30-minute inactivity → session lost, re-auth required (name + DOB)
- This is intentional — no passwords for elderly patients

---

## 6. Messaging Architecture

- Coordinator messages appear inline in the check-in conversation (role: `.coordinator`)
- Patient can reply to coordinator even after check-in is complete
- DMs polled every 8 seconds via `get-messages` edge function
- Replies route through `send-message` edge function
- The `sending` flag never blocks coordinator replies

---

## 7. Engineering Standards

This project follows the **Engineering Standards** defined in the root `CLAUDE.md` at the monorepo level. All standards regarding secrets management, observability, input validation, security, architecture, deployment, documentation, technical debt, testing, and time handling apply to this codebase. Read and follow them on every file, feature, and suggestion.
