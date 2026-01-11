/**
 * Bootstrap Builder - Toast Notifications
 * Provides user feedback for actions and errors
 */

class ToastManager {
    constructor() {
        this.container = document.getElementById('toastContainer');
        this.toasts = [];
    }

    /**
     * Show a toast notification
     * @param {Object} options - Toast options
     * @param {string} options.title - Toast title
     * @param {string} options.message - Toast message
     * @param {string} options.type - Toast type: 'info', 'success', 'warning', 'error'
     * @param {number} options.duration - Duration in ms (default: 3000, 0 = no auto-close)
     */
    show({ title, message, type = 'info', duration = 3000 }) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const iconMap = {
            info: 'bi-info-circle',
            success: 'bi-check-circle',
            warning: 'bi-exclamation-triangle',
            error: 'bi-x-circle'
        };

        toast.innerHTML = `
            <div class="toast-icon">
                <i class="bi ${iconMap[type]}"></i>
            </div>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                ${message ? `<div class="toast-message">${message}</div>` : ''}
            </div>
            <button class="toast-close" aria-label="Close">
                <i class="bi bi-x"></i>
            </button>
        `;

        // Close button handler
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.dismiss(toast);
        });

        this.container.appendChild(toast);
        this.toasts.push(toast);

        // Auto-dismiss
        if (duration > 0) {
            setTimeout(() => this.dismiss(toast), duration);
        }

        return toast;
    }

    dismiss(toast) {
        if (!toast || !this.container.contains(toast)) return;

        toast.classList.add('toast-exit');
        setTimeout(() => {
            if (this.container.contains(toast)) {
                this.container.removeChild(toast);
            }
            this.toasts = this.toasts.filter(t => t !== toast);
        }, 300);
    }

    // Convenience methods
    info(title, message, duration) {
        return this.show({ title, message, type: 'info', duration });
    }

    success(title, message, duration) {
        return this.show({ title, message, type: 'success', duration });
    }

    warning(title, message, duration) {
        return this.show({ title, message, type: 'warning', duration });
    }

    error(title, message, duration) {
        return this.show({ title, message, type: 'error', duration });
    }

    // Clear all toasts
    clear() {
        this.toasts.forEach(toast => this.dismiss(toast));
    }
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.toast = new ToastManager();
});
