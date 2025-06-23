document.addEventListener('DOMContentLoaded', () => {
    // --- Get Elements from the DOM ---
    const moduleList = document.getElementById('module-list');
    const dropZone = document.getElementById('drop-zone');
    const buildBtn = document.getElementById('build-btn');
    const previewFrame = document.getElementById('preview-frame');
    const loadingIndicator = document.getElementById('loading-indicator');
    const desktopBtn = document.getElementById('desktop-btn');
    const mobileBtn = document.getElementById('mobile-btn');
    
    // --- ::: NEW ELEMENT & VARIABLE ::: ---
    const generateBtn = document.getElementById('generate-btn');
    let generatedHtmlContent = null; // This will store our final HTML string

    let emailComposition = [];

    // --- View Toggle Logic (Unchanged) ---
    function setDesktopView() {
        previewFrame.style.width = '800px';
        desktopBtn.classList.add('active');
        mobileBtn.classList.remove('active');
    }
    function setMobileView() {
        previewFrame.style.width = '480px';
        mobileBtn.classList.add('active');
        desktopBtn.classList.remove('active');
    }
    desktopBtn.addEventListener('click', setDesktopView);
    mobileBtn.addEventListener('click', setMobileView);
    setDesktopView();

    // --- Drag and Drop Logic (Updated) ---
    moduleList.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('module-item')) {
            e.dataTransfer.setData('text/plain', e.target.dataset.moduleName);
            e.dataTransfer.effectAllowed = 'copy';
        }
    });
    dropZone.addEventListener('dragenter', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); });
    dropZone.addEventListener('dragleave', (e) => { dropZone.classList.remove('drag-over'); });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const moduleName = e.dataTransfer.getData('text/plain');
        if (moduleName) {
            emailComposition.push(moduleName);
            renderComposition();
        }
    });
    
    function renderComposition() {
        dropZone.innerHTML = '';
        emailComposition.forEach((moduleName, index) => {
            const droppedItem = document.createElement('div');
            droppedItem.className = 'module-item dropped-item';
            droppedItem.textContent = moduleName;
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '×';
            deleteBtn.dataset.index = index;
            deleteBtn.addEventListener('click', (e) => {
                const itemIndex = parseInt(e.target.dataset.index, 10);
                emailComposition.splice(itemIndex, 1);
                renderComposition();
            });
            droppedItem.appendChild(deleteBtn);
            dropZone.appendChild(droppedItem);
        });
        
        // --- ::: NEW ::: ---
        // Whenever the canvas changes, disable the generate button
        // to force the user to rebuild the preview.
        generateBtn.disabled = true;
        generatedHtmlContent = null;
    }

    // --- Backend Communication (Updated) ---
    buildBtn.addEventListener('click', async () => {
        if (emailComposition.length === 0) {
            alert('Please drag at least one module into the canvas.');
            return;
        }
        loadingIndicator.classList.remove('hidden');
        buildBtn.disabled = true;
        generateBtn.disabled = true; // Also disable generate during build
        previewFrame.srcdoc = '<p>Building email...</p>';
        try {
            const response = await fetch('/api/build-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ modules: emailComposition }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Network response was not ok');
            }
            const data = await response.json();
            previewFrame.srcdoc = data.html;
            
            // --- ::: NEW ::: ---
            // Store the successful HTML and enable the generate button
            generatedHtmlContent = data.html;
            generateBtn.disabled = false;
            
        } catch (error) {
            console.error('Error:', error);
            previewFrame.srcdoc = `<p style="color:red;">Error: ${error.message}</p>`;
        } finally {
            loadingIndicator.classList.add('hidden');
            buildBtn.disabled = false; // Re-enable the build button
        }
    });

    // --- ::: NEW Generate File Logic ::: ---
    generateBtn.addEventListener('click', () => {
        if (!generatedHtmlContent) {
            alert('Please build a preview first.');
            return;
        }

        // 1. Create a Blob (a file-like object) from the HTML string
        const blob = new Blob([generatedHtmlContent], { type: 'text/html' });

        // 2. Create a temporary anchor element
        const a = document.createElement('a');
        
        // 3. Set its URL to the blob's URL and give it a default filename
        a.href = URL.createObjectURL(blob);
        a.download = 'email.html'; // This is the suggested filename

        // 4. Append to the document, click it, and then remove it
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // 5. Clean up the blob URL to free memory
        URL.revokeObjectURL(a.href);
    });
});