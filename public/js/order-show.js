// public/js/order-show.js

document.addEventListener('DOMContentLoaded', function() {
    // ---ELEMENTS---
    const cancelOrderBtn = document.getElementById('cancelOrderBtn');
    const reorderBtn = document.getElementById('reorderBtn');
    const orderIdElement = document.querySelector('.receipt-order-id');

    // Use a centralized notification utility if available, otherwise fallback to console logging.
    const showNotification = window.utils?.showNotification || ((msg, type) => console.log(`${type}: ${msg}`));

    // ---EVENT LISTENERS---

    if (cancelOrderBtn) {
        cancelOrderBtn.addEventListener('click', function() {
            cancelOrder(this.dataset.orderId);
        });
    }

    if (reorderBtn) {
        reorderBtn.addEventListener('click', function() {
            reorderItems(this.dataset.orderId);
        });
    }

    if (orderIdElement) {
        orderIdElement.style.cursor = 'pointer';
        orderIdElement.title = 'Click to copy order ID';
        orderIdElement.addEventListener('click', copyOrderId);
    }
    
    // Setup print functionality
    document.querySelectorAll('.order-action-print').forEach(button => {
        button.addEventListener('click', () => {
            document.body.classList.add('printing-active');
            window.print();
        });
    });
    // More reliable way to remove print class
    window.addEventListener('afterprint', () => {
        document.body.classList.remove('printing-active');
    });


    // ---FUNCTIONS---

    /**
     * Handles the order cancellation process, including confirmation and API call.
     * @param {string} orderId The ID of the order to cancel.
     */
    async function cancelOrder(orderId) {
        const confirmMessage = `Are you sure you want to cancel Order #${orderId.slice(-8).toUpperCase()}?\n\nThis action cannot be undone.`;
        if (!confirm(confirmMessage)) {
            return;
        }

        let originalText = '';
        if (cancelOrderBtn) {
            originalText = cancelOrderBtn.innerHTML;
            cancelOrderBtn.innerHTML = '⏳ Cancelling...';
            cancelOrderBtn.disabled = true;
        }

        try {
            const response = await fetch(`/orders/${orderId}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: 'Customer requested cancellation' })
            });

            const data = await response.json();
            if (!response.ok) {
                // Throw an error with the message from the server's JSON response.
                throw new Error(data.message || 'Server responded with an error.');
            }

            updateOrderStatus('Cancelled');
            showNotification('Order successfully cancelled.', 'success');
            if (cancelOrderBtn) {
                cancelOrderBtn.style.display = 'none';
            }
        } catch (error) {
            console.error('Cancellation Error:', error);
            showNotification(error.message || 'Could not cancel order. Please try again.', 'error');
        } finally {
            // Restore button state only if it's still disabled (i.e., not hidden).
            if (cancelOrderBtn && cancelOrderBtn.disabled) {
                cancelOrderBtn.innerHTML = originalText;
                cancelOrderBtn.disabled = false;
            }
        }
    }

    /**
     * Handles adding all items from a previous order to the current cart.
     * @param {string} orderId The ID of the order to reorder from.
     */
    async function reorderItems(orderId) {
        if (!confirm('Add all items from this order to your cart?')) {
            return;
        }

        let originalText = '';
        if (reorderBtn) {
            originalText = reorderBtn.innerHTML;
            reorderBtn.innerHTML = '⏳ Adding...';
            reorderBtn.disabled = true;
        }

        try {
            const response = await fetch(`/orders/${orderId}/reorder`, {
                method: 'POST'
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Server responded with an error.');
            }

            showNotification(`${data.itemsAdded || 'Items'} added to your cart!`, 'success');
            updateCartCount(data.cartCount);

            if (confirm('Items added! Would you like to view your cart now?')) {
                window.location.href = '/cart';
            }
        } catch (error) {
            console.error('Reorder Error:', error);
            showNotification(error.message || 'Could not reorder items. Please try again.', 'error');
        } finally {
            if (reorderBtn) {
                reorderBtn.innerHTML = originalText;
                reorderBtn.disabled = false;
            }
        }
    }

    /**
     * Copies the order ID from the UI to the clipboard.
     */
    async function copyOrderId() {
        const orderIdText = this.textContent.replace('Order #', '').trim();
        try {
            await navigator.clipboard.writeText(orderIdText);
            showNotification('Order ID copied to clipboard!', 'success', 2000);
        } catch (err) {
            console.warn('Clipboard API failed, using fallback.', err);
            // Fallback for older browsers or insecure contexts
            const textArea = document.createElement('textarea');
            textArea.value = orderIdText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showNotification('Order ID copied to clipboard!', 'success', 2000);
        }
    }

    /**
     * Updates the order status badge and page title.
     * @param {string} newStatus The new status to display.
     */
    function updateOrderStatus(newStatus) {
        const statusBadge = document.querySelector('.receipt-status-badge');
        const formattedStatus = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
        if (statusBadge) {
            statusBadge.textContent = formattedStatus;
            statusBadge.className = `receipt-status-badge receipt-status-${newStatus.toLowerCase()}`;
        }
        document.title = document.title.replace(/- \w+/, `- ${formattedStatus}`);
    }

    /**
     * Updates the cart count indicator in the site's navigation.
     * @param {number} count The new total number of items in the cart.
     */
    function updateCartCount(count) {
        if (typeof count === 'undefined') return;
        document.querySelectorAll('.cart-count, [data-cart-count]').forEach(el => {
            el.textContent = count;
            el.style.display = count > 0 ? 'inline' : 'none';
        });
    }
});