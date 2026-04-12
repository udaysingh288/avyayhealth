import SwiftUI

extension Color {
    static let forest = Color(red: 0.153, green: 0.314, blue: 0.039)       // #27500A
    static let forestLight = Color(red: 0.227, green: 0.431, blue: 0.071)  // #3A6E12
    static let forestPale = Color(red: 0.933, green: 0.957, blue: 0.910)   // #EEF4E8
    static let warmOatmeal = Color(red: 0.976, green: 0.969, blue: 0.949)  // #F9F7F2
    static let accentTeal = Color(red: 0.051, green: 0.420, blue: 0.337)   // #0D6B56

    static let riskRed = Color(red: 0.863, green: 0.149, blue: 0.149)      // #DC2626
    static let riskRedBg = Color(red: 0.996, green: 0.949, blue: 0.949)    // #FEF2F2
    static let riskYellow = Color(red: 0.851, green: 0.467, blue: 0.024)   // #D97706
    static let riskYellowBg = Color(red: 1.0, green: 0.984, blue: 0.922)   // #FFFBEB
    static let riskGreen = Color(red: 0.086, green: 0.639, blue: 0.290)    // #16A34A
    static let riskGreenBg = Color(red: 0.941, green: 0.992, blue: 0.957)  // #F0FDF4

    static let textPrimary = Color(red: 0.118, green: 0.161, blue: 0.231)  // #1E293B
    static let textSecondary = Color(red: 0.392, green: 0.455, blue: 0.545) // #64748B
    static let textMuted = Color(red: 0.580, green: 0.639, blue: 0.722)    // #94A3B8

    static let borderColor = Color(red: 0.886, green: 0.910, blue: 0.878)  // #E2E8F0

    static let coordinatorBubble = Color(red: 0.902, green: 0.933, blue: 0.925) // #E6EEEC
}

extension RiskLevel {
    var color: Color {
        switch self {
        case .red: return .riskRed
        case .yellow: return .riskYellow
        case .green: return .riskGreen
        }
    }

    var bgColor: Color {
        switch self {
        case .red: return .riskRedBg
        case .yellow: return .riskYellowBg
        case .green: return .riskGreenBg
        }
    }
}
