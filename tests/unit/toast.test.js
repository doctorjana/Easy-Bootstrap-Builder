/**
 * Unit Tests for ToastManager Class
 * Tests toast notification creation, display, and dismissal
 */

// Load ToastManager via setup helper
loadScript('toast.js');

describe('ToastManager', () => {
    let toastManager;
    let container;

    beforeEach(() => {
        container = document.getElementById('toastContainer');
        toastManager = new ToastManager();
    });

    describe('constructor', () => {
        test('should initialize with container reference', () => {
            expect(toastManager.container).toBe(container);
        });

        test('should initialize with empty toasts array', () => {
            expect(toastManager.toasts).toEqual([]);
        });
    });

    describe('show', () => {
        test('should create toast element with correct class', () => {
            toastManager.show({ title: 'Test', message: 'Message', type: 'info' });

            const toast = container.querySelector('.toast');
            expect(toast).not.toBeNull();
            expect(toast.classList.contains('toast-info')).toBe(true);
        });

        test('should create toast with title when provided', () => {
            toastManager.show({ title: 'My Title', message: 'Content' });

            expect(container.innerHTML).toContain('My Title');
        });

        test('should create toast with message when provided', () => {
            toastManager.show({ title: 'Title', message: 'My Message' });

            expect(container.innerHTML).toContain('My Message');
        });

        test('should handle missing title gracefully', () => {
            toastManager.show({ message: 'Just a message' });

            expect(container.innerHTML).toContain('Just a message');
        });

        test('should add correct icon for info type', () => {
            toastManager.show({ title: 'Info', type: 'info' });

            expect(container.innerHTML).toContain('bi-info-circle');
        });

        test('should add correct icon for success type', () => {
            toastManager.show({ title: 'Success', type: 'success' });

            expect(container.innerHTML).toContain('bi-check-circle');
        });

        test('should add correct icon for warning type', () => {
            toastManager.show({ title: 'Warning', type: 'warning' });

            expect(container.innerHTML).toContain('bi-exclamation-triangle');
        });

        test('should add correct icon for error type', () => {
            toastManager.show({ title: 'Error', type: 'error' });

            expect(container.innerHTML).toContain('bi-x-circle');
        });

        test('should default to info type', () => {
            toastManager.show({ title: 'Default' });

            const toast = container.querySelector('.toast');
            expect(toast.classList.contains('toast-info')).toBe(true);
        });

        test('should add toast to toasts array', () => {
            toastManager.show({ title: 'Test' });

            expect(toastManager.toasts.length).toBe(1);
        });

        test('should return toast element', () => {
            const toast = toastManager.show({ title: 'Test' });

            expect(toast).toBeInstanceOf(HTMLElement);
        });

        test('should include close button', () => {
            toastManager.show({ title: 'Test' });

            expect(container.querySelector('.toast-close')).not.toBeNull();
        });

        test('should auto-dismiss after duration', () => {
            jest.useFakeTimers();

            toastManager.show({ title: 'Test', duration: 1000 });
            expect(toastManager.toasts.length).toBe(1);

            jest.advanceTimersByTime(1000);
            expect(container.querySelector('.toast-exit')).not.toBeNull();

            jest.useRealTimers();
        });

        test('should not auto-dismiss when duration is 0', () => {
            jest.useFakeTimers();

            toastManager.show({ title: 'Test', duration: 0 });
            jest.advanceTimersByTime(5000);

            expect(container.querySelector('.toast-exit')).toBeNull();
            expect(toastManager.toasts.length).toBe(1);

            jest.useRealTimers();
        });

        test('should close toast when close button clicked', () => {
            toastManager.show({ title: 'Test' });

            const closeBtn = container.querySelector('.toast-close');
            closeBtn.click();

            expect(container.querySelector('.toast-exit')).not.toBeNull();
        });
    });

    describe('dismiss', () => {
        test('should add toast-exit class', () => {
            const toast = toastManager.show({ title: 'Test', duration: 0 });
            toastManager.dismiss(toast);

            expect(toast.classList.contains('toast-exit')).toBe(true);
        });

        test('should remove toast from DOM after animation', () => {
            jest.useFakeTimers();

            const toast = toastManager.show({ title: 'Test', duration: 0 });
            toastManager.dismiss(toast);

            expect(container.contains(toast)).toBe(true);

            jest.advanceTimersByTime(300);
            expect(container.contains(toast)).toBe(false);

            jest.useRealTimers();
        });

        test('should remove toast from toasts array', () => {
            jest.useFakeTimers();

            const toast = toastManager.show({ title: 'Test', duration: 0 });
            expect(toastManager.toasts.length).toBe(1);

            toastManager.dismiss(toast);
            jest.advanceTimersByTime(300);

            expect(toastManager.toasts.length).toBe(0);

            jest.useRealTimers();
        });

        test('should handle null toast gracefully', () => {
            expect(() => {
                toastManager.dismiss(null);
            }).not.toThrow();
        });

        test('should handle already-removed toast gracefully', () => {
            const toast = toastManager.show({ title: 'Test', duration: 0 });
            container.removeChild(toast);

            expect(() => {
                toastManager.dismiss(toast);
            }).not.toThrow();
        });
    });

    describe('convenience methods', () => {
        test('info() should create info toast', () => {
            toastManager.info('Info Title', 'Info Message');

            const toast = container.querySelector('.toast-info');
            expect(toast).not.toBeNull();
        });

        test('success() should create success toast', () => {
            toastManager.success('Success Title', 'Success Message');

            const toast = container.querySelector('.toast-success');
            expect(toast).not.toBeNull();
        });

        test('warning() should create warning toast', () => {
            toastManager.warning('Warning Title', 'Warning Message');

            const toast = container.querySelector('.toast-warning');
            expect(toast).not.toBeNull();
        });

        test('error() should create error toast', () => {
            toastManager.error('Error Title', 'Error Message');

            const toast = container.querySelector('.toast-error');
            expect(toast).not.toBeNull();
        });

        test('convenience methods should pass duration parameter', () => {
            jest.useFakeTimers();

            toastManager.info('Test', 'Message', 500);

            jest.advanceTimersByTime(500);
            expect(container.querySelector('.toast-exit')).not.toBeNull();

            jest.useRealTimers();
        });
    });

    describe('clear', () => {
        test('should dismiss all toasts', () => {
            toastManager.show({ title: 'Toast 1', duration: 0 });
            toastManager.show({ title: 'Toast 2', duration: 0 });
            toastManager.show({ title: 'Toast 3', duration: 0 });

            expect(toastManager.toasts.length).toBe(3);

            toastManager.clear();

            const toasts = container.querySelectorAll('.toast');
            toasts.forEach(toast => {
                expect(toast.classList.contains('toast-exit')).toBe(true);
            });
        });

        test('should handle empty toasts array', () => {
            expect(() => {
                toastManager.clear();
            }).not.toThrow();
        });
    });
});
