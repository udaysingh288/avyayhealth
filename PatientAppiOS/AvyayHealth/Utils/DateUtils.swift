import Foundation

func relativeTime(_ isoString: String?) -> String {
    guard let str = isoString else { return "—" }
    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    guard let date = formatter.date(from: str) ?? ISO8601DateFormatter().date(from: str) else { return "—" }

    let diff = Date().timeIntervalSince(date)
    if diff < 60 { return "Just now" }
    if diff < 3600 { return "\(Int(diff / 60))m ago" }
    if diff < 86400 { return "\(Int(diff / 3600))h ago" }

    let df = DateFormatter()
    df.dateFormat = "MMM d, h:mm a"
    return df.string(from: date)
}

func formatTime(_ isoString: String) -> String {
    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    guard let date = formatter.date(from: isoString) ?? ISO8601DateFormatter().date(from: isoString) else {
        return ""
    }

    let df = DateFormatter()
    df.dateFormat = "h:mm a"
    return df.string(from: date)
}

func dayOfProgram(_ days: Int) -> String {
    "Day \(days) of 30"
}
