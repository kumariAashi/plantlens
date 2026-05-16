document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('upload-form');
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('image-input');
    const previewImg = document.getElementById('preview-img');
    const dropDefault = document.getElementById('drop-default');
    const removeBtn = document.getElementById('remove-btn');
    const identifyBtn = document.getElementById('identify-btn');
    const btnText = document.getElementById('btn-text');
    const btnArrow = document.getElementById('btn-arrow');
    const btnSpinner = document.getElementById('btn-spinner');

    // Click drop zone to open file dialog
    dropZone.addEventListener('click', (e) => {
        if (e.target.closest('#remove-btn')) return;
        fileInput.click();
    });

    // File selected via input
    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file) handleFile(file);
    });

    // Drag & drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-over'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'), false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length) {
            fileInput.files = files;
            handleFile(files[0]);
        }
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file (JPEG, PNG, etc.)');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            previewImg.classList.remove('hidden');
            dropDefault.classList.add('hidden');
            removeBtn.classList.remove('hidden');
            identifyBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }

    // Remove selected image
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.value = '';
        previewImg.src = '';
        previewImg.classList.add('hidden');
        dropDefault.classList.remove('hidden');
        removeBtn.classList.add('hidden');
        identifyBtn.disabled = true;
    });

    // Handle form submit loading state
    form.addEventListener('submit', () => {
        identifyBtn.disabled = true;
        btnText.textContent = 'Identifying...';
        btnArrow.classList.add('hidden');
        btnSpinner.classList.remove('hidden');
    });
});
