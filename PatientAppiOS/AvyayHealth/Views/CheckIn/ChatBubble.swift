import SwiftUI

struct ChatBubble: View {
    let message: Message
    let coordinatorName: String
    let showAvatar: Bool

    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            if message.role == .patient {
                Spacer(minLength: 60)
            }

            if message.role != .patient && showAvatar {
                avatar
            } else if message.role != .patient {
                Color.clear.frame(width: 32, height: 32)
            }

            VStack(alignment: message.role == .patient ? .trailing : .leading, spacing: 4) {
                if showAvatar {
                    Text(message.role == .coordinator ? coordinatorName : "Avyay Health")
                        .font(.custom("DMSans-Medium", size: 12))
                        .foregroundColor(.textMuted)
                }

                Text(message.content)
                    .font(.custom("DMSans-Regular", size: 16))
                    .foregroundColor(message.role == .patient ? .white : .textPrimary)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .background(bubbleBackground)
                    .cornerRadius(20, corners: bubbleCorners)
                    .lineSpacing(4)

                Text(formatTime(message.sentAt))
                    .font(.custom("DMSans-Regular", size: 11))
                    .foregroundColor(.textMuted)
            }

            if message.role != .patient {
                Spacer(minLength: 60)
            }
        }
    }

    @ViewBuilder
    private var avatar: some View {
        if message.role == .coordinator {
            Image(systemName: "person.fill")
                .font(.system(size: 14))
                .foregroundColor(.white)
                .frame(width: 32, height: 32)
                .background(Color.accentTeal)
                .clipShape(Circle())
        } else {
            Image(systemName: "heart.text.clipboard")
                .font(.system(size: 14))
                .foregroundColor(.white)
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
    @State private var dotIndex = 0

    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            Image(systemName: "heart.text.clipboard")
                .font(.system(size: 14))
                .foregroundColor(.white)
                .frame(width: 32, height: 32)
                .background(Color.forest)
                .clipShape(Circle())

            HStack(spacing: 6) {
                ForEach(0..<3) { i in
                    Circle()
                        .fill(Color.textMuted)
                        .frame(width: 8, height: 8)
                        .opacity(dotIndex == i ? 1.0 : 0.3)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 16)
            .background(Color.white)
            .cornerRadius(20)

            Spacer(minLength: 60)
        }
        .onAppear {
            Timer.scheduledTimer(withTimeInterval: 0.4, repeats: true) { _ in
                withAnimation { dotIndex = (dotIndex + 1) % 3 }
            }
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
