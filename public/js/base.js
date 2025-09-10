document.addEventListener('DOMContentLoaded', () => {
    const allFlashMessages = document.querySelectorAll('.flash-message');

    allFlashMessages.forEach(message => {
        // Find the close button INSIDE each message
        const closeButton = message.querySelector('.flash-close');

        const dismissMessage = () => {
            message.classList.add('fade-out');
            // Remove the element from the DOM after the animation completes
            message.addEventListener('transitionend', () => message.remove());
        };

        // If a close button exists, add the click listener
        if (closeButton) {
            closeButton.addEventListener('click', dismissMessage);
        }

        // Automatically dismiss the message after 5 seconds
        setTimeout(dismissMessage, 5000);
    });
});