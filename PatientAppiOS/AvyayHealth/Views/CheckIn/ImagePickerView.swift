import SwiftUI
import PhotosUI

/// HIPAA-compliant image picker.
/// Uses PHPickerViewController (no direct photo library access) and UIImagePickerController for camera.
/// Selected images exist only in memory — never written to disk.
struct ImagePickerView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var showCamera = false
    @State private var showPhotoLibrary = false
    @State private var selectedItem: PhotosPickerItem?

    let onImageSelected: (UIImage) -> Void

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                Spacer()

                Image(systemName: "camera.viewfinder")
                    .font(.system(size: 56))
                    .foregroundStyle(.forest)
                    .accessibilityHidden(true)

                Text("Share a photo")
                    .font(.custom("DMSerifDisplay-Regular", size: 24, relativeTo: .title2))
                    .foregroundStyle(.textPrimary)

                Text("Take or select a photo of your injury.\nYour care team will review it.")
                    .font(.custom("DMSans-Regular", size: 15, relativeTo: .subheadline))
                    .foregroundStyle(.textSecondary)
                    .multilineTextAlignment(.center)
                    .lineSpacing(3)

                VStack(spacing: 12) {
                    Button {
                        haptic(.medium)
                        showCamera = true
                    } label: {
                        Label("Take Photo", systemImage: "camera.fill")
                            .font(.custom("DMSans-SemiBold", size: 17, relativeTo: .body))
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 52)
                            .background(
                                LinearGradient(
                                    colors: [.forestGradientStart, .forestGradientEnd],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .clipShape(.rect(cornerRadius: 26))
                    }

                    PhotosPicker(
                        selection: $selectedItem,
                        matching: .images,
                        photoLibrary: .shared()
                    ) {
                        Label("Choose from Library", systemImage: "photo.on.rectangle")
                            .font(.custom("DMSans-SemiBold", size: 17, relativeTo: .body))
                            .foregroundStyle(.forest)
                            .frame(maxWidth: .infinity)
                            .frame(height: 52)
                            .background(Color.forestPale)
                            .clipShape(.rect(cornerRadius: 26))
                            .overlay(
                                RoundedRectangle(cornerRadius: 26)
                                    .stroke(Color.forest.opacity(0.2), lineWidth: 1)
                            )
                    }
                }
                .padding(.horizontal, 24)

                Spacer()
            }
            .padding(.horizontal, 20)
            .background(Color.warmOatmeal)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                        .font(.custom("DMSans-Medium", size: 16, relativeTo: .body))
                        .foregroundStyle(.forest)
                }
            }
            .fullScreenCover(isPresented: $showCamera) {
                CameraView { image in
                    onImageSelected(image)
                    dismiss()
                }
                .ignoresSafeArea()
            }
            .onChange(of: selectedItem) { item in
                guard let item else { return }
                Task {
                    if let data = try? await item.loadTransferable(type: Data.self),
                       let image = UIImage(data: data) {
                        // Strip EXIF by re-encoding through CGImage (in memory only)
                        if let clean = stripExif(image) {
                            onImageSelected(clean)
                        } else {
                            onImageSelected(image)
                        }
                        dismiss()
                    }
                }
            }
        }
    }

    /// Re-encode through CGImage to strip all EXIF metadata (GPS, device info).
    /// HIPAA requirement: EXIF can contain location data.
    private func stripExif(_ image: UIImage) -> UIImage? {
        guard let cgImage = image.cgImage else { return nil }
        return UIImage(cgImage: cgImage, scale: 1.0, orientation: image.imageOrientation)
    }
}

// MARK: - Camera (UIImagePickerController wrapper)

struct CameraView: UIViewControllerRepresentable {
    let onCapture: (UIImage) -> Void

    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.sourceType = .camera
        picker.allowsEditing = false
        picker.delegate = context.coordinator
        return picker
    }

    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}

    func makeCoordinator() -> Coordinator { Coordinator(onCapture: onCapture) }

    class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let onCapture: (UIImage) -> Void
        init(onCapture: @escaping (UIImage) -> Void) { self.onCapture = onCapture }

        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            picker.dismiss(animated: true)
            if let image = info[.originalImage] as? UIImage {
                // Strip EXIF by re-encoding through CGImage
                if let cg = image.cgImage {
                    let clean = UIImage(cgImage: cg, scale: 1.0, orientation: image.imageOrientation)
                    onCapture(clean)
                } else {
                    onCapture(image)
                }
            }
        }

        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            picker.dismiss(animated: true)
        }
    }
}
