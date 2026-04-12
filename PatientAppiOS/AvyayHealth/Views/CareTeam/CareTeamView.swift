import SwiftUI

struct CareTeamView: View {
    @EnvironmentObject var store: PatientStore
    @State private var selectedTab = 0

    var body: some View {
        VStack(spacing: 0) {
            VStack(spacing: 4) {
                Text("Care Team")
                    .font(.custom("DMSerifDisplay-Regular", size: 24, relativeTo: .title))
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
                iconColor: .forest,
                name: store.session?.coordinatorFirstName ?? "Your Coordinator",
                role: "Care Coordinator, RN",
                phone: "18005550100"
            )
            contactCard(
                icon: "cross.case.fill",
                iconColor: .accentTeal,
                name: "Hospital Pharmacy",
                role: "Medication questions & refills",
                phone: "18005550101"
            )
            contactCard(
                icon: "stethoscope",
                iconColor: .riskRed,
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
                iconColor: .textSecondary,
                name: "Main Reception",
                role: "General inquiries",
                phone: "18005550100"
            )
            contactCard(
                icon: "doc.text.fill",
                iconColor: .textSecondary,
                name: "Discharge Planning",
                role: "Follow-up scheduling",
                phone: "18005550103"
            )
            contactCard(
                icon: "person.2.fill",
                iconColor: .textSecondary,
                name: "Patient Services",
                role: "Billing & support",
                phone: "18005550104"
            )

            Spacer(minLength: 100)
        }
        .padding(.horizontal, 20)
    }

    private func contactCard(icon: String, iconColor: Color, name: String, role: String, phone: String, isUrgent: Bool = false) -> some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 20))
                .foregroundStyle(iconColor)
                .frame(width: 48, height: 48)
                .background(iconColor.opacity(0.1))
                .clipShape(.rect(cornerRadius: 12))
                .accessibilityHidden(true)

            VStack(alignment: .leading, spacing: 2) {
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
                    .font(.system(size: 16))
                    .foregroundStyle(isUrgent ? .white : .forest)
                    .frame(width: 44, height: 44)
                    .background(isUrgent ? Color.riskRed : Color.forestPale)
                    .clipShape(.rect(cornerRadius: 12))
            }
            .accessibilityLabel("Call \(name)")
        }
        .padding(16)
        .background(Color.white)
        .clipShape(.rect(cornerRadius: 16))
        .shadow(color: .black.opacity(0.04), radius: 8, y: 2)
        .overlay(
            isUrgent
                ? RoundedRectangle(cornerRadius: 16).stroke(Color.riskRed.opacity(0.3), lineWidth: 1)
                : nil
        )
        .accessibilityElement(children: .combine)
    }
}
