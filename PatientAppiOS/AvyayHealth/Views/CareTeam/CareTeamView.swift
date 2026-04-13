import SwiftUI

struct CareTeamView: View {
    @EnvironmentObject var store: PatientStore
    @State private var selectedTab = 0

    private var coordinatorName: String {
        store.session?.coordinatorFirstName ?? "Your Coordinator"
    }

    var body: some View {
        VStack(spacing: 0) {
            VStack(spacing: 4) {
                Text("Care Team")
                    .font(.custom("DMSerifDisplay-Regular", size: 26, relativeTo: .title))
                    .foregroundStyle(.textPrimary)
                    .accessibilityAddTraits(.isHeader)
                Text(store.session?.hospitalName ?? "Your Hospital")
                    .font(.custom("DMSans-Regular", size: 14, relativeTo: .subheadline))
                    .foregroundStyle(.textSecondary)
            }
            .padding(.top, 16)
            .padding(.bottom, 8)

            Picker("Tab", selection: $selectedTab) {
                Text("My Team").tag(0)
                Text("Hospital").tag(1)
            }
            .pickerStyle(.segmented)
            .padding(.horizontal, 20)
            .padding(.bottom, 16)
            .tint(.forest)

            ScrollView {
                if selectedTab == 0 {
                    myTeamTab
                } else {
                    hospitalTab
                }

                // Legal disclaimer
                Text("Calls may be recorded for care quality.")
                    .font(.custom("DMSans-Regular", size: 11, relativeTo: .caption2))
                    .foregroundStyle(.textMuted)
                    .multilineTextAlignment(.center)
                    .padding(.top, 16)
                    .padding(.horizontal, 40)

                Spacer(minLength: 100)
            }
        }
        .background(Color.warmOatmeal)
    }

    // MARK: - My Team Tab

    private var myTeamTab: some View {
        VStack(spacing: 12) {
            // Care coordinator with online indicator
            coordinatorCard

            contactCard(
                icon: "cross.case.fill",
                gradient: [.accentTeal, .accentTeal.opacity(0.7)],
                name: "Hospital Pharmacy",
                role: "Medication questions & refills",
                hours: "Mon–Fri, 8 AM – 6 PM",
                phone: "18005550101"
            )

            contactCard(
                icon: "stethoscope",
                gradient: [.riskRed, .riskRed.opacity(0.8)],
                name: "On-Call Physician",
                role: "Urgent medical questions",
                hours: "Available 24/7",
                phone: "18005550102",
                isUrgent: true
            )

            // Fallback notice
            fallbackNotice
        }
        .padding(.horizontal, 20)
    }

    // MARK: - Hospital Tab

    private var hospitalTab: some View {
        VStack(spacing: 12) {
            // 911 — always first, not removable
            emergencyCard

            contactCard(
                icon: "stethoscope",
                gradient: [.riskRed, .riskRed.opacity(0.8)],
                name: "On-Call Physician",
                role: "Urgent medical questions",
                hours: "Available 24/7",
                phone: "18005550102",
                isUrgent: true
            )

            contactCard(
                icon: "doc.text.fill",
                gradient: [.forestGradientStart, .accentTeal],
                name: "Discharge Planning",
                role: "Follow-up scheduling",
                hours: "Mon–Fri, 8 AM – 5 PM",
                phone: "18005550103"
            )

            contactCard(
                icon: "person.2.fill",
                gradient: [.forestGradientStart, .accentTeal],
                name: "Patient Services",
                role: "Billing & support",
                hours: "Mon–Fri, 9 AM – 5 PM",
                phone: "18005550104"
            )

            contactCard(
                icon: "building.2.fill",
                gradient: [.textSecondary, .textSecondary.opacity(0.7)],
                name: "Main Reception",
                role: "General inquiries",
                hours: "Mon–Fri, 7 AM – 7 PM",
                phone: "18005550100"
            )

            // Fallback notice
            fallbackNotice
        }
        .padding(.horizontal, 20)
    }

    // MARK: - Coordinator Card (with online dot + hours)

    private var coordinatorCard: some View {
        HStack(spacing: 16) {
            ZStack(alignment: .bottomTrailing) {
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [.forestGradientStart, .accentTeal],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 48, height: 48)

                    Text(String(coordinatorName.prefix(1)).uppercased())
                        .font(.custom("DMSans-Bold", size: 20, relativeTo: .title3))
                        .foregroundStyle(.white)
                }

                // Online indicator
                if isOnShift {
                    Circle()
                        .fill(Color.riskGreen)
                        .frame(width: 14, height: 14)
                        .overlay(Circle().stroke(Color.white, lineWidth: 2.5))
                        .offset(x: 2, y: 2)
                }
            }
            .accessibilityHidden(true)

            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 6) {
                    Text(coordinatorName)
                        .font(.custom("DMSans-SemiBold", size: 16, relativeTo: .body))
                        .foregroundStyle(.textPrimary)

                    if isOnShift {
                        Text("On shift")
                            .font(.custom("DMSans-Medium", size: 10, relativeTo: .caption2))
                            .foregroundStyle(.riskGreen)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.riskGreenBg)
                            .clipShape(.rect(cornerRadius: 4))
                    }
                }

                Text("Care Coordinator, RN")
                    .font(.custom("DMSans-Regular", size: 13, relativeTo: .subheadline))
                    .foregroundStyle(.textSecondary)

                Text("Mon–Fri, 8 AM – 5 PM")
                    .font(.custom("DMSans-Regular", size: 11, relativeTo: .caption))
                    .foregroundStyle(.textMuted)
            }

            Spacer()

            Button {
                haptic(.medium)
                if let url = URL(string: "tel://18005550100") {
                    UIApplication.shared.open(url)
                }
            } label: {
                Image(systemName: "phone.fill")
                    .font(.system(size: 15))
                    .foregroundStyle(.forest)
                    .frame(width: 44, height: 44)
                    .background(Color.forestPale)
                    .clipShape(Circle())
            }
            .accessibilityLabel("Call \(coordinatorName)")
        }
        .padding(16)
        .background(Color.white)
        .clipShape(.rect(cornerRadius: 18))
        .shadow(color: .black.opacity(0.05), radius: 10, y: 3)
        .accessibilityElement(children: .combine)
    }

    // MARK: - 911 Emergency Card (hardcoded, always top)

    private var emergencyCard: some View {
        Button {
            haptic(.warning)
            if let url = URL(string: "tel://911") {
                UIApplication.shared.open(url)
            }
        } label: {
            HStack(spacing: 14) {
                ZStack {
                    Circle()
                        .fill(Color.riskRed)
                        .frame(width: 48, height: 48)

                    Image(systemName: "exclamationmark.triangle.fill")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundStyle(.white)
                }

                VStack(alignment: .leading, spacing: 3) {
                    Text("Emergency — Call 911")
                        .font(.custom("DMSans-Bold", size: 16, relativeTo: .body))
                        .foregroundStyle(.riskRed)
                    Text("Life-threatening emergency, available 24/7")
                        .font(.custom("DMSans-Regular", size: 12, relativeTo: .caption))
                        .foregroundStyle(.textSecondary)
                }

                Spacer()

                Image(systemName: "phone.fill")
                    .font(.system(size: 15))
                    .foregroundStyle(.white)
                    .frame(width: 44, height: 44)
                    .background(Color.riskRed)
                    .clipShape(Circle())
                    .shadow(color: .riskRed.opacity(0.3), radius: 4, y: 2)
            }
            .padding(16)
            .background(Color.riskRedBg)
            .clipShape(.rect(cornerRadius: 18))
            .overlay(
                RoundedRectangle(cornerRadius: 18)
                    .stroke(Color.riskRed.opacity(0.3), lineWidth: 1.5)
            )
        }
        .accessibilityLabel("Emergency. Call 911. Available 24/7.")
        .accessibilityHint("Double tap to call 911")
    }

    // MARK: - Fallback Notice

    private var fallbackNotice: some View {
        HStack(spacing: 8) {
            Image(systemName: "info.circle.fill")
                .font(.system(size: 13))
                .foregroundStyle(.textMuted)
                .accessibilityHidden(true)
            Text("If no answer and your situation is urgent, call 911.")
                .font(.custom("DMSans-Regular", size: 12, relativeTo: .caption))
                .foregroundStyle(.textMuted)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.warmOatmeal)
        .clipShape(.rect(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.borderColor, lineWidth: 1)
        )
    }

    // MARK: - Contact Card

    private func contactCard(icon: String, gradient: [Color], name: String, role: String, hours: String, phone: String, isUrgent: Bool = false) -> some View {
        HStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: gradient,
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 48, height: 48)

                Image(systemName: icon)
                    .font(.system(size: 18, weight: .medium))
                    .foregroundStyle(.white)
            }
            .accessibilityHidden(true)

            VStack(alignment: .leading, spacing: 3) {
                Text(name)
                    .font(.custom("DMSans-SemiBold", size: 16, relativeTo: .body))
                    .foregroundStyle(.textPrimary)
                Text(role)
                    .font(.custom("DMSans-Regular", size: 13, relativeTo: .subheadline))
                    .foregroundStyle(.textSecondary)
                Text(hours)
                    .font(.custom("DMSans-Regular", size: 11, relativeTo: .caption))
                    .foregroundStyle(.textMuted)
            }

            Spacer()

            Button {
                haptic(.medium)
                if let url = URL(string: "tel://\(phone)") {
                    UIApplication.shared.open(url)
                }
            } label: {
                Image(systemName: "phone.fill")
                    .font(.system(size: 15))
                    .foregroundStyle(isUrgent ? .white : .forest)
                    .frame(width: 44, height: 44)
                    .background(isUrgent ? Color.riskRed : Color.forestPale)
                    .clipShape(Circle())
                    .shadow(color: isUrgent ? .riskRed.opacity(0.3) : .clear, radius: 4, y: 2)
            }
            .accessibilityLabel("Call \(name)")
        }
        .padding(16)
        .background(Color.white)
        .clipShape(.rect(cornerRadius: 18))
        .shadow(color: .black.opacity(0.05), radius: 10, y: 3)
        .overlay(
            isUrgent
                ? RoundedRectangle(cornerRadius: 18).stroke(Color.riskRed.opacity(0.2), lineWidth: 1)
                : nil
        )
        .accessibilityElement(children: .combine)
    }

    // MARK: - On-Shift Logic

    /// Simple business-hours check: Mon–Fri, 8 AM – 5 PM local time
    private var isOnShift: Bool {
        let cal = Calendar.current
        let now = Date()
        let weekday = cal.component(.weekday, from: now)
        let hour = cal.component(.hour, from: now)
        // Sunday=1, Saturday=7
        let isWeekday = weekday >= 2 && weekday <= 6
        let isDuringHours = hour >= 8 && hour < 17
        return isWeekday && isDuringHours
    }
}
