import SwiftUI

struct EscalationAlertView: View {
    let hospitalName: String
    let onDismiss: () -> Void
    @State private var pulseScale: CGFloat = 1.0

    var body: some View {
        ZStack {
            Color.riskRedBg.ignoresSafeArea()

            VStack(spacing: 24) {
                Spacer()

                ZStack {
                    Circle()
                        .fill(Color.riskRed.opacity(0.1))
                        .frame(width: 120, height: 120)
                        .scaleEffect(pulseScale)

                    Circle()
                        .fill(Color.riskRed.opacity(0.15))
                        .frame(width: 90, height: 90)

                    Image(systemName: "exclamationmark.triangle.fill")
                        .font(.system(size: 44))
                        .foregroundStyle(.riskRed)
                }
                .accessibilityHidden(true)
                .onAppear {
                    withAnimation(.easeInOut(duration: 1.5).repeatForever(autoreverses: true)) {
                        pulseScale = 1.15
                    }
                }

                VStack(spacing: 12) {
                    Text("This sounds urgent.")
                        .font(.custom("DMSerifDisplay-Regular", size: 28, relativeTo: .title))
                        .foregroundStyle(.textPrimary)
                        .accessibilityAddTraits(.isHeader)

                    Text("Please call 911 or go to your nearest\nemergency room right away.")
                        .font(.custom("DMSans-Regular", size: 17, relativeTo: .body))
                        .foregroundStyle(.textSecondary)
                        .multilineTextAlignment(.center)
                        .lineSpacing(4)

                    Text("Your care team at \(hospitalName)\nhas also been notified.")
                        .font(.custom("DMSans-Regular", size: 15, relativeTo: .subheadline))
                        .foregroundStyle(.textMuted)
                        .multilineTextAlignment(.center)
                        .padding(.top, 4)
                }

                Spacer()

                VStack(spacing: 12) {
                    Button {
                        guard let url = URL(string: "tel://911") else { return }
                        UIApplication.shared.open(url)
                    } label: {
                        HStack(spacing: 8) {
                            Image(systemName: "phone.fill")
                            Text("Call 911")
                        }
                        .font(.custom("DMSans-SemiBold", size: 18, relativeTo: .headline))
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity, minHeight: 56)
                        .background(Color.riskRed)
                        .clipShape(.rect(cornerRadius: 28))
                        .shadow(color: .riskRed.opacity(0.4), radius: 10, y: 4)
                    }
                    .accessibilityLabel("Call 911 emergency services")
                    .accessibilityHint("Double tap to call emergency services immediately")

                    Button {
                        haptic(.medium)
                        onDismiss()
                    } label: {
                        Text("I'm okay, continue")
                            .font(.custom("DMSans-SemiBold", size: 16, relativeTo: .body))
                            .foregroundStyle(.textSecondary)
                            .frame(maxWidth: .infinity, minHeight: 48)
                            .background(Color.white)
                            .clipShape(.rect(cornerRadius: 24))
                            .overlay(RoundedRectangle(cornerRadius: 24).stroke(Color.borderColor, lineWidth: 1))
                    }
                    .accessibilityLabel("I'm okay, continue check-in")
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 40)
            }
        }
        .onAppear {
            UIAccessibility.post(notification: .screenChanged, argument: "Emergency alert. This sounds urgent. Please call 911 or go to your nearest emergency room.")
        }
    }
}
