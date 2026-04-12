import SwiftUI

struct EscalationAlertView: View {
    let hospitalName: String
    let onDismiss: () -> Void

    var body: some View {
        ZStack {
            Color.riskRed.opacity(0.08).ignoresSafeArea()

            VStack(spacing: 24) {
                Spacer()

                Image(systemName: "exclamationmark.triangle.fill")
                    .font(.system(size: 56))
                    .foregroundColor(.riskRed)

                VStack(spacing: 12) {
                    Text("This sounds urgent.")
                        .font(.custom("DMSerifDisplay-Regular", size: 28))
                        .foregroundColor(.textPrimary)

                    Text("Please call 911 or go to your nearest\nemergency room right away.")
                        .font(.custom("DMSans-Regular", size: 17))
                        .foregroundColor(.textSecondary)
                        .multilineTextAlignment(.center)
                        .lineSpacing(4)

                    Text("Your care team at \(hospitalName)\nhas also been notified.")
                        .font(.custom("DMSans-Regular", size: 15))
                        .foregroundColor(.textMuted)
                        .multilineTextAlignment(.center)
                        .padding(.top, 8)
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
                        .font(.custom("DMSans-SemiBold", size: 18))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity, minHeight: 56)
                        .background(Color.riskRed)
                        .cornerRadius(28)
                    }

                    Button {
                        haptic(.medium)
                        onDismiss()
                    } label: {
                        Text("I'm okay, continue")
                            .font(.custom("DMSans-SemiBold", size: 16))
                            .foregroundColor(.textSecondary)
                            .frame(maxWidth: .infinity, minHeight: 48)
                            .background(Color.white)
                            .cornerRadius(24)
                            .overlay(RoundedRectangle(cornerRadius: 24).stroke(Color.borderColor, lineWidth: 1))
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 40)
            }
        }
    }
}
