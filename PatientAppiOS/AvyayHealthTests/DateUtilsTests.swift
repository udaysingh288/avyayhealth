import XCTest
@testable import AvyayHealth

final class DateUtilsTests: XCTestCase {

    // MARK: - parseISO8601

    func testParseISO8601_validString() {
        let result = parseISO8601("2026-03-15T12:00:00Z")
        XCTAssertNotNil(result)
    }

    func testParseISO8601_fractionalSeconds() {
        let result = parseISO8601("2026-03-15T12:00:00.123Z")
        XCTAssertNotNil(result)
    }

    func testParseISO8601_invalidString() {
        XCTAssertNil(parseISO8601("not-a-date"))
    }

    func testParseISO8601_emptyString() {
        XCTAssertNil(parseISO8601(""))
    }

    // MARK: - iso8601Now

    func testIso8601Now_roundTrips() {
        let now = iso8601Now()
        let parsed = parseISO8601(now)
        XCTAssertNotNil(parsed)
    }

    func testIso8601Now_returnsNonEmptyString() {
        XCTAssertFalse(iso8601Now().isEmpty)
    }

    // MARK: - relativeTime

    func testRelativeTime_nilReturnsEmpty() {
        XCTAssertEqual(relativeTime(nil), "—")
    }

    func testRelativeTime_invalidStringReturnsDash() {
        XCTAssertEqual(relativeTime("garbage"), "—")
    }

    func testRelativeTime_recentDateReturnsJustNow() {
        let now = iso8601Now()
        XCTAssertEqual(relativeTime(now), "Just now")
    }

    // MARK: - formatTime

    func testFormatTime_validISO() {
        let result = formatTime("2026-03-15T14:30:00Z")
        XCTAssertFalse(result.isEmpty)
        // Should contain AM or PM
        XCTAssertTrue(result.contains("AM") || result.contains("PM"))
    }

    func testFormatTime_invalidISO() {
        XCTAssertEqual(formatTime("invalid"), "")
    }

    func testFormatTime_emptyString() {
        XCTAssertEqual(formatTime(""), "")
    }
}
