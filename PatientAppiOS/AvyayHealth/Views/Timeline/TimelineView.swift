import SwiftUI

struct TimelineView: View {
    @EnvironmentObject var store: PatientStore

    private var totalDays: Int { store.session?.totalDays ?? 30 }
    private var currentDay: Int { store.session?.daysInProgram ?? 1 }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header
                VStack(spacing: 4) {
                    Text("Recovery Timeline")
                        .font(.custom("DMSerifDisplay-Regular", size: 24, relativeTo: .title))
                        .foregroundStyle(.textPrimary)
                        .accessibilityAddTraits(.isHeader)
                    Text("Day \(currentDay) of \(totalDays)")
                        .font(.custom("DMSans-Regular", size: 14, relativeTo: .subheadline))
                        .foregroundStyle(.textSecondary)
                }
                .padding(.top, 16)

                // Stats
                HStack(spacing: 12) {
                    statCard(value: "\(max(currentDay - 1, 0))", label: "Completed", color: .riskGreen)
                    statCard(value: "1", label: "Today", color: .forest)
                    statCard(value: "\(totalDays - currentDay)", label: "Remaining", color: .textSecondary)
                }
                .padding(.horizontal, 20)

                // Calendar grid
                VStack(alignment: .leading, spacing: 12) {
                    Text("30-Day Calendar")
                        .font(.custom("DMSans-SemiBold", size: 16, relativeTo: .headline))
                        .foregroundStyle(.textPrimary)
                        .accessibilityAddTraits(.isHeader)

                    LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 6), spacing: 8) {
                        ForEach(1...totalDays, id: \.self) { day in
                            dayCell(day: day)
                        }
                    }
                }
                .padding(20)
                .background(Color.white)
                .clipShape(.rect(cornerRadius: 16))
                .shadow(color: .black.opacity(0.04), radius: 8, y: 2)
                .padding(.horizontal, 20)

                // Legend — uses icons alongside color for accessibility
                HStack(spacing: 16) {
                    legendItem(icon: "checkmark.circle.fill", color: .riskGreen, label: "Stable")
                    legendItem(icon: "exclamationmark.circle.fill", color: .riskYellow, label: "Watched")
                    legendItem(icon: "exclamationmark.triangle.fill", color: .riskRed, label: "Alert")
                    legendItem(icon: "circle.dotted", color: .textSecondary, label: "Upcoming")
                }
                .padding(.horizontal, 20)

                Spacer(minLength: 100)
            }
        }
        .background(Color.warmOatmeal)
    }

    private func statCard(value: String, label: String, color: Color) -> some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.custom("DMSans-Bold", size: 24, relativeTo: .title2))
                .foregroundStyle(color)
            Text(label)
                .font(.custom("DMSans-Regular", size: 12, relativeTo: .caption))
                .foregroundStyle(.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .background(Color.white)
        .clipShape(.rect(cornerRadius: 12))
        .shadow(color: .black.opacity(0.04), radius: 4, y: 1)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(label): \(value)")
    }

    private func dayCell(day: Int) -> some View {
        let isToday = day == currentDay
        let isPast = day < currentDay
        let checkinDone = isPast || (isToday && store.checkin?.status == .completed)

        let statusLabel: String = {
            if isToday { return checkinDone ? "today, completed" : "today, pending" }
            if isPast { return checkinDone ? "completed, stable" : "completed, watched" }
            return "upcoming"
        }()

        return VStack(spacing: 4) {
            Text("\(day)")
                .font(.custom("DMSans-SemiBold", size: 14, relativeTo: .subheadline))
                .foregroundStyle(isToday ? .white : isPast ? .textPrimary : .textSecondary)

            dayDotView(isPast: isPast, isToday: isToday, done: checkinDone)
                .frame(width: 10, height: 10)
        }
        .frame(height: 52)
        .frame(maxWidth: .infinity)
        .background(isToday ? Color.forest : Color.clear)
        .clipShape(.rect(cornerRadius: 10))
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(isToday ? Color.clear : (day > currentDay ? Color.borderColor : Color.clear), lineWidth: 1)
        )
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Day \(day), \(statusLabel)")
    }

    @ViewBuilder
    private func dayDotView(isPast: Bool, isToday: Bool, done: Bool) -> some View {
        if isToday {
            // White dot for today
            Circle()
                .fill(.white.opacity(done ? 1 : 0.5))
        } else if isPast && done {
            // Green checkmark for completed stable
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 10))
                .foregroundStyle(.riskGreen)
        } else if isPast && !done {
            // Yellow warning for watched
            Image(systemName: "exclamationmark.circle.fill")
                .font(.system(size: 10))
                .foregroundStyle(.riskYellow)
        } else {
            // Future: dotted circle
            Circle()
                .fill(Color.textSecondary.opacity(0.3))
        }
    }

    private func legendItem(icon: String, color: Color, label: String) -> some View {
        HStack(spacing: 6) {
            Image(systemName: icon)
                .font(.system(size: 10))
                .foregroundStyle(color)
            Text(label)
                .font(.custom("DMSans-Regular", size: 12, relativeTo: .caption))
                .foregroundStyle(.textSecondary)
        }
    }
}
