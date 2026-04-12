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

    enum EnrollStep { case welcome, verify, success }

    var body: some View {
        ZStack {
            Color.warmOatmeal.ignoresSafeArea()

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
        VStack(spacing: 32) {
            Spacer()

            Image(systemName: "heart.text.clipboard")
                .font(.system(size: 64))
                .foregroundStyle(.forest)
                .accessibilityHidden(true)

            VStack(spacing: 12) {
                Text("Welcome to")
                    .font(.custom("DMSans-Regular", size: 18, relativeTo: .title3))
                    .foregroundStyle(.textSecondary)

                Text("Avyay Health")
                    .font(.custom("DMSerifDisplay-Regular", size: 36, relativeTo: .largeTitle))
                    .foregroundStyle(.forest)
                    .accessibilityAddTraits(.isHeader)

                Text("The care that follows you home")
                    .font(.custom("DMSans-Regular", size: 16, relativeTo: .body))
                    .foregroundStyle(.textSecondary)
                    .italic()
            }

            VStack(spacing: 16) {
                FeatureRow(icon: "bubble.left.and.bubble.right", title: "Daily check-ins", desc: "Quick conversations about how you're feeling")
                FeatureRow(icon: "person.2", title: "Connected care", desc: "Your care team monitors your progress")
                FeatureRow(icon: "exclamationmark.triangle", title: "Urgent alerts", desc: "Immediate help when something isn't right")
            }
            .padding(.horizontal, 24)

            Spacer()

            Button {
                haptic(.medium)
                if reduceMotion {
                    step = .verify
                } else {
                    withAnimation { step = .verify }
                }
            } label: {
                Text("Get started")
                    .font(.custom("DMSans-SemiBold", size: 18, relativeTo: .headline))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity, minHeight: 56)
                    .background(Color.forest)
                    .clipShape(.rect(cornerRadius: 28))
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 40)
        }
    }

    // MARK: - Verify

    private var verifyStep: some View {
        VStack(spacing: 24) {
            HStack {
                Button {
                    haptic(.light)
                    if reduceMotion {
                        step = .welcome
                    } else {
                        withAnimation { step = .welcome }
                    }
                } label: {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 20, weight: .medium))
                        .foregroundStyle(.forest)
                        .frame(width: 44, height: 44)
                }
                .accessibilityLabel("Go back")
                Spacer()
            }
            .padding(.horizontal, 12)

            VStack(spacing: 8) {
                Text("Verify your identity")
                    .font(.custom("DMSerifDisplay-Regular", size: 28, relativeTo: .title))
                    .foregroundStyle(.textPrimary)
                    .accessibilityAddTraits(.isHeader)

                Text("Enter your name and date of birth\nas it appears in your hospital records")
                    .font(.custom("DMSans-Regular", size: 15, relativeTo: .body))
                    .foregroundStyle(.textSecondary)
                    .multilineTextAlignment(.center)
            }

            VStack(spacing: 16) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("First name")
                        .font(.custom("DMSans-Medium", size: 14, relativeTo: .subheadline))
                        .foregroundStyle(.textSecondary)

                    TextField("Your first name", text: $firstName)
                        .font(.custom("DMSans-Regular", size: 17, relativeTo: .body))
                        .padding(16)
                        .background(Color.white)
                        .clipShape(.rect(cornerRadius: 12))
                        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.borderColor, lineWidth: 1))
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
                        .padding(12)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color.white)
                        .clipShape(.rect(cornerRadius: 12))
                        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.borderColor, lineWidth: 1))
                }
            }
            .padding(.horizontal, 20)

            if let error = errorMessage {
                Text(error)
                    .font(.custom("DMSans-Medium", size: 14, relativeTo: .subheadline))
                    .foregroundStyle(.riskRed)
                    .padding(.horizontal, 20)
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
                .background(firstName.trimmingCharacters(in: .whitespaces).isEmpty ? Color.forest.opacity(0.4) : Color.forest)
                .clipShape(.rect(cornerRadius: 28))
            }
            .disabled(firstName.trimmingCharacters(in: .whitespaces).isEmpty || isLoading)
            .padding(.horizontal, 20)
            .padding(.bottom, 40)
        }
    }

    // MARK: - Success

    private var successStep: some View {
        VStack(spacing: 24) {
            Spacer()

            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 72))
                .foregroundStyle(.forest)
                .accessibilityHidden(true)

            VStack(spacing: 8) {
                Text("Welcome, \(store.session?.firstName ?? firstName)!")
                    .font(.custom("DMSerifDisplay-Regular", size: 28, relativeTo: .title))
                    .foregroundStyle(.textPrimary)
                    .accessibilityAddTraits(.isHeader)

                Text("You're all set. Your daily check-ins\nstart now.")
                    .font(.custom("DMSans-Regular", size: 16, relativeTo: .body))
                    .foregroundStyle(.textSecondary)
                    .multilineTextAlignment(.center)
            }

            Spacer()

            Button {
                haptic(.success)
                store.checkin = store.buildInitialCheckin()
            } label: {
                Text("Start my first check-in")
                    .font(.custom("DMSans-SemiBold", size: 18, relativeTo: .headline))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity, minHeight: 56)
                    .background(Color.forest)
                    .clipShape(.rect(cornerRadius: 28))
            }
            .padding(.horizontal, 20)
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
                        withAnimation { step = .success }
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
                .font(.system(size: 22))
                .foregroundStyle(.forest)
                .frame(width: 44, height: 44)
                .background(Color.forestPale)
                .clipShape(.rect(cornerRadius: 12))
                .accessibilityHidden(true)

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.custom("DMSans-SemiBold", size: 16, relativeTo: .body))
                    .foregroundStyle(.textPrimary)
                Text(desc)
                    .font(.custom("DMSans-Regular", size: 14, relativeTo: .subheadline))
                    .foregroundStyle(.textSecondary)
            }
            Spacer()
        }
        .accessibilityElement(children: .combine)
    }
}
