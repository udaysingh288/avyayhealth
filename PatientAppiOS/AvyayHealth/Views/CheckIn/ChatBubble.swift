import SwiftUI
import Combine

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
        HStack(alignment: .bottom, spacing: 8) {
            if message.role == .patient {
                Spacer(minLength: 48)
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
                        .font(.custom("DMSans-Medium", size: 11, relativeTo: .caption2))
                        .foregroundStyle(.textMuted)
                        .padding(.leading, message.role != .patient ? 4 : 0)
                        .padding(.trailing, message.role == .patient ? 4 : 0)
                }

                VStack(alignment: message.role == .patient ? .trailing : .leading, spacing: 2) {
                    if message.messageType == .audio {
                        // Voice-to-text indicator
                        HStack(spacing: 4) {
                            Image(systemName: "mic.fill")
                                .font(.system(size: 10))
                                .foregroundStyle(message.role == .patient ? .white.opacity(0.7) : .forest)
                            Text("Voice message")
                                .font(.custom("DMSans-Medium", size: 10, relativeTo: .caption2))
                                .foregroundStyle(message.role == .patient ? .white.opacity(0.7) : .textMuted)
                        }
                        .padding(.horizontal, 16)
                        .padding(.top, 8)
                    }

                    Text(message.content)
                        .font(.custom("DMSans-Regular", size: 16, relativeTo: .body))
                        .foregroundStyle(message.role == .patient ? .white : .textPrimary)
                        .padding(.horizontal, 16)
                        .padding(.vertical, message.messageType == .audio ? 6 : 11)
                        .padding(.top, message.messageType == .audio ? 0 : 0)
                }
                .background(bubbleBackground)
                .cornerRadius(20, corners: bubbleCorners)
                .lineSpacing(3)
                .shadow(
                    color: message.role == .patient ? .forest.opacity(0.15) : .black.opacity(0.04),
                    radius: message.role == .patient ? 6 : 4,
                    y: 2
                )

                Text(formatTime(message.sentAt))
                    .font(.custom("DMSans-Regular", size: 10, relativeTo: .caption2))
                    .foregroundStyle(.textMuted)
                    .padding(.leading, message.role != .patient ? 4 : 0)
                    .padding(.trailing, message.role == .patient ? 4 : 0)
            }

            if message.role != .patient {
                Spacer(minLength: 48)
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(senderLabel) said: \(message.content). \(formatTime(message.sentAt))")
    }

    @ViewBuilder
    private var avatar: some View {
        if message.role == .coordinator {
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [.accentTeal, .accentTeal.opacity(0.8)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 32, height: 32)

                Image(systemName: "person.fill")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(.white)
            }
        } else {
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [.forestGradientStart, .forestGradientEnd],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 32, height: 32)

                Image(systemName: "heart.text.clipboard")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(.white)
            }
        }
    }

    @ViewBuilder
    private var bubbleBackground: some View {
        switch message.role {
        case .patient:
            LinearGradient(
                colors: [.forestGradientStart, .forestGradientEnd],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        case .coordinator:
            Color.coordinatorBubble
        case .ai:
            Color.white
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

    private let tick = Timer.publish(every: 0.45, on: .main, in: .common).autoconnect()

    var body: some View {
        HStack(alignment: .bottom, spacing: 8) {
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [.forestGradientStart, .forestGradientEnd],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 32, height: 32)

                Image(systemName: "heart.text.clipboard")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(.white)
            }

            HStack(spacing: 5) {
                ForEach(0..<3, id: \.self) { i in
                    Circle()
                        .fill(Color.forest)
                        .frame(width: 7, height: 7)
                        .scaleEffect(reduceMotion ? 1.0 : (dotIndex == i ? 1.2 : 0.7))
                        .opacity(reduceMotion ? 0.6 : (dotIndex == i ? 1.0 : 0.3))
                        .animation(
                            reduceMotion ? nil : .spring(response: 0.3, dampingFraction: 0.5),
                            value: dotIndex
                        )
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .background(Color.white)
            .clipShape(.rect(cornerRadius: 20))
            .shadow(color: .black.opacity(0.04), radius: 4, y: 2)

            Spacer(minLength: 48)
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Avyay Health is typing")
        .onReceive(tick) { _ in
            guard !reduceMotion else { return }
            dotIndex = (dotIndex + 1) % 3
        }
    }
}

struct TranscribingIndicator: View {
    @State private var wavePhase = false

    var body: some View {
        HStack(alignment: .bottom, spacing: 8) {
            Spacer(minLength: 48)

            HStack(spacing: 6) {
                Image(systemName: "mic.fill")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(.forest)

                Text("Transcribing…")
                    .font(.custom("DMSans-Medium", size: 13, relativeTo: .footnote))
                    .foregroundStyle(.textSecondary)

                // Animated sound wave bars
                HStack(spacing: 2) {
                    ForEach(0..<4, id: \.self) { i in
                        RoundedRectangle(cornerRadius: 1)
                            .fill(Color.forest)
                            .frame(width: 3, height: wavePhase ? CGFloat(6 + i * 3) : CGFloat(12 - i * 2))
                            .animation(
                                .easeInOut(duration: 0.4)
                                    .repeatForever()
                                    .delay(Double(i) * 0.1),
                                value: wavePhase
                            )
                    }
                }
                .frame(height: 14)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(Color.forestPale)
            .clipShape(.rect(cornerRadius: 20))
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Converting voice to text")
        .onAppear { wavePhase = true }
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
