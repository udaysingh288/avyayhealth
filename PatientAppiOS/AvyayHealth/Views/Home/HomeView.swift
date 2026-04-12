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
                            .font(.custom("DMSans-Regular", size: 16))
                            .foregroundColor(.textSecondary)
                        Text(store.session?.firstName ?? "")
                            .font(.custom("DMSerifDisplay-Regular", size: 28))
                            .foregroundColor(.textPrimary)
                    }

                    Spacer()

                    Text(String((store.session?.firstName ?? "A").prefix(1)))
                        .font(.custom("DMSans-Bold", size: 20))
                        .foregroundColor(.white)
                        .frame(width: 48, height: 48)
                        .background(Color.forest)
                        .clipShape(Circle())
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
                                .foregroundColor(checkinDone ? .riskGreen : .forest)
                        }

                        VStack(alignment: .leading, spacing: 4) {
                            Text("Daily Check-in")
                                .font(.custom("DMSans-SemiBold", size: 18))
                                .foregroundColor(.textPrimary)

                            Text(checkinDone ? "Completed for today" : "Ready for you")
                                .font(.custom("DMSans-Regular", size: 14))
                                .foregroundColor(checkinDone ? .riskGreen : .textSecondary)
                        }

                        Spacer()

                        if !checkinDone {
                            Circle()
                                .fill(Color.riskRed)
                                .frame(width: 10, height: 10)
                        }

                        Image(systemName: "chevron.right")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.textMuted)
                    }
                    .padding(20)
                    .background(Color.white)
                    .cornerRadius(16)
                    .shadow(color: .black.opacity(0.04), radius: 8, y: 2)
                }
                .padding(.horizontal, 20)

                // Recovery progress
                VStack(alignment: .leading, spacing: 16) {
                    Text("Recovery Progress")
                        .font(.custom("DMSans-SemiBold", size: 16))
                        .foregroundColor(.textPrimary)

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
                .cornerRadius(16)
                .shadow(color: .black.opacity(0.04), radius: 8, y: 2)
                .padding(.horizontal, 20)

                // Quick actions
                VStack(alignment: .leading, spacing: 12) {
                    Text("Quick Actions")
                        .font(.custom("DMSans-SemiBold", size: 16))
                        .foregroundColor(.textPrimary)
                        .padding(.horizontal, 20)

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
                    .cornerRadius(16)
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
                .font(.custom("DMSans-Bold", size: 18))
                .foregroundColor(.forest)
        }
    }

    private func statRow(label: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label)
                .font(.custom("DMSans-Regular", size: 12))
                .foregroundColor(.textMuted)
            Text(value)
                .font(.custom("DMSans-Medium", size: 15))
                .foregroundColor(.textPrimary)
        }
    }

    private func quickActionRow(icon: String, title: String, color: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.system(size: 16))
                    .foregroundColor(color)
                    .frame(width: 36, height: 36)
                    .background(color.opacity(0.1))
                    .cornerRadius(8)

                Text(title)
                    .font(.custom("DMSans-Medium", size: 16))
                    .foregroundColor(.textPrimary)

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.textMuted)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
        }
    }
}
