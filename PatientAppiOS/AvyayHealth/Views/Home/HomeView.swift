import SwiftUI

struct HomeView: View {
    @EnvironmentObject var store: PatientStore
    @State private var showCheckIn = false

    private var greeting: String {
        let h = Calendar.current.component(.hour, from: Date())
        if h < 12 { return "Good morning" }
        if h < 17 { return "Good afternoon" }
        return "Good evening"
    }

    private var checkinDone: Bool {
        store.checkin?.status == .completed
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Greeting
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("\(greeting),")
                            .font(.custom("DMSans-Regular", size: 16, relativeTo: .subheadline))
                            .foregroundStyle(.textSecondary)
                        Text(store.session?.firstName ?? "")
                            .font(.custom("DMSerifDisplay-Regular", size: 28, relativeTo: .title))
                            .foregroundStyle(.textPrimary)
                            .accessibilityAddTraits(.isHeader)
                    }

                    Spacer()

                    Text(String((store.session?.firstName ?? "A").prefix(1)))
                        .font(.custom("DMSans-Bold", size: 20, relativeTo: .title3))
                        .foregroundStyle(.white)
                        .frame(width: 48, height: 48)
                        .background(Color.forest)
                        .clipShape(.circle)
                        .accessibilityHidden(true)
                }
                .padding(.horizontal, 20)
                .padding(.top, 16)

                // Check-in card
                Button {
                    haptic(.medium)
                    if store.checkin == nil {
                        store.checkin = store.buildInitialCheckin()
                    }
                    showCheckIn = true
                } label: {
                    HStack(spacing: 16) {
                        ZStack {
                            Circle()
                                .fill(checkinDone ? Color.riskGreenBg : Color.forestPale)
                                .frame(width: 56, height: 56)

                            Image(systemName: checkinDone ? "checkmark.circle.fill" : "bubble.left.and.bubble.right.fill")
                                .font(.system(size: 24))
                                .foregroundStyle(checkinDone ? .riskGreen : .forest)
                        }
                        .accessibilityHidden(true)

                        VStack(alignment: .leading, spacing: 4) {
                            Text("Daily Check-in")
                                .font(.custom("DMSans-SemiBold", size: 18, relativeTo: .headline))
                                .foregroundStyle(.textPrimary)

                            Text(checkinDone ? "Completed for today" : "Ready for you")
                                .font(.custom("DMSans-Regular", size: 14, relativeTo: .subheadline))
                                .foregroundStyle(checkinDone ? .riskGreen : .textSecondary)
                        }

                        Spacer()

                        if !checkinDone {
                            Image(systemName: "exclamationmark.circle.fill")
                                .font(.system(size: 12))
                                .foregroundStyle(.riskRed)
                                .accessibilityHidden(true)
                        }

                        Image(systemName: "chevron.right")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundStyle(.textSecondary)
                            .accessibilityHidden(true)
                    }
                    .padding(20)
                    .background(Color.white)
                    .clipShape(.rect(cornerRadius: 16))
                    .shadow(color: .black.opacity(0.04), radius: 8, y: 2)
                }
                .accessibilityLabel(checkinDone ? "Daily check-in, completed for today" : "Daily check-in, ready for you. Tap to start.")
                .padding(.horizontal, 20)

                // Recovery progress
                VStack(alignment: .leading, spacing: 16) {
                    Text("Recovery Progress")
                        .font(.custom("DMSans-SemiBold", size: 16, relativeTo: .headline))
                        .foregroundStyle(.textPrimary)
                        .accessibilityAddTraits(.isHeader)

                    HStack(spacing: 24) {
                        progressRing

                        VStack(alignment: .leading, spacing: 8) {
                            statRow(label: "Day", value: "\(store.session?.daysInProgram ?? 1) of \(store.session?.totalDays ?? 30)")
                            statRow(label: "Condition", value: store.session?.condition.label ?? "—")
                            statRow(label: "Hospital", value: store.session?.hospitalName ?? "—")
                        }
                    }
                }
                .padding(20)
                .background(Color.white)
                .clipShape(.rect(cornerRadius: 16))
                .shadow(color: .black.opacity(0.04), radius: 8, y: 2)
                .padding(.horizontal, 20)

                // Quick actions
                VStack(alignment: .leading, spacing: 12) {
                    Text("Quick Actions")
                        .font(.custom("DMSans-SemiBold", size: 16, relativeTo: .headline))
                        .foregroundStyle(.textPrimary)
                        .padding(.horizontal, 20)
                        .accessibilityAddTraits(.isHeader)

                    VStack(spacing: 0) {
                        quickActionRow(icon: "phone.fill", title: "Call care team", color: .forest) {
                            if let url = URL(string: "tel://18005550100") {
                                UIApplication.shared.open(url)
                            }
                        }
                        Divider().padding(.leading, 56)
                        quickActionRow(icon: "exclamationmark.triangle.fill", title: "Emergency — Call 911", color: .riskRed) {
                            if let url = URL(string: "tel://911") {
                                UIApplication.shared.open(url)
                            }
                        }
                    }
                    .background(Color.white)
                    .clipShape(.rect(cornerRadius: 16))
                    .shadow(color: .black.opacity(0.04), radius: 8, y: 2)
                    .padding(.horizontal, 20)
                }

                Spacer(minLength: 100)
            }
        }
        .background(Color.warmOatmeal)
        .fullScreenCover(isPresented: $showCheckIn) {
            CheckInView()
                .environmentObject(store)
        }
    }

    private var progressRing: some View {
        let progress = Double(store.session?.daysInProgram ?? 1) / Double(store.session?.totalDays ?? 30)
        return ZStack {
            Circle()
                .stroke(Color.forest.opacity(0.1), lineWidth: 8)
                .frame(width: 80, height: 80)

            Circle()
                .trim(from: 0, to: progress)
                .stroke(Color.forest, style: StrokeStyle(lineWidth: 8, lineCap: .round))
                .frame(width: 80, height: 80)
                .rotationEffect(.degrees(-90))

            Text("\(Int(progress * 100))%")
                .font(.custom("DMSans-Bold", size: 18, relativeTo: .headline))
                .foregroundStyle(.forest)
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Recovery progress: \(Int(progress * 100)) percent, day \(store.session?.daysInProgram ?? 1) of \(store.session?.totalDays ?? 30)")
    }

    private func statRow(label: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label)
                .font(.custom("DMSans-Regular", size: 12, relativeTo: .caption))
                .foregroundStyle(.textSecondary)
            Text(value)
                .font(.custom("DMSans-Medium", size: 15, relativeTo: .subheadline))
                .foregroundStyle(.textPrimary)
        }
    }

    private func quickActionRow(icon: String, title: String, color: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.system(size: 16))
                    .foregroundStyle(color)
                    .frame(width: 36, height: 36)
                    .background(color.opacity(0.1))
                    .clipShape(.rect(cornerRadius: 8))
                    .accessibilityHidden(true)

                Text(title)
                    .font(.custom("DMSans-Medium", size: 16, relativeTo: .body))
                    .foregroundStyle(.textPrimary)

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(.textSecondary)
                    .accessibilityHidden(true)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
        }
    }
}
