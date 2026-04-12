import SwiftUI

struct CheckInView: View {
    @EnvironmentObject var store: PatientStore
    @Environment(\.dismiss) var dismiss
    @StateObject private var vm = CheckInViewModel()

    var body: some View {
        VStack(spacing: 0) {
            // Header
            header

            // Chat feed
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: 16) {
                        ForEach(Array(vm.conversation.enumerated()), id: \.element.id) { index, msg in
                            ChatBubble(
                                message: msg,
                                coordinatorName: store.session?.coordinatorFirstName ?? "Coordinator",
                                showAvatar: (msg.role == .ai || msg.role == .coordinator) &&
                                    (index == 0 || vm.conversation[index - 1].role != msg.role)
                            )
                        }

                        if vm.isSending {
                            TypingIndicator()
                        }

                        if vm.isCompleted && !vm.isSending {
                            completionView
                        }

                        Color.clear.frame(height: 1).id("bottom")
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 20)
                    .padding(.bottom, 16)
                }
                .onChange(of: vm.conversation.count) { _ in
                    withAnimation { proxy.scrollTo("bottom", anchor: .bottom) }
                }
                .onChange(of: vm.isSending) { _ in
                    withAnimation { proxy.scrollTo("bottom", anchor: .bottom) }
                }
            }

            // Composer
            if vm.showComposer {
                composer
            }
        }
        .background(Color.warmOatmeal)
        .navigationBarHidden(true)
        .onAppear {
            vm.setup(store: store)
        }
        .fullScreenCover(isPresented: $vm.showEscalation) {
            EscalationAlertView(
                hospitalName: store.session?.hospitalName ?? "your hospital",
                onDismiss: { vm.dismissEscalation(store: store) }
            )
        }
    }

    // MARK: - Header

    private var header: some View {
        VStack(spacing: 0) {
            HStack {
                Button {
                    haptic(.light)
                    dismiss()
                } label: {
                    Image(systemName: "xmark")
                        .font(.system(size: 18, weight: .medium))
                        .foregroundColor(.textPrimary)
                        .frame(width: 44, height: 44)
                }

                Spacer()

                VStack(spacing: 2) {
                    Text("Daily Check-in")
                        .font(.custom("DMSans-Bold", size: 16))
                        .foregroundColor(.textPrimary)
                    Text("Day \(vm.dayNumber) of \(store.session?.totalDays ?? 30)")
                        .font(.custom("DMSans-Medium", size: 11))
                        .foregroundColor(.textMuted)
                }

                Spacer()

                Color.clear.frame(width: 44, height: 44)
            }
            .padding(.horizontal, 8)

            // Progress bar
            HStack(spacing: 6) {
                ForEach(0..<3) { i in
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 2)
                                .fill(Color.forest.opacity(0.1))
                                .frame(height: 4)

                            RoundedRectangle(cornerRadius: 2)
                                .fill(Color.forest)
                                .frame(width: i <= vm.stepIndex ? geo.size.width : 0, height: 4)
                                .animation(.easeInOut(duration: 0.5), value: vm.stepIndex)
                        }
                    }
                    .frame(height: 4)
                }
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 12)
        }
        .background(.ultraThinMaterial)
    }

    // MARK: - Completion

    private var completionView: some View {
        VStack(spacing: 12) {
            Image(systemName: "checkmark")
                .font(.system(size: 32, weight: .bold))
                .foregroundColor(.white)
                .frame(width: 64, height: 64)
                .background(Color.forest)
                .clipShape(Circle())
                .shadow(color: .forest.opacity(0.3), radius: 8, y: 4)

            Text("Check-in complete")
                .font(.custom("DMSans-Bold", size: 18))
                .foregroundColor(.textPrimary)

            Text("See you tomorrow for Day \(min(vm.dayNumber + 1, store.session?.totalDays ?? 30)).")
                .font(.custom("DMSans-Regular", size: 14))
                .foregroundColor(.textMuted)

            Button {
                haptic(.medium)
                dismiss()
            } label: {
                Text("Back to home")
                    .font(.custom("DMSans-SemiBold", size: 17))
                    .foregroundColor(.white)
                    .padding(.horizontal, 32)
                    .frame(height: 52)
                    .background(Color.forest)
                    .cornerRadius(26)
            }
            .padding(.top, 16)
        }
        .padding(.vertical, 24)
    }

    // MARK: - Composer

    private var composer: some View {
        VStack(spacing: 0) {
            // Quick replies (only during active check-in)
            if !vm.isCompleted && !vm.quickReplies.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(vm.quickReplies, id: \.self) { reply in
                            Button {
                                vm.send(text: reply, store: store)
                            } label: {
                                Text(reply)
                                    .font(.custom("DMSans-SemiBold", size: 14))
                                    .foregroundColor(.textPrimary)
                                    .padding(.horizontal, 16)
                                    .frame(height: 40)
                                    .background(Color.white)
                                    .cornerRadius(20)
                                    .overlay(RoundedRectangle(cornerRadius: 20).stroke(Color.forest.opacity(0.25), lineWidth: 1))
                            }
                            .disabled(vm.isSending)
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 10)
                }
            }

            // Input row
            HStack(alignment: .bottom, spacing: 8) {
                TextField(vm.isCompleted ? "Reply to coordinator…" : "Type your reply…", text: $vm.replyText)
                    .font(.custom("DMSans-Regular", size: 16))
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .background(Color.white)
                    .cornerRadius(22)
                    .overlay(RoundedRectangle(cornerRadius: 22).stroke(Color.borderColor, lineWidth: 1))
                    .disabled(vm.isSending)
                    .submitLabel(.send)
                    .onSubmit { vm.send(store: store) }

                Button {
                    vm.send(store: store)
                } label: {
                    Image(systemName: "arrow.up")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(vm.canSend ? .white : .forest.opacity(0.4))
                        .frame(width: 44, height: 44)
                        .background(vm.canSend ? Color.forest : Color.forest.opacity(0.15))
                        .clipShape(Circle())
                }
                .disabled(!vm.canSend)
            }
            .padding(.horizontal, 16)
            .padding(.top, 8)
            .padding(.bottom, 12)
        }
        .background(.ultraThinMaterial)
    }
}
