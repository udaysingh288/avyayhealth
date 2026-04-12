import SwiftUI

@main
struct AvyayHealthApp: App {
    @StateObject private var store = PatientStore.shared

    var body: some Scene {
        WindowGroup {
            if store.isEnrolled {
                MainTabView()
                    .environmentObject(store)
            } else {
                EnrollmentView()
                    .environmentObject(store)
            }
        }
    }
}

struct MainTabView: View {
    @EnvironmentObject var store: PatientStore
    @State private var selectedTab = 0

    private var checkinDone: Bool {
        store.checkin?.status == .completed
    }

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Image(systemName: "house.fill")
                    Text("Home")
                }
                .tag(0)
                .badge(checkinDone ? 0 : 1)

            TimelineView()
                .tabItem {
                    Image(systemName: "calendar")
                    Text("Timeline")
                }
                .tag(1)

            CarePlanView()
                .tabItem {
                    Image(systemName: "heart.text.clipboard")
                    Text("Care Plan")
                }
                .tag(2)

            CareTeamView()
                .tabItem {
                    Image(systemName: "person.2.fill")
                    Text("Care Team")
                }
                .tag(3)
        }
        .tint(.forest)
    }
}
