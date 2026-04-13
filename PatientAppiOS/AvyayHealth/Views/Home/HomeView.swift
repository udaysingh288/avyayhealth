import SwiftUI

struct HomeView: View {
    @EnvironmentObject var store: PatientStore
    @State private var showCheckIn = false
    @State private var pulseCheckin = false

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
            VStack(spacing: 0) {
                // Top hero section
                heroSection

                VStack(spacing: 20) {
                    // Check-in card
                    checkinCard
                        .padding(.top, -40)

                    // Recovery progress
                    progressCard

                    // Quick actions
                    quickActionsSection

                    // Motivational quote
                    motivationCard

                    Spacer(minLength: 100)
                }
                .padding(.horizontal, 20)
            }
        }
        .background(Color.warmOatmeal)
        .fullScreenCover(isPresented: $showCheckIn) {
            CheckInView()
                .environmentObject(store)
        }
    }

    // MARK: - Hero

    private var heroSection: some View {
        VStack(spacing: 0) {
            HStack(alignment: .center) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(greeting)
                        .font(.custom("DMSans-Regular", size: 16, relativeTo: .subheadline))
                        .foregroundStyle(.white.opacity(0.8))
                    Text(store.session?.firstName ?? "")
                        .font(.custom("DMSerifDisplay-Regular", size: 30, relativeTo: .largeTitle))
                        .foregroundStyle(.white)
                        .accessibilityAddTraits(.isHeader)
                }

                Spacer()

                ZStack {
                    Circle()
                        .fill(.white.opacity(0.15))
                        .frame(width: 52, height: 52)

                    Text(String((store.session?.firstName ?? "A").prefix(1)))
                        .font(.custom("DMSans-Bold", size: 22, relativeTo: .title3))
                        .foregroundStyle(.white)
                }
                .accessibilityHidden(true)
            }
            .padding(.horizontal, 24)
            .padding(.top, 20)
            .padding(.bottom, 16)

            // Hospital banner
            HStack(spacing: 6) {
                Image(systemName: "building.2")
                    .font(.system(size: 13))
                    .foregroundStyle(.white.opacity(0.7))
                Text(store.session?.hospitalName ?? "—")
                    .font(.custom("DMSans-Medium", size: 15, relativeTo: .subheadline))
                    .foregroundStyle(.white.opacity(0.85))
                    .lineLimit(2)
                    .multilineTextAlignment(.center)
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 50)
            .accessibilityLabel("Hospital: \(store.session?.hospitalName ?? "")")
        }
        .background(
            LinearGradient(
                colors: [.forestGradientStart, .forestGradientEnd],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea(edges: .top)
        )
    }

    // MARK: - Check-in Card

    private var checkinCard: some View {
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

                    if checkinDone {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 28))
                            .foregroundStyle(.riskGreen)
                    } else {
                        Image(systemName: "bubble.left.and.bubble.right.fill")
                            .font(.system(size: 24))
                            .foregroundStyle(.forest)
                            .scaleEffect(pulseCheckin ? 1.08 : 1.0)
                    }
                }
                .accessibilityHidden(true)

                VStack(alignment: .leading, spacing: 4) {
                    Text("Daily Check-in")
                        .font(.custom("DMSans-SemiBold", size: 18, relativeTo: .headline))
                        .foregroundStyle(.textPrimary)

                    Text(checkinDone ? "Completed for today" : "Tap to start")
                        .font(.custom("DMSans-Regular", size: 14, relativeTo: .subheadline))
                        .foregroundStyle(checkinDone ? .riskGreen : .textSecondary)
                }

                Spacer()

                if !checkinDone {
                    ZStack {
                        Circle()
                            .fill(Color.riskRed)
                            .frame(width: 10, height: 10)

                        Circle()
                            .fill(Color.riskRed.opacity(0.3))
                            .frame(width: 20, height: 20)
                            .scaleEffect(pulseCheckin ? 1.3 : 1.0)
                    }
                    .accessibilityHidden(true)
                }

                Image(systemName: "chevron.right")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(.textMuted)
                    .accessibilityHidden(true)
            }
            .padding(20)
            .background(Color.white)
            .clipShape(.rect(cornerRadius: 20))
            .shadow(color: .black.opacity(0.08), radius: 16, y: 4)
        }
        .accessibilityLabel(checkinDone ? "Daily check-in, completed for today" : "Daily check-in, ready for you. Tap to start.")
        .onAppear {
            guard !checkinDone else { return }
            withAnimation(.easeInOut(duration: 1.5).repeatForever(autoreverses: true)) {
                pulseCheckin = true
            }
        }
        .onChange(of: checkinDone) { done in
            if done {
                withAnimation { pulseCheckin = false }
            }
        }
    }

    // MARK: - Progress Card

    private var progressCard: some View {
        let progress = Double(store.session?.daysInProgram ?? 1) / Double(store.session?.totalDays ?? 30)
        return VStack(spacing: 16) {
            HStack {
                Text("Recovery Progress")
                    .font(.custom("DMSans-SemiBold", size: 17, relativeTo: .headline))
                    .foregroundStyle(.textPrimary)
                    .accessibilityAddTraits(.isHeader)
                Spacer()
                Text("\(Int(progress * 100))%")
                    .font(.custom("DMSans-Bold", size: 20, relativeTo: .title3))
                    .foregroundStyle(.forest)
            }

            // Horizontal progress bar
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 6)
                        .fill(Color.forestPale)
                        .frame(height: 10)

                    RoundedRectangle(cornerRadius: 6)
                        .fill(
                            LinearGradient(
                                colors: [.forestGradientStart, .accentTeal],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .frame(width: geo.size.width * progress, height: 10)
                }
            }
            .frame(height: 10)

            HStack {
                infoChip(icon: "calendar", label: "Day \(store.session?.daysInProgram ?? 1) of \(store.session?.totalDays ?? 30)")
                Spacer()
            }
        }
        .padding(20)
        .background(Color.white)
        .clipShape(.rect(cornerRadius: 20))
        .shadow(color: .black.opacity(0.05), radius: 10, y: 3)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Recovery progress: \(Int(progress * 100)) percent, day \(store.session?.daysInProgram ?? 1) of \(store.session?.totalDays ?? 30)")
    }

    private func infoChip(icon: String, label: String) -> some View {
        HStack(spacing: 6) {
            Image(systemName: icon)
                .font(.system(size: 13))
                .foregroundStyle(.forest)
            Text(label)
                .font(.custom("DMSans-Medium", size: 14, relativeTo: .subheadline))
                .foregroundStyle(.textPrimary)
                .lineLimit(1)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(Color.forestPale)
        .clipShape(.rect(cornerRadius: 8))
    }

    // MARK: - Quick Actions

    private var quickActionsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Quick Actions")
                .font(.custom("DMSans-SemiBold", size: 17, relativeTo: .headline))
                .foregroundStyle(.textPrimary)
                .accessibilityAddTraits(.isHeader)

            HStack(spacing: 12) {
                quickActionButton(
                    icon: "phone.fill",
                    title: "Call Care\nTeam",
                    color: .forest
                ) {
                    if let url = URL(string: "tel://18005550100") {
                        UIApplication.shared.open(url)
                    }
                }

                quickActionButton(
                    icon: "exclamationmark.triangle.fill",
                    title: "Emergency\n911",
                    color: .riskRed
                ) {
                    if let url = URL(string: "tel://911") {
                        UIApplication.shared.open(url)
                    }
                }
            }
        }
    }

    private func quickActionButton(icon: String, title: String, color: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.system(size: 22))
                    .foregroundStyle(color)
                    .frame(width: 48, height: 48)
                    .background(color.opacity(0.1))
                    .clipShape(Circle())
                    .accessibilityHidden(true)

                Text(title)
                    .font(.custom("DMSans-Medium", size: 14, relativeTo: .subheadline))
                    .foregroundStyle(.textPrimary)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 20)
            .background(Color.white)
            .clipShape(.rect(cornerRadius: 16))
            .shadow(color: .black.opacity(0.04), radius: 8, y: 2)
        }
    }

    // MARK: - Motivation

    private var motivationCard: some View {
        VStack(spacing: 10) {
            Image(systemName: "sparkles")
                .font(.system(size: 22))
                .foregroundStyle(.forest)
                .accessibilityHidden(true)

            Text(dailyQuote)
                .font(.custom("DMSerifDisplay-Regular", size: 17, relativeTo: .body))
                .foregroundStyle(.textPrimary)
                .multilineTextAlignment(.center)
                .lineSpacing(4)

            Text("— Your Avyay Health Team")
                .font(.custom("DMSans-Regular", size: 12, relativeTo: .caption))
                .foregroundStyle(.textMuted)
        }
        .padding(24)
        .frame(maxWidth: .infinity)
        .background(Color.forestPale.opacity(0.5))
        .clipShape(.rect(cornerRadius: 16))
    }

    private var dailyQuote: String {
        let quotes = [
            "Every day you check in is a day you choose your health. That takes real strength.",
            "Healing is not a straight line. Be patient with yourself — you are doing great.",
            "The strongest people are those who ask for help when they need it.",
            "Your body is working hard to heal. Give it rest, give it kindness.",
            "Small steps every day lead to big changes. You are proof of that.",
            "You are not alone in this. Your care team is right here with you.",
            "Recovery takes courage, and you have more of it than you know.",
            "Each morning is a fresh start. Today is full of possibility.",
            "The fact that you are here, checking in, says everything about your strength.",
            "Progress is progress, no matter how small. Celebrate every good day.",
            "You have already survived the hardest part. Now it is time to heal.",
            "Take it one day at a time. That is all anyone can ask.",
            "Your health is your greatest treasure. Protect it gently.",
            "Rest is not giving up. Rest is how your body rebuilds.",
            "You are stronger than you think, braver than you feel, and never alone.",
            "Good days will come more often. Trust the process.",
            "A little progress each day adds up to big results over time.",
            "You deserve to feel well. Keep going — brighter days are ahead.",
            "Breathe deeply. You are exactly where you need to be right now.",
            "Your care team believes in you. We see your effort every single day.",
            "Healing happens in its own time. Be gentle with yourself today.",
            "Every check-in is a gift to your future self. Thank you for showing up.",
            "Even on tough days, you are moving forward. That matters.",
            "Your family and your care team are cheering you on. Always.",
            "One step, one breath, one day. You have got this.",
            "The sun comes out after every storm. Hold on to hope.",
            "You are writing your recovery story. Make today a good chapter.",
            "Laughter, rest, and a little fresh air — simple things that heal.",
            "You have come so far already. Do not forget to look back and be proud.",
            "Tomorrow will be a little easier because of what you did today.",
        ]

        // Pick a quote based on the day of the year so it changes daily
        // but stays the same throughout the day
        let dayOfYear = Calendar.current.ordinality(of: .day, in: .year, for: Date()) ?? 1
        return quotes[(dayOfYear - 1) % quotes.count]
    }
}
