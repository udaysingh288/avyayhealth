import SwiftUI

struct CheckInView: View {
    @EnvironmentObject var store: PatientStore
    @Environment(\.dismiss) var dismiss
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @StateObject private var vm = CheckInViewModel()
    @FocusState private var isTextFieldFocused: Bool

    private var hideCompletionCard: Bool {
        guard vm.isCompleted else { return false }
        return vm.conversation.contains { $0.role == .coordinator }
    }

    var body: some View {
        VStack(spacing: 0) {
            header

            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: 12) {
                        ForEach(Array(vm.conversation.enumerated()), id: \.element.id) { index, msg in
                            ChatBubble(
                                message: msg,
                                coordinatorName: store.session?.coordinatorFirstName ?? "Coordinator",
                                showAvatar: (msg.role == .ai || msg.role == .coordinator) &&
                                    (index == 0 || vm.conversation[index - 1].role != msg.role)
                            )
                            .transition(.asymmetric(
                                insertion: .opacity.combined(with: .move(edge: .bottom)).combined(with: .scale(scale: 0.95)),
                                removal: .opacity
                            ))
                        }

                        if vm.isTranscribing {
                            TranscribingIndicator()
                                .transition(.opacity.combined(with: .scale(scale: 0.9)))
                        }

                        if vm.isSending {
                            TypingIndicator()
                                .transition(.opacity.combined(with: .scale(scale: 0.9)))
                        }

                        // Hide completion card when coordinator joins the chat
                        if vm.isCompleted && !vm.isSending && !hideCompletionCard {
                            completionView
                                .transition(.opacity.combined(with: .scale(scale: 0.9)))
                        }

                        Color.clear.frame(height: 1).id("bottom")
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 20)
                    .padding(.bottom, 16)
                    .animation(reduceMotion ? nil : .spring(response: 0.35, dampingFraction: 0.85), value: vm.conversation.count)
                    .animation(reduceMotion ? nil : .easeInOut(duration: 0.2), value: vm.isSending)
                }
                .scrollDismissesKeyboard(.interactively)
                .onChange(of: vm.conversation.count) { _ in
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                        if reduceMotion {
                            proxy.scrollTo("bottom", anchor: .bottom)
                        } else {
                            withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                                proxy.scrollTo("bottom", anchor: .bottom)
                            }
                        }
                    }
                }
                .onChange(of: vm.isSending) { _ in
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.05) {
                        if reduceMotion {
                            proxy.scrollTo("bottom", anchor: .bottom)
                        } else {
                            withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                                proxy.scrollTo("bottom", anchor: .bottom)
                            }
                        }
                    }
                }
            }

            if vm.showComposer {
                composer
            }
        }
        .background(Color.warmOatmeal)
        .navigationBarHidden(true)
        .onAppear {
            vm.setup(store: store)
        }
        .onDisappear {
            vm.stopDMPolling()
        }
        .fullScreenCover(isPresented: $vm.showEscalation) {
            EscalationAlertView(
                hospitalName: store.session?.hospitalName ?? "your hospital",
                onDismiss: { vm.dismissEscalation(store: store) }
            )
        }
        // Image feature rolled back — kept in code for future use
        // .sheet(isPresented: $vm.showImagePicker) { ImagePickerView { image in vm.sendImage(image, store: store) } }
        // .sheet(isPresented: $vm.showImageConsent) { ImageConsentSheet { vm.onImageConsentGiven(store: store) } }
    }

    // MARK: - Header

    private var header: some View {
        VStack(spacing: 0) {
            HStack {
                Button {
                    haptic(.light)
                    dismiss()
                } label: {
                    Image(systemName: "chevron.down")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(.white.opacity(0.9))
                        .frame(width: 36, height: 36)
                        .background(.white.opacity(0.15))
                        .clipShape(Circle())
                }
                .accessibilityLabel("Close check-in")

                Spacer()

                VStack(spacing: 2) {
                    Text("Daily Check-in")
                        .font(.custom("DMSans-Bold", size: 17, relativeTo: .headline))
                        .foregroundStyle(.white)
                        .accessibilityAddTraits(.isHeader)
                    Text("Day \(vm.dayNumber) of \(store.session?.totalDays ?? 30)")
                        .font(.custom("DMSans-Medium", size: 12, relativeTo: .caption2))
                        .foregroundStyle(.white.opacity(0.7))
                }

                Spacer()

                // Balance the layout
                Color.clear.frame(width: 36, height: 36)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)

            // Progress bar
            HStack(spacing: 4) {
                ForEach(0..<3, id: \.self) { i in
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 3)
                                .fill(Color.white.opacity(0.2))
                                .frame(height: 4)

                            RoundedRectangle(cornerRadius: 3)
                                .fill(Color.white)
                                .frame(width: i <= vm.stepIndex ? geo.size.width : 0, height: 4)
                                .animation(reduceMotion ? nil : .spring(response: 0.5, dampingFraction: 0.7), value: vm.stepIndex)
                        }
                    }
                    .frame(height: 4)
                }
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 14)
            .accessibilityElement(children: .ignore)
            .accessibilityLabel("Check-in progress: step \(vm.stepIndex + 1) of 3")
        }
        .background(
            LinearGradient(
                colors: [.forestGradientStart, .forestGradientEnd],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
    }

    // MARK: - Completion

    private var completionView: some View {
        VStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(Color.riskGreenBg)
                    .frame(width: 80, height: 80)

                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 48))
                    .foregroundStyle(.riskGreen)
            }
            .accessibilityHidden(true)

            Text("Check-in complete!")
                .font(.custom("DMSerifDisplay-Regular", size: 22, relativeTo: .title3))
                .foregroundStyle(.textPrimary)
                .accessibilityAddTraits(.isHeader)

            Text("Great job today. See you tomorrow\nfor Day \(min(vm.dayNumber + 1, store.session?.totalDays ?? 30)).")
                .font(.custom("DMSans-Regular", size: 15, relativeTo: .subheadline))
                .foregroundStyle(.textSecondary)
                .multilineTextAlignment(.center)
                .lineSpacing(3)

            Button {
                haptic(.medium)
                dismiss()
            } label: {
                Text("Back to home")
                    .font(.custom("DMSans-SemiBold", size: 17, relativeTo: .body))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 36)
                    .frame(height: 52)
                    .background(
                        LinearGradient(
                            colors: [.forestGradientStart, .forestGradientEnd],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .clipShape(.rect(cornerRadius: 26))
                    .shadow(color: .forest.opacity(0.3), radius: 8, y: 4)
            }
            .padding(.top, 4)
        }
        .padding(.vertical, 28)
        .padding(.horizontal, 20)
        .background(Color.white)
        .clipShape(.rect(cornerRadius: 20))
        .shadow(color: .black.opacity(0.06), radius: 12, y: 4)
        .padding(.horizontal, 4)
    }

    private func formatDuration(_ seconds: TimeInterval) -> String {
        let mins = Int(seconds) / 60
        let secs = Int(seconds) % 60
        return String(format: "%d:%02d", mins, secs)
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
                                    .foregroundStyle(.forest)
                                    .padding(.horizontal, 16)
                                    .frame(minHeight: 40)
                                    .background(Color.forestPale)
                                    .clipShape(.rect(cornerRadius: 20))
                                    .overlay(RoundedRectangle(cornerRadius: 20).stroke(Color.forest.opacity(0.2), lineWidth: 1))
                            }
                            .disabled(vm.isSending)
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 8)
                }
                .scrollIndicators(.hidden)
                .transition(.move(edge: .bottom).combined(with: .opacity))
            }

            // Recording indicator bar
            if vm.isRecording {
                HStack(spacing: 8) {
                    Circle()
                        .fill(Color.red)
                        .frame(width: 8, height: 8)
                        .opacity(vm.recordingPulse ? 0.3 : 1.0)
                        .animation(.easeInOut(duration: 0.8).repeatForever(autoreverses: true), value: vm.recordingPulse)

                    Text("Recording… \(formatDuration(vm.recordingDuration))")
                        .font(.custom("DMSans-Medium", size: 14, relativeTo: .subheadline))
                        .foregroundStyle(.red)

                    Spacer()

                    Button {
                        vm.cancelAudioRecording()
                    } label: {
                        Text("Cancel")
                            .font(.custom("DMSans-Medium", size: 14, relativeTo: .subheadline))
                            .foregroundStyle(.textMuted)
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 6)
                .transition(.move(edge: .bottom).combined(with: .opacity))
            }

            // Input row
            HStack(alignment: .bottom, spacing: 10) {
                // Audio recording button
                Button {
                    haptic(.light)
                    vm.toggleAudioRecording(store: store)
                } label: {
                    Image(systemName: vm.isRecording ? "stop.circle.fill" : "mic.fill")
                        .font(.system(size: 16))
                        .foregroundStyle(vm.isRecording ? .red : .forest)
                        .frame(width: 42, height: 42)
                        .background(vm.isRecording ? Color.red.opacity(0.1) : Color.forestPale)
                        .clipShape(Circle())
                        .overlay(
                            vm.isRecording ?
                                Circle().stroke(Color.red.opacity(0.5), lineWidth: 2)
                                    .scaleEffect(vm.recordingPulse ? 1.2 : 1.0)
                                    .opacity(vm.recordingPulse ? 0.0 : 1.0)
                                    .animation(.easeInOut(duration: 1.0).repeatForever(autoreverses: false), value: vm.recordingPulse)
                            : nil
                        )
                }
                .disabled(vm.isSending || vm.isTranscribing)
                .accessibilityLabel(vm.isRecording ? "Stop recording" : "Record voice message")

                TextField(vm.isCompleted ? "Reply to coordinator…" : "Type your reply…", text: $vm.replyText)
                    .font(.custom("DMSans-Regular", size: 16, relativeTo: .body))
                    .foregroundColor(.textPrimary)
                    .accentColor(.forest)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .background(Color.white)
                    .clipShape(.rect(cornerRadius: 22))
                    .overlay(
                        RoundedRectangle(cornerRadius: 22)
                            .stroke(isTextFieldFocused ? Color.forest.opacity(0.5) : Color.borderColor, lineWidth: isTextFieldFocused ? 1.5 : 1)
                    )
                    .focused($isTextFieldFocused)
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
                        .font(.system(size: 15, weight: .bold))
                        .foregroundStyle(.white)
                        .frame(width: 42, height: 42)
                        .background(
                            vm.canSend
                                ? LinearGradient(colors: [.forestGradientStart, .forestGradientEnd], startPoint: .topLeading, endPoint: .bottomTrailing)
                                : LinearGradient(colors: [Color.forest.opacity(0.2), Color.forest.opacity(0.2)], startPoint: .topLeading, endPoint: .bottomTrailing)
                        )
                        .clipShape(Circle())
                        .shadow(color: vm.canSend ? .forest.opacity(0.3) : .clear, radius: 4, y: 2)
                }
                .disabled(!vm.canSend)
                .accessibilityLabel("Send message")
                .animation(.easeInOut(duration: 0.15), value: vm.canSend)
            }
            .padding(.horizontal, 16)
            .padding(.top, 8)
            .padding(.bottom, 12)
        }
        .background(Color.warmOatmeal)
    }
}
