document.addEventListener('DOMContentLoaded', () => {
    initializeAuth();
});

/**
 * Initializes all authentication-related functionalities on the page.
 */
function initializeAuth() {
    initializePasswordToggle();
    initializeFormValidation();
}

/**
 * Adds click event listeners to all password visibility toggles. 👁️
 */
function initializePasswordToggle() {
    document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.setAttribute('aria-label', 'Show or hide password');
        toggle.addEventListener('click', () => {
            const input = toggle.previousElementSibling;
            if (!input || input.tagName !== 'INPUT') return;

            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            toggle.textContent = isPassword ? '🙈' : '👁️';
        });
    });
}

/**
 * Sets up client-side form validation using native browser capabilities.
 */
function initializeFormValidation() {
    document.querySelectorAll('.auth-form').forEach(form => {
        // Disable native browser validation popups to use our custom UI.
        form.setAttribute('novalidate', true);

        form.addEventListener('submit', event => {
            // Clear any existing errors before re-validating.
            clearFormErrors(form);

            if (!form.checkValidity()) {
                event.preventDefault(); // Stop form submission.
                // Find all invalid fields and display a specific error for each.
                form.querySelectorAll(':invalid').forEach(field => {
                    // Use the browser's built-in validation message for accuracy.
                    showFieldError(field, field.validationMessage);
                });
            }
        });
    });
}

/**
 * Displays a validation error message for a specific input field.
 * @param {HTMLInputElement} input The input field with the error.
 * @param {string} message The error message to display.
 */
function showFieldError(input, message) {
    const group = input.closest('.form-group');
    if (!group) return;

    // Create the error message element if it doesn't exist.
    let error = group.querySelector('.error-message');
    if (!error) {
        error = document.createElement('div');
        error.className = 'error-message';
        // Assign a unique ID for accessibility.
        error.id = `${input.id}-error`;
        group.appendChild(error);
    }

    // Display the message and link it to the input for screen readers.
    error.textContent = message;
    input.setAttribute('aria-describedby', error.id);
    input.setAttribute('aria-invalid', 'true');
}

/**
 * Removes all validation error messages and accessibility attributes from a form.
 * @param {HTMLFormElement} form The form to clear errors from.
 */
function clearFormErrors(form) {
    // Remove the error message elements.
    form.querySelectorAll('.error-message').forEach(error => error.remove());

    // Reset accessibility attributes on all relevant inputs.
    form.querySelectorAll('[aria-invalid]').forEach(input => {
        input.removeAttribute('aria-invalid');
        input.removeAttribute('aria-describedby');
    });
}