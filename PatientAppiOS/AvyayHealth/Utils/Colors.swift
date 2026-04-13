import SwiftUI

extension Color {
    // Brand — primary deep forest #053027
    static let forest = Color(red: 0.020, green: 0.188, blue: 0.153)       // #053027
    static let forestLight = Color(red: 0.039, green: 0.259, blue: 0.212)  // #0A4236
    static let forestPale = Color(red: 0.918, green: 0.953, blue: 0.945)   // #EAF3F1
    static let warmOatmeal = Color(red: 0.976, green: 0.969, blue: 0.949)  // #F9F7F2
    static let accentTeal = Color(red: 0.051, green: 0.420, blue: 0.337)   // #0D6B56

    // Risk
    static let riskRed = Color(red: 0.863, green: 0.149, blue: 0.149)      // #DC2626
    static let riskRedBg = Color(red: 0.996, green: 0.949, blue: 0.949)    // #FEF2F2
    static let riskYellow = Color(red: 0.851, green: 0.467, blue: 0.024)   // #D97706
    static let riskYellowBg = Color(red: 1.0, green: 0.984, blue: 0.922)   // #FFFBEB
    static let riskGreen = Color(red: 0.086, green: 0.639, blue: 0.290)    // #16A34A
    static let riskGreenBg = Color(red: 0.941, green: 0.992, blue: 0.957)  // #F0FDF4

    // Text
    static let textPrimary = Color(red: 0.102, green: 0.102, blue: 0.102)  // #1A1A1A
    static let textSecondary = Color(red: 0.392, green: 0.455, blue: 0.545) // #64748B
    static let textMuted = Color(red: 0.475, green: 0.533, blue: 0.612)    // #798898

    // UI
    static let borderColor = Color(red: 0.886, green: 0.910, blue: 0.878)  // #E2E8F0
    static let coordinatorBubble = Color(red: 0.902, green: 0.933, blue: 0.925) // #E6EEEC

    // Gradient helpers
    static let forestGradientStart = Color(red: 0.020, green: 0.188, blue: 0.153)  // #053027
    static let forestGradientEnd = Color(red: 0.039, green: 0.259, blue: 0.212)    // #0A4236
}

extension ShapeStyle where Self == Color {
    static var forest: Color { .forest }
    static var forestLight: Color { .forestLight }
    static var forestPale: Color { .forestPale }
    static var warmOatmeal: Color { .warmOatmeal }
    static var accentTeal: Color { .accentTeal }
    static var riskRed: Color { .riskRed }
    static var riskRedBg: Color { .riskRedBg }
    static var riskYellow: Color { .riskYellow }
    static var riskYellowBg: Color { .riskYellowBg }
    static var riskGreen: Color { .riskGreen }
    static var riskGreenBg: Color { .riskGreenBg }
    static var textPrimary: Color { .textPrimary }
    static var textSecondary: Color { .textSecondary }
    static var textMuted: Color { .textMuted }
    static var borderColor: Color { .borderColor }
    static var coordinatorBubble: Color { .coordinatorBubble }
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
