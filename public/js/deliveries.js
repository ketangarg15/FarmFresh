document.addEventListener('DOMContentLoaded', () => {
    // A single, comprehensive initialization function.
    initializeDeliveryManagement();
});

function initializeDeliveryManagement() {
    // --- STATE AND CONSTANTS ---
    const deliveriesTable = document.getElementById('deliveriesTable');
    const cardsContainer = document.getElementById('cardsView');
    const statusUpdateModal = document.getElementById('statusUpdateModal');
    let isSubmitting = false; // Prevents duplicate form submissions.

    // Use a centralized notification utility if available.
    const showToast = window.utils?.showNotification || console.log;

    // --- CORE LOGIC ---

    /**
     * Shows the status update modal with pre-filled data.
     */
    function showStatusUpdateModal(deliveryId, currentStatus) {
        if (!statusUpdateModal) return;
        statusUpdateModal.querySelector('#updateDeliveryId').value = deliveryId;
        const statusSelect = statusUpdateModal.querySelector('#newStatus');
        statusSelect.value = currentStatus;
        // Disable the current status to prevent redundant updates.
        Array.from(statusSelect.options).forEach(opt => {
            opt.disabled = (opt.value === currentStatus);
        });
        statusUpdateModal.style.display = 'flex';
        statusSelect.focus();
    }

    /**
     * Hides and resets the status update modal.
     */
    function hideStatusUpdateModal() {
        if (!statusUpdateModal) return;
        statusUpdateModal.style.display = 'none';
        statusUpdateModal.querySelector('#statusUpdateForm')?.reset();
    }

    /**
     * Handles the submission of the status update form.
     */
    async function handleStatusUpdateSubmit(event) {
        event.preventDefault();
        if (isSubmitting) return;

        const form = event.target;
        const deliveryId = form.querySelector('#updateDeliveryId').value;
        const status = form.querySelector('#newStatus').value;
        const submitBtn = form.querySelector('#updateStatusSubmit');
        const originalBtnText = submitBtn.textContent;

        isSubmitting = true;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Updating...';

        try {
            // Using a generic API call function would be ideal here.
            await updateDeliveryAPI(deliveryId, { status });
            applyStatusToDom(deliveryId, status);
            showToast('Status updated successfully!', 'success');
            hideStatusUpdateModal();
        } catch (error) {
            showToast(error.message || 'Failed to update status.', 'error');
        } finally {
            isSubmitting = false;
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    }
    
    /**
     * A placeholder for the actual API call to update delivery status.
     */
    async function updateDeliveryAPI(deliveryId, data) {
        // In a real app, this would be a fetch call.
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (deliveryId) {
                    resolve({ success: true, status: data.status });
                } else {
                    reject(new Error("Invalid delivery ID."));
                }
            }, 500);
        });
    }

    /**
     * Updates the status badge on the page for a given delivery.
     */
    function applyStatusToDom(deliveryId, newStatus) {
        const formattedStatus = newStatus.replace(/_/g, ' ').replace(/\b\w/g, s => s.toUpperCase());
        document.querySelectorAll(`[data-delivery-id="${deliveryId}"]`).forEach(el => {
            el.dataset.status = newStatus;
            const badge = el.querySelector('.status-badge, .card-status-badge');
            if (badge) badge.textContent = formattedStatus;
        });
    }
    
    /**
     * Handles clicks on actions within the table or cards view (Update, Track).
     */
    function handleActionClick(event) {
        const button = event.target.closest('button.update-btn, button.track-btn');
        if (!button) return;

        const itemElement = button.closest('[data-delivery-id]');
        const deliveryId = itemElement?.dataset.deliveryId;
        const currentStatus = itemElement?.dataset.status;
        
        if (button.classList.contains('update-btn')) {
            showStatusUpdateModal(deliveryId, currentStatus);
        } else if (button.classList.contains('track-btn')) {
            window.open(`/deliveries/${deliveryId}/track`, '_blank');
        }
    }


    // --- EVENT LISTENERS ---

    // Set up all event listeners for the page.
    function setupEventListeners() {
        // Delegated listeners for dynamic content.
        deliveriesTable?.addEventListener('click', handleActionClick);
        cardsContainer?.addEventListener('click', handleActionClick);

        // Modal listeners.
        statusUpdateModal?.addEventListener('click', (e) => {
            if (e.target === statusUpdateModal || e.target.closest('.modal-close')) {
                hideStatusUpdateModal();
            }
        });
        document.getElementById('statusUpdateForm')?.addEventListener('submit', handleStatusUpdateSubmit);
    }

    // Initialize everything.
    setupEventListeners();
}