/**
 * Recurring Expenses Manager Module
 * Handles automatic recurring expense management and processing
 */

class RecurringExpensesManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.frequencies = {
            'weekly': { days: 7, label: 'Weekly' },
            'biweekly': { days: 14, label: 'Bi-weekly' },
            'monthly': { days: 30, label: 'Monthly' },
            'quarterly': { days: 90, label: 'Quarterly' },
            'yearly': { days: 365, label: 'Yearly' }
        };
    }
    
    showRecurringModal() {
        const modal = document.getElementById('recurringModal');
        if (!modal) {
            this.createRecurringModal();
        }
        
        this.loadRecurringExpenses();
        document.getElementById('recurringModal').classList.add('active');
        document.getElementById('overlay').classList.add('active');
    }
    
    createRecurringModal() {
        const modalHTML = `
            <div id="recurringModal" class="modal">
                <div class="modal-content recurring-modal-content">
                    <div class="modal-header">
                        <h3>Recurring Expenses</h3>
                        <button id="closeRecurringModal" class="close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="recurring-tabs">
                            <button class="tab-btn active" data-tab="add">Add New</button>
                            <button class="tab-btn" data-tab="manage">Manage Existing</button>
                        </div>
                        
                        <div class="tab-content active" id="addTab">
                            <form id="recurringForm">
                                <div class="form-group">
                                    <label for="recurringName">Expense Name</label>
                                    <input type="text" id="recurringName" placeholder="e.g., Netflix Subscription, Rent" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="recurringCategory">Category</label>
                                    <select id="recurringCategory" required>
                                        <option value="Food">🍔 Food</option>
                                        <option value="Transportation">🚗 Transportation</option>
                                        <option value="Entertainment">🎬 Entertainment</option>
                                        <option value="Shopping">🛒 Shopping</option>
                                        <option value="Bills" selected>🧾 Bills</option>
                                        <option value="Health">🏥 Health</option>
                                        <option value="Education">📚 Education</option>
                                        <option value="Other">📦 Other</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label for="recurringAmount">Amount (₹)</label>
                                    <input type="number" id="recurringAmount" placeholder="0.00" min="0" step="0.01" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="recurringFrequency">Frequency</label>
                                    <select id="recurringFrequency" required>
                                        <option value="weekly">Weekly</option>
                                        <option value="biweekly">Bi-weekly</option>
                                        <option value="monthly" selected>Monthly</option>
                                        <option value="quarterly">Quarterly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label for="recurringStartDate">Start Date</label>
                                    <input type="date" id="recurringStartDate" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="recurringEndDate">End Date (Optional)</label>
                                    <input type="date" id="recurringEndDate">
                                </div>
                                
                                <div class="form-group">
                                    <label class="checkbox-option">
                                        <input type="checkbox" id="recurringAutoAdd" checked>
                                        <span>Automatically add to expenses</span>
                                    </label>
                                </div>
                            </form>
                        </div>
                        
                        <div class="tab-content" id="manageTab">
                            <div id="recurringList" class="recurring-list">
                                <div class="loading">Loading recurring expenses...</div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="saveRecurring" class="btn btn-primary">Save Recurring Expense</button>
                        <button id="processRecurring" class="btn btn-secondary">Process All Due</button>
                        <button id="closeRecurringModal" class="btn btn-secondary">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.bindRecurringEvents();
    }
    
    bindRecurringEvents() {
        // Close modal
        document.querySelectorAll('#closeRecurringModal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('recurringModal').classList.remove('active');
                document.getElementById('overlay').classList.remove('active');
            });
        });
        
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });
        
        // Save recurring expense
        document.getElementById('saveRecurring')?.addEventListener('click', () => this.saveRecurringExpense());
        
        // Process all due
        document.getElementById('processRecurring')?.addEventListener('click', () => this.processAllDueExpenses());
        
        // Set default start date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('recurringStartDate').value = today;
    }
    
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');
        
        if (tabName === 'manage') {
            this.loadRecurringExpenses();
        }
    }
    
    saveRecurringExpense() {
        const form = document.getElementById('recurringForm');
        const formData = new FormData(form);
        
        const recurringExpense = {
            name: document.getElementById('recurringName').value.trim(),
            category: document.getElementById('recurringCategory').value,
            amount: parseFloat(document.getElementById('recurringAmount').value),
            frequency: document.getElementById('recurringFrequency').value,
            startDate: document.getElementById('recurringStartDate').value,
            endDate: document.getElementById('recurringEndDate').value || null,
            autoAdd: document.getElementById('recurringAutoAdd').checked,
            lastProcessed: null,
            isActive: true
        };
        
        if (!recurringExpense.name || !recurringExpense.amount || recurringExpense.amount <= 0) {
            if (window.expenseTracker?.notificationManager) {
                window.expenseTracker.notificationManager.showError('Please fill in all required fields');
            }
            return;
        }
        
        const id = this.dataManager.addRecurringExpense(recurringExpense);
        if (id) {
            if (window.expenseTracker?.notificationManager) {
                window.expenseTracker.notificationManager.showSuccess('Recurring expense added successfully');
            }
            this.clearForm();
            this.loadRecurringExpenses();
        }
    }
    
    clearForm() {
        document.getElementById('recurringName').value = '';
        document.getElementById('recurringAmount').value = '';
        document.getElementById('recurringEndDate').value = '';
        document.getElementById('recurringAutoAdd').checked = true;
        
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('recurringStartDate').value = today;
    }
    
    loadRecurringExpenses() {
        const container = document.getElementById('recurringList');
        if (!container) return;
        
        const recurringExpenses = this.dataManager.getRecurringExpenses();
        
        if (recurringExpenses.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No recurring expenses set up yet.</p>
                    <p>Add your first recurring expense to get started!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = recurringExpenses.map(expense => this.createRecurringExpenseHTML(expense)).join('');
        this.bindRecurringItemEvents();
    }
    
    createRecurringExpenseHTML(expense) {
        const nextDue = this.getNextDueDate(expense);
        const isOverdue = nextDue && nextDue < new Date();
        const statusClass = isOverdue ? 'overdue' : expense.isActive ? 'active' : 'inactive';
        
        return `
            <div class="recurring-item ${statusClass}" data-id="${expense.id}">
                <div class="recurring-info">
                    <div class="recurring-header">
                        <span class="recurring-name">${expense.name}</span>
                        <span class="recurring-amount">₹${expense.amount.toLocaleString()}</span>
                    </div>
                    <div class="recurring-details">
                        <span class="recurring-category">${this.getCategoryIcon(expense.category)} ${expense.category}</span>
                        <span class="recurring-frequency">${this.frequencies[expense.frequency].label}</span>
                        ${nextDue ? `<span class="next-due">Next: ${nextDue.toLocaleDateString()}</span>` : ''}
                    </div>
                </div>
                <div class="recurring-actions">
                    <button class="action-btn edit-btn" onclick="recurringManager.editRecurring('${expense.id}')">✏️</button>
                    <button class="action-btn ${expense.isActive ? 'pause-btn' : 'play-btn'}" 
                            onclick="recurringManager.toggleRecurring('${expense.id}')">
                        ${expense.isActive ? '⏸️' : '▶️'}
                    </button>
                    <button class="action-btn process-btn" onclick="recurringManager.processRecurring('${expense.id}')">💰</button>
                    <button class="action-btn delete-btn" onclick="recurringManager.deleteRecurring('${expense.id}')">🗑️</button>
                </div>
            </div>
        `;
    }
    
    getCategoryIcon(category) {
        const icons = {
            'Food': '🍔',
            'Transportation': '🚗',
            'Entertainment': '🎬',
            'Shopping': '🛒',
            'Bills': '🧾',
            'Health': '🏥',
            'Education': '📚',
            'Other': '📦'
        };
        return icons[category] || '📦';
    }
    
    bindRecurringItemEvents() {
        // Events are bound via onclick attributes in the HTML for simplicity
        // In a production app, you'd want to use event delegation
    }
    
    editRecurring(id) {
        const expense = this.dataManager.getRecurringExpenses().find(e => e.id === id);
        if (!expense) return;
        
        // Switch to add tab and populate form
        this.switchTab('add');
        
        document.getElementById('recurringName').value = expense.name;
        document.getElementById('recurringCategory').value = expense.category;
        document.getElementById('recurringAmount').value = expense.amount;
        document.getElementById('recurringFrequency').value = expense.frequency;
        document.getElementById('recurringStartDate').value = expense.startDate;
        document.getElementById('recurringEndDate').value = expense.endDate || '';
        document.getElementById('recurringAutoAdd').checked = expense.autoAdd;
        
        // Change save button to update
        const saveBtn = document.getElementById('saveRecurring');
        saveBtn.textContent = 'Update Recurring Expense';
        saveBtn.onclick = () => this.updateRecurring(id);
    }
    
    updateRecurring(id) {
        const updatedExpense = {
            name: document.getElementById('recurringName').value.trim(),
            category: document.getElementById('recurringCategory').value,
            amount: parseFloat(document.getElementById('recurringAmount').value),
            frequency: document.getElementById('recurringFrequency').value,
            startDate: document.getElementById('recurringStartDate').value,
            endDate: document.getElementById('recurringEndDate').value || null,
            autoAdd: document.getElementById('recurringAutoAdd').checked
        };
        
        if (this.dataManager.updateRecurringExpense(id, updatedExpense)) {
            if (window.expenseTracker?.notificationManager) {
                window.expenseTracker.notificationManager.showSuccess('Recurring expense updated successfully');
            }
            this.clearForm();
            this.loadRecurringExpenses();
            
            // Reset save button
            const saveBtn = document.getElementById('saveRecurring');
            saveBtn.textContent = 'Save Recurring Expense';
            saveBtn.onclick = () => this.saveRecurringExpense();
        }
    }
    
    toggleRecurring(id) {
        const expense = this.dataManager.getRecurringExpenses().find(e => e.id === id);
        if (!expense) return;
        
        const updated = this.dataManager.updateRecurringExpense(id, { isActive: !expense.isActive });
        if (updated) {
            if (window.expenseTracker?.notificationManager) {
                window.expenseTracker.notificationManager.showSuccess(
                    `Recurring expense ${expense.isActive ? 'paused' : 'activated'}`
                );
            }
            this.loadRecurringExpenses();
        }
    }
    
    processRecurring(id) {
        const expense = this.dataManager.getRecurringExpenses().find(e => e.id === id);
        if (!expense) return;
        
        const nextDue = this.getNextDueDate(expense);
        if (nextDue && nextDue <= new Date()) {
            this.addRecurringExpenseToDate(expense, nextDue);
            
            // Update last processed date
            this.dataManager.updateRecurringExpense(id, { lastProcessed: nextDue.toISOString() });
            
            if (window.expenseTracker?.notificationManager) {
                window.expenseTracker.notificationManager.showSuccess(
                    `Added ${expense.name} (₹${expense.amount}) to ${nextDue.toLocaleDateString()}`
                );
            }
            
            this.loadRecurringExpenses();
            
            // Refresh main app if available
            if (window.expenseTracker) {
                window.expenseTracker.refreshDisplay();
            }
        } else {
            if (window.expenseTracker?.notificationManager) {
                window.expenseTracker.notificationManager.showInfo('This expense is not due yet');
            }
        }
    }
    
    deleteRecurring(id) {
        const expense = this.dataManager.getRecurringExpenses().find(e => e.id === id);
        if (!expense) return;
        
        if (confirm(`Are you sure you want to delete "${expense.name}"?`)) {
            if (this.dataManager.deleteRecurringExpense(id)) {
                if (window.expenseTracker?.notificationManager) {
                    window.expenseTracker.notificationManager.showSuccess('Recurring expense deleted');
                }
                this.loadRecurringExpenses();
            }
        }
    }
    
    processAllDueExpenses() {
        const recurringExpenses = this.dataManager.getRecurringExpenses();
        const dueExpenses = recurringExpenses.filter(expense => {
            if (!expense.isActive) return false;
            const nextDue = this.getNextDueDate(expense);
            return nextDue && nextDue <= new Date();
        });
        
        if (dueExpenses.length === 0) {
            if (window.expenseTracker?.notificationManager) {
                window.expenseTracker.notificationManager.showInfo('No recurring expenses are due for processing');
            }
            return;
        }
        
        let processed = 0;
        dueExpenses.forEach(expense => {
            const nextDue = this.getNextDueDate(expense);
            if (nextDue && nextDue <= new Date()) {
                this.addRecurringExpenseToDate(expense, nextDue);
                this.dataManager.updateRecurringExpense(expense.id, { lastProcessed: nextDue.toISOString() });
                processed++;
            }
        });
        
        if (processed > 0) {
            if (window.expenseTracker?.notificationManager) {
                window.expenseTracker.notificationManager.showSuccess(
                    `Processed ${processed} recurring expense${processed > 1 ? 's' : ''}`
                );
            }
            
            this.loadRecurringExpenses();
            
            // Refresh main app
            if (window.expenseTracker) {
                window.expenseTracker.refreshDisplay();
            }
        }
    }
    
    processRecurringExpenses() {
        // Auto-process expenses that have autoAdd enabled
        const recurringExpenses = this.dataManager.getRecurringExpenses();
        const autoExpenses = recurringExpenses.filter(expense => {
            if (!expense.isActive || !expense.autoAdd) return false;
            const nextDue = this.getNextDueDate(expense);
            return nextDue && nextDue <= new Date();
        });
        
        autoExpenses.forEach(expense => {
            const nextDue = this.getNextDueDate(expense);
            if (nextDue && nextDue <= new Date()) {
                this.addRecurringExpenseToDate(expense, nextDue);
                this.dataManager.updateRecurringExpense(expense.id, { lastProcessed: nextDue.toISOString() });
            }
        });
        
        if (autoExpenses.length > 0) {
            console.log(`Auto-processed ${autoExpenses.length} recurring expenses`);
        }
    }
    
    addRecurringExpenseToDate(recurringExpense, date) {
        const expense = {
            name: `${recurringExpense.name} (Recurring)`,
            category: recurringExpense.category,
            amount: recurringExpense.amount,
            isRecurring: true,
            recurringId: recurringExpense.id
        };
        
        this.dataManager.addExpenseForDate(date, expense);
    }
    
    getNextDueDate(expense) {
        if (!expense.isActive) return null;
        
        const startDate = new Date(expense.startDate);
        const lastProcessed = expense.lastProcessed ? new Date(expense.lastProcessed) : null;
        const frequency = this.frequencies[expense.frequency];
        
        if (!frequency) return null;
        
        let nextDue;
        if (lastProcessed) {
            nextDue = new Date(lastProcessed);
            nextDue.setDate(nextDue.getDate() + frequency.days);
        } else {
            nextDue = new Date(startDate);
        }
        
        // Check if end date has passed
        if (expense.endDate && nextDue > new Date(expense.endDate)) {
            return null;
        }
        
        return nextDue;
    }
    
    getDashboardSummary() {
        const recurringExpenses = this.dataManager.getRecurringExpenses();
        const activeExpenses = recurringExpenses.filter(e => e.isActive);
        
        const monthlyTotal = activeExpenses.reduce((sum, expense) => {
            const frequency = this.frequencies[expense.frequency];
            if (!frequency) return sum;
            
            // Convert to monthly amount
            const monthlyAmount = expense.amount * (30 / frequency.days);
            return sum + monthlyAmount;
        }, 0);
        
        const dueCount = activeExpenses.filter(expense => {
            const nextDue = this.getNextDueDate(expense);
            return nextDue && nextDue <= new Date();
        }).length;
        
        return {
            totalActive: activeExpenses.length,
            monthlyTotal,
            dueCount
        };
    }
    
    createDashboardWidget() {
        const summary = this.getDashboardSummary();
        
        return `
            <div class="recurring-widget">
                <h4>Recurring Expenses</h4>
                <div class="widget-stats">
                    <div class="stat">
                        <span class="stat-label">Active</span>
                        <span class="stat-value">${summary.totalActive}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Monthly Total</span>
                        <span class="stat-value">₹${summary.monthlyTotal.toLocaleString()}</span>
                    </div>
                    ${summary.dueCount > 0 ? `
                        <div class="stat alert">
                            <span class="stat-label">Due Now</span>
                            <span class="stat-value">${summary.dueCount}</span>
                        </div>
                    ` : ''}
                </div>
                <button class="widget-btn" onclick="window.expenseTracker.recurringManager.showRecurringModal()">
                    Manage Recurring
                </button>
            </div>
        `;
    }
}

// Make RecurringExpensesManager globally available
window.RecurringExpensesManager = RecurringExpensesManager;
