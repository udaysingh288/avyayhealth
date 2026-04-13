# Avyay Health — System Architecture

**Version:** 1.0 | **Date:** April 2026 | **Confidential**

---

## 1. Platform Overview

Avyay Health is a post-discharge AI care platform that contacts every discharged patient daily for 30 days — via a Progressive Web App — and alerts care coordinators the moment a patient needs help.

The platform consists of **4 frontend applications**, **1 backend (Supabase)**, and **4 Edge Functions** that together form a complete post-discharge monitoring system.

```
+------------------------------------------------------------------+
|                        AVYAY HEALTH PLATFORM                      |
+------------------------------------------------------------------+
|                                                                    |
|   FRONTEND APPS (React/Next.js + Tailwind CSS)                   |
|   +-----------------+  +-----------------+  +-----------------+   |
|   | Patient App     |  | Hospital        |  | Quality         |   |
|   | (PWA)           |  | Dashboard       |  | Dashboard       |   |
|   | Port: 5173      |  | Port: 3000      |  | Port: 3100      |   |
|   | For: Patients   |  | For: Care       |  | For: VP of      |   |
|   |                 |  | Coordinators    |  | Quality         |   |
|   +-----------------+  +-----------------+  +-----------------+   |
|                                                                    |
|   +-----------------+                                             |
|   | Marketing       |                                             |
|   | Website         |                                             |
|   | (Next.js)       |                                             |
|   | For: Hospital   |                                             |
|   | buyers          |                                             |
|   +-----------------+                                             |
|                                                                    |
+------------------------------------------------------------------+
            |                    |                   |
            v                    v                   v
+------------------------------------------------------------------+
|                     SUPABASE BACKEND                              |
|  +-------------------+  +----------------------------------+     |
|  | PostgreSQL DB      |  | Edge Functions (Deno)            |     |
|  | - hospitals        |  | - enroll-patient                 |     |
|  | - coordinators     |  | - chat-reply (Claude AI)         |     |
|  | - patients         |  | - save-checkin-message           |     |
|  | - check_ins        |  | - complete-checkin               |     |
|  | - messages         |  +----------------------------------+     |
|  | - sdoh_flags       |                                           |
|  | - profiles         |  +----------------------------------+     |
|  +-------------------+  | Supabase Auth                     |     |
|                          | - Coordinator/Director login      |     |
|  +-------------------+  +----------------------------------+     |
|  | Realtime           |                                           |
|  | - postgres_changes |  +----------------------------------+     |
|  | - Auto-refresh     |  | Row Level Security (RLS)         |     |
|  +-------------------+  | - Hospital-scoped data access     |     |
|                          +----------------------------------+     |
+------------------------------------------------------------------+
            |
            v
+------------------------------------------------------------------+
|                     ANTHROPIC CLAUDE API                           |
|  Model: claude-haiku-4-5-20251001                                |
|  Used by: chat-reply edge function                                |
|  Purpose: AI-powered patient conversation with clinical context   |
+------------------------------------------------------------------+
```

---

## 2. Application Details

### 2.1 Patient App (PWA)
**Directory:** `PatientAppPWA/`
**Tech:** React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion
**Purpose:** Mobile-first Progressive Web App for patients to complete daily AI health check-ins

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| State | Zustand (with localStorage persistence) |
| Routing | React Router v6 |
| Animations | Framer Motion |
| Icons | Material Symbols (Google Fonts) |
| PWA | vite-plugin-pwa (Workbox) |

**Key Files:**
```
PatientAppPWA/
  src/
    pages/
      Enroll.tsx          # /enroll/:code — patient enrollment
      Home.tsx            # / — today's check-in status
      CheckIn.tsx         # /checkin — AI conversation
      Timeline.tsx        # /timeline — 30-day history
      CarePlan.tsx        # /care-plan — medications & habits
      CareTeam.tsx        # /care-team — coordinator contact
    api/
      patients.ts         # Enrollment API
      checkins.ts         # Check-in messages + AI chat API
    store/
      patientStore.ts     # Zustand store with localStorage persistence
    utils/
      conversationEngine.ts  # Offline AI fallback engine
    components/
      shared/
        AuthGuard.tsx     # Token-based route protection
        BottomNav.tsx     # 4-tab navigation
```

**Auth Flow:**
```
Nurse gives URL → /enroll/RIVERSIDE
         ↓
Patient enters first name + DOB
         ↓
enroll-patient edge function verifies against DB
         ↓
Returns signed JWT (30-day expiry)
         ↓
Token stored in Zustand + localStorage
         ↓
Patient accesses protected routes
```

**Check-in Conversation Flow:**
```
Patient opens check-in
         ↓
AI greeting with condition-specific opening question
         ↓
Patient replies (text or quick reply buttons)
         ↓
Client sends conversation to chat-reply edge function
         ↓
Edge function sends to Claude API with:
  - Full conversation history
  - Clinical system prompt (~2K tokens)
  - Patient context (condition, day number, phase)
         ↓
Claude returns structured JSON:
  { reply, risk_level, next_phase, is_complete, summary, follow_up }
         ↓
Client displays AI response + saves messages to DB
         ↓
When complete: calls complete-checkin to finalize
         ↓
If RED risk: shows escalation alert (call 911)
```

### 2.2 Hospital Dashboard (Care Coordinator View)
**Directory:** `HospitalDashboard/`
**Tech:** React 18 + TypeScript + Vite + Tailwind CSS + Recharts
**Purpose:** Browser-based dashboard for care coordinators to monitor their patient population

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| State | Zustand |
| Charts | Recharts |
| Icons | Lucide React |
| Auth | Supabase Auth (email/password) |
| Realtime | Supabase Realtime (postgres_changes) |

**Key Files:**
```
HospitalDashboard/
  src/
    pages/
      Login.tsx           # Supabase Auth login
      Dashboard.tsx       # Main view — metrics + patient table
      Alerts.tsx          # Alert management + acknowledgment
      Reports.tsx         # Engagement trends
      Settings.tsx        # User profile
    hooks/
      useDashboardData.ts # Central data hook — fetches patients,
                          # check-ins, alerts, metrics from Supabase
      useAuthSession.ts   # Supabase Auth session management
    store/
      authStore.ts        # Auth state (userId, profile, hospital_id)
    lib/
      supabase.ts         # Supabase client initialization
```

**What coordinators see:**
- Patient risk feed (RED → YELLOW → GREEN sorted)
- Metric cards: Active patients, Red alerts, Yellow watch, Green stable
- Patient detail panel with conversation history
- Alert acknowledgment workflow (called / escalated / other)
- 2-minute auto-refresh + Supabase Realtime subscriptions

### 2.3 Quality Dashboard (VP of Quality View)
**Directory:** `QualityDashboard/`
**Tech:** React 18 + TypeScript + Vite + Tailwind CSS + Recharts
**Purpose:** Hospital-wide analytics for quality directors

**Key Pages:**
| Page | Content |
|------|---------|
| Overview | Hospital-wide KPIs, HRRP penalty estimates, CMS revenue potential |
| Coordinators | Per-coordinator performance (completion rate, response time, alerts) |
| Engagement | 30-day response rate trends, condition outcomes, SDOH screening |
| Penalties | HRRP penalty calculations, readmission rates by condition |
| Reimbursement | CMS CPT code revenue projections (99453–99496) |

**Data Source:** `useHospitalData.ts` hook — same Supabase queries, but aggregated at the hospital level with coordinator-level breakdowns.

### 2.4 Marketing Website
**Directory:** `Website/`
**Tech:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
**Purpose:** B2B sales website targeting hospital VP of Quality / Care Transitions Director

**Single conversion goal:** Book a 20-minute discovery call
**Contact form:** Formspree integration (placeholder ID — needs real form ID)

---

## 3. Backend Architecture (Supabase)

### 3.1 Database Schema

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  hospitals   │     │ coordinators │     │   profiles   │
│─────────────│     │──────────────│     │─────────────│
│ id (PK)     │◄────│ hospital_id  │     │ id (FK→auth)│
│ name        │     │ first_name   │     │ email       │
│ enroll_code │     │ last_name    │     │ display_name│
│ city        │     │ email        │     │ role        │
│ state       │     │ phone        │     │ hospital_id │
│ created_at  │     │ role         │     │ created_at  │
└─────────────┘     │ created_at   │     └─────────────┘
       │            └──────────────┘
       │
       ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  patients   │     │  check_ins   │     │  messages   │
│─────────────│     │──────────────│     │─────────────│
│ id (PK)     │◄────│ patient_id   │◄────│ check_in_id │
│ hospital_id │     │ day_number   │     │ role        │
│ coordinator │     │ date         │     │ content     │
│ first_name  │     │ status       │     │ risk_level  │
│ last_name   │     │ risk_level   │     │ sent_at     │
│ dob         │     │ summary      │     └─────────────┘
│ condition   │     │ completed_at │
│ discharge_dt│     │ created_at   │
│ days_in_pgm │     │ (unique:     │
│ total_days  │     │  patient_id  │
│ phone       │     │  +day_number)│
│ enroll_token│     └──────────────┘
│ status      │
│ created_at  │     ┌──────────────┐
└─────────────┘     │  sdoh_flags  │
       │            │──────────────│
       └────────────│ patient_id   │
                    │ check_in_id  │
                    │ domain       │
                    │ notes        │
                    │ resolved     │
                    │ created_at   │
                    └──────────────┘
```

**Status enums:**
- `patients.status`: `active` | `completed` | `withdrawn`
- `check_ins.status`: `pending` | `completed` | `missed` | `escalated`
- `check_ins.risk_level`: `red` | `yellow` | `green`
- `patients.condition`: `chf` | `copd` | `pneumonia` | `ami`
- `sdoh_flags.domain`: `food_insecurity` | `housing_instability` | `transportation` | `utility_difficulty` | `interpersonal_safety`
- `coordinators.role`: `care_coordinator` | `quality_director`

### 3.2 Row Level Security (RLS)
All tables have RLS enabled. Policies ensure:
- Coordinators only see their own hospital's data
- Patients can only access their own records (via JWT claims)
- Service role key (used by edge functions) bypasses RLS

### 3.3 Realtime Subscriptions
Both dashboards subscribe to postgres_changes on:
- `patients` table — new enrollments, status changes
- `check_ins` table — risk level updates, completions
- `messages` table — new messages (HospitalDashboard only)

Auto-refresh interval: 2 minutes (fallback when realtime misses events)

---

## 4. Edge Functions (Supabase Deno Runtime)

### 4.1 enroll-patient
**Trigger:** Patient submits name + DOB on enrollment page
**Flow:**
1. Receives hospital enrollment code + patient first name + DOB
2. Looks up hospital by enrollment code
3. Finds matching patient record (first_name + dob + hospital_id)
4. If found: signs a 30-day patient JWT with `{ patient_id, hospital_id }`
5. Returns JWT + patient session data (condition, day number, coordinator name)

### 4.2 chat-reply (AI Conversation)
**Trigger:** Patient sends a message during check-in
**Flow:**
1. Verifies patient JWT
2. Receives full conversation history + patient context
3. Builds system prompt with:
   - Clinical knowledge base (CHF/COPD/Pneumonia/AMI protocols)
   - SDOH screening protocol (CMS 5-domain)
   - Medication adherence guidance
   - Emergency escalation rules
4. Calls Claude Haiku API (`claude-haiku-4-5-20251001`)
5. Parses structured JSON response
6. Returns: `{ reply, risk_level, next_phase, is_complete, summary, follow_up }`

**Fallback:** If Anthropic API key is missing or API fails, uses built-in rule-based response generator.

**Cost:** ~$0.001 per check-in conversation (Claude Haiku pricing)

### 4.3 save-checkin-message
**Trigger:** Every message sent (patient or AI)
**Flow:**
1. Verifies patient JWT
2. Finds or creates today's check-in row (unique per patient + day_number)
3. Inserts message into `messages` table
4. Returns check_in_id + message_id

### 4.4 complete-checkin
**Trigger:** Check-in conversation ends
**Flow:**
1. Verifies patient JWT
2. Updates check-in status to `completed` or `escalated` (if RED)
3. Saves final risk_level and summary
4. Triggers realtime notification to coordinator dashboard

---

## 5. AI Conversation Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    PATIENT APP (Client)                       │
│                                                              │
│  ┌────────────────┐    ┌─────────────────────────────────┐  │
│  │  CheckIn.tsx    │    │  conversationEngine.ts          │  │
│  │  (UI + flow)    │    │  (offline fallback)             │  │
│  │                 │    │  - 18 intent types               │  │
│  │  handleSend()───┼──► │  - 80+ symptom patterns          │  │
│  │       │         │    │  - Phase-based flow              │  │
│  │       │ try AI  │    │  - Response pools (no repeats)   │  │
│  │       ▼         │    └─────────────────────────────────┘  │
│  │  getChatReply() │              ▲                           │
│  │       │         │              │ fallback if API fails     │
│  └───────┼─────────┘              │                           │
└──────────┼────────────────────────┼───────────────────────────┘
           │                        │
           ▼                        │
┌──────────────────────────────────────────────────────────────┐
│              SUPABASE EDGE FUNCTION: chat-reply               │
│                                                              │
│  1. Verify patient JWT                                       │
│  2. Build system prompt with:                                │
│     ┌─────────────────────────────────────────────────────┐  │
│     │  CLINICAL KNOWLEDGE BASE (RAG-in-prompt ~2K tokens) │  │
│     │  - CHF red flags + self-care guidance                │  │
│     │  - COPD red flags + inhaler protocol                 │  │
│     │  - Pneumonia + AMI recovery warnings                 │  │
│     │  - SDOH 5-domain screening protocol                  │  │
│     │  - Medication adherence barriers                     │  │
│     │  - 911 escalation criteria                           │  │
│     └─────────────────────────────────────────────────────┘  │
│  3. Call Claude Haiku API                                    │
│  4. Parse structured JSON response                           │
│  5. Return { reply, risk_level, summary, next_phase, ... }   │
└──────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────┐
│                    ANTHROPIC CLAUDE API                        │
│  Model: claude-haiku-4-5-20251001                            │
│  Max tokens: 512                                              │
│  Input: system prompt + conversation history                  │
│  Output: structured JSON with risk classification             │
└──────────────────────────────────────────────────────────────┘
```

### Conversation Phases
```
Symptom Check → Symptom Follow-up → Medication Check → [SDOH Screen] → Complete
     │                 │                   │                  │
     │  "not good"     │  "yes, swelling"  │  "took them"    │  "need a ride"
     │  → probes       │  → flags team     │  → encourages   │  → flags coordinator
     │  further        │  → asks about     │  → moves to     │  → completes
     │                 │  weight gain       │  SDOH/complete  │
```

### What the AI handles:
| Input | Response |
|-------|----------|
| "feeling good" | Warm acknowledgment, condition-specific encouragement |
| "not good" | Empathetic probe — asks for specifics |
| "my ankle is swollen" | Flags for coordinator, asks about weight gain (CHF) |
| "asdfghjk" (gibberish) | Acknowledges warmly, re-asks the health question |
| "my daughter visited today" | Responds to life update, steers to health check |
| "I'm scared" | Validates emotions, flags for coordinator support |
| "stop asking me questions" | Empathetic, explains why check-ins matter |
| "can't breathe" | EMERGENCY — directs to call 911 immediately |

---

## 6. Authentication Architecture

### Patient Auth (PatientAppPWA)
```
No username/password — elderly patients can't remember them

Enrollment link (from nurse) → /enroll/RIVERSIDE
         ↓
Enter first name + date of birth
         ↓
enroll-patient edge function verifies against patients table
         ↓
Signs custom JWT: { patient_id, hospital_id, exp: 30 days }
         ↓
Stored in Zustand + localStorage (survives app refresh)
         ↓
All API calls include X-Patient-Token header
         ↓
30-minute inactivity timer → re-auth required
```

### Coordinator Auth (HospitalDashboard + QualityDashboard)
```
Supabase Auth (email + password)
         ↓
Login → Supabase returns access token
         ↓
On auth, looks up `profiles` table for hospital_id + role
         ↓
Role determines which dashboard is accessible:
  - care_coordinator → HospitalDashboard
  - quality_director → QualityDashboard
         ↓
All DB queries scoped by hospital_id
         ↓
15-minute inactivity timer → session warning → auto-logout
```

---

## 7. Data Flow: End-to-End

### Patient Check-in → Coordinator Alert
```
1. Patient opens app, starts check-in
2. AI asks: "How are you feeling today?"
3. Patient: "My ankle is really swollen and I'm short of breath"
4. Client → chat-reply edge function → Claude API
5. Claude classifies as YELLOW (swelling + breathing with CHF)
6. Claude responds empathetically, asks follow-up
7. Messages saved to DB via save-checkin-message
8. Check-in completes → complete-checkin sets risk_level=yellow
9. Supabase Realtime fires postgres_changes event
10. Hospital Dashboard receives event → refetches data
11. Coordinator sees patient flagged YELLOW with summary:
    "Reports ankle swelling and shortness of breath, Day 5 CHF.
     Medications taken. No SDOH concerns."
12. Coordinator clicks "Follow up today" → calls patient
```

---

## 8. Environment & Deployment

### Supabase Project
- **Project ID:** `gehcrdcgxifryfwjhpoz`
- **Region:** (Supabase cloud)
- **Database:** PostgreSQL with RLS enabled
- **Edge Functions:** 4 deployed (Deno runtime)

### Secrets (Supabase)
| Secret | Purpose |
|--------|---------|
| `ANTHROPIC_API_KEY` | Claude API for AI chat responses |
| `PATIENT_JWT_SECRET` | Signs/verifies patient session tokens |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge function DB access (bypasses RLS) |

### Frontend Env Vars
| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://gehcrdcgxifryfwjhpoz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon JWT (public, safe to expose) |

### Development Ports
| App | Port | URL |
|-----|------|-----|
| PatientAppPWA | 5173 | `http://localhost:5173` |
| HospitalDashboard | 3000 | `http://localhost:3000` |
| QualityDashboard | 3100 | `http://localhost:3100` |
| Phone testing | — | `http://192.168.1.167:<port>` |

### Demo Credentials
| Dashboard | Email | Password |
|-----------|-------|----------|
| Hospital (Coordinator) | `sarah.chen@riverside.demo` | `WCLgB$!$ZT@bwdHt3F` |
| Quality (Director) | `maya.rodriguez@riverside.demo` | `DHwm6Ciqnn2hzKSwvs` |
| Patient App | Enroll via `/enroll/RIVERSIDE` | Any name + DOB |

---

## 9. Tech Stack Summary

| Component | Technology | Why |
|-----------|-----------|-----|
| Frontend framework | React 18 + TypeScript | Type safety, ecosystem |
| Styling | Tailwind CSS | Utility-first, fast iteration |
| Build tool | Vite | Fast dev server + builds |
| State management | Zustand | Lightweight, no boilerplate |
| Backend / DB | Supabase (PostgreSQL) | Auth, realtime, edge functions, RLS |
| AI model | Claude Haiku 4.5 | Fast, cheap, high quality for clinical conversations |
| Edge functions | Deno (Supabase) | Serverless, TypeScript native |
| Patient auth | Custom JWT | No password for elderly patients |
| Coordinator auth | Supabase Auth | Email/password, session management |
| Charts | Recharts | React-native charting |
| Animations | Framer Motion | Smooth mobile transitions |
| PWA | vite-plugin-pwa + Workbox | Offline support, home screen install |
| Marketing site | Next.js 14 | SEO, SSG, fast load |
| Fonts | DM Serif Display + DM Sans | Warm, trustworthy brand identity |

---

## 10. Security & Compliance

| Concern | Implementation |
|---------|---------------|
| Data isolation | RLS policies scope all queries to hospital_id |
| Patient auth | Custom JWT with HMAC-SHA256, 30-day TTL |
| Coordinator auth | Supabase Auth with session management |
| Inactivity timeout | 30 min (patients), 15 min (coordinators) |
| PHI protection | No PHI in URLs, no console logging of patient data |
| Cross-tenant | check_ins and sdoh_flags filtered by hospital patient IDs |
| CORS | Edge functions allow specific headers only |
| API keys | Stored as Supabase secrets, never in client code |

---

## 11. Cost Estimates

| Component | Cost |
|-----------|------|
| Supabase (free tier) | $0/month (up to 50K MAU, 500MB DB) |
| Claude Haiku API | ~$0.001 per check-in (~$3/month per 100 patients) |
| Vercel (website hosting) | $0/month (free tier) |
| **Total for 100-patient pilot** | **~$3/month** |

---

*Avyay Health, Inc. | Jersey City, NJ | Confidential*
