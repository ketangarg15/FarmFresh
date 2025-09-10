// public/js/orders.js

document.addEventListener('DOMContentLoaded', () => {
    // ---ELEMENTS---
    const ordersList = document.getElementById('ordersList');
    const searchInput = document.getElementById('ordersSearch');
    const statusFilter = document.getElementById('statusFilter');
    const sortFilter = document.getElementById('sortFilter');
    const clearFiltersBtn = document.getElementById('clearFilters');

    // Use a centralized notification utility if available.
    const showNotification = window.utils?.showNotification || ((msg, type) => console.log(`${type}: ${msg}`));

    // ---STATE---
    let searchTimeout;

    // ---FUNCTIONS---

    /**
     * Applies all current filter, sort, and search criteria to the list of orders.
     */
    function applyFilters() {
        const searchTerm = searchInput?.value.toLowerCase().trim() || '';
        const status = statusFilter?.value || 'all';
        const sortBy = sortFilter?.value || 'newest';

        const allItems = Array.from(ordersList.children);

        // 1. Filter items based on search and status
        const visibleItems = allItems.filter(item => {
            const itemStatus = item.dataset.status;
            const itemText = item.dataset.searchText || item.textContent.toLowerCase();
            const matchesSearch = !searchTerm || itemText.includes(searchTerm);
            const matchesStatus = status === 'all' || itemStatus === status;
            const shouldShow = matchesSearch && matchesStatus;
            item.style.display = shouldShow ? '' : 'none';
            return shouldShow;
        });

        // 2. Sort the filtered items
        visibleItems.sort((a, b) => {
            switch (sortBy) {
                case 'oldest': return new Date(a.dataset.date) - new Date(b.dataset.date);
                case 'amount-high': return parseFloat(b.dataset.amount) - parseFloat(a.dataset.amount);
                case 'amount-low': return parseFloat(a.dataset.amount) - parseFloat(b.dataset.amount);
                case 'newest':
                default:
                    return new Date(b.dataset.date) - new Date(a.dataset.date);
            }
        });

        // 3. Re-append sorted items to the DOM
        visibleItems.forEach(item => ordersList.appendChild(item));

        updateEmptyState(visibleItems.length);
        updateStatistics(visibleItems);
    }

    /**
     * Toggles the visibility of an order's detail section.
     */
    function toggleOrderDetails(orderItem) {
        const details = orderItem.querySelector('.orders-item-details');
        const toggleBtn = orderItem.querySelector('.orders-toggle-btn');
        if (!details || !toggleBtn) return;

        const isVisible = !details.hidden;
        details.hidden = isVisible;
        toggleBtn.setAttribute('aria-expanded', !isVisible);
    }
    
    /**
     * Updates the summary statistics based on the currently visible orders.
     */
    function updateStatistics(visibleOrders) {
        const totalSpan = document.getElementById('totalOrders');
        const pendingSpan = document.getElementById('pendingOrders');
        const deliveredSpan = document.getElementById('deliveredOrders');

        if(totalSpan) totalSpan.textContent = visibleOrders.length;
        if(pendingSpan) pendingSpan.textContent = visibleOrders.filter(item => item.dataset.status === 'pending').length;
        if(deliveredSpan) deliveredSpan.textContent = visibleOrders.filter(item => item.dataset.status === 'delivered').length;
    }
    
    /**
     * Shows or hides the "No orders found" message.
     */
    function updateEmptyState(visibleCount) {
        const emptyState = document.querySelector('.orders-empty-state');
        if(emptyState) emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    }
    
    /**
     * Handles clicks on action buttons within an order item using event delegation.
     */
    async function handleOrderAction(event) {
        const button = event.target.closest('button');
        if (!button) return;

        const orderItem = button.closest('.orders-item');
        const orderId = orderItem?.dataset.orderId;

        if (button.matches('.orders-toggle-btn')) {
            toggleOrderDetails(orderItem);
        } else if (button.matches('.cancel-btn')) {
            await cancelOrder(orderId, orderItem, button);
        } else if (button.matches('.reorder-btn')) {
            await reorderItems(orderId, button);
        }
    }

    /**
     * Cancels an order via an API call and updates the UI.
     */
    async function cancelOrder(orderId, orderItem, button) {
        if (!confirm('Are you sure you want to cancel this order?')) return;
        
        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = 'Cancelling...';

        try {
            const response = await fetch(`/orders/${orderId}/cancel`, { method: 'POST' });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to cancel order.');

            const statusBadge = orderItem.querySelector('.orders-status-badge');
            statusBadge.textContent = 'Cancelled';
            statusBadge.className = 'orders-status-badge orders-status-cancelled';
            orderItem.dataset.status = 'cancelled';
            button.remove(); // Remove the button as the action is complete
            showNotification('Order cancelled successfully.', 'success');
            applyFilters(); // Re-apply filters to update statistics
        } catch (error) {
            showNotification(error.message, 'error');
            button.disabled = false;
            button.textContent = originalText;
        }
    }

    /**
     * Adds items from a previous order to the cart.
     */
    async function reorderItems(orderId, button) {
        if (!confirm('Add all items from this order to your cart?')) return;

        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = 'Adding...';

        try {
            const response = await fetch(`/orders/${orderId}/reorder`, { method: 'POST' });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to reorder items.');

            showNotification('Items added to cart!', 'success');
            if (confirm('Items added. View your cart now?')) {
                window.location.href = '/cart';
            }
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            button.disabled = false;
            button.textContent = originalText;
        }
    }


    // ---EVENT LISTENERS SETUP---

    // Listen for all clicks within the orders list for efficient event handling.
    ordersList?.addEventListener('click', handleOrderAction);

    // Filters and Search
    [statusFilter, sortFilter].forEach(el => el?.addEventListener('change', () => {
        localStorage.setItem(el.id, el.value); // Persist selection
        applyFilters();
    }));

    searchInput?.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(applyFilters, 300); // Debounce search input
    });

    clearFiltersBtn?.addEventListener('click', () => {
        if(searchInput) searchInput.value = '';
        if(statusFilter) statusFilter.value = 'all';
        if(sortFilter) sortFilter.value = 'newest';
        localStorage.removeItem('statusFilter');
        localStorage.removeItem('sortFilter');
        applyFilters();
    });
    
    // ---INITIALIZATION---
    
    // Load persisted filter values from localStorage
    if (statusFilter) statusFilter.value = localStorage.getItem('statusFilter') || 'all';
    if (sortFilter) sortFilter.value = localStorage.getItem('sortFilter') || 'newest';

    applyFilters(); // Apply initial filters on page load
});