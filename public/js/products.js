document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ===============================================
    // DOM Element Selections
    // ===============================================
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const productsGrid = document.getElementById('productsGrid');
    const productCards = document.querySelectorAll('.products-card');
    const searchForm = document.querySelector('.products-search-form');
    const emptyState = document.querySelector('.products-empty');

    // ===============================================
    // Utility Functions
    // ===============================================
    // Debounce function to improve performance on input events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // ===============================================
    // Core Filtering Logic
    // ===============================================
    function filterProducts() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedCategory = categoryFilter.value.toLowerCase();
        let visibleCount = 0;

        productCards.forEach(card => {
            const productName = card.getAttribute('data-name') || '';
            const productCategory = card.getAttribute('data-category') || '';

            const matchesSearch = !searchTerm || productName.includes(searchTerm);
            const matchesCategory = !selectedCategory || productCategory.toLowerCase() === selectedCategory;

            if (matchesSearch && matchesCategory) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        updateEmptyState(visibleCount);
        updateURL(searchTerm, selectedCategory);
    }

    function updateEmptyState(visibleCount) {
        if (emptyState) {
            if (visibleCount === 0 && productCards.length > 0) {
                emptyState.style.display = 'block';
            } else {
                emptyState.style.display = 'none';
            }
        }
    }

    function updateURL(searchTerm, category) {
        if (history.pushState) {
            const url = new URL(window.location);
            if (searchTerm) {
                url.searchParams.set('q', searchTerm);
            } else {
                url.searchParams.delete('q');
            }
            if (category) {
                url.searchParams.set('category', category);
            } else {
                url.searchParams.delete('category');
            }
            if (url.toString() !== window.location.toString()) {
                history.pushState(null, '', url.toString());
            }
        }
    }
    
    window.clearFilters = function() {
        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = '';
        filterProducts();
    };

    // ===============================================
    // Event Listeners
    // ===============================================
    const debouncedFilter = debounce(filterProducts, 300);

    if (searchInput) {
        searchInput.addEventListener('input', debouncedFilter);
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                filterProducts();
            }
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProducts);
    }
    
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            filterProducts();
        });
    }
    
    // Add loading states for order buttons
    const orderForms = document.querySelectorAll('.products-order-form');
    orderForms.forEach(form => {
        form.addEventListener('submit', function() {
            const button = form.querySelector('.products-btn-order');
            if (button) {
                button.textContent = 'Adding...';
                button.disabled = true;
                setTimeout(() => {
                    button.textContent = 'Add to Cart';
                    button.disabled = false;
                }, 3000);
            }
        });
    });

    // ===============================================
    // Animations & Accessibility
    // ===============================================
    function animateCards() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });

        productCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
    }
    animateCards();

    // Add keyboard navigation support (from second script)
    if (searchInput) {
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                searchInput.focus();
                searchInput.select();
            }
            if (e.key === 'Escape' && document.activeElement === searchInput) {
                searchInput.value = '';
                debouncedFilter();
            }
        });
    }
    
    // Accessibility: allow Enter on focused cards to open details
    productCards.forEach(card=>{
        card.setAttribute('tabindex','0');
        card.addEventListener('keydown', (e)=>{
            if(e.key === 'Enter'){
                const link = card.querySelector('.products-btn-view');
                if(link) window.location.href = link.href;
            }
        });
    });
});