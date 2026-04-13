import SwiftUI

struct TimelineView: View {
    @EnvironmentObject var store: PatientStore

    private var totalDays: Int { store.session?.totalDays ?? 30 }
    private var currentDay: Int { store.session?.daysInProgram ?? 1 }

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Header
                VStack(spacing: 6) {
                    Text("Recovery Timeline")
                        .font(.custom("DMSerifDisplay-Regular", size: 26, relativeTo: .title))
                        .foregroundStyle(.textPrimary)
                        .accessibilityAddTraits(.isHeader)
                    Text("Day \(currentDay) of \(totalDays)")
                        .font(.custom("DMSans-Regular", size: 14, relativeTo: .subheadline))
                        .foregroundStyle(.textSecondary)
                }
                .padding(.top, 16)

                // Stats
                HStack(spacing: 10) {
                    statCard(value: "\(max(currentDay - 1, 0))", label: "Completed", color: .riskGreen, icon: "checkmark.circle.fill")
                    statCard(value: "1", label: "Today", color: .forest, icon: "sun.max.fill")
                    statCard(value: "\(totalDays - currentDay)", label: "Remaining", color: .textSecondary, icon: "clock")
                }
                .padding(.horizontal, 20)

                // Calendar grid
                VStack(alignment: .leading, spacing: 14) {
                    Text("30-Day Calendar")
                        .font(.custom("DMSans-SemiBold", size: 17, relativeTo: .headline))
                        .foregroundStyle(.textPrimary)
                        .accessibilityAddTraits(.isHeader)

                    LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 6), count: 6), spacing: 6) {
                        ForEach(1...totalDays, id: \.self) { day in
                            dayCell(day: day)
                        }
                    }
                }
                .padding(20)
                .background(Color.white)
                .clipShape(.rect(cornerRadius: 20))
                .shadow(color: .black.opacity(0.05), radius: 10, y: 3)
                .padding(.horizontal, 20)

                // Legend
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

    private func statCard(value: String, label: String, color: Color, icon: String) -> some View {
        VStack(spacing: 6) {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundStyle(color)
                .accessibilityHidden(true)
            Text(value)
                .font(.custom("DMSans-Bold", size: 22, relativeTo: .title2))
                .foregroundStyle(color)
            Text(label)
                .font(.custom("DMSans-Regular", size: 11, relativeTo: .caption))
                .foregroundStyle(.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .background(Color.white)
        .clipShape(.rect(cornerRadius: 14))
        .shadow(color: .black.opacity(0.04), radius: 6, y: 2)
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

        return VStack(spacing: 3) {
            Text("\(day)")
                .font(.custom("DMSans-SemiBold", size: 13, relativeTo: .subheadline))
                .foregroundStyle(isToday ? .white : isPast ? .textPrimary : .textMuted)

            dayDotView(isPast: isPast, isToday: isToday, done: checkinDone)
                .frame(width: 10, height: 10)
        }
        .frame(height: 48)
        .frame(maxWidth: .infinity)
        .background(
            isToday
                ? AnyShapeStyle(LinearGradient(colors: [.forestGradientStart, .forestGradientEnd], startPoint: .topLeading, endPoint: .bottomTrailing))
                : AnyShapeStyle(Color.clear)
        )
        .clipShape(.rect(cornerRadius: 10))
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(isToday ? Color.clear : (day > currentDay ? Color.borderColor.opacity(0.5) : Color.clear), lineWidth: 1)
        )
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Day \(day), \(statusLabel)")
    }

    @ViewBuilder
    private func dayDotView(isPast: Bool, isToday: Bool, done: Bool) -> some View {
        if isToday {
            Circle()
                .fill(.white.opacity(done ? 1 : 0.5))
        } else if isPast && done {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 10))
                .foregroundStyle(.riskGreen)
        } else if isPast && !done {
            Image(systemName: "exclamationmark.circle.fill")
                .font(.system(size: 10))
                .foregroundStyle(.riskYellow)
        } else {
            Circle()
                .fill(Color.textSecondary.opacity(0.2))
        }
    }

    private func legendItem(icon: String, color: Color, label: String) -> some View {
        HStack(spacing: 5) {
            Image(systemName: icon)
                .font(.system(size: 10))
                .foregroundStyle(color)
            Text(label)
                .font(.custom("DMSans-Regular", size: 11, relativeTo: .caption))
                .foregroundStyle(.textSecondary)
        }
    }
}
