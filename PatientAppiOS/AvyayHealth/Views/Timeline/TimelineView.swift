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
                        .font(.custom("DMSerifDisplay-Regular", size: 24))
                        .foregroundColor(.textPrimary)
                    Text("Day \(currentDay) of \(totalDays)")
                        .font(.custom("DMSans-Regular", size: 14))
                        .foregroundColor(.textSecondary)
                }
                .padding(.top, 16)

                // Stats
                HStack(spacing: 12) {
                    statCard(value: "\(max(currentDay - 1, 0))", label: "Completed", color: .riskGreen)
                    statCard(value: "1", label: "Today", color: .forest)
                    statCard(value: "\(totalDays - currentDay)", label: "Remaining", color: .textMuted)
                }
                .padding(.horizontal, 20)

                // Calendar grid
                VStack(alignment: .leading, spacing: 12) {
                    Text("30-Day Calendar")
                        .font(.custom("DMSans-SemiBold", size: 16))
                        .foregroundColor(.textPrimary)

                    LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 6), spacing: 8) {
                        ForEach(1...totalDays, id: \.self) { day in
                            dayCell(day: day)
                        }
                    }
                }
                .padding(20)
                .background(Color.white)
                .cornerRadius(16)
                .shadow(color: .black.opacity(0.04), radius: 8, y: 2)
                .padding(.horizontal, 20)

                // Legend
                HStack(spacing: 16) {
                    legendItem(color: .riskGreen, label: "Stable")
                    legendItem(color: .riskYellow, label: "Watched")
                    legendItem(color: .riskRed, label: "Alert")
                    legendItem(color: .textMuted, label: "Upcoming")
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
                .font(.custom("DMSans-Bold", size: 24))
                .foregroundColor(color)
            Text(label)
                .font(.custom("DMSans-Regular", size: 12))
                .foregroundColor(.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.04), radius: 4, y: 1)
    }

    private func dayCell(day: Int) -> some View {
        let isToday = day == currentDay
        let isPast = day < currentDay
        let isFuture = day > currentDay
        let checkinDone = isPast || (isToday && store.checkin?.status == .completed)

        return VStack(spacing: 4) {
            Text("\(day)")
                .font(.custom("DMSans-SemiBold", size: 14))
                .foregroundColor(isToday ? .white : isPast ? .textPrimary : .textMuted)

            Circle()
                .fill(dayDotColor(isPast: isPast, isToday: isToday, done: checkinDone))
                .frame(width: 8, height: 8)
        }
        .frame(height: 52)
        .frame(maxWidth: .infinity)
        .background(isToday ? Color.forest : Color.clear)
        .cornerRadius(10)
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(isToday ? Color.clear : (isFuture ? Color.borderColor : Color.clear), lineWidth: 1)
        )
    }

    private func dayDotColor(isPast: Bool, isToday: Bool, done: Bool) -> Color {
        if isToday { return .white.opacity(done ? 1 : 0.5) }
        if isPast { return done ? .riskGreen : .riskYellow }
        return .textMuted.opacity(0.3)
    }

    private func legendItem(color: Color, label: String) -> some View {
        HStack(spacing: 6) {
            Circle().fill(color).frame(width: 8, height: 8)
            Text(label)
                .font(.custom("DMSans-Regular", size: 12))
                .foregroundColor(.textSecondary)
        }
    }
}
