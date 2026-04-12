# CLAUDE.md — Avyay Health Website

## What You Are Building

A marketing website for **Avyay Health** — a post-discharge AI care platform for hospitals.
This is a B2B sales website. The buyer is a VP of Quality or Care Transitions Director at a community hospital.
The goal of the website is one thing: get them to book a 20-minute discovery call.

Everything on the website should serve that one conversion goal.

---

## Company Identity

**Company:** Avyay Health, Inc.
**Tagline:** The care that follows you home
**One-liner:** AI care companion that contacts every discharged patient daily for 30 days — via SMS or app — and alerts care coordinators the moment a patient needs help.
**Founded:** March 2026 | Jersey City, NJ
**Stage:** Pre-seed, building toward first pilot

**Founders:**
- Diksha Deshmukh — CEO & Co-Founder. MPH, 3 years inside hospital systems studying post-discharge care failure. Clinical protocols, hospital relationships, business development.
- Kunwar Uday Singh — Co-Founder. Data, AI/ML, product engineering, technical architecture.

**Contact email:** diksha@avyayhealth.com
**Website:** avyayhealth.com

---

## Brand Identity

### Colors
- **Primary deep forest green:** `#27500A` — dominant brand color, use for headers, CTAs, key backgrounds
- **Warm off-white:** `#F9F7F2` — page background, creates warmth and approachability
- **Accent teal:** `#0D6B56` — secondary green, used for highlights, hover states
- **Dark charcoal:** `#1A1A1A` — body text
- **Muted gray:** `#6B7280` — secondary text, captions
- **Red alert:** `#C0392B` — used ONLY for Red patient risk badge
- **Amber:** `#D97706` — used ONLY for Yellow patient risk badge
- **Green indicator:** `#27500A` — used for Green patient risk badge

### Typography
- **Display/headings:** `DM Serif Display` — elegant, human, trustworthy. Import from Google Fonts.
- **Body/UI:** `DM Sans` — clean, modern, readable. Import from Google Fonts.
- **Monospace (for code/SMS examples):** `JetBrains Mono` — for SMS conversation mockups

### Design Aesthetic
- Warm, refined minimalism — NOT cold tech startup, NOT clinical/hospital white
- Inspired by the pitch deck: cream/off-white backgrounds, forest green accents, elegant serif headlines
- Every section should feel like it was designed for a healthcare professional who is skeptical of technology
- Trust signals everywhere: research data, real quotes from survey respondents, clinical specificity
- Generous whitespace. Typography-led. Not icon-heavy.

### Logo
The Avyay Health logo is a location pin icon merged with a medical cross inside a forest green rounded rectangle, with the tagline "THE CARE THAT FOLLOWS YOU HOME" in small caps below the wordmark. Reference the pitch deck cover for the exact design.

---

## What the Website Must Communicate

### The Core Narrative (in order)
1. Hospitals are losing patients the moment they walk out the door
2. The existing approaches (manual nurse calls, IVR, tablet RPM) are broken
3. Avyay fixes this with conversational AI — no hardware, no app download required
4. Hospitals earn more than they spend (CMS reimbursement)
5. We are doing a free 90-day pilot — book a call

### The One Conversion Goal
Every page, every section, every CTA points to: **"Book a 20-minute call"**
Use Calendly embed or a simple contact form.

---

## Website Sections / Pages

### 1. Hero Section
**Headline:** "The care that follows you home"
**Subheadline:** "Avyay Health contacts every discharged patient daily for 30 days — by SMS or app — and alerts your care team before deterioration becomes a readmission."
**CTA:** "Book a free 20-minute call →"
**Secondary CTA:** "See how it works ↓"
**Visual:** SMS conversation mockup on the right side showing:
- Avyay: "Hi Maria, it's day 3 after your discharge. How are you feeling today? Any pain, shortness of breath, or swelling?"
- Patient: "My ankle is a bit swollen and I feel tired."
- Avyay: "Thanks for letting me know. That level of swelling after discharge is worth checking. I'll flag this for your care team now."
- [Flagged as Yellow badge]

### 2. Problem Section — "The post-discharge gap"
**Headline:** "Your patients leave. Most systems lose them."
**Stats from our primary research (52 hospital professionals surveyed March 2026):**
- **8 in 10** hospital staff rank reducing 30-day readmissions as a top priority
- **46%** say their #1 challenge is simply not being able to reach patients after discharge
- **46%** still rely on nurses making manual follow-up calls — adding to burnout
- **37%** cite patient comprehension failure as a core breakdown point

**Quote to include:**
> "Many patients don't answer the phone. Often their contact info in the EMR is not accurate. Without a verified number, we simply cannot follow up."
> — Discharge Nurse, Survey Respondent, March 2026

**Financial stats:**
- $15,000 average cost per preventable readmission
- 2,400+ hospitals penalized under HRRP in FY2026
- ~20% of Medicare patients readmitted within 30 days

### 3. How It Works Section
**Headline:** "From discharge to 30 days — automated"
**Four steps:**

**Step 01 — Enrollment**
Nurse enrolls patient at discharge. Welcome SMS arrives within 24 hours. No hardware. No app download required. Works on any phone.

**Step 02 — Daily check-ins (Days 1–7)**
AI asks about symptoms, medications, and recovery. Reads free-text replies — not just button taps. "Feeling more winded going upstairs" triggers escalation, not a log entry.

**Step 03 — Tapering care (Days 8–30)**
Check-ins taper as patient stabilizes. Social determinants (transport, food, housing) screened using CMS 5-domain framework and referred to community resources.

**Step 04 — Red alerts (Anytime)**
Flagged symptoms trigger an instant coordinator ping with patient summary. Response SLA: under 2 hours.

### 4. Product Demo Section — "One dashboard, every patient"
**Headline:** "Your care coordinators see everything. In real time."
**Show coordinator dashboard mockup with:**
- Patient risk feed: Maria P. (RED), Benjamin B. (YELLOW), Natalia S. (GREEN)
- Flagged patients panel with recommended actions
- Metrics: Daily Response Rate, Check-in Completion, SDOH Flags Raised
**Body text:** "Browser-based. No new software to install. No training required. Your team is live in under a week."

### 5. Why We're Different Section
**Headline:** "Built for hospitals that can't afford to wait"
**Comparison table:**

| Feature | Avyay Health | Manual calls | IVR / Portals | Digital health tools |
|---|---|---|---|---|
| Engagement | App + SMS — meets patients where they are | 40–50% reach rate, high staff cost | 20–30% open rate, low completion | 30–50% depending on app download |
| Language access | English + Spanish at launch | Requires bilingual staff | English-only or basic | Limited translation layers |
| SDOH screening | CMS 5-domain built in | Ad hoc, inconsistent | Not supported | Optional add-on |
| Implementation | <24hr enrollment, ADT feed only | Ongoing staffing need | 4–8 weeks IT integration | 6–12 weeks app rollout |

### 6. Business Case Section — "Avyay pays for itself"
**Headline:** "We don't cost hospitals money. We make them money."
**CMS Reimbursement Stack:**
- 99453 — RPM device setup: $21.71 (one-time)
- 99454 — Device supply monthly: $52.11/mo
- 99457 — RPM management 20 min: $51.77/mo
- 99458 — RPM management add-on: $41.42/mo
- 99490 — CCM first 20 min: $66.13/mo
- 99496 — TCM high complexity: $298 per discharge

**Total: $3,164+ per CHF patient per year**

**ROI table:**
- 100 patients: $42–60K Avyay fee → ~$316K CMS revenue → ~5–7x ROI
- 500 patients: $210–300K Avyay fee → ~$1.58M CMS revenue → ~5–6x ROI

**HRRP penalty context:**
"A 300-bed hospital with a 0.5% HRRP penalty on $200M Medicare revenue loses $1M/year. Reducing readmissions by 20% can save $500K in penalties alone — before counting CMS reimbursement revenue."

### 7. Free Pilot Section
**Headline:** "A free 90-day pilot. No budget. No IT lift."
**What we offer:**
- 200 CHF or COPD patients enrolled
- One care unit, one coordinator
- ADT discharge feed only — no EHR write-back
- Full setup and onboarding handled by Avyay
- Complete outcomes report: readmission data, engagement metrics, SDOH flags

**What we need from you:**
- ADT discharge data feed
- 1 clinical champion
- 30 minutes to onboard

**Conversion terms:**
"If the pilot shows ≥15% readmission reduction, we convert to a paid contract. If not, we part as friends."

**CTA:** "Book your discovery call →"

### 8. Founders Section
**Headline:** "Built by people who have been inside your hospital"
**Diksha Deshmukh:**
"I spent 3 years inside hospital systems studying post-discharge care failure firsthand — not from the outside. I've personally spoken with 52 hospital professionals to validate every assumption before writing a line of code. That's not research. That's obsession."
Role: CEO & Co-Founder — Clinical Research & Healthcare Expert, MPH

**Kunwar Uday Singh:**
"I build the AI infrastructure that makes Avyay work — the LLM classification engine, the SMS infrastructure, the real-time risk scoring system. Healthcare data is my domain."
Role: Co-Founder — Data, AI/ML & Product Engineering

### 9. CTA / Contact Section
**Headline:** "Let's talk — 20 minutes is all we need"
**Body:** "Walk us through your current post-discharge workflow. We'll show you how Avyay fits in. No pitch — just questions."
**Form fields:** Name, Hospital name, Role/title, Email, Preferred time to talk
**Or:** Calendly embed for direct booking
**Email:** diksha@avyayhealth.com

### 10. Footer
- Logo + tagline
- Navigation links
- "Avyay Health, Inc. · Jersey City, NJ · 2026"
- Privacy Policy link (placeholder)
- diksha@avyayhealth.com

---

## Key Messages to Weave Throughout

1. **No hardware.** Say this repeatedly. It removes the #1 objection.
2. **Works on any phone.** SMS + app. No download required.
3. **ADT feed only — no EHR write-back.** Removes the IT objection.
4. **Free 90-day pilot.** Remove the budget objection.
5. **$3,100+ per patient per year in CMS reimbursement.** Reframe from cost to revenue.
6. **HRRP penalty math.** Make the CFO pain real and specific.
7. **52 hospital professionals surveyed.** Primary research, not secondary. We talked to your peers.
8. **Under 2-hour alert response SLA.** Clinical specificity builds trust.

---

## What NOT to Include

- Do NOT mention that the product is still being built
- Do NOT use the words "journey", "revolutionize", "disrupt", "game-changing", "cutting-edge"
- Do NOT use stock photo doctor/nurse imagery — use the actual SMS mockup and dashboard mockup
- Do NOT over-explain AI — hospitals do not care about the technology, they care about outcomes
- Do NOT use vague claims without numbers behind them
- Do NOT mention funding stage or company age unless asked
- Do NOT say "startup" anywhere on the website

---

## Technical Requirements

- **Framework:** Next.js 14 with App Router (or React + Vite if simpler)
- **Styling:** Tailwind CSS
- **Fonts:** DM Serif Display + DM Sans from Google Fonts
- **Animations:** Subtle — fade-in on scroll for sections, no aggressive animations
- **Mobile:** Fully responsive — hospital staff often check things on their phone
- **Performance:** Fast — hospitals have slow hospital WiFi
- **Contact form:** Works with Formspree or Netlify Forms (no backend needed)
- **Deploy:** Vercel (free tier, one command deploy)
- **HIPAA note:** The marketing website itself does NOT handle any patient data — no HIPAA compliance needed for the website

---

## Tone of Voice

- **Confident, not boastful.** Let the numbers speak.
- **Direct, not salesy.** Hospital buyers hate being sold to.
- **Clinical specificity builds trust.** Use real CPT codes, real HRRP penalty percentages, real survey numbers.
- **Human, not robotic.** This is a care product. Warmth matters.
- **Short sentences. Active voice.** Healthcare leaders are busy.

---

## SMS Conversation Examples to Use as UI Mockups

**Example 1 — CHF patient flagged Yellow:**
```
Avyay Health: Hi Maria, it's day 3 after your discharge. How are
you feeling today? Any pain, shortness of breath, or swelling?

Maria: My ankle is a bit swollen and I feel tired.

Avyay Health: Thanks for letting me know. That level of swelling
after discharge is worth checking. I'll flag this for your care
team now.

[Flagged as Yellow ●]
```

**Example 2 — SDOH screening:**
```
Avyay Health: One quick question — are you able to get to your
follow-up appointment next week? Do you have transportation?

James: No I don't have a ride and my son works during the day.

Avyay Health: Got it. I've flagged this for your care coordinator.
They'll help arrange a ride for your appointment.

[Transportation barrier flagged ●]
```

**Example 3 — Red alert:**
```
Avyay Health: Good morning Dorothy. How is your breathing today
compared to yesterday?

Dorothy: Cannot sleep lying flat, very short of breath.

Avyay Health: This sounds urgent. Please call 911 or go to your
nearest emergency room immediately. Your care team has been
notified.

[Escalated to RED — Coordinator alerted ●]
```

---

## Coordinator Dashboard UI Reference

The dashboard should show:

**Top metrics bar:**
- 47 Active patients
- 3 Red alerts today
- 8 Yellow — watch
- 36 Green — stable
- 78% Engagement rate

**Patient risk feed table columns:**
Patient | Condition | Risk | Last check-in | Last reply | Action

**Example rows:**
- Maria T., 68F | Heart Failure | 🔴 RED | 2 hrs ago | "Ankle swelling, more breathless going upstairs" | Call now
- James W., 74M | COPD | 🟡 YELLOW | 4 hrs ago | "Coughing more than usual, no fever" | Follow up today
- Sandra K., 61F | Heart Failure | 🟢 GREEN | 1 hr ago | "Feeling good, went for a short walk today" | No action

---

## Build Instructions for Claude

When building this website:

1. Start with the full page structure in one Next.js or React file
2. Use Tailwind for all styling — no custom CSS files unless necessary
3. Import DM Serif Display and DM Sans from Google Fonts in the `<head>`
4. Build the SMS mockup as a styled component simulating a phone screen
5. Build the coordinator dashboard as a styled mockup — not a real data table
6. Every section should have a subtle fade-in animation on scroll using Intersection Observer
7. The navigation should be sticky with a forest green background on scroll
8. On mobile, the comparison table should horizontally scroll
9. The contact form should submit to Formspree (free tier) — replace `YOUR_FORM_ID` with actual ID
10. Deploy instructions: `npm run build` → push to GitHub → connect to Vercel → done

---

## Reference: Pitch Deck Structure (13 slides)

The website mirrors the pitch deck narrative:
1. Cover → Hero section
2. "We've seen this problem firsthand" → Problem section
3. "The cost of doing nothing" → Financial impact stats
4. "$490B market" → Market section (optional — less relevant for hospital buyers)
5. "Meet Avyay" → Product overview
6. "How it works" → How it works section
7. "Key differentiators" → Why we're different
8. "One dashboard, every patient" → Dashboard mockup
9. "Business model" → Business case / CMS reimbursement
10. "Why we're different" → Comparison table
11. "The team" → Founders section
12. "The ask" → Free pilot offer
13. "Thank you" → Contact / CTA

---

*This file is the single source of truth for building avyayhealth.com.
Last updated: April 2026 | Avyay Health, Inc. | Confidential*

---

# Engineering Standards for This Project

> These standards apply to **every app** in this monorepo: Website, HospitalDashboard, PatientAppPWA, PatientAppiOS, QualityDashboard, and all Supabase edge functions.

## Secrets & Environment

- NEVER hardcode API keys, tokens, passwords, or secrets in code or config files
- All secrets go in `.env` files; ensure `.env` is in `.gitignore`
- Maintain separate credentials for dev, staging, and prod — never share tokens across environments
- Use environment variables accessed via a central config module, not scattered `process.env` / `import.meta.env` calls

## Observability (from Day One)

- Integrate crash/error reporting on the first day, not after complaints arrive
- Add structured logging that writes to a persistent sink (file, service) — not just stdout
- Expose a `/health` or `/healthz` endpoint for every backend service
- Log meaningful context in errors: what failed, with what inputs, at what stage

## External Services & APIs

- Wrap every third-party API in a dedicated service/adapter layer — never call it inline
- Add rate limiting on all auth endpoints and write operations from the start
- Handle API errors explicitly: timeouts, retries with backoff, unexpected response shapes
- Design the wrapper so swapping providers requires touching only one file

## Input Validation & Security

- Validate and sanitize ALL input server-side — never trust the client
- The happy path is not enough. Always handle: missing fields, wrong types, empty strings, null, out-of-range values
- Set CORS to specific allowed origins — never use `*` in production
- Sanitize anything that will be rendered or stored

## Architecture

- Break logic into small, single-responsibility modules from the start — no monolithic controllers
- Never change database schema by hand. Use versioned migrations only
- Separate concerns: routing, business logic, data access, and external calls each belong in their own layer
- If you're tempted to put more than one major responsibility in a file, split it

## Environments & Deployment

- Three environments minimum: dev, staging (mirrors prod), prod
- Staging must use production-equivalent config and data shape
- Deployments come from the CI/CD pipeline — never from a local machine or manual script
- Set up CI (automated tests on every push) and CD (automated deploy on merge) early — even a basic setup beats none

## Documentation

- Every project must have a README.md covering: local setup, environment variables needed, how to run, how to deploy
- Document non-obvious decisions inline with a `# Why:` comment
- If you are the only person who knows how to run or deploy this, that is a risk — fix it

## Technical Debt

- If something is hacky, either fix it now or create a tracked issue with a deadline
- "I'll clean it up later" is not acceptable. Later never comes
- Feature flags must be real flags (env var, config value) — not commented-out code
- Any TODO left in code must include what, why, and when

## Testing

- Test unhappy paths explicitly: network failures, unexpected API responses, invalid input, empty states
- Do not rely on "it worked on my machine"
- If you add a backup or restore mechanism, test a full restore before calling it done
- Write tests alongside features, not after shipping

## Time Handling

- Store all timestamps in UTC
- Convert to local time only at the display layer
- Never mix UTC, local time, and framework defaults in the same flow

## The Mental Model

You are a brilliant, fast engineer who needs a senior to guide architecture, security, and long-term maintainability decisions. That senior is the developer working with you. You flag risks, ask clarifying questions on ambiguous architecture choices, and never cut corners silently. When something feels like a shortcut, say so.
