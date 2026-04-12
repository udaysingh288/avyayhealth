import SwiftUI

struct CarePlanView: View {
    @EnvironmentObject var store: PatientStore
    @State private var selectedTab = 0

    private var condition: Condition { store.session?.condition ?? .chf }

    var body: some View {
        VStack(spacing: 0) {
            // Header
            VStack(spacing: 4) {
                Text("Care Plan")
                    .font(.custom("DMSerifDisplay-Regular", size: 24))
                    .foregroundColor(.textPrimary)
                Text(condition.label)
                    .font(.custom("DMSans-Regular", size: 14))
                    .foregroundColor(.textSecondary)
            }
            .padding(.top, 16)
            .padding(.bottom, 8)

            // Tab selector
            Picker("", selection: $selectedTab) {
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
                .font(.custom("DMSans-SemiBold", size: 16))
                .foregroundColor(.white)
                .frame(maxWidth: .infinity, minHeight: 48)
                .background(Color.riskRed)
                .cornerRadius(24)
            }
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

                medicationRow(name: condition == .chf ? "Furosemide (Lasix)" : "Albuterol Inhaler",
                              dose: condition == .chf ? "40mg, once daily" : "2 puffs, as needed",
                              timing: "Morning")
                medicationRow(name: condition == .chf ? "Lisinopril" : "Tiotropium (Spiriva)",
                              dose: condition == .chf ? "10mg, once daily" : "1 capsule, once daily",
                              timing: "Morning")
                medicationRow(name: condition == .chf ? "Metoprolol" : "Prednisone",
                              dose: condition == .chf ? "25mg, twice daily" : "20mg, tapering",
                              timing: "Morning & Evening")
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
                        .foregroundColor(.riskRed)
                    Text("Call 911 Immediately")
                        .font(.custom("DMSans-SemiBold", size: 16))
                        .foregroundColor(.riskRed)
                }

                VStack(alignment: .leading, spacing: 8) {
                    emergencyRow("Severe chest pain")
                    emergencyRow("Cannot breathe at all")
                    emergencyRow("Lips or fingertips turning blue")
                    emergencyRow("Sudden confusion or inability to speak")
                }
            }
            .padding(20)
            .background(Color.riskRedBg)
            .cornerRadius(16)
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
                .foregroundColor(.forest)
            Text(title)
                .font(.custom("DMSans-SemiBold", size: 16))
                .foregroundColor(.textPrimary)
        }
    }

    private func medicationRow(name: String, dose: String, timing: String) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(name)
                    .font(.custom("DMSans-Medium", size: 15))
                    .foregroundColor(.textPrimary)
                Text(dose)
                    .font(.custom("DMSans-Regular", size: 13))
                    .foregroundColor(.textSecondary)
            }
            Spacer()
            Text(timing)
                .font(.custom("DMSans-Regular", size: 12))
                .foregroundColor(.textMuted)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(Color.forestPale)
                .cornerRadius(6)
        }
    }

    private func habitRow(_ text: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: "circle")
                .font(.system(size: 20))
                .foregroundColor(.forest.opacity(0.4))
            Text(text)
                .font(.custom("DMSans-Regular", size: 15))
                .foregroundColor(.textPrimary)
        }
    }

    private func warningRow(_ text: String) -> some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: "exclamationmark.circle.fill")
                .font(.system(size: 14))
                .foregroundColor(.riskYellow)
                .padding(.top, 2)
            Text(text)
                .font(.custom("DMSans-Regular", size: 14))
                .foregroundColor(.textPrimary)
        }
    }

    private func emergencyRow(_ text: String) -> some View {
        HStack(spacing: 8) {
            Circle().fill(Color.riskRed).frame(width: 6, height: 6)
            Text(text)
                .font(.custom("DMSans-Medium", size: 14))
                .foregroundColor(.riskRed)
        }
    }
}

private extension View {
    func cardStyle() -> some View {
        self.padding(20)
            .background(Color.white)
            .cornerRadius(16)
            .shadow(color: .black.opacity(0.04), radius: 8, y: 2)
            .padding(.horizontal, 20)
    }
}
