import SwiftUI

struct EnrollmentView: View {
    @EnvironmentObject var store: PatientStore
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var step: EnrollStep = .welcome
    @State private var hospitalCode = "RIVERSIDE"
    @State private var firstName = ""
    @State private var dob = Date()
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var logoScale: CGFloat = 0.8
    @State private var logoOpacity: Double = 0

    enum EnrollStep { case welcome, verify, success }

    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [.warmOatmeal, Color(red: 0.96, green: 0.95, blue: 0.93)],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            switch step {
            case .welcome:
                welcomeStep
            case .verify:
                verifyStep
            case .success:
                successStep
            }
        }
    }

    // MARK: - Welcome

    private var welcomeStep: some View {
        VStack(spacing: 0) {
            Spacer()

            VStack(spacing: 28) {
                // Logo
                ZStack {
                    Circle()
                        .fill(Color.forestPale)
                        .frame(width: 100, height: 100)

                    Image(systemName: "heart.text.clipboard")
                        .font(.system(size: 44))
                        .foregroundStyle(.forest)
                }
                .scaleEffect(logoScale)
                .opacity(logoOpacity)
                .accessibilityHidden(true)

                VStack(spacing: 10) {
                    Text("Welcome to")
                        .font(.custom("DMSans-Regular", size: 17, relativeTo: .title3))
                        .foregroundStyle(.textSecondary)

                    Text("Avyay Health")
                        .font(.custom("DMSerifDisplay-Regular", size: 38, relativeTo: .largeTitle))
                        .foregroundStyle(.forest)
                        .accessibilityAddTraits(.isHeader)

                    Text("The care that follows you home")
                        .font(.custom("DMSans-Regular", size: 16, relativeTo: .body))
                        .foregroundStyle(.textSecondary)
                        .italic()
                }
            }
            .onAppear {
                if !reduceMotion {
                    withAnimation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.2)) {
                        logoScale = 1.0
                        logoOpacity = 1.0
                    }
                } else {
                    logoScale = 1.0
                    logoOpacity = 1.0
                }
            }

            Spacer()

            VStack(spacing: 16) {
                FeatureRow(icon: "bubble.left.and.bubble.right", title: "Daily check-ins", desc: "Quick conversations about how you're feeling")
                FeatureRow(icon: "person.2", title: "Connected care", desc: "Your care team monitors your progress")
                FeatureRow(icon: "bell.badge", title: "Urgent alerts", desc: "Immediate help when something isn't right")
            }
            .padding(.horizontal, 24)

            Spacer()

            Button {
                haptic(.medium)
                if reduceMotion {
                    step = .verify
                } else {
                    withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) { step = .verify }
                }
            } label: {
                Text("Get started")
                    .font(.custom("DMSans-SemiBold", size: 18, relativeTo: .headline))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity, minHeight: 56)
                    .background(
                        LinearGradient(
                            colors: [.forestGradientStart, .forestGradientEnd],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .clipShape(.rect(cornerRadius: 28))
                    .shadow(color: .forest.opacity(0.3), radius: 10, y: 4)
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 40)
        }
    }

    // MARK: - Verify

    private var verifyStep: some View {
        VStack(spacing: 20) {
            HStack {
                Button {
                    haptic(.light)
                    if reduceMotion {
                        step = .welcome
                    } else {
                        withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) { step = .welcome }
                    }
                } label: {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 18, weight: .medium))
                        .foregroundStyle(.forest)
                        .frame(width: 44, height: 44)
                        .background(Color.forestPale)
                        .clipShape(Circle())
                }
                .accessibilityLabel("Go back")
                Spacer()
            }
            .padding(.horizontal, 16)

            VStack(spacing: 8) {
                Text("Verify your identity")
                    .font(.custom("DMSerifDisplay-Regular", size: 28, relativeTo: .title))
                    .foregroundStyle(.textPrimary)
                    .accessibilityAddTraits(.isHeader)

                Text("Enter your name and date of birth\nas it appears in your hospital records")
                    .font(.custom("DMSans-Regular", size: 15, relativeTo: .body))
                    .foregroundStyle(.textSecondary)
                    .multilineTextAlignment(.center)
                    .lineSpacing(2)
            }

            VStack(spacing: 16) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("First name")
                        .font(.custom("DMSans-Medium", size: 14, relativeTo: .subheadline))
                        .foregroundStyle(.textSecondary)

                    TextField("Your first name", text: $firstName)
                        .font(.custom("DMSans-Regular", size: 17, relativeTo: .body))
                        .foregroundColor(.textPrimary)
                        .accentColor(.forest)
                        .padding(16)
                        .background(Color.white)
                        .clipShape(.rect(cornerRadius: 14))
                        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.borderColor, lineWidth: 1))
                        .textContentType(.givenName)
                        .autocorrectionDisabled()
                        .onChange(of: firstName) { newValue in
                            if newValue.count > Config.maxNameLength {
                                firstName = String(newValue.prefix(Config.maxNameLength))
                            }
                        }
                }

                VStack(alignment: .leading, spacing: 6) {
                    Text("Date of birth")
                        .font(.custom("DMSans-Medium", size: 14, relativeTo: .subheadline))
                        .foregroundStyle(.textSecondary)

                    DatePicker("Date of birth", selection: $dob, displayedComponents: .date)
                        .datePickerStyle(.compact)
                        .labelsHidden()
                        .tint(.forest)
                        .padding(14)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color.white)
                        .clipShape(.rect(cornerRadius: 14))
                        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.borderColor, lineWidth: 1))
                }
            }
            .padding(.horizontal, 24)

            if let error = errorMessage {
                HStack(spacing: 8) {
                    Image(systemName: "exclamationmark.circle.fill")
                        .font(.system(size: 14))
                        .foregroundStyle(.riskRed)
                    Text(error)
                        .font(.custom("DMSans-Medium", size: 14, relativeTo: .subheadline))
                        .foregroundStyle(.riskRed)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .background(Color.riskRedBg)
                .clipShape(.rect(cornerRadius: 12))
                .padding(.horizontal, 24)
            }

            Spacer()

            Button {
                haptic(.medium)
                enroll()
            } label: {
                Group {
                    if isLoading {
                        ProgressView().tint(.white)
                    } else {
                        Text("Confirm identity")
                            .font(.custom("DMSans-SemiBold", size: 18, relativeTo: .headline))
                    }
                }
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity, minHeight: 56)
                .background(
                    firstName.trimmingCharacters(in: .whitespaces).isEmpty
                        ? AnyShapeStyle(Color.forest.opacity(0.3))
                        : AnyShapeStyle(LinearGradient(colors: [.forestGradientStart, .forestGradientEnd], startPoint: .leading, endPoint: .trailing))
                )
                .clipShape(.rect(cornerRadius: 28))
                .shadow(color: firstName.trimmingCharacters(in: .whitespaces).isEmpty ? .clear : .forest.opacity(0.3), radius: 10, y: 4)
            }
            .disabled(firstName.trimmingCharacters(in: .whitespaces).isEmpty || isLoading)
            .padding(.horizontal, 24)
            .padding(.bottom, 40)
        }
    }

    // MARK: - Success

    private var successStep: some View {
        VStack(spacing: 24) {
            Spacer()

            ZStack {
                Circle()
                    .fill(Color.riskGreenBg)
                    .frame(width: 100, height: 100)

                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 56))
                    .foregroundStyle(.riskGreen)
            }
            .accessibilityHidden(true)

            VStack(spacing: 10) {
                Text("Welcome, \(store.session?.firstName ?? firstName)!")
                    .font(.custom("DMSerifDisplay-Regular", size: 30, relativeTo: .title))
                    .foregroundStyle(.textPrimary)
                    .accessibilityAddTraits(.isHeader)

                Text("You're all set. Your daily check-ins\nstart now.")
                    .font(.custom("DMSans-Regular", size: 16, relativeTo: .body))
                    .foregroundStyle(.textSecondary)
                    .multilineTextAlignment(.center)
                    .lineSpacing(3)
            }

            Spacer()

            Button {
                haptic(.success)
                store.checkin = store.buildInitialCheckin()
            } label: {
                HStack(spacing: 8) {
                    Text("Start my first check-in")
                        .font(.custom("DMSans-SemiBold", size: 18, relativeTo: .headline))
                    Image(systemName: "arrow.right")
                        .font(.system(size: 16, weight: .semibold))
                }
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity, minHeight: 56)
                .background(
                    LinearGradient(
                        colors: [.forestGradientStart, .forestGradientEnd],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .clipShape(.rect(cornerRadius: 28))
                .shadow(color: .forest.opacity(0.3), radius: 10, y: 4)
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 40)
        }
        .onAppear {
            UIAccessibility.post(notification: .screenChanged, argument: "Enrollment successful. Welcome, \(store.session?.firstName ?? firstName).")
        }
    }

    // MARK: - Enroll API

    private func enroll() {
        let trimmedName = firstName.trimmingCharacters(in: .whitespaces)
        guard !trimmedName.isEmpty else { return }
        isLoading = true
        errorMessage = nil

        let fmt = DateFormatter()
        fmt.dateFormat = "yyyy-MM-dd"
        fmt.timeZone = TimeZone(identifier: "UTC")
        let dobStr = fmt.string(from: dob)

        Task {
            do {
                let response = try await APIClient.shared.enroll(
                    hospitalCode: hospitalCode,
                    firstName: trimmedName,
                    dob: dobStr
                )
                await MainActor.run {
                    store.setSession(response)
                    isLoading = false
                    if reduceMotion {
                        step = .success
                    } else {
                        withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) { step = .success }
                    }
                }
            } catch let apiError as APIError {
                await MainActor.run {
                    isLoading = false
                    errorMessage = apiError.localizedDescription
                }
            } catch {
                await MainActor.run {
                    isLoading = false
                    errorMessage = "Could not connect. Please check your internet connection and try again."
                }
            }
        }
    }
}

// MARK: - Feature Row

private struct FeatureRow: View {
    let icon: String
    let title: String
    let desc: String

    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 20))
                .foregroundStyle(.forest)
                .frame(width: 48, height: 48)
                .background(Color.forestPale)
                .clipShape(.rect(cornerRadius: 14))
                .accessibilityHidden(true)

            VStack(alignment: .leading, spacing: 3) {
                Text(title)
                    .font(.custom("DMSans-SemiBold", size: 16, relativeTo: .body))
                    .foregroundStyle(.textPrimary)
                Text(desc)
                    .font(.custom("DMSans-Regular", size: 14, relativeTo: .subheadline))
                    .foregroundStyle(.textSecondary)
                    .lineSpacing(1)
            }
            Spacer()
        }
        .accessibilityElement(children: .combine)
    }
}
