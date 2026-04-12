import SwiftUI

struct EnrollmentView: View {
    @EnvironmentObject var store: PatientStore
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
                .foregroundColor(.forest)

            VStack(spacing: 12) {
                Text("Welcome to")
                    .font(.custom("DMSans-Regular", size: 18))
                    .foregroundColor(.textSecondary)

                Text("Avyay Health")
                    .font(.custom("DMSerifDisplay-Regular", size: 36))
                    .foregroundColor(.forest)

                Text("The care that follows you home")
                    .font(.custom("DMSans-Regular", size: 16))
                    .foregroundColor(.textMuted)
                    .italic()
            }

            VStack(spacing: 16) {
                featureRow(icon: "bubble.left.and.bubble.right", title: "Daily check-ins", desc: "Quick conversations about how you're feeling")
                featureRow(icon: "person.2", title: "Connected care", desc: "Your care team monitors your progress")
                featureRow(icon: "exclamationmark.triangle", title: "Urgent alerts", desc: "Immediate help when something isn't right")
            }
            .padding(.horizontal, 24)

            Spacer()

            Button {
                haptic(.medium)
                withAnimation { step = .verify }
            } label: {
                Text("Get started")
                    .font(.custom("DMSans-SemiBold", size: 18))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity, minHeight: 56)
                    .background(Color.forest)
                    .cornerRadius(28)
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 40)
        }
    }

    private func featureRow(icon: String, title: String, desc: String) -> some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 22))
                .foregroundColor(.forest)
                .frame(width: 44, height: 44)
                .background(Color.forestPale)
                .cornerRadius(12)

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.custom("DMSans-SemiBold", size: 16))
                    .foregroundColor(.textPrimary)
                Text(desc)
                    .font(.custom("DMSans-Regular", size: 14))
                    .foregroundColor(.textSecondary)
            }
            Spacer()
        }
    }

    // MARK: - Verify

    private var verifyStep: some View {
        VStack(spacing: 24) {
            HStack {
                Button {
                    haptic(.light)
                    withAnimation { step = .welcome }
                } label: {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 20, weight: .medium))
                        .foregroundColor(.forest)
                        .frame(width: 44, height: 44)
                }
                Spacer()
            }
            .padding(.horizontal, 12)

            VStack(spacing: 8) {
                Text("Verify your identity")
                    .font(.custom("DMSerifDisplay-Regular", size: 28))
                    .foregroundColor(.textPrimary)

                Text("Enter your name and date of birth\nas it appears in your hospital records")
                    .font(.custom("DMSans-Regular", size: 15))
                    .foregroundColor(.textSecondary)
                    .multilineTextAlignment(.center)
            }

            VStack(spacing: 16) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("First name")
                        .font(.custom("DMSans-Medium", size: 14))
                        .foregroundColor(.textSecondary)

                    TextField("Your first name", text: $firstName)
                        .font(.custom("DMSans-Regular", size: 17))
                        .padding(16)
                        .background(Color.white)
                        .cornerRadius(12)
                        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.borderColor, lineWidth: 1))
                        .textContentType(.givenName)
                        .autocorrectionDisabled()
                }

                VStack(alignment: .leading, spacing: 6) {
                    Text("Date of birth")
                        .font(.custom("DMSans-Medium", size: 14))
                        .foregroundColor(.textSecondary)

                    DatePicker("", selection: $dob, displayedComponents: .date)
                        .datePickerStyle(.compact)
                        .labelsHidden()
                        .padding(12)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color.white)
                        .cornerRadius(12)
                        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.borderColor, lineWidth: 1))
                }
            }
            .padding(.horizontal, 20)

            if let error = errorMessage {
                Text(error)
                    .font(.custom("DMSans-Medium", size: 14))
                    .foregroundColor(.riskRed)
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
                            .font(.custom("DMSans-SemiBold", size: 18))
                    }
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity, minHeight: 56)
                .background(firstName.trimmingCharacters(in: .whitespaces).isEmpty ? Color.forest.opacity(0.4) : Color.forest)
                .cornerRadius(28)
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
                .foregroundColor(.forest)

            VStack(spacing: 8) {
                Text("Welcome, \(store.session?.firstName ?? firstName)!")
                    .font(.custom("DMSerifDisplay-Regular", size: 28))
                    .foregroundColor(.textPrimary)

                Text("You're all set. Your daily check-ins\nstart now.")
                    .font(.custom("DMSans-Regular", size: 16))
                    .foregroundColor(.textSecondary)
                    .multilineTextAlignment(.center)
            }

            Spacer()

            Button {
                haptic(.success)
                store.checkin = store.buildInitialCheckin()
            } label: {
                Text("Start my first check-in")
                    .font(.custom("DMSans-SemiBold", size: 18))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity, minHeight: 56)
                    .background(Color.forest)
                    .cornerRadius(28)
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 40)
        }
    }

    // MARK: - Enroll API

    private func enroll() {
        guard !firstName.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        isLoading = true
        errorMessage = nil

        let df = DateFormatter()
        df.dateFormat = "yyyy-MM-dd"
        let dobStr = df.string(from: dob)

        Task {
            do {
                let response = try await APIClient.shared.enroll(
                    hospitalCode: hospitalCode,
                    firstName: firstName.trimmingCharacters(in: .whitespaces),
                    dob: dobStr
                )
                await MainActor.run {
                    store.setSession(response)
                    isLoading = false
                    withAnimation { step = .success }
                }
            } catch {
                await MainActor.run {
                    isLoading = false
                    errorMessage = "Could not verify your identity. Please check your name and date of birth."
                }
            }
        }
    }
}
