import Foundation

/// App configuration loaded from Info.plist (build-time injection).
/// Secrets should be set via xcconfig files excluded from version control.
enum Config {
    static let supabaseURL: String = {
        guard let value = Bundle.main.infoDictionary?["SUPABASE_URL"] as? String, !value.isEmpty else {
            // Fallback for development — in production, always inject via xcconfig
            return "https://gehcrdcgxifryfwjhpoz.supabase.co"
        }
        return value
    }()

    static let supabaseAnonKey: String = {
        guard let value = Bundle.main.infoDictionary?["SUPABASE_ANON_KEY"] as? String, !value.isEmpty else {
            // Fallback for development — in production, always inject via xcconfig
            return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlaGNyZGNneGlmcnlmd2pocG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTE4NDcsImV4cCI6MjA5MTQ2Nzg0N30.QKgdbLbou6I3bOHsBjv2gXI-uptchn7trNp21xaXhjA"
        }
        return value
    }()

    /// Maximum character length for patient chat messages
    static let maxMessageLength = 2000

    /// Maximum character length for patient first name
    static let maxNameLength = 50
}
