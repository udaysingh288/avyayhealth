import AVFoundation
import Speech

/// Records audio from the microphone and transcribes it to text using Apple's on-device Speech framework.
///
/// HIPAA compliance:
/// - Audio is recorded to a temporary file that is deleted immediately after transcription.
/// - No audio data is persisted to disk beyond the recording session.
/// - Transcription uses on-device processing when available (iOS 13+).
/// - Only the text transcript is kept — the audio buffer is discarded.
@MainActor
final class AudioRecorderManager: NSObject, ObservableObject {
    @Published var isRecording = false
    @Published var isTranscribing = false
    @Published var transcribedText: String?
    @Published var error: String?
    @Published var recordingDuration: TimeInterval = 0

    private var audioRecorder: AVAudioRecorder?
    private var tempFileURL: URL?
    private var durationTimer: Timer?

    /// Maximum recording duration in seconds (2 minutes — enough for elderly patients)
    private let maxDuration: TimeInterval = 120

    // MARK: - Permissions

    func requestPermissions() async -> Bool {
        let micGranted = await withCheckedContinuation { cont in
            AVAudioSession.sharedInstance().requestRecordPermission { granted in
                cont.resume(returning: granted)
            }
        }
        guard micGranted else {
            error = "Microphone access is required to record voice messages."
            return false
        }

        let speechStatus = SFSpeechRecognizer.authorizationStatus()
        if speechStatus == .notDetermined {
            let granted = await withCheckedContinuation { cont in
                SFSpeechRecognizer.requestAuthorization { status in
                    cont.resume(returning: status == .authorized)
                }
            }
            guard granted else {
                error = "Speech recognition permission is required to convert your voice to text."
                return false
            }
        } else if speechStatus != .authorized {
            error = "Speech recognition is not available. Please enable it in Settings."
            return false
        }

        return true
    }

    // MARK: - Recording

    func startRecording() async {
        guard !isRecording else { return }

        let permitted = await requestPermissions()
        guard permitted else { return }

        error = nil
        transcribedText = nil

        do {
            let audioSession = AVAudioSession.sharedInstance()
            try audioSession.setCategory(.record, mode: .default)
            try audioSession.setActive(true)
        } catch {
            self.error = "Could not activate microphone."
            return
        }

        // Temporary file — deleted immediately after transcription
        let tempDir = FileManager.default.temporaryDirectory
        let fileURL = tempDir.appendingPathComponent(UUID().uuidString + ".m4a")
        tempFileURL = fileURL

        let settings: [String: Any] = [
            AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
            AVSampleRateKey: 16000,
            AVNumberOfChannelsKey: 1,
            AVEncoderAudioQualityKey: AVAudioQuality.medium.rawValue,
        ]

        do {
            audioRecorder = try AVAudioRecorder(url: fileURL, settings: settings)
            audioRecorder?.record(forDuration: maxDuration)
            isRecording = true
            recordingDuration = 0

            durationTimer = Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { [weak self] _ in
                Task { @MainActor [weak self] in
                    guard let self, self.isRecording else { return }
                    self.recordingDuration = self.audioRecorder?.currentTime ?? 0
                    // Auto-stop at max duration
                    if self.recordingDuration >= self.maxDuration {
                        self.stopRecording()
                    }
                }
            }
        } catch {
            self.error = "Could not start recording."
            cleanupTempFile()
        }
    }

    func stopRecording() {
        guard isRecording else { return }
        audioRecorder?.stop()
        isRecording = false
        durationTimer?.invalidate()
        durationTimer = nil

        // Deactivate audio session so other audio can resume
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    }

    // MARK: - Transcription

    /// Transcribes the last recording to text using Apple Speech framework.
    /// Returns the transcribed text, or nil if transcription failed.
    func transcribe() async -> String? {
        guard let fileURL = tempFileURL else {
            error = "No recording to transcribe."
            return nil
        }

        guard FileManager.default.fileExists(atPath: fileURL.path) else {
            error = "Recording file not found."
            return nil
        }

        isTranscribing = true
        defer {
            isTranscribing = false
            cleanupTempFile()
        }

        guard let recognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US")),
              recognizer.isAvailable else {
            error = "Speech recognition is not available on this device."
            return nil
        }

        let request = SFSpeechURLRecognitionRequest(url: fileURL)
        request.shouldReportPartialResults = false

        // Prefer on-device recognition for HIPAA compliance
        if #available(iOS 13, *) {
            request.requiresOnDeviceRecognition = recognizer.supportsOnDeviceRecognition
        }

        do {
            let result = try await withCheckedThrowingContinuation { (cont: CheckedContinuation<SFSpeechRecognitionResult, Error>) in
                recognizer.recognitionTask(with: request) { result, error in
                    if let error {
                        cont.resume(throwing: error)
                    } else if let result, result.isFinal {
                        cont.resume(returning: result)
                    }
                }
            }

            let text = result.bestTranscription.formattedString
            if text.trimmingCharacters(in: .whitespaces).isEmpty {
                error = "Could not understand the audio. Please try again or type your message."
                return nil
            }
            transcribedText = text
            return text
        } catch {
            self.error = "Could not transcribe audio. Please try typing instead."
            return nil
        }
    }

    // MARK: - Cleanup

    /// Immediately delete the temporary audio file — never persist audio to disk.
    private func cleanupTempFile() {
        if let url = tempFileURL {
            try? FileManager.default.removeItem(at: url)
            tempFileURL = nil
        }
    }

    func cancel() {
        audioRecorder?.stop()
        isRecording = false
        isTranscribing = false
        durationTimer?.invalidate()
        durationTimer = nil
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
        cleanupTempFile()
    }

    deinit {
        // Ensure temp file is cleaned up
        if let url = tempFileURL {
            try? FileManager.default.removeItem(at: url)
        }
    }
}
