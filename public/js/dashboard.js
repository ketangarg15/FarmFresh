// public/js/dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
});

/**
 * Main function to set up all dashboard functionalities.
 */
function initializeDashboard() {
    initializeExpandableCards();
    initializeLiveMetrics();
    initializeLoadingStates();
    initializeInteractions();
    startPeriodicUpdates();
    setupGlobalEventListeners();
}

/**
 * Initializes expand/collapse functionality for dashboard cards.
 */
function initializeExpandableCards() {
    const expandableCards = document.querySelectorAll('.dashboard-card.expandable');
    expandableCards.forEach(card => {
        const expandBtn = card.querySelector('.card-expand-btn');
        if (expandBtn) {
            // Delegate click to the card, but stop propagation on the button itself
            // to avoid toggling twice if the button is inside the clickable area.
            expandBtn.addEventListener('click', e => {
                e.stopPropagation();
                toggleCard(card);
            });
            card.addEventListener('click', () => toggleCard(card));
        }
    });
}

/**
 * Toggles the expanded/collapsed state of a card.
 * @param {HTMLElement} card The card element to toggle.
 */
function toggleCard(card) {
    const isExpanded = card.classList.toggle('expanded');
    const expandBtn = card.querySelector('.card-expand-btn');
    if (expandBtn) {
        expandBtn.textContent = isExpanded ? '▲' : '▼';
        expandBtn.setAttribute('aria-label', isExpanded ? 'Collapse card' : 'Expand card');
    }
}

/**
 * Initializes animated counters and sets up real-time metric updates.
 */
function initializeLiveMetrics() {
    document.querySelectorAll('.stats-number').forEach(counter => {
        const target = parseInt(counter.dataset.value || counter.textContent, 10) || 0;
        counter.textContent = '0'; // Start from 0
        animateValueChange(counter, 0, target, 2000);
    });
    // In a real app, you might connect to a WebSocket here.
}

/**
 * Animates a number change for a given element.
 * @param {HTMLElement} element The element whose textContent will be animated.
 * @param {number} from The starting number.
 * @param {number} to The target number.
 * @param {number} duration The animation duration in milliseconds.
 */
function animateValueChange(element, from, to, duration = 1000) {
    const startTime = performance.now();
    const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentValue = Math.floor(from + (to - from) * progress);
        element.textContent = currentValue.toLocaleString('en-US'); // Format with commas

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            element.textContent = to.toLocaleString('en-US');
        }
    };
    requestAnimationFrame(animate);
}

/**
 * Updates metrics on the dashboard with new data.
 * @param {object} data An object containing new metric values.
 */
function updateMetrics(data) {
    for (const key in data) {
        const element = document.getElementById(key);
        if (element) {
            const currentValue = parseInt(element.textContent.replace(/,/g, ''), 10) || 0;
            const newValue = data[key];

            if (currentValue !== newValue) {
                animateValueChange(element, currentValue, newValue);
                // Update change indicator if it exists
                const changeElement = element.closest('.stats-card')?.querySelector('.stats-change');
                if (changeElement) {
                    updateChangeIndicator(changeElement, currentValue, newValue);
                }
            }
        }
    }
}

/**
 * Updates the percentage change indicator.
 */
function updateChangeIndicator(element, oldValue, newValue) {
    const change = newValue - oldValue;
    if (oldValue === 0) { // Avoid division by zero
        element.textContent = 'New';
        element.className = 'stats-change positive';
        return;
    }
    const percentage = ((change / oldValue) * 100).toFixed(1);
    element.classList.remove('positive', 'negative');

    if (change > 0) {
        element.classList.add('positive');
        element.textContent = `+${percentage}%`;
    } else if (change < 0) {
        element.classList.add('negative');
        element.textContent = `${percentage}%`;
    } else {
        element.textContent = 'No change';
    }
}

/**
 * Hides loading skeletons after a simulated delay.
 */
function initializeLoadingStates() {
    // In a real app, this would be tied to the initial data fetch.
    setTimeout(() => {
        document.querySelectorAll('.loading-skeleton').forEach(el => {
            el.classList.remove('loading-skeleton');
        });
    }, 1500);
}

/**
 * Initializes UI interactions using CSS classes instead of inline styles.
 */
function initializeInteractions() {
    // These interactions are now better handled by CSS pseudo-classes
    // like :hover and :active for performance and separation of concerns.
    // This function is kept for clarity or for more complex JS-driven interactions.
}

/**
 * Starts periodic data refreshes and timestamp updates.
 */
function startPeriodicUpdates() {
    updateTimestamps();
    setInterval(updateTimestamps, 60000); // Update "time ago" every minute
    setInterval(refreshDashboardData, 300000); // Refresh data every 5 minutes
}

/**
 * Updates all elements with a `data-timestamp` attribute to show relative time.
 */
function updateTimestamps() {
    document.querySelectorAll('[data-timestamp]').forEach(el => {
        const timestamp = el.getAttribute('data-timestamp');
        const date = new Date(timestamp);
        el.textContent = formatTimeAgo(date);
    });
}

function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)} years ago`;
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)} months ago`;
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)} days ago`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)} hours ago`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)} minutes ago`;
    return 'Just now';
}

/**
 * Fetches fresh dashboard data and updates the UI.
 */
async function refreshDashboardData() {
    try {
        // Use a real fetch function if it exists, otherwise use the stub.
        const data = await (window.dashboardUtils?.fetchDashboardMetrics || fetchDashboardMetrics)();
        updateMetrics(data);
        // Use the centralized notification utility.
        window.utils?.showNotification('Dashboard updated', 'success');
    } catch (error) {
        console.error('Failed to refresh dashboard:', error);
        window.utils?.showNotification('Failed to update dashboard', 'error');
    }
}

/**
 * API Fetch stub for dashboard metrics.
 */
async function fetchDashboardMetrics() {
    // This is a mock/stub. In a real application, this would fetch from a live endpoint.
    console.log("Fetching mock dashboard metrics...");
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                totalListings: Math.floor(Math.random() * 100) + 50,
                pendingOrders: Math.floor(Math.random() * 20) + 5,
                totalUsers: Math.floor(Math.random() * 1000) + 500,
                totalOrders: Math.floor(Math.random() * 500) + 200
            });
        }, 800);
    });
}

/**
 * Sets up global event listeners for page visibility and online/offline status.
 */
function setupGlobalEventListeners() {
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            refreshDashboardData();
        }
    });

    window.addEventListener('online', () => {
        window.utils?.showNotification('Connection restored', 'success');
        refreshDashboardData();
    });

    window.addEventListener('offline', () => {
        window.utils?.showNotification('You are offline', 'warning');
    });
}