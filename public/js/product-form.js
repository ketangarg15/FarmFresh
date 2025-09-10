// public/js/product-form.js

document.addEventListener('DOMContentLoaded', () => {
    // --- STATE & CONFIG ---
    let product = {};
    let isSubmitting = false;
    const MAX_DESC_LENGTH = 500;

    // Use a centralized notification utility if available.
    const showNotification = window.utils?.showNotification || ((msg, type) => console.log(`${type}: ${msg}`));

    // --- ELEMENT SELECTORS ---
    const form = document.getElementById('productForm');
    const nameInput = document.getElementById('name');
    const descInput = document.getElementById('description');
    const priceInput = document.getElementById('price');
    const qtyInput = document.getElementById('quantity');
    const categorySel = document.getElementById('category');
    const unitSel = document.getElementById('unit');
    const imageUrlInput = document.getElementById('imageUrl');
    const imagePreview = document.getElementById('imagePreview');
    const submitBtn = document.getElementById('submitBtn');

    // Object map for easier access to error elements
    const errorElements = {
        name: document.getElementById('nameError'),
        description: document.getElementById('descriptionError'),
        price: document.getElementById('priceError'),
        quantity: document.getElementById('quantityError'),
        imageUrl: document.getElementById('imageError')
    };

    /**
     * Initializes the form by parsing embedded product data and setting up the preview.
     */
    function initializeForm() {
        const productDataEl = document.getElementById('product');
        if (productDataEl) {
            try {
                product = JSON.parse(productDataEl.dataset.product || '{}');
            } catch (err) {
                console.error('Failed to parse product data:', err);
            }
        }
        updateAllPreviews();
        updateDescriptionCount();
    }

    /**
     * Updates all live preview elements based on current form values.
     */
    function updateAllPreviews() {
        document.getElementById('previewName').textContent = nameInput.value || 'Product Name';
        document.getElementById('previewPrice').textContent = formatPrice(priceInput.value);
        document.getElementById('previewCategory').textContent = categorySel.options[categorySel.selectedIndex]?.text || 'Category';
        document.getElementById('previewDescription').textContent = descInput.value || 'Product description will appear here...';
        document.getElementById('previewStock').textContent = `${qtyInput.value || 0} ${unitSel.value || 'units'} available`;
    }
    
    function updateDescriptionCount() {
        const countEl = document.getElementById('descriptionCount');
        if(countEl) countEl.textContent = `${descInput.value.length} / ${MAX_DESC_LENGTH}`;
    }

    /**
     * Updates the image preview from the URL input.
     */
    function updateImagePreview() {
        const url = imageUrlInput.value.trim();
        clearError('imageUrl');
        if (!url || !isValidUrl(url)) {
            imagePreview.src = '/images/placeholder-product.jpg';
            if (!url) return; // Don't show error for empty field
            showError('imageUrl', 'Please enter a valid image URL.');
        } else {
            imagePreview.src = url;
        }
    }

    /**
     * Validates the entire form and displays errors.
     * @returns {boolean} - True if the form is valid, false otherwise.
     */
    function validateForm() {
        clearAllErrors();
        let isValid = true;
        
        // Name validation
        if (!nameInput.value.trim()) {
            isValid = false;
            showError('name', 'Product name is required.');
        }

        // Description validation
        if (!descInput.value.trim()) {
            isValid = false;
            showError('description', 'Description is required.');
        } else if (descInput.value.length > MAX_DESC_LENGTH) {
            isValid = false;
            showError('description', `Description must be ${MAX_DESC_LENGTH} characters or fewer.`);
        }

        // Price validation
        const price = parseFloat(priceInput.value);
        if (isNaN(price) || price <= 0) {
            isValid = false;
            showError('price', 'Please enter a valid, positive price.');
        }

        // Quantity validation
        const quantity = parseInt(qtyInput.value, 10);
        if (isNaN(quantity) || quantity < 0 || qtyInput.value.includes('.')) {
             isValid = false;
             showError('quantity', 'Please enter a valid whole number for quantity.');
        }
        
        return isValid;
    }

    function showError(field, message) {
        if (errorElements[field]) errorElements[field].textContent = message;
    }
    function clearError(field) {
        if (errorElements[field]) errorElements[field].textContent = '';
    }
    function clearAllErrors() {
        Object.values(errorElements).forEach(el => { if(el) el.textContent = ''; });
    }
    
    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;  
        }
    }
    
    function formatPrice(value) {
        const number = parseFloat(value) || 0;
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(number);
    }
    
    /**
     * Attaches all necessary event listeners.
     */
    function setupEventListeners() {
        const inputsForPreview = [nameInput, descInput, priceInput, qtyInput, categorySel, unitSel, imageUrlInput];
        inputsForPreview.forEach(el => el?.addEventListener('input', updateAllPreviews));
        
        descInput?.addEventListener('input', updateDescriptionCount);
        imageUrlInput?.addEventListener('input', updateImagePreview);

        imagePreview?.addEventListener('error', () => {
            imagePreview.src = '/images/placeholder-product.jpg';
        });

        form?.addEventListener('submit', (event) => {
            event.preventDefault();
            if (isSubmitting) return;

            if (validateForm()) {
                isSubmitting = true;
                submitBtn.disabled = true;
                submitBtn.textContent = 'Submitting...';
                form.submit(); // Perform native form submission
            } else {
                showNotification('Please correct the errors before submitting.', 'error');
            }
        });
    }

    // --- INITIALIZATION ---
    initializeForm();
    setupEventListeners();
});