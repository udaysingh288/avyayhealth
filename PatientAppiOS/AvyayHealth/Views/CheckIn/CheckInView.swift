import SwiftUI

struct CheckInView: View {
    @EnvironmentObject var store: PatientStore
    @Environment(\.dismiss) var dismiss
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.accessibilityReduceTransparency) private var reduceTransparency
    @StateObject private var vm = CheckInViewModel()

    var body: some View {
        VStack(spacing: 0) {
            // Header
            header

            // Chat feed
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: 16) {
                        ForEach(vm.conversation.enumerated(), id: \.element.id) { index, msg in
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
                    if reduceMotion {
                        proxy.scrollTo("bottom", anchor: .bottom)
                    } else {
                        withAnimation { proxy.scrollTo("bottom", anchor: .bottom) }
                    }
                }
                .onChange(of: vm.isSending) { _ in
                    if reduceMotion {
                        proxy.scrollTo("bottom", anchor: .bottom)
                    } else {
                        withAnimation { proxy.scrollTo("bottom", anchor: .bottom) }
                    }
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
                        .foregroundStyle(.textPrimary)
                        .frame(width: 44, height: 44)
                }
                .accessibilityLabel("Close check-in")

                Spacer()

                VStack(spacing: 2) {
                    Text("Daily Check-in")
                        .font(.custom("DMSans-Bold", size: 16, relativeTo: .headline))
                        .foregroundStyle(.textPrimary)
                        .accessibilityAddTraits(.isHeader)
                    Text("Day \(vm.dayNumber) of \(store.session?.totalDays ?? 30)")
                        .font(.custom("DMSans-Medium", size: 11, relativeTo: .caption2))
                        .foregroundStyle(.textSecondary)
                }

                Spacer()

                Color.clear.frame(width: 44, height: 44)
            }
            .padding(.horizontal, 8)

            // Progress bar
            HStack(spacing: 6) {
                ForEach(0..<3, id: \.self) { i in
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 2)
                                .fill(Color.forest.opacity(0.1))
                                .frame(height: 4)

                            RoundedRectangle(cornerRadius: 2)
                                .fill(Color.forest)
                                .frame(width: i <= vm.stepIndex ? geo.size.width : 0, height: 4)
                                .animation(reduceMotion ? nil : .easeInOut(duration: 0.5), value: vm.stepIndex)
                        }
                    }
                    .frame(height: 4)
                }
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 12)
            .accessibilityElement(children: .ignore)
            .accessibilityLabel("Check-in progress: step \(vm.stepIndex + 1) of 3")
        }
        .background {
            if reduceTransparency {
                Color.warmOatmeal
            } else {
                Color.clear.background(.ultraThinMaterial)
            }
        }
    }

    // MARK: - Completion

    private var completionView: some View {
        VStack(spacing: 12) {
            Image(systemName: "checkmark")
                .font(.system(size: 32, weight: .bold))
                .foregroundStyle(.white)
                .frame(width: 64, height: 64)
                .background(Color.forest)
                .clipShape(.circle)
                .shadow(color: .forest.opacity(0.3), radius: 8, y: 4)
                .accessibilityHidden(true)

            Text("Check-in complete")
                .font(.custom("DMSans-Bold", size: 18, relativeTo: .headline))
                .foregroundStyle(.textPrimary)
                .accessibilityAddTraits(.isHeader)

            Text("See you tomorrow for Day \(min(vm.dayNumber + 1, store.session?.totalDays ?? 30)).")
                .font(.custom("DMSans-Regular", size: 14, relativeTo: .subheadline))
                .foregroundStyle(.textSecondary)

            Button {
                haptic(.medium)
                dismiss()
            } label: {
                Text("Back to home")
                    .font(.custom("DMSans-SemiBold", size: 17, relativeTo: .body))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 32)
                    .frame(height: 52)
                    .background(Color.forest)
                    .clipShape(.rect(cornerRadius: 26))
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
                ScrollView(.horizontal) {
                    HStack(spacing: 8) {
                        ForEach(vm.quickReplies, id: \.self) { reply in
                            Button {
                                vm.send(text: reply, store: store)
                            } label: {
                                Text(reply)
                                    .font(.custom("DMSans-SemiBold", size: 14, relativeTo: .subheadline))
                                    .foregroundStyle(.textPrimary)
                                    .padding(.horizontal, 16)
                                    .frame(minHeight: 44)
                                    .background(Color.white)
                                    .clipShape(.rect(cornerRadius: 22))
                                    .overlay(RoundedRectangle(cornerRadius: 22).stroke(Color.forest.opacity(0.25), lineWidth: 1))
                            }
                            .disabled(vm.isSending)
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 10)
                }
                .scrollIndicators(.hidden)
            }

            // Input row
            HStack(alignment: .bottom, spacing: 8) {
                TextField(vm.isCompleted ? "Reply to coordinator…" : "Type your reply…", text: $vm.replyText)
                    .font(.custom("DMSans-Regular", size: 16, relativeTo: .body))
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .background(Color.white)
                    .clipShape(.rect(cornerRadius: 22))
                    .overlay(RoundedRectangle(cornerRadius: 22).stroke(Color.borderColor, lineWidth: 1))
                    .disabled(vm.isSending)
                    .submitLabel(.send)
                    .onSubmit { vm.send(store: store) }
                    .onChange(of: vm.replyText) { newValue in
                        if newValue.count > Config.maxMessageLength {
                            vm.replyText = String(newValue.prefix(Config.maxMessageLength))
                        }
                    }

                Button {
                    vm.send(store: store)
                } label: {
                    Image(systemName: "arrow.up")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundStyle(vm.canSend ? .white : .forest.opacity(0.4))
                        .frame(width: 44, height: 44)
                        .background(vm.canSend ? Color.forest : Color.forest.opacity(0.15))
                        .clipShape(.circle)
                }
                .disabled(!vm.canSend)
                .accessibilityLabel("Send message")
            }
            .padding(.horizontal, 16)
            .padding(.top, 8)
            .padding(.bottom, 12)
        }
        .background {
            if reduceTransparency {
                Color.warmOatmeal
            } else {
                Color.clear.background(.ultraThinMaterial)
            }
        }
    }
}
