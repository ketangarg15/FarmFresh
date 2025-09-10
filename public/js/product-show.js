// public/js/product.js

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTS & CONFIG ---
    const root = document.getElementById('product');
    if (!root) return;

    const quantityInput = document.getElementById('quantity');
    const decreaseBtn = document.getElementById('decreaseQty');
    const increaseBtn = document.getElementById('increaseQty');
    const orderForm = document.getElementById('orderForm');
    const orderBtn = document.getElementById('orderBtn');
    const totalPriceSpan = document.getElementById('totalPrice');
    const mainImage = document.getElementById('mainProductImage');
    const thumbnailContainer = document.getElementById('productThumbnails');

    let product;

    // --- INITIALIZATION ---

    /**
     * Main function to initialize the entire product page functionality.
     */
    function initialize() {
        try {
            product = JSON.parse(root.dataset.product || '{}');
        } catch (err)
        {
            console.error('Failed to parse product data', err);
            product = {}; // Gracefully fail
        }

        const maxQuantity = Math.max(0, parseInt(product.quantity, 10) || 0);

        // If the product is out of stock, disable all interactions.
        if (maxQuantity === 0) {
            handleOutOfStock();
            return;
        }
        
        setupEventListeners(maxQuantity);
        
        // Set initial quantity based on input value or default to 1.
        const initialQuantity = clamp(parseInt(quantityInput?.value, 10) || 1, 1, maxQuantity);
        setQuantity(initialQuantity, { animate: false, max: maxQuantity });
    }

    /**
     * Sets up all event listeners for the page.
     * @param {number} maxQuantity - The maximum available quantity for the product.
     */
    function setupEventListeners(maxQuantity) {
        decreaseBtn?.addEventListener('click', () => {
            const currentVal = parseInt(quantityInput?.value, 10) || 1;
            setQuantity(currentVal - 1, { max: maxQuantity });
        });

        increaseBtn?.addEventListener('click', () => {
            const currentVal = parseInt(quantityInput?.value, 10) || 1;
            setQuantity(currentVal + 1, { max: maxQuantity });
        });

        quantityInput?.addEventListener('input', () => {
            const val = parseInt(quantityInput.value, 10) || 1;
            setQuantity(val, { animate: false, max: maxQuantity });
        });

        // Event delegation for thumbnails
        thumbnailContainer?.addEventListener('click', (event) => {
            const thumbnail = event.target.closest('.product-thumbnail');
            if (thumbnail && thumbnail.dataset.src) {
                changeMainImage(thumbnail.dataset.src);
            }
        });

        orderForm?.addEventListener('submit', handleFormSubmit);
    }

    // --- CORE FUNCTIONS ---

    /**
     * Sets the quantity, updates UI elements, and clamps the value within valid bounds.
     * @param {number} newQuantity - The new quantity to set.
     * @param {object} options - Configuration options.
     * @param {boolean} options.animate - Whether to animate the change.
     * @param {number} options.max - The maximum allowed quantity.
     */
    function setQuantity(newQuantity, { animate = true, max = 1 } = {}) {
        const clampedQuantity = clamp(newQuantity, 1, max);

        if (quantityInput) quantityInput.value = clampedQuantity;
        
        updateButtonStates(clampedQuantity, max);
        updateTotalPrice(clampedQuantity);
        
        if (animate && quantityInput) {
            quantityInput.animate([{ transform: 'scale(1.1)' }, { transform: 'scale(1)' }], {
                duration: 180,
                easing: 'ease-in-out'
            });
        }
    }

    /**
     * Updates the disabled state of the quantity buttons.
     */
    function updateButtonStates(quantity, maxQuantity) {
        if (decreaseBtn) decreaseBtn.disabled = (quantity <= 1);
        if (increaseBtn) increaseBtn.disabled = (quantity >= maxQuantity);
    }
    
    /**
     * Calculates and displays the total price based on quantity.
     */
    function updateTotalPrice(quantity) {
        if (!totalPriceSpan || !product.price) return;
        const total = (parseFloat(product.price) * quantity);
        totalPriceSpan.textContent = formatPrice(total);
    }

    /**
     * Changes the main product image and updates the active thumbnail.
     * @param {string} imageSrc - The source URL of the new image.
     */
    function changeMainImage(imageSrc) {
        if (mainImage) mainImage.src = imageSrc;
        thumbnailContainer?.querySelectorAll('.product-thumbnail').forEach(thumb => {
            thumb.classList.toggle('active', thumb.dataset.src === imageSrc);
        });
    }

    /**
     * Handles the form submission, including confirmation and disabling the button.
     */
    function handleFormSubmit(event) {
        event.preventDefault();
        const quantity = parseInt(quantityInput?.value, 10) || 1;
        const total = (parseFloat(product.price) * quantity);
        const productName = product.name || 'product';

        const confirmationMessage = `Add ${quantity} ${productName}${quantity > 1 ? 's' : ''} to your cart for ${formatPrice(total, true)}?`;

        if (window.confirm(confirmationMessage)) {
            if (orderBtn) {
                orderBtn.disabled = true;
                orderBtn.textContent = 'Adding to Cart...';
            }
            // Proceed with native form submission.
            orderForm.submit();
        }
    }

    /**
     * Disables form controls when a product is out of stock.
     */
    function handleOutOfStock() {
        if (quantityInput) quantityInput.value = 0;
        if (orderBtn) {
            orderBtn.disabled = true;
            orderBtn.textContent = 'Out of Stock';
        }
        if (decreaseBtn) decreaseBtn.disabled = true;
        if (increaseBtn) increaseBtn.disabled = true;
    }


    // --- HELPERS ---
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const formatPrice = (value, includeSymbol = false) => {
        const formatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(value);
        return includeSymbol ? formatted : formatted.replace('$', '');
    };
    
    // --- START ---
    initialize();
});