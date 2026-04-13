# iOS Development Agent

Use this skill when building, reviewing, or refactoring Swift/SwiftUI code for the Avyay Health iOS patient app. It enforces modern Swift patterns, Apple HIG compliance, HIPAA requirements, and market-readiness standards.

## When to Use

- When writing new SwiftUI views or features
- When refactoring existing iOS code
- When reviewing code for production readiness
- When ensuring HIPAA compliance in iOS code
- When adding accessibility features for elderly users
- Before submitting for App Store review

## How to Apply

Read the full agent prompt from `agents/ios-development/ios-development.md` in the repository root.

Key areas covered:

1. **Modern Swift/SwiftUI** — No deprecated APIs, async/await, proper state management
2. **HIPAA Compliance** — In-memory only storage, no PHI logging, screen protection, inactivity timeout
3. **Accessibility** — VoiceOver labels, Dynamic Type, color contrast, reduce motion, 44pt touch targets
4. **Architecture** — APIClient singleton, Config for secrets, PatientStore as source of truth
5. **Brand System** — Forest green theme, DMSans/DMSerifDisplay fonts, warm oatmeal backgrounds

## Output Format

When reviewing, provide:
- Issues found with file:line references
- Before/after code examples
- Pre-release checklist status
