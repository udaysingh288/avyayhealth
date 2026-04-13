import SwiftUI

struct CareTeamView: View {
    @EnvironmentObject var store: PatientStore
    @State private var selectedTab = 0

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
            }
        }
        .background(Color.warmOatmeal)
    }

    private var myTeamTab: some View {
        VStack(spacing: 12) {
            contactCard(
                icon: "person.fill",
                gradient: [.forestGradientStart, .accentTeal],
                name: store.session?.coordinatorFirstName ?? "Your Coordinator",
                role: "Care Coordinator, RN",
                phone: "18005550100"
            )
            contactCard(
                icon: "cross.case.fill",
                gradient: [.accentTeal, .accentTeal.opacity(0.7)],
                name: "Hospital Pharmacy",
                role: "Medication questions & refills",
                phone: "18005550101"
            )
            contactCard(
                icon: "stethoscope",
                gradient: [.riskRed, .riskRed.opacity(0.8)],
                name: "On-Call Physician",
                role: "Emergency medical questions",
                phone: "18005550102",
                isUrgent: true
            )

            Spacer(minLength: 100)
        }
        .padding(.horizontal, 20)
    }

    private var hospitalTab: some View {
        VStack(spacing: 12) {
            contactCard(
                icon: "building.2.fill",
                gradient: [.textSecondary, .textSecondary.opacity(0.7)],
                name: "Main Reception",
                role: "General inquiries",
                phone: "18005550100"
            )
            contactCard(
                icon: "doc.text.fill",
                gradient: [.textSecondary, .textSecondary.opacity(0.7)],
                name: "Discharge Planning",
                role: "Follow-up scheduling",
                phone: "18005550103"
            )
            contactCard(
                icon: "person.2.fill",
                gradient: [.textSecondary, .textSecondary.opacity(0.7)],
                name: "Patient Services",
                role: "Billing & support",
                phone: "18005550104"
            )

            Spacer(minLength: 100)
        }
        .padding(.horizontal, 20)
    }

    private func contactCard(icon: String, gradient: [Color], name: String, role: String, phone: String, isUrgent: Bool = false) -> some View {
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
}
