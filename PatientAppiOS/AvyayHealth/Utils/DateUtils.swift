import Foundation

// MARK: - Cached Formatters (DateFormatter is expensive to allocate)

private let cachedISO8601: ISO8601DateFormatter = {
    let f = ISO8601DateFormatter()
    return f
}()

private let cachedISO8601Fractional: ISO8601DateFormatter = {
    let f = ISO8601DateFormatter()
    f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    return f
}()

private let cachedTimeFormatter: DateFormatter = {
    let f = DateFormatter()
    f.dateFormat = "h:mm a"
    return f
}()

private let cachedDateTimeFormatter: DateFormatter = {
    let f = DateFormatter()
    f.dateFormat = "MMM d, h:mm a"
    return f
}()

func parseISO8601(_ str: String) -> Date? {
    cachedISO8601Fractional.date(from: str) ?? cachedISO8601.date(from: str)
}

func iso8601Now() -> String {
    cachedISO8601.string(from: Date())
}

func relativeTime(_ isoString: String?) -> String {
    guard let str = isoString, let date = parseISO8601(str) else { return "—" }

    let diff = Date().timeIntervalSince(date)
    if diff < 60 { return "Just now" }
    if diff < 3600 { return "\(Int(diff / 60))m ago" }
    if diff < 86400 { return "\(Int(diff / 3600))h ago" }

    return cachedDateTimeFormatter.string(from: date)
}

func formatTime(_ isoString: String) -> String {
    guard let date = parseISO8601(isoString) else { return "" }
    return cachedTimeFormatter.string(from: date)
}

