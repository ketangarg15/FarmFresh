/* public/js/home.js */

(function () {
  'use strict';

  // --- HELPERS ---
  const qs = (selector, context = document) => context.querySelector(selector);
  const qsa = (selector, context = document) => Array.from(context.querySelectorAll(selector));


  // --- MOBILE NAVIGATION ---
  function setupMobileNav() {
    const navToggle = qs('.home-nav-toggle');
    const navLinks = qs('.home-nav-links');

    if (!navToggle || !navLinks) return;

    const toggleNav = (forceClose = false) => {
      const isOpen = navLinks.classList.contains('mobile-open') && !forceClose;
      navLinks.classList.toggle('mobile-open', !isOpen);
      navToggle.classList.toggle('is-open', !isOpen);
      navToggle.setAttribute('aria-expanded', String(!isOpen));
    };

    navToggle.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent document click handler from closing it immediately
      toggleNav();
    });

    // Close nav when clicking outside of it
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target)) {
        toggleNav(true); // Force close
      }
    });
  }


  // --- LAZY IMAGE LOADING ---
  function setupLazyLoading() {
    const lazyImages = qsa('img.lazy-load');
    if (!lazyImages.length) return;

    // Use IntersectionObserver for efficient loading as images enter the viewport
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
            img.removeAttribute('data-src');
            obs.unobserve(img);
          }
        });
      }, { rootMargin: '150px' }); // Load images when they are 150px from the viewport

      lazyImages.forEach(img => observer.observe(img));
    } else {
      // Fallback for older browsers
      lazyImages.forEach(img => {
        img.src = img.dataset.src;
        img.classList.add('loaded');
      });
    }
  }


  // --- SMOOTH SCROLLING ---
  function setupSmoothScrolling() {
    // This JS-based smooth scroll is kept for compatibility and control.
    // A simpler CSS-only approach is `html { scroll-behavior: smooth; }`
    const scrollToTarget = (targetEl) => {
        if(!targetEl) return;
        const headerOffset = qs('.home-header')?.offsetHeight || 0;
        const targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    };
    
    // Attach to CTA button
    const ctaButton = qs('.cta-button'); // Assuming a CTA button exists
    ctaButton?.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToTarget(qs('#products'));
    });

    // Attach to logo
    const logo = qs('.home-nav-brand h1');
    logo?.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  // --- DYNAMIC ANIMATIONS ---
  function setupScrollAnimations() {
    // Parallax effect for the hero section
    const hero = qs('.home-hero');
    if (hero) {
      window.addEventListener('scroll', () => {
        const offset = window.pageYOffset;
        hero.style.transform = `translateY(${offset * 0.1}px)`;
      }, { passive: true });
    }

    // Staggered entry animation for product cards
    const productCards = qsa('.home-product-card');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        productCards.forEach(card => observer.observe(card));
    }
  }

  
  // --- INITIALIZATION ---
  document.addEventListener('DOMContentLoaded', () => {
    setupMobileNav();
    setupLazyLoading();
    setupSmoothScrolling();
    setupScrollAnimations();
  });

})();