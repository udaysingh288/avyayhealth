import SwiftUI

struct ChatBubble: View {
    let message: Message
    let coordinatorName: String
    let showAvatar: Bool

    private var senderLabel: String {
        switch message.role {
        case .patient: return "You"
        case .coordinator: return coordinatorName
        case .ai: return "Avyay Health"
        }
    }

    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            if message.role == .patient {
                Spacer(minLength: 60)
            }

            if message.role != .patient && showAvatar {
                avatar
                    .accessibilityHidden(true)
            } else if message.role != .patient {
                Color.clear.frame(width: 32, height: 32)
                    .accessibilityHidden(true)
            }

            VStack(alignment: message.role == .patient ? .trailing : .leading, spacing: 4) {
                if showAvatar {
                    Text(message.role == .coordinator ? coordinatorName : "Avyay Health")
                        .font(.custom("DMSans-Medium", size: 12, relativeTo: .caption2))
                        .foregroundStyle(.textMuted)
                }

                Text(message.content)
                    .font(.custom("DMSans-Regular", size: 16, relativeTo: .body))
                    .foregroundStyle(message.role == .patient ? .white : .textPrimary)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .background(bubbleBackground)
                    .cornerRadius(20, corners: bubbleCorners)
                    .lineSpacing(4)

                Text(formatTime(message.sentAt))
                    .font(.custom("DMSans-Regular", size: 11, relativeTo: .caption2))
                    .foregroundStyle(.textMuted)
            }

            if message.role != .patient {
                Spacer(minLength: 60)
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(senderLabel) said: \(message.content). \(formatTime(message.sentAt))")
    }

    @ViewBuilder
    private var avatar: some View {
        if message.role == .coordinator {
            Image(systemName: "person.fill")
                .font(.system(size: 14))
                .foregroundStyle(.white)
                .frame(width: 32, height: 32)
                .background(Color.accentTeal)
                .clipShape(Circle())
        } else {
            Image(systemName: "heart.text.clipboard")
                .font(.system(size: 14))
                .foregroundStyle(.white)
                .frame(width: 32, height: 32)
                .background(Color.forest)
                .clipShape(Circle())
        }
    }

    private var bubbleBackground: Color {
        switch message.role {
        case .patient: return .forest
        case .coordinator: return .coordinatorBubble
        case .ai: return .white
        }
    }

    private var bubbleCorners: UIRectCorner {
        if message.role == .patient {
            return [.topLeft, .topRight, .bottomLeft]
        } else {
            return [.topLeft, .topRight, .bottomRight]
        }
    }
}

struct TypingIndicator: View {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var dotIndex = 0
    @State private var timer: Timer?

    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            Image(systemName: "heart.text.clipboard")
                .font(.system(size: 14))
                .foregroundStyle(.white)
                .frame(width: 32, height: 32)
                .background(Color.forest)
                .clipShape(.circle)

            HStack(spacing: 6) {
                ForEach(0..<3, id: \.self) { i in
                    Circle()
                        .fill(Color.textMuted)
                        .frame(width: 8, height: 8)
                        .opacity(reduceMotion ? 0.6 : (dotIndex == i ? 1.0 : 0.3))
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 16)
            .background(Color.white)
            .clipShape(.rect(cornerRadius: 20))

            Spacer(minLength: 60)
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Avyay Health is typing")
        .onAppear {
            guard !reduceMotion else { return }
            let t = Timer.scheduledTimer(withTimeInterval: 0.4, repeats: true) { _ in
                Task { @MainActor in
                    withAnimation { dotIndex = (dotIndex + 1) % 3 }
                }
            }
            timer = t
        }
        .onDisappear {
            timer?.invalidate()
            timer = nil
        }
    }
}

// MARK: - Corner Radius Helper

extension View {
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(RoundedCorner(radius: radius, corners: corners))
    }
}

struct RoundedCorner: Shape {
    var radius: CGFloat
    var corners: UIRectCorner

    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(
            roundedRect: rect,
            byRoundingCorners: corners,
            cornerRadii: CGSize(width: radius, height: radius)
        )
        return Path(path.cgPath)
    }
}
