/**
 * Notification Manager Module
 * Handles all notifications, alerts, and user feedback
 */

class NotificationManager {
    constructor() {
        this.notifications = [];
        this.notificationQueue = [];
        this.maxNotifications = 5;
        this.defaultDuration = 5000;
        this.soundEnabled = true;
        this.positions = {
            'top-right': 'top-right',
            'top-left': 'top-left',
            'bottom-right': 'bottom-right',
            'bottom-left': 'bottom-left',
            'top-center': 'top-center',
            'bottom-center': 'bottom-center'
        };
        this.currentPosition = 'top-right';
        
        this.createNotificationContainer();
        this.loadSounds();
    }
    
    createNotificationContainer() {
        // Remove existing containers
        document.querySelectorAll('.notification-container').forEach(container => {
            container.remove();
        });
        
        // Create new container
        const container = document.createElement('div');
        container.className = `notification-container ${this.currentPosition}`;
        container.id = 'notificationContainer';
        document.body.appendChild(container);
    }
    
    loadSounds() {
        this.sounds = {};
        
        // Create audio contexts for different notification types
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Success sound (positive chime)
        this.sounds.success = this.createTone(audioContext, [523.25, 659.25, 783.99], 0.3);
        
        // Error sound (alert beep)
        this.sounds.error = this.createTone(audioContext, [220, 220, 220], 0.5);
        
        // Warning sound (double beep)
        this.sounds.warning = this.createTone(audioContext, [440, 440], 0.4);
        
        // Info sound (single beep)
        this.sounds.info = this.createTone(audioContext, [440], 0.3);
    }
    
    createTone(audioContext, frequencies, duration) {
        return () => {
            if (!this.soundEnabled) return;
            
            frequencies.forEach((freq, index) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.1);
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0, audioContext.currentTime + index * 0.1);
                gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + index * 0.1 + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.1 + duration);
                
                oscillator.start(audioContext.currentTime + index * 0.1);
                oscillator.stop(audioContext.currentTime + index * 0.1 + duration);
            });
        };
    }
    
    show(message, type = 'info', options = {}) {
        const notification = {
            id: Date.now() + Math.random(),
            message,
            type,
            duration: options.duration || this.defaultDuration,
            persistent: options.persistent || false,
            actions: options.actions || [],
            icon: options.icon || this.getDefaultIcon(type),
            title: options.title || null,
            timestamp: new Date(),
            onClick: options.onClick || null,
            onClose: options.onClose || null
        };
        
        // Play sound
        if (this.sounds[type]) {
            this.sounds[type]();
        }
        
        // Add to queue if container is full
        if (this.notifications.length >= this.maxNotifications) {
            this.notificationQueue.push(notification);
            return notification.id;
        }
        
        this.notifications.push(notification);
        this.renderNotification(notification);
        
        // Auto-remove if not persistent
        if (!notification.persistent) {
            setTimeout(() => {
                this.remove(notification.id);
            }, notification.duration);
        }
        
        return notification.id;
    }
    
    showSuccess(message, options = {}) {
        return this.show(message, 'success', {
            icon: '✅',
            ...options
        });
    }
    
    showError(message, options = {}) {
        return this.show(message, 'error', {
            icon: '❌',
            persistent: true, // Errors are persistent by default
            ...options
        });
    }
    
    showWarning(message, options = {}) {
        return this.show(message, 'warning', {
            icon: '⚠️',
            duration: 7000, // Warnings stay longer
            ...options
        });
    }
    
    showInfo(message, options = {}) {
        return this.show(message, 'info', {
            icon: 'ℹ️',
            ...options
        });
    }
    
    showCustom(message, options = {}) {
        return this.show(message, 'custom', options);
    }
    
    showProgress(message, progress = 0, options = {}) {
        const notification = {
            id: options.id || Date.now() + Math.random(),
            message,
            type: 'progress',
            progress,
            persistent: true,
            icon: options.icon || '⏳',
            title: options.title || null,
            timestamp: new Date()
        };
        
        // Remove existing progress notification with same ID
        if (options.id) {
            this.remove(options.id, false);
        }
        
        this.notifications.push(notification);
        this.renderNotification(notification);
        
        // Auto-remove when progress reaches 100%
        if (progress >= 100) {
            setTimeout(() => {
                this.remove(notification.id);
                if (options.onComplete) {
                    options.onComplete();
                }
            }, 2000);
        }
        
        return notification.id;
    }
    
    getDefaultIcon(type) {
        const icons = {
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️',
            'progress': '⏳'
        };
        return icons[type] || 'ℹ️';
    }
    
    renderNotification(notification) {
        const container = document.getElementById('notificationContainer');
        if (!container) return;
        
        const element = document.createElement('div');
        element.className = `notification notification-${notification.type}`;
        element.setAttribute('data-notification-id', notification.id);
        
        let progressBar = '';
        if (notification.type === 'progress') {
            progressBar = `
                <div class="notification-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${notification.progress}%"></div>
                    </div>
                    <span class="progress-text">${Math.round(notification.progress)}%</span>
                </div>
            `;
        }
        
        let actions = '';
        if (notification.actions && notification.actions.length > 0) {
            actions = `
                <div class="notification-actions">
                    ${notification.actions.map(action => `
                        <button class="notification-action-btn" data-action="${action.id}">
                            ${action.label}
                        </button>
                    `).join('')}
                </div>
            `;
        }
        
        element.innerHTML = `
            <div class="notification-content">
                <div class="notification-header">
                    <span class="notification-icon">${notification.icon}</span>
                    ${notification.title ? `<span class="notification-title">${notification.title}</span>` : ''}
                    <button class="notification-close" data-close="${notification.id}">&times;</button>
                </div>
                <div class="notification-message">${notification.message}</div>
                ${progressBar}
                ${actions}
                <div class="notification-timestamp">${this.formatTimestamp(notification.timestamp)}</div>
            </div>
        `;
        
        // Add event listeners
        const closeBtn = element.querySelector('.notification-close');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.remove(notification.id);
        });
        
        // Add click handler for entire notification
        if (notification.onClick) {
            element.addEventListener('click', notification.onClick);
            element.style.cursor = 'pointer';
        }
        
        // Add action button handlers
        element.querySelectorAll('.notification-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const actionId = e.target.getAttribute('data-action');
                const action = notification.actions.find(a => a.id === actionId);
                if (action && action.handler) {
                    action.handler();
                }
                if (action && action.dismissOnClick !== false) {
                    this.remove(notification.id);
                }
            });
        });
        
        // Add entrance animation
        element.style.opacity = '0';
        element.style.transform = 'translateX(100%)';
        container.appendChild(element);
        
        // Trigger animation
        requestAnimationFrame(() => {
            element.style.transition = 'all 0.3s ease-out';
            element.style.opacity = '1';
            element.style.transform = 'translateX(0)';
        });
        
        // Add hover effects
        element.addEventListener('mouseenter', () => {
            element.style.transform = 'scale(1.02)';
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'scale(1)';
        });
    }
    
    remove(id, processQueue = true) {
        const element = document.querySelector(`[data-notification-id="${id}"]`);
        if (element) {
            // Exit animation
            element.style.transition = 'all 0.3s ease-in';
            element.style.opacity = '0';
            element.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }, 300);
        }
        
        // Remove from notifications array
        this.notifications = this.notifications.filter(n => n.id !== id);
        
        // Call onClose callback
        const notification = this.notifications.find(n => n.id === id);
        if (notification && notification.onClose) {
            notification.onClose();
        }
        
        // Process queue
        if (processQueue && this.notificationQueue.length > 0) {
            const nextNotification = this.notificationQueue.shift();
            setTimeout(() => {
                this.notifications.push(nextNotification);
                this.renderNotification(nextNotification);
                
                if (!nextNotification.persistent) {
                    setTimeout(() => {
                        this.remove(nextNotification.id);
                    }, nextNotification.duration);
                }
            }, 100);
        }
    }
    
    removeAll() {
        this.notifications.forEach(notification => {
            this.remove(notification.id, false);
        });
        this.notifications = [];
        this.notificationQueue = [];
    }
    
    updateProgress(id, progress, message = null) {
        const notification = this.notifications.find(n => n.id === id);
        if (!notification) return;
        
        notification.progress = Math.min(100, Math.max(0, progress));
        if (message) {
            notification.message = message;
        }
        
        const element = document.querySelector(`[data-notification-id="${id}"]`);
        if (element) {
            const progressFill = element.querySelector('.progress-fill');
            const progressText = element.querySelector('.progress-text');
            const messageElement = element.querySelector('.notification-message');
            
            if (progressFill) {
                progressFill.style.width = `${notification.progress}%`;
            }
            if (progressText) {
                progressText.textContent = `${Math.round(notification.progress)}%`;
            }
            if (messageElement && message) {
                messageElement.textContent = message;
            }
        }
        
        // Auto-remove when complete
        if (notification.progress >= 100) {
            setTimeout(() => {
                this.remove(id);
            }, 2000);
        }
    }
    
    formatTimestamp(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        
        if (diff < 60000) { // Less than 1 minute
            return 'Just now';
        } else if (diff < 3600000) { // Less than 1 hour
            const minutes = Math.floor(diff / 60000);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diff < 86400000) { // Less than 1 day
            const hours = Math.floor(diff / 3600000);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            return timestamp.toLocaleDateString();
        }
    }
    
    // Batch notifications for related operations
    showBatch(notifications, options = {}) {
        const batchId = Date.now() + Math.random();
        const results = [];
        
        notifications.forEach((notification, index) => {
            setTimeout(() => {
                const id = this.show(notification.message, notification.type, {
                    ...notification.options,
                    batchId
                });
                results.push(id);
            }, index * (options.delay || 200));
        });
        
        return results;
    }
    
    // Smart notifications based on context
    showBudgetAlert(category, amount, budget) {
        const percentage = (amount / budget) * 100;
        
        if (percentage > 100) {
            return this.showWarning(
                `Budget exceeded for ${category}! You've spent ₹${amount.toLocaleString()} (₹${(amount - budget).toLocaleString()} over budget)`,
                {
                    title: 'Budget Alert',
                    actions: [
                        {
                            id: 'view-budget',
                            label: 'View Budget',
                            handler: () => {
                                if (window.expenseTracker?.budgetManager) {
                                    window.expenseTracker.budgetManager.showBudgetModal();
                                }
                            }
                        },
                        {
                            id: 'adjust-budget',
                            label: 'Adjust Budget',
                            handler: () => {
                                if (window.expenseTracker?.budgetManager) {
                                    window.expenseTracker.budgetManager.showBudgetModal();
                                }
                            }
                        }
                    ]
                }
            );
        } else if (percentage > 80) {
            return this.showInfo(
                `${category} budget is ${percentage.toFixed(1)}% used (₹${amount.toLocaleString()} of ₹${budget.toLocaleString()})`,
                {
                    title: 'Budget Update',
                    icon: '📊'
                }
            );
        }
    }
    
    showGoalProgress(goalName, progress, target) {
        const percentage = (progress / target) * 100;
        
        if (percentage >= 100) {
            return this.showSuccess(
                `🎉 Congratulations! You've achieved your goal "${goalName}"!`,
                {
                    title: 'Goal Achieved',
                    actions: [
                        {
                            id: 'mark-complete',
                            label: 'Mark Complete',
                            handler: () => {
                                if (window.expenseTracker?.goalsManager) {
                                    // Handle goal completion
                                }
                            }
                        },
                        {
                            id: 'set-new-goal',
                            label: 'Set New Goal',
                            handler: () => {
                                if (window.expenseTracker?.goalsManager) {
                                    window.expenseTracker.goalsManager.showGoalsModal();
                                }
                            }
                        }
                    ]
                }
            );
        } else if (percentage >= 75) {
            return this.showInfo(
                `You're ${percentage.toFixed(1)}% towards your goal "${goalName}"! Keep it up!`,
                {
                    title: 'Goal Progress',
                    icon: '🎯'
                }
            );
        }
    }
    
    showRecurringExpenseReminder(expenses) {
        if (expenses.length === 0) return;
        
        const message = expenses.length === 1 
            ? `Recurring expense "${expenses[0].name}" is due (₹${expenses[0].amount})`
            : `${expenses.length} recurring expenses are due (Total: ₹${expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()})`;
        
        return this.showInfo(message, {
            title: 'Recurring Expenses',
            icon: '🔄',
            actions: [
                {
                    id: 'process-all',
                    label: 'Process All',
                    handler: () => {
                        if (window.expenseTracker?.recurringManager) {
                            window.expenseTracker.recurringManager.processAllDueExpenses();
                        }
                    }
                },
                {
                    id: 'view-recurring',
                    label: 'View Details',
                    handler: () => {
                        if (window.expenseTracker?.recurringManager) {
                            window.expenseTracker.recurringManager.showRecurringModal();
                        }
                    }
                }
            ]
        });
    }
    
    showDataBackupReminder() {
        return this.showInfo(
            'Regular backups help protect your financial data. Consider exporting your data.',
            {
                title: 'Backup Reminder',
                icon: '💾',
                actions: [
                    {
                        id: 'backup-now',
                        label: 'Backup Now',
                        handler: () => {
                            if (window.expenseTracker?.dataExportImport) {
                                window.expenseTracker.dataExportImport.exportToJSON();
                            }
                        }
                    },
                    {
                        id: 'remind-later',
                        label: 'Remind Later',
                        handler: () => {
                            // Set reminder for later
                            localStorage.setItem('nextBackupReminder', 
                                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                            );
                        }
                    }
                ]
            }
        );
    }
    
    // Settings management
    setPosition(position) {
        if (this.positions[position]) {
            this.currentPosition = position;
            this.createNotificationContainer();
            
            // Re-render existing notifications
            this.notifications.forEach(notification => {
                this.renderNotification(notification);
            });
        }
    }
    
    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
    }
    
    setMaxNotifications(max) {
        this.maxNotifications = Math.max(1, Math.min(10, max));
    }
    
    setDefaultDuration(duration) {
        this.defaultDuration = Math.max(1000, duration);
    }
    
    // Analytics and insights notifications
    showInsight(insight, type = 'insight') {
        return this.showInfo(insight.message, {
            title: insight.title || 'Financial Insight',
            icon: insight.icon || '💡',
            duration: 8000, // Insights stay longer
            actions: insight.actions
        });
    }
    
    showTrendAlert(trend) {
        const isPositive = trend.change > 0;
        const type = Math.abs(trend.change) > 20 ? 'warning' : 'info';
        
        return this.show(
            `${trend.category} spending has ${isPositive ? 'increased' : 'decreased'} by ${Math.abs(trend.change).toFixed(1)}% this month`,
            type,
            {
                title: 'Spending Trend',
                icon: isPositive ? '📈' : '📉',
                actions: [
                    {
                        id: 'view-analytics',
                        label: 'View Analytics',
                        handler: () => {
                            if (window.expenseTracker?.analyticsManager) {
                                window.expenseTracker.analyticsManager.showAnalyticsModal();
                            }
                        }
                    }
                ]
            }
        );
    }
    
    // System notifications
    showWelcome() {
        return this.showSuccess(
            'Welcome to Smart Expense Tracker! Start by setting your monthly income.',
            {
                title: 'Welcome!',
                icon: '👋',
                duration: 8000,
                actions: [
                    {
                        id: 'set-income',
                        label: 'Set Income',
                        handler: () => {
                            if (window.expenseTracker) {
                                window.expenseTracker.showIncomeModal();
                            }
                        }
                    },
                    {
                        id: 'take-tour',
                        label: 'Take Tour',
                        handler: () => {
                            this.showTour();
                        }
                    }
                ]
            }
        );
    }
    
    showTour() {
        const tourSteps = [
            {
                message: 'Click on any calendar date to add expenses for that day.',
                icon: '📅'
            },
            {
                message: 'Set budgets for different categories to track your spending.',
                icon: '🎯'
            },
            {
                message: 'Create financial goals and track your progress.',
                icon: '🏆'
            },
            {
                message: 'Use the search feature to find specific expenses quickly.',
                icon: '🔍'
            },
            {
                message: 'View detailed analytics and insights about your spending patterns.',
                icon: '📊'
            }
        ];
        
        this.showBatch(
            tourSteps.map((step, index) => ({
                message: step.message,
                type: 'info',
                options: {
                    title: `Tip ${index + 1}/${tourSteps.length}`,
                    icon: step.icon,
                    duration: 6000
                }
            })),
            { delay: 1000 }
        );
    }
    
    // Keyboard shortcuts notification
    showKeyboardShortcuts() {
        const shortcuts = [
            'Ctrl+I: Set Income',
            'Ctrl+E: Add Expense',
            'Ctrl+B: Manage Budget',
            'Ctrl+S: Settings',
            'Ctrl+R: Reports',
            'Esc: Close Modals'
        ];
        
        return this.showInfo(
            shortcuts.join('\n'),
            {
                title: 'Keyboard Shortcuts',
                icon: '⌨️',
                duration: 10000
            }
        );
    }
    
    // Monthly summary notification
    showMonthlySummary(summary) {
        const savingsRate = summary.income > 0 ? ((summary.income - summary.expenses) / summary.income) * 100 : 0;
        const isGoodMonth = savingsRate >= 20;
        
        return this.show(
            `Monthly Summary: Income ₹${summary.income.toLocaleString()}, Expenses ₹${summary.expenses.toLocaleString()}, Savings Rate ${savingsRate.toFixed(1)}%`,
            isGoodMonth ? 'success' : 'warning',
            {
                title: 'Monthly Summary',
                icon: '📈',
                actions: [
                    {
                        id: 'view-report',
                        label: 'View Report',
                        handler: () => {
                            if (window.expenseTracker?.reportsManager) {
                                window.expenseTracker.reportsManager.showReportsModal();
                            }
                        }
                    }
                ]
            }
        );
    }
    
    // Error handling for app issues
    showAppError(error, details = null) {
        return this.showError(
            `An error occurred: ${error}${details ? ` (${details})` : ''}`,
            {
                title: 'Application Error',
                persistent: true,
                actions: [
                    {
                        id: 'reload-app',
                        label: 'Reload App',
                        handler: () => {
                            window.location.reload();
                        }
                    },
                    {
                        id: 'report-bug',
                        label: 'Report Bug',
                        handler: () => {
                            window.open('#', '_blank'); // Would link to bug report
                        }
                    }
                ]
            }
        );
    }
    
    // Cleanup method
    destroy() {
        this.removeAll();
        const container = document.getElementById('notificationContainer');
        if (container) {
            container.remove();
        }
    }
}

// Make NotificationManager globally available
window.NotificationManager = NotificationManager;
