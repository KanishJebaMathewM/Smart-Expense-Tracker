/**
 * Custom Confirmation Dialog
 * Replaces window.confirm to avoid cross-origin iframe deprecation
 */

class CustomConfirm {
    constructor() {
        this.isOpen = false;
        this.currentResolve = null;
    }

    // Show custom confirmation dialog
    show(message, options = {}) {
        return new Promise((resolve) => {
            if (this.isOpen) {
                resolve(false);
                return;
            }

            this.isOpen = true;
            this.currentResolve = resolve;

            const {
                title = 'Confirm Action',
                confirmText = 'Yes',
                cancelText = 'Cancel',
                confirmClass = 'btn-danger',
                cancelClass = 'btn-secondary'
            } = options;

            // Create modal HTML
            const modalHtml = `
                <div id="customConfirmModal" class="modal active" style="z-index: 10000;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>${this.escapeHtml(title)}</h3>
                        </div>
                        <div class="modal-body">
                            <p style="margin: 0; font-size: 16px; line-height: 1.5;">${this.escapeHtml(message)}</p>
                        </div>
                        <div class="modal-footer">
                            <button id="customConfirmYes" class="btn ${confirmClass}">${this.escapeHtml(confirmText)}</button>
                            <button id="customConfirmNo" class="btn ${cancelClass}">${this.escapeHtml(cancelText)}</button>
                        </div>
                    </div>
                </div>
                <div id="customConfirmOverlay" class="overlay active" style="z-index: 9999;"></div>
            `;

            // Add to DOM
            document.body.insertAdjacentHTML('beforeend', modalHtml);

            // Get elements
            const modal = document.getElementById('customConfirmModal');
            const overlay = document.getElementById('customConfirmOverlay');
            const yesBtn = document.getElementById('customConfirmYes');
            const noBtn = document.getElementById('customConfirmNo');

            // Handle clicks
            const handleYes = () => {
                this.cleanup();
                resolve(true);
            };

            const handleNo = () => {
                this.cleanup();
                resolve(false);
            };

            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    this.cleanup();
                    resolve(false);
                }
            };

            // Bind events
            yesBtn.addEventListener('click', handleYes);
            noBtn.addEventListener('click', handleNo);
            overlay.addEventListener('click', handleNo);
            document.addEventListener('keydown', handleEscape);

            // Store cleanup function
            this.cleanupFunction = () => {
                document.removeEventListener('keydown', handleEscape);
                if (modal) modal.remove();
                if (overlay) overlay.remove();
                this.isOpen = false;
                this.currentResolve = null;
                this.cleanupFunction = null;
            };

            // Focus confirm button
            setTimeout(() => {
                yesBtn.focus();
            }, 100);
        });
    }

    // Cleanup modal
    cleanup() {
        if (this.cleanupFunction) {
            this.cleanupFunction();
        }
    }

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Create global instance
window.customConfirm = new CustomConfirm();

// Helper function to replace confirm() calls
window.confirmAsync = async (message, options = {}) => {
    return await window.customConfirm.show(message, options);
};

// Styles for custom confirm modal
const confirmStyles = `
<style>
#customConfirmModal {
    display: flex !important;
    align-items: center;
    justify-content: center;
}

#customConfirmModal .modal-content {
    max-width: 500px;
    width: 90%;
    margin: 0;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    animation: confirmFadeIn 0.2s ease-out;
}

#customConfirmModal .modal-header {
    border-bottom: 1px solid var(--border-color, #e5e5e5);
    padding: 20px 20px 15px 20px;
}

#customConfirmModal .modal-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary, #333);
}

#customConfirmModal .modal-body {
    padding: 20px;
}

#customConfirmModal .modal-footer {
    border-top: 1px solid var(--border-color, #e5e5e5);
    padding: 15px 20px 20px 20px;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

#customConfirmModal .btn {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 80px;
}

#customConfirmModal .btn-danger {
    background-color: #dc3545;
    color: white;
}

#customConfirmModal .btn-danger:hover {
    background-color: #c82333;
}

#customConfirmModal .btn-secondary {
    background-color: #6c757d;
    color: white;
}

#customConfirmModal .btn-secondary:hover {
    background-color: #5a6268;
}

#customConfirmModal .btn:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
}

@keyframes confirmFadeIn {
    from {
        opacity: 0;
        transform: scale(0.9);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

#customConfirmOverlay {
    background-color: rgba(0, 0, 0, 0.5);
}
</style>
`;

// Add styles to document
document.head.insertAdjacentHTML('beforeend', confirmStyles);
