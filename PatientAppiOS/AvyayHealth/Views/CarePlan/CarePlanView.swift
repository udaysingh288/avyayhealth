import SwiftUI

struct CarePlanView: View {
    @EnvironmentObject var store: PatientStore
    @State private var selectedTab = 0

    private var condition: Condition { store.session?.condition ?? .chf }

    private var medications: [Medication] {
        if let meds = store.session?.medications, !meds.isEmpty {
            return meds
        }
        // Fallback defaults for when API doesn't return medications
        if condition == .chf {
            return [
                Medication(name: "Furosemide (Lasix)", dose: "40mg", frequency: "once daily", timing: "Morning"),
                Medication(name: "Lisinopril", dose: "10mg", frequency: "once daily", timing: "Morning"),
                Medication(name: "Metoprolol", dose: "25mg", frequency: "twice daily", timing: "Morning & Evening"),
            ]
        } else {
            return [
                Medication(name: "Albuterol Inhaler", dose: "2 puffs", frequency: "as needed", timing: "As needed"),
                Medication(name: "Tiotropium (Spiriva)", dose: "1 capsule", frequency: "once daily", timing: "Morning"),
                Medication(name: "Prednisone", dose: "20mg", frequency: "tapering", timing: "Morning"),
            ]
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            // Header
            VStack(spacing: 4) {
                Text("Care Plan")
                    .font(.custom("DMSerifDisplay-Regular", size: 24, relativeTo: .title))
                    .foregroundStyle(.textPrimary)
                    .accessibilityAddTraits(.isHeader)
                Text(condition.label)
                    .font(.custom("DMSans-Regular", size: 14, relativeTo: .subheadline))
                    .foregroundStyle(.textSecondary)
            }
            .padding(.top, 16)
            .padding(.bottom, 8)

            // Tab selector
            Picker("View", selection: $selectedTab) {
                Text("Today").tag(0)
                Text("Resources").tag(1)
            }
            .pickerStyle(.segmented)
            .padding(.horizontal, 20)
            .padding(.bottom, 16)

            ScrollView {
                if selectedTab == 0 {
                    todayTab
                } else {
                    resourcesTab
                }
            }

            // Emergency footer
            Button {
                if let url = URL(string: "tel://911") {
                    UIApplication.shared.open(url)
                }
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "phone.fill")
                    Text("Call 911")
                }
                .font(.custom("DMSans-SemiBold", size: 16, relativeTo: .body))
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity, minHeight: 48)
                .background(Color.riskRed)
                .clipShape(.rect(cornerRadius: 24))
            }
            .accessibilityLabel("Call 911 emergency services")
            .accessibilityHint("Double tap to call emergency services")
            .padding(.horizontal, 20)
            .padding(.bottom, 16)
        }
        .background(Color.warmOatmeal)
    }

    // MARK: - Today Tab

    private var todayTab: some View {
        VStack(alignment: .leading, spacing: 20) {
            // Medications
            VStack(alignment: .leading, spacing: 12) {
                sectionHeader("Medications", icon: "pills")

                ForEach(medications) { med in
                    medicationRow(name: med.name, dose: "\(med.dose), \(med.frequency)", timing: med.timing)
                }
            }
            .cardStyle()

            // Daily habits
            VStack(alignment: .leading, spacing: 12) {
                sectionHeader("Daily Habits", icon: "heart")

                if condition == .chf {
                    habitRow("Weigh yourself each morning")
                    habitRow("Limit sodium to <2,000mg")
                    habitRow("Take a 10-15 minute walk")
                    habitRow("Elevate feet when resting")
                    habitRow("Track fluid intake")
                } else {
                    habitRow("Practice pursed-lip breathing")
                    habitRow("Avoid smoke and strong odors")
                    habitRow("Take a short walk if able")
                    habitRow("Use inhaler before activity")
                    habitRow("Stay hydrated")
                }
            }
            .cardStyle()

            Spacer(minLength: 100)
        }
        .padding(.horizontal, 20)
    }

    // MARK: - Resources Tab

    private var resourcesTab: some View {
        VStack(alignment: .leading, spacing: 20) {
            // Warning signs
            VStack(alignment: .leading, spacing: 12) {
                sectionHeader("Warning Signs", icon: "exclamationmark.triangle")

                if condition == .chf {
                    warningRow("Sudden weight gain (2+ lbs in a day)")
                    warningRow("Swelling in feet, ankles, or legs")
                    warningRow("Shortness of breath at rest or lying flat")
                    warningRow("Waking up gasping for air")
                    warningRow("New or worsening cough")
                    warningRow("Dizziness or severe fatigue")
                } else {
                    warningRow("Increased breathlessness")
                    warningRow("Sputum color change (yellow/green)")
                    warningRow("Increased mucus production")
                    warningRow("Chest tightness not relieved by inhaler")
                    warningRow("Fever > 101.5°F")
                    warningRow("Confusion or extreme drowsiness")
                }
            }
            .cardStyle()

            // When to call 911
            VStack(alignment: .leading, spacing: 12) {
                HStack(spacing: 8) {
                    Image(systemName: "exclamationmark.octagon.fill")
                        .foregroundStyle(.riskRed)
                    Text("Call 911 Immediately")
                        .font(.custom("DMSans-SemiBold", size: 16, relativeTo: .headline))
                        .foregroundStyle(.riskRed)
                }
                .accessibilityAddTraits(.isHeader)

                VStack(alignment: .leading, spacing: 8) {
                    emergencyRow("Severe chest pain")
                    emergencyRow("Cannot breathe at all")
                    emergencyRow("Lips or fingertips turning blue")
                    emergencyRow("Sudden confusion or inability to speak")
                }
            }
            .padding(20)
            .background(Color.riskRedBg)
            .clipShape(.rect(cornerRadius: 16))
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color.riskRed.opacity(0.3), lineWidth: 1))
            .padding(.horizontal, 20)

            Spacer(minLength: 100)
        }
    }

    // MARK: - Helpers

    private func sectionHeader(_ title: String, icon: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundStyle(.forest)
                .accessibilityHidden(true)
            Text(title)
                .font(.custom("DMSans-SemiBold", size: 16, relativeTo: .headline))
                .foregroundStyle(.textPrimary)
                .accessibilityAddTraits(.isHeader)
        }
    }

    private func medicationRow(name: String, dose: String, timing: String) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(name)
                    .font(.custom("DMSans-Medium", size: 15, relativeTo: .body))
                    .foregroundStyle(.textPrimary)
                Text(dose)
                    .font(.custom("DMSans-Regular", size: 13, relativeTo: .subheadline))
                    .foregroundStyle(.textSecondary)
            }
            Spacer()
            Text(timing)
                .font(.custom("DMSans-Regular", size: 12, relativeTo: .caption))
                .foregroundStyle(.textSecondary)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(Color.forestPale)
                .clipShape(.rect(cornerRadius: 6))
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(name), \(dose), take \(timing)")
    }

    private func habitRow(_ text: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: "circle")
                .font(.system(size: 20))
                .foregroundStyle(.forest.opacity(0.4))
                .accessibilityHidden(true)
            Text(text)
                .font(.custom("DMSans-Regular", size: 15, relativeTo: .body))
                .foregroundStyle(.textPrimary)
        }
    }

    private func warningRow(_ text: String) -> some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: "exclamationmark.circle.fill")
                .font(.system(size: 14))
                .foregroundStyle(.riskYellow)
                .padding(.top, 2)
                .accessibilityHidden(true)
            Text(text)
                .font(.custom("DMSans-Regular", size: 14, relativeTo: .subheadline))
                .foregroundStyle(.textPrimary)
        }
        .accessibilityLabel("Warning: \(text)")
    }

    private func emergencyRow(_ text: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 10))
                .foregroundStyle(.riskRed)
                .accessibilityHidden(true)
            Text(text)
                .font(.custom("DMSans-Medium", size: 14, relativeTo: .subheadline))
                .foregroundStyle(.riskRed)
        }
        .accessibilityLabel("Emergency: \(text)")
    }
}

private extension View {
    func cardStyle() -> some View {
        self.padding(20)
            .background(Color.white)
            .clipShape(.rect(cornerRadius: 16))
            .shadow(color: .black.opacity(0.04), radius: 8, y: 2)
            .padding(.horizontal, 20)
    }
}
