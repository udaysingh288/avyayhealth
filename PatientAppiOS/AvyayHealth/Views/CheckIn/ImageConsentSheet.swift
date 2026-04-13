import SwiftUI

/// HIPAA-required consent sheet shown before the first image upload.
/// Patient must acknowledge how their photos are used and stored.
struct ImageConsentSheet: View {
    @Environment(\.dismiss) private var dismiss
    let onConsent: () -> Void

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Icon
                    ZStack {
                        Circle()
                            .fill(Color.forestPale)
                            .frame(width: 80, height: 80)

                        Image(systemName: "lock.shield.fill")
                            .font(.system(size: 36))
                            .foregroundStyle(.forest)
                    }
                    .padding(.top, 20)
                    .accessibilityHidden(true)

                    Text("Photo Sharing Consent")
                        .font(.custom("DMSerifDisplay-Regular", size: 24, relativeTo: .title2))
                        .foregroundStyle(.textPrimary)
                        .accessibilityAddTraits(.isHeader)

                    Text("Before sharing a photo, please review how it will be used:")
                        .font(.custom("DMSans-Regular", size: 15, relativeTo: .subheadline))
                        .foregroundStyle(.textSecondary)
                        .multilineTextAlignment(.center)

                    VStack(alignment: .leading, spacing: 16) {
                        consentItem(
                            icon: "stethoscope",
                            title: "Care team review",
                            body: "Your care coordinator will review the photo to assess your recovery."
                        )
                        consentItem(
                            icon: "lock.fill",
                            title: "Stored securely",
                            body: "Photos are encrypted and stored on HIPAA-compliant servers. Only your care team can access them."
                        )
                        consentItem(
                            icon: "brain.head.profile",
                            title: "AI-assisted triage",
                            body: "A secure AI system helps classify the photo to speed up your care team's response."
                        )
                        consentItem(
                            icon: "xmark.shield.fill",
                            title: "No training",
                            body: "Your photos are never used to train AI models or shared with third parties."
                        )
                        consentItem(
                            icon: "clock.fill",
                            title: "Limited access",
                            body: "Photo links expire after 5 minutes. Access is logged for your protection."
                        )
                    }
                    .padding(.horizontal, 4)

                    // Consent button
                    Button {
                        haptic(.medium)
                        onConsent()
                        dismiss()
                    } label: {
                        Text("I understand, continue")
                            .font(.custom("DMSans-SemiBold", size: 17, relativeTo: .body))
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 52)
                            .background(
                                LinearGradient(
                                    colors: [.forestGradientStart, .forestGradientEnd],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .clipShape(.rect(cornerRadius: 26))
                            .shadow(color: .forest.opacity(0.3), radius: 8, y: 4)
                    }
                    .padding(.top, 8)

                    Button {
                        dismiss()
                    } label: {
                        Text("Not now")
                            .font(.custom("DMSans-Medium", size: 15, relativeTo: .subheadline))
                            .foregroundStyle(.textSecondary)
                    }
                    .padding(.bottom, 24)
                }
                .padding(.horizontal, 24)
            }
            .background(Color.warmOatmeal)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundStyle(.textMuted)
                            .frame(width: 32, height: 32)
                            .background(.white.opacity(0.8))
                            .clipShape(Circle())
                    }
                }
            }
        }
    }

    private func consentItem(icon: String, title: String, body: String) -> some View {
        HStack(alignment: .top, spacing: 14) {
            Image(systemName: icon)
                .font(.system(size: 18))
                .foregroundStyle(.forest)
                .frame(width: 28, height: 28)
                .accessibilityHidden(true)

            VStack(alignment: .leading, spacing: 3) {
                Text(title)
                    .font(.custom("DMSans-SemiBold", size: 15, relativeTo: .subheadline))
                    .foregroundStyle(.textPrimary)
                Text(body)
                    .font(.custom("DMSans-Regular", size: 14, relativeTo: .caption))
                    .foregroundStyle(.textSecondary)
                    .lineSpacing(2)
            }
        }
    }
}
