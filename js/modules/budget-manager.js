/**
 * Budget Manager Module
 * Handles budget setting, tracking, and alerts
 */

class BudgetManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.categories = [
            'Food', 'Transportation', 'Entertainment', 'Shopping', 
            'Bills', 'Health', 'Education', 'Other'
        ];
    }
    
    showBudgetModal() {
        const modal = document.getElementById('budgetModal');
        if (!modal) {
            this.createBudgetModal();
        }
        
        this.loadBudgetData();
        document.getElementById('budgetModal').classList.add('active');
        document.getElementById('overlay').classList.add('active');
    }
    
    createBudgetModal() {
        const modalHTML = `
            <div id="budgetModal" class="modal">
                <div class="modal-content budget-modal-content">
                    <div class="modal-header">
                        <h3>Monthly Budget Settings</h3>
                        <button id="closeBudgetModal" class="close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="budget-month-selector">
                            <label for="budgetMonth">Budget for:</label>
                            <select id="budgetMonth">
                                ${this.generateMonthOptions()}
                            </select>
                        </div>
                        <div class="budget-categories">
                            ${this.generateBudgetCategoryHTML()}
                        </div>
                        <div class="budget-summary">
                            <div class="budget-total">
                                <strong>Total Budget: <span id="totalBudget">₹0</span></strong>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="saveBudget" class="btn btn-primary">Save Budget</button>
                        <button id="copyPreviousBudget" class="btn btn-secondary">Copy Previous Month</button>
                        <button id="clearBudget" class="btn btn-danger">Clear Budget</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.bindBudgetEvents();
    }
    
    generateMonthOptions() {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        let options = '';
        const currentDate = new Date();
        
        // Generate options for current year and next year
        for (let year = currentDate.getFullYear(); year <= currentDate.getFullYear() + 1; year++) {
            months.forEach((month, index) => {
                const value = `${year}-${index}`;
                const selected = (year === this.currentYear && index === this.currentMonth) ? 'selected' : '';
                options += `<option value="${value}" ${selected}>${month} ${year}</option>`;
            });
        }
        
        return options;
    }
    
    generateBudgetCategoryHTML() {
        return this.categories.map(category => `
            <div class="budget-category-item">
                <div class="category-info">
                    <span class="category-name">${this.getCategoryIcon(category)} ${category}</span>
                    <div class="category-spending">
                        <span class="spent-amount" id="spent-${category}">₹0</span>
                        <span class="budget-status" id="status-${category}"></span>
                    </div>
                </div>
                <div class="budget-input-group">
                    <input type="number" id="budget-${category}" class="budget-input" 
                           placeholder="0" min="0" step="0.01">
                    <div class="budget-progress">
                        <div class="progress-bar" id="progress-${category}"></div>
                    </div>
                </div>
            </div>
        `).join('');
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
    
    bindBudgetEvents() {
        // Close modal
        document.getElementById('closeBudgetModal')?.addEventListener('click', () => {
            document.getElementById('budgetModal').classList.remove('active');
            document.getElementById('overlay').classList.remove('active');
        });
        
        // Save budget
        document.getElementById('saveBudget')?.addEventListener('click', () => this.saveBudget());
        
        // Copy previous month budget
        document.getElementById('copyPreviousBudget')?.addEventListener('click', () => this.copyPreviousBudget());
        
        // Clear budget
        document.getElementById('clearBudget')?.addEventListener('click', () => this.clearBudget());
        
        // Month selector change
        document.getElementById('budgetMonth')?.addEventListener('change', (e) => {
            const [year, month] = e.target.value.split('-');
            this.currentYear = parseInt(year);
            this.currentMonth = parseInt(month);
            this.loadBudgetData();
        });
        
        // Budget input changes
        this.categories.forEach(category => {
            document.getElementById(`budget-${category}`)?.addEventListener('input', () => {
                this.updateBudgetTotal();
                this.updateCategoryProgress(category);
            });
        });
    }
    
    loadBudgetData() {
        // Load budget amounts
        this.categories.forEach(category => {
            const budget = this.dataManager.getBudgetForCategory(category, this.currentMonth, this.currentYear);
            const input = document.getElementById(`budget-${category}`);
            if (input) {
                input.value = budget || '';
            }
            
            // Load spending data
            this.updateCategorySpending(category);
            this.updateCategoryProgress(category);
        });
        
        this.updateBudgetTotal();
    }
    
    updateCategorySpending(category) {
        const categoryTotals = this.dataManager.getCategoryTotals(this.currentMonth, this.currentYear);
        const spent = categoryTotals[category] || 0;
        const budget = parseFloat(document.getElementById(`budget-${category}`)?.value) || 0;
        
        const spentElement = document.getElementById(`spent-${category}`);
        const statusElement = document.getElementById(`status-${category}`);
        
        if (spentElement) {
            spentElement.textContent = `₹${spent.toLocaleString()}`;
        }
        
        if (statusElement && budget > 0) {
            const percentage = (spent / budget) * 100;
            if (percentage > 100) {
                statusElement.textContent = `${(percentage - 100).toFixed(1)}% over`;
                statusElement.className = 'budget-status over-budget';
            } else if (percentage > 80) {
                statusElement.textContent = `${(100 - percentage).toFixed(1)}% remaining`;
                statusElement.className = 'budget-status warning';
            } else {
                statusElement.textContent = `${(100 - percentage).toFixed(1)}% remaining`;
                statusElement.className = 'budget-status under-budget';
            }
        } else if (statusElement) {
            statusElement.textContent = '';
            statusElement.className = 'budget-status';
        }
    }
    
    updateCategoryProgress(category) {
        const categoryTotals = this.dataManager.getCategoryTotals(this.currentMonth, this.currentYear);
        const spent = categoryTotals[category] || 0;
        const budget = parseFloat(document.getElementById(`budget-${category}`)?.value) || 0;
        
        const progressBar = document.getElementById(`progress-${category}`);
        if (progressBar && budget > 0) {
            const percentage = Math.min((spent / budget) * 100, 100);
            progressBar.style.width = `${percentage}%`;
            
            if (percentage > 100) {
                progressBar.className = 'progress-bar over-budget';
            } else if (percentage > 80) {
                progressBar.className = 'progress-bar warning';
            } else {
                progressBar.className = 'progress-bar under-budget';
            }
        } else if (progressBar) {
            progressBar.style.width = '0%';
            progressBar.className = 'progress-bar';
        }
    }
    
    updateBudgetTotal() {
        let total = 0;
        this.categories.forEach(category => {
            const amount = parseFloat(document.getElementById(`budget-${category}`)?.value) || 0;
            total += amount;
        });
        
        const totalElement = document.getElementById('totalBudget');
        if (totalElement) {
            totalElement.textContent = `₹${total.toLocaleString()}`;
        }
    }
    
    saveBudget() {
        let saved = false;
        
        this.categories.forEach(category => {
            const amount = parseFloat(document.getElementById(`budget-${category}`)?.value) || 0;
            if (amount > 0) {
                this.dataManager.setBudgetForCategory(category, amount, this.currentMonth, this.currentYear);
                saved = true;
            }
        });
        
        if (saved) {
            if (window.expenseTracker?.notificationManager) {
                window.expenseTracker.notificationManager.showSuccess('Budget saved successfully');
            }
            this.updateBudgetDisplay();
        } else {
            if (window.expenseTracker?.notificationManager) {
                window.expenseTracker.notificationManager.showWarning('No budget amounts entered');
            }
        }
        
        // Close modal
        document.getElementById('budgetModal').classList.remove('active');
        document.getElementById('overlay').classList.remove('active');
    }
    
    copyPreviousBudget() {
        let prevMonth = this.currentMonth - 1;
        let prevYear = this.currentYear;
        
        if (prevMonth < 0) {
            prevMonth = 11;
            prevYear = this.currentYear - 1;
        }
        
        let copied = false;
        this.categories.forEach(category => {
            const prevBudget = this.dataManager.getBudgetForCategory(category, prevMonth, prevYear);
            if (prevBudget > 0) {
                const input = document.getElementById(`budget-${category}`);
                if (input) {
                    input.value = prevBudget;
                    copied = true;
                }
            }
        });
        
        if (copied) {
            this.updateBudgetTotal();
            this.categories.forEach(category => this.updateCategoryProgress(category));
            if (window.expenseTracker?.notificationManager) {
                window.expenseTracker.notificationManager.showSuccess('Previous month budget copied');
            }
        } else {
            if (window.expenseTracker?.notificationManager) {
                window.expenseTracker.notificationManager.showWarning('No previous month budget found');
            }
        }
    }
    
    clearBudget() {
        if (confirm('Are you sure you want to clear all budget amounts?')) {
            this.categories.forEach(category => {
                const input = document.getElementById(`budget-${category}`);
                if (input) {
                    input.value = '';
                }
            });
            this.updateBudgetTotal();
            this.categories.forEach(category => this.updateCategoryProgress(category));
        }
    }
    
    updateBudgetDisplay() {
        // Update dashboard with budget information
        const budgetContainer = document.getElementById('budgetOverview');
        if (!budgetContainer) {
            this.createBudgetOverview();
        }
        
        this.renderBudgetOverview();
    }
    
    createBudgetOverview() {
        const dashboardSection = document.querySelector('.dashboard');
        if (dashboardSection) {
            const budgetHTML = `
                <div id="budgetOverview" class="budget-overview">
                    <h3>Budget Overview</h3>
                    <div class="budget-summary-cards">
                        <div class="budget-card">
                            <span class="budget-label">Total Budget</span>
                            <span id="totalMonthlyBudget" class="budget-amount">₹0</span>
                        </div>
                        <div class="budget-card">
                            <span class="budget-label">Total Spent</span>
                            <span id="totalMonthlySpent" class="budget-amount">₹0</span>
                        </div>
                        <div class="budget-card">
                            <span class="budget-label">Remaining</span>
                            <span id="budgetRemaining" class="budget-amount">₹0</span>
                        </div>
                    </div>
                    <div class="budget-alerts" id="budgetAlerts"></div>
                </div>
            `;
            dashboardSection.insertAdjacentHTML('beforeend', budgetHTML);
        }
    }
    
    renderBudgetOverview() {
        const categoryTotals = this.dataManager.getCategoryTotals(this.currentMonth, this.currentYear);
        let totalBudget = 0;
        let totalSpent = 0;
        
        this.categories.forEach(category => {
            const budget = this.dataManager.getBudgetForCategory(category, this.currentMonth, this.currentYear);
            const spent = categoryTotals[category] || 0;
            
            totalBudget += budget;
            totalSpent += spent;
        });
        
        const remaining = totalBudget - totalSpent;
        
        // Update budget summary
        const totalBudgetElement = document.getElementById('totalMonthlyBudget');
        const totalSpentElement = document.getElementById('totalMonthlySpent');
        const remainingElement = document.getElementById('budgetRemaining');
        
        if (totalBudgetElement) totalBudgetElement.textContent = `₹${totalBudget.toLocaleString()}`;
        if (totalSpentElement) totalSpentElement.textContent = `₹${totalSpent.toLocaleString()}`;
        if (remainingElement) {
            remainingElement.textContent = `₹${remaining.toLocaleString()}`;
            remainingElement.classList.remove('positive-balance', 'negative-balance');
            if (remaining >= 0) {
                remainingElement.classList.add('positive-balance');
            } else {
                remainingElement.classList.add('negative-balance');
            }
        }
        
        // Update budget alerts
        this.updateBudgetAlerts();
    }
    
    updateBudgetAlerts() {
        const alertsContainer = document.getElementById('budgetAlerts');
        if (!alertsContainer) return;
        
        const categoryTotals = this.dataManager.getCategoryTotals(this.currentMonth, this.currentYear);
        const alerts = [];
        
        this.categories.forEach(category => {
            const budget = this.dataManager.getBudgetForCategory(category, this.currentMonth, this.currentYear);
            const spent = categoryTotals[category] || 0;
            
            if (budget > 0) {
                const percentage = (spent / budget) * 100;
                
                if (percentage > 100) {
                    alerts.push({
                        type: 'danger',
                        message: `${category}: ₹${(spent - budget).toLocaleString()} over budget`,
                        category
                    });
                } else if (percentage > 80) {
                    alerts.push({
                        type: 'warning',
                        message: `${category}: ${(100 - percentage).toFixed(1)}% budget remaining`,
                        category
                    });
                }
            }
        });
        
        if (alerts.length > 0) {
            alertsContainer.innerHTML = alerts.map(alert => `
                <div class="budget-alert budget-alert-${alert.type}">
                    <span class="alert-icon">${alert.type === 'danger' ? '⚠️' : '⚡'}</span>
                    <span class="alert-message">${alert.message}</span>
                </div>
            `).join('');
        } else if (this.getTotalBudget() > 0) {
            alertsContainer.innerHTML = `
                <div class="budget-alert budget-alert-success">
                    <span class="alert-icon">✅</span>
                    <span class="alert-message">All categories within budget</span>
                </div>
            `;
        } else {
            alertsContainer.innerHTML = '';
        }
    }
    
    getTotalBudget() {
        let total = 0;
        this.categories.forEach(category => {
            total += this.dataManager.getBudgetForCategory(category, this.currentMonth, this.currentYear);
        });
        return total;
    }
    
    checkBudgetAfterExpense(category, amount) {
        const budget = this.dataManager.getBudgetForCategory(category, this.currentMonth, this.currentYear);
        if (budget > 0) {
            const categoryTotals = this.dataManager.getCategoryTotals(this.currentMonth, this.currentYear);
            const totalSpent = categoryTotals[category] || 0;
            const percentage = (totalSpent / budget) * 100;
            
            if (percentage > 100) {
                if (window.expenseTracker?.notificationManager) {
                    window.expenseTracker.notificationManager.showWarning(
                        `${category} budget exceeded! You're ₹${(totalSpent - budget).toLocaleString()} over budget.`
                    );
                }
            } else if (percentage > 80) {
                if (window.expenseTracker?.notificationManager) {
                    window.expenseTracker.notificationManager.showInfo(
                        `${category}: ${(100 - percentage).toFixed(1)}% budget remaining`
                    );
                }
            }
        }
        
        this.updateBudgetDisplay();
    }
    
    checkBudgetAlerts() {
        const categoryTotals = this.dataManager.getCategoryTotals(this.currentMonth, this.currentYear);
        const overBudgetCategories = [];
        
        this.categories.forEach(category => {
            const budget = this.dataManager.getBudgetForCategory(category, this.currentMonth, this.currentYear);
            const spent = categoryTotals[category] || 0;
            
            if (budget > 0 && spent > budget) {
                overBudgetCategories.push({
                    category,
                    overage: spent - budget
                });
            }
        });
        
        if (overBudgetCategories.length > 0 && window.expenseTracker?.notificationManager) {
            const message = `Budget Alert: ${overBudgetCategories.length} ${overBudgetCategories.length === 1 ? 'category is' : 'categories are'} over budget`;
            window.expenseTracker.notificationManager.showWarning(message);
        }
    }
    
    isDateOverBudget(date) {
        const month = date.getMonth();
        const year = date.getFullYear();
        
        if (month !== this.currentMonth || year !== this.currentYear) {
            return false;
        }
        
        const categoryTotals = this.dataManager.getCategoryTotals(month, year);
        
        return this.categories.some(category => {
            const budget = this.dataManager.getBudgetForCategory(category, month, year);
            const spent = categoryTotals[category] || 0;
            return budget > 0 && spent > budget;
        });
    }
    
    getBudgetProgress() {
        const categoryTotals = this.dataManager.getCategoryTotals(this.currentMonth, this.currentYear);
        const progress = {};
        
        this.categories.forEach(category => {
            const budget = this.dataManager.getBudgetForCategory(category, this.currentMonth, this.currentYear);
            const spent = categoryTotals[category] || 0;
            
            if (budget > 0) {
                progress[category] = {
                    budget,
                    spent,
                    percentage: (spent / budget) * 100,
                    remaining: budget - spent,
                    status: spent > budget ? 'over' : spent > budget * 0.8 ? 'warning' : 'good'
                };
            }
        });
        
        return progress;
    }
}
