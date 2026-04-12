import SwiftUI

@main
struct AvyayHealthApp: App {
    @StateObject private var store = PatientStore.shared
    @Environment(\.scenePhase) private var scenePhase
    @State private var isScreenProtected = false

    var body: some Scene {
        WindowGroup {
            ZStack {
                if store.isEnrolled {
                    MainTabView()
                        .environmentObject(store)
                } else {
                    EnrollmentView()
                        .environmentObject(store)
                }

                // HIPAA: blur PHI when app enters background/app switcher
                if isScreenProtected {
                    Color.warmOatmeal
                        .ignoresSafeArea()
                        .overlay(
                            VStack(spacing: 12) {
                                Image(systemName: "heart.text.clipboard")
                                    .font(.system(size: 48))
                                    .foregroundStyle(.forest)
                                Text("Avyay Health")
                                    .font(.custom("DMSerifDisplay-Regular", size: 24))
                                    .foregroundStyle(.forest)
                            }
                        )
                }
            }
            .onChange(of: scenePhase) { phase in
                switch phase {
                case .active:
                    isScreenProtected = false
                    store.recordActivity()
                    store.checkInactivityTimeout()
                case .inactive, .background:
                    isScreenProtected = true
                    store.recordActivity()
                @unknown default:
                    break
                }
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
                    Label("Home", systemImage: "house.fill")
                }
                .tag(0)
                .badge(checkinDone ? 0 : 1)
                .accessibilityLabel(checkinDone ? "Home" : "Home, check-in pending")

            TimelineView()
                .tabItem {
                    Label("Timeline", systemImage: "calendar")
                }
                .tag(1)

            CarePlanView()
                .tabItem {
                    Label("Care Plan", systemImage: "heart.text.clipboard")
                }
                .tag(2)

            CareTeamView()
                .tabItem {
                    Label("Care Team", systemImage: "person.2.fill")
                }
                .tag(3)
        }
        .tint(.forest)
    }
}
