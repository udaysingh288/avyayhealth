import UIKit

enum HapticStyle {
    case light, medium, heavy, success, warning, error
}

private let lightGenerator = UIImpactFeedbackGenerator(style: .light)
private let mediumGenerator = UIImpactFeedbackGenerator(style: .medium)
private let heavyGenerator = UIImpactFeedbackGenerator(style: .heavy)
private let notificationGenerator = UINotificationFeedbackGenerator()

func haptic(_ style: HapticStyle) {
    switch style {
    case .light:
        lightGenerator.impactOccurred()
    case .medium:
        mediumGenerator.impactOccurred()
    case .heavy:
        heavyGenerator.impactOccurred()
    case .success:
        notificationGenerator.notificationOccurred(.success)
    case .warning:
        notificationGenerator.notificationOccurred(.warning)
    case .error:
        notificationGenerator.notificationOccurred(.error)
    }
}
