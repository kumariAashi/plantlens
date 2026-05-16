document.addEventListener('DOMContentLoaded', () => {
    const cameraBtn = document.getElementById('camera-btn');
    const cameraModal = document.getElementById('camera-modal');
    const closeCamera = document.getElementById('close-camera');
    const video = document.getElementById('camera-video');
    const canvas = document.getElementById('camera-canvas');
    const snapBtn = document.getElementById('snap-btn');
    const fileInput = document.getElementById('image-input');
    const previewImg = document.getElementById('preview-img');
    const dropDefault = document.getElementById('drop-default');
    const removeBtn = document.getElementById('remove-btn');
    const identifyBtn = document.getElementById('identify-btn');

    let stream = null;

    cameraBtn.addEventListener('click', async () => {
        cameraModal.classList.remove('hidden');
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });
            video.srcObject = stream;
        } catch (err) {
            console.error('Camera access denied or unavailable:', err);
            alert('Could not access camera. Please ensure you have granted camera permissions and are using HTTPS or localhost.');
            closeCameraModal();
        }
    });

    closeCamera.addEventListener('click', closeCameraModal);

    // Close modal when clicking outside
    cameraModal.addEventListener('click', (e) => {
        if (e.target === cameraModal) closeCameraModal();
    });

    snapBtn.addEventListener('click', () => {
        if (!stream) return;

        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;

            // Show preview
            const url = URL.createObjectURL(blob);
            previewImg.src = url;
            previewImg.classList.remove('hidden');
            dropDefault.classList.add('hidden');
            removeBtn.classList.remove('hidden');
            identifyBtn.disabled = false;

            closeCameraModal();
        }, 'image/jpeg', 0.9);
    });

    function closeCameraModal() {
        cameraModal.classList.add('hidden');
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        video.srcObject = null;
    }
});
