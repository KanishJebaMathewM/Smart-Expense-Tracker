/**
 * Smart Expense Tracker - Core Application Module
 * Main application controller and initialization
 */

class ExpenseTrackerApp {
    constructor() {
        this.currentDate = new Date();
        this.currentMonth = this.currentDate.getMonth();
        this.currentYear = this.currentDate.getFullYear();
        this.selectedDate = null;
        this.editingExpenseId = null;
        
        // Module instances
        this.dataManager = null;
        this.budgetManager = null;
        this.chartManager = null;
        this.searchManager = null;
        this.settingsManager = null;
        this.notificationManager = null;
        this.reportsManager = null;
        this.goalsManager = null;
        this.recurringManager = null;
        this.analyticsManager = null;
        
        // Category colors for charts
        this.categoryColors = {
            'Food': '#EF4444',
            'Transportation': '#F97316',
            'Entertainment': '#8B5CF6',
            'Shopping': '#EC4899',
            'Bills': '#3B82F6',
            'Health': '#10B981',
            'Education': '#F59E0B',
            'Other': '#64748B'
        };
        
        this.init();
    }
    
    async init() {
        try {
            // Initialize core modules first
            this.dataManager = new DataManager();
            this.settingsManager = new SettingsManager();
            this.notificationManager = new NotificationManager();
            
            // Load settings first
            await this.settingsManager.loadSettings();
            
            // Initialize other modules
            this.budgetManager = new BudgetManager(this.dataManager);
            this.chartManager = new ChartManager(this.categoryColors);
            this.searchManager = new SearchManager(this.dataManager);
            this.reportsManager = new ReportsManager(this.dataManager);
            this.goalsManager = new GoalsManager(this.dataManager);
            this.recurringManager = new RecurringExpensesManager(this.dataManager);
            this.analyticsManager = new AnalyticsManager(this.dataManager);
            
            // Bind events
            this.bindEvents();
            
            // Load data
            this.loadData();
            
            // Render initial state
            this.renderCalendar();
            this.updateDashboard();
            this.chartManager.renderAllCharts();
            
            // Check for first-time setup
            this.checkFirstTimeSetup();
            
            // Process recurring expenses
            this.recurringManager.processRecurringExpenses();
            
            // Check goals and budgets
            this.checkGoalsAndBudgets();
            
            console.log('Smart Expense Tracker initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
            this.notificationManager.showError('Failed to initialize application');
        }
    }
    
    bindEvents() {
        // Core expense management events
        this.bindExpenseEvents();
        this.bindIncomeEvents();
        this.bindCalendarEvents();
        this.bindModalEvents();
        this.bindNavigationEvents();
        
        // Feature-specific events
        this.bindBudgetEvents();
        this.bindSearchEvents();
        this.bindSettingsEvents();
        this.bindReportEvents();
        this.bindGoalEvents();
        this.bindRecurringEvents();
        
        // Keyboard shortcuts
        this.bindKeyboardShortcuts();
    }
    
    bindExpenseEvents() {
        document.getElementById('saveExpense')?.addEventListener('click', () => this.saveExpense());
        document.getElementById('updateExpense')?.addEventListener('click', () => this.updateExpense());
        document.getElementById('closeExpenseModal')?.addEventListener('click', () => this.hideExpenseModal());
        
        // Form validation
        document.getElementById('expenseName')?.addEventListener('input', this.validateExpenseForm.bind(this));
        document.getElementById('expenseAmount')?.addEventListener('input', this.validateExpenseForm.bind(this));
        
        // Enter key submissions
        ['expenseName', 'expenseAmount'].forEach(id => {
            document.getElementById(id)?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.saveExpense();
            });
        });
    }
    
    bindIncomeEvents() {
        document.getElementById('setIncomeBtn')?.addEventListener('click', () => this.showIncomeModal());
        document.getElementById('closeIncomeModal')?.addEventListener('click', () => this.hideIncomeModal());
        document.getElementById('saveIncome')?.addEventListener('click', () => this.saveIncome());
        
        document.getElementById('incomeAmount')?.addEventListener('input', this.validateIncomeForm.bind(this));
        document.getElementById('incomeAmount')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveIncome();
        });
    }
    
    bindCalendarEvents() {
        document.getElementById('prevMonth')?.addEventListener('click', () => this.previousMonth());
        document.getElementById('nextMonth')?.addEventListener('click', () => this.nextMonth());
    }
    
    bindModalEvents() {
        document.getElementById('overlay')?.addEventListener('click', () => {
            this.hideIncomeModal();
            this.hideExpenseModal();
            this.hideBudgetModal();
            this.hideGoalModal();
            this.hideSettingsModal();
        });
        
        // Prevent modal close on content click
        document.querySelectorAll('.modal-content').forEach(content => {
            content.addEventListener('click', (e) => e.stopPropagation());
        });
    }
    
    bindNavigationEvents() {
        // Tab navigation for different sections
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetSection = e.target.dataset.section;
                this.switchSection(targetSection);
            });
        });
    }
    
    bindBudgetEvents() {
        document.getElementById('budgetBtn')?.addEventListener('click', () => this.budgetManager.showBudgetModal());
        document.getElementById('saveBudget')?.addEventListener('click', () => this.budgetManager.saveBudget());
        document.getElementById('closeBudgetModal')?.addEventListener('click', () => this.hideBudgetModal());
    }
    
    bindSearchEvents() {
        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            this.searchManager.performSearch(e.target.value);
        });
        
        document.getElementById('filterBtn')?.addEventListener('click', () => {
            this.searchManager.showFilterModal();
        });
    }
    
    bindSettingsEvents() {
        document.getElementById('settingsBtn')?.addEventListener('click', () => this.settingsManager.showSettingsModal());
        document.getElementById('saveSettings')?.addEventListener('click', () => this.settingsManager.saveSettings());
        document.getElementById('closeSettingsModal')?.addEventListener('click', () => this.hideSettingsModal());
    }
    
    bindReportEvents() {
        document.getElementById('reportsBtn')?.addEventListener('click', () => this.reportsManager.showReportsModal());
        document.getElementById('generateReport')?.addEventListener('click', () => this.reportsManager.generateReport());
    }
    
    bindGoalEvents() {
        document.getElementById('goalsBtn')?.addEventListener('click', () => this.goalsManager.showGoalsModal());
        document.getElementById('saveGoal')?.addEventListener('click', () => this.goalsManager.saveGoal());
        document.getElementById('closeGoalModal')?.addEventListener('click', () => this.hideGoalModal());
    }
    
    bindRecurringEvents() {
        document.getElementById('recurringBtn')?.addEventListener('click', () => this.recurringManager.showRecurringModal());
        document.getElementById('saveRecurring')?.addEventListener('click', () => this.recurringManager.saveRecurringExpense());
    }
    
    bindKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when no modal is open
            if (document.querySelector('.modal.active')) return;
            
            switch(e.key) {
                case 'i':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.showIncomeModal();
                    }
                    break;
                case 'e':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        const today = new Date();
                        this.showExpenseModal(today);
                    }
                    break;
                case 'b':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.budgetManager.showBudgetModal();
                    }
                    break;
                case 's':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.settingsManager.showSettingsModal();
                    }
                    break;
                case 'r':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.reportsManager.showReportsModal();
                    }
                    break;
                case 'Escape':
                    this.hideAllModals();
                    break;
            }
        });
    }
    
    // Data loading and management
    loadData() {
        this.income = this.dataManager.getIncome(this.currentMonth, this.currentYear);
        this.expenses = this.dataManager.getExpenses();
    }
    
    // Calendar methods
    renderCalendar() {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        document.getElementById('currentMonth').textContent = 
            `${monthNames[this.currentMonth]} ${this.currentYear}`;
        
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        const calendarDates = document.getElementById('calendarDates');
        calendarDates.innerHTML = '';
        
        // Previous month's trailing dates
        const prevMonth = new Date(this.currentYear, this.currentMonth - 1, 0);
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const date = new Date(this.currentYear, this.currentMonth - 1, prevMonth.getDate() - i);
            const dateElement = this.createDateElement(date, true);
            calendarDates.appendChild(dateElement);
        }
        
        // Current month dates
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(this.currentYear, this.currentMonth, day);
            const dateElement = this.createDateElement(date, false);
            calendarDates.appendChild(dateElement);
        }
        
        // Next month's leading dates
        const totalCells = calendarDates.children.length;
        const remainingCells = 42 - totalCells;
        for (let day = 1; day <= remainingCells; day++) {
            const date = new Date(this.currentYear, this.currentMonth + 1, day);
            const dateElement = this.createDateElement(date, true);
            calendarDates.appendChild(dateElement);
        }
    }
    
    createDateElement(date, isOtherMonth) {
        const dateElement = document.createElement('div');
        dateElement.className = 'calendar-date';
        
        if (isOtherMonth) {
            dateElement.classList.add('other-month');
        }
        
        // Check if this is today
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            dateElement.classList.add('today');
        }
        
        // Check if there are expenses for this date
        const totalExpenses = this.dataManager.getTotalExpensesForDate(date);
        if (totalExpenses > 0) {
            dateElement.classList.add('has-expenses');
        }
        
        // Check if this date exceeds budget
        if (this.budgetManager && this.budgetManager.isDateOverBudget(date)) {
            dateElement.classList.add('over-budget');
        }
        
        dateElement.innerHTML = `
            <div class="date-number">${date.getDate()}</div>
            ${totalExpenses > 0 ? `<div class="date-amount">₹${totalExpenses.toFixed(0)}</div>` : ''}
        `;
        
        dateElement.addEventListener('click', () => {
            if (!isOtherMonth) {
                this.showExpenseModal(date);
            }
        });
        
        return dateElement;
    }
    
    // Navigation methods
    previousMonth() {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.refreshDisplay();
    }
    
    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.refreshDisplay();
    }
    
    refreshDisplay() {
        this.loadData();
        this.renderCalendar();
        this.updateDashboard();
        this.chartManager.renderAllCharts();
        this.budgetManager.updateBudgetDisplay();
        this.checkGoalsAndBudgets();
    }
    
    // Dashboard update
    updateDashboard() {
        const income = this.dataManager.getIncome(this.currentMonth, this.currentYear);
        const totalSpent = this.dataManager.getTotalMonthlyExpenses(this.currentMonth, this.currentYear);
        const balance = income - totalSpent;
        
        // Update dashboard cards
        document.getElementById('monthlyIncome').textContent = `₹${income.toLocaleString()}`;
        document.getElementById('totalSpent').textContent = `₹${totalSpent.toLocaleString()}`;
        document.getElementById('remainingBalance').textContent = `₹${balance.toLocaleString()}`;
        
        // Update header balance
        const headerBalance = document.getElementById('headerBalance');
        headerBalance.textContent = `₹${balance.toLocaleString()}`;
        
        // Apply color classes based on balance
        const balanceElements = [
            document.getElementById('remainingBalance'),
            headerBalance
        ];
        
        balanceElements.forEach(element => {
            element.classList.remove('positive-balance', 'negative-balance');
            if (balance >= 0) {
                element.classList.add('positive-balance');
            } else {
                element.classList.add('negative-balance');
            }
        });
        
        // Update month comparison
        this.updateMonthComparison();
        
        // Update all-time totals
        this.updateAllTimeTotals();
    }
    
    updateMonthComparison() {
        // Implementation similar to previous version
        // (keeping existing logic)
    }
    
    updateAllTimeTotals() {
        const totalIncome = this.dataManager.getAllTimeIncome();
        const totalExpenses = this.dataManager.getAllTimeExpenses();
        const totalSavings = totalIncome - totalExpenses;
        
        document.getElementById('allTimeIncome').textContent = `₹${totalIncome.toLocaleString()}`;
        document.getElementById('allTimeExpenses').textContent = `₹${totalExpenses.toLocaleString()}`;
        
        const savingsElement = document.getElementById('allTimeSavings');
        savingsElement.textContent = `₹${totalSavings.toLocaleString()}`;
        
        savingsElement.classList.remove('positive-balance', 'negative-balance');
        if (totalSavings >= 0) {
            savingsElement.classList.add('positive-balance');
        } else {
            savingsElement.classList.add('negative-balance');
        }
    }
    
    // Modal management
    showExpenseModal(date) {
        this.selectedDate = date;
        // Implementation continues...
    }
    
    hideExpenseModal() {
        document.getElementById('expenseModal')?.classList.remove('active');
        document.getElementById('overlay')?.classList.remove('active');
        this.selectedDate = null;
        this.editingExpenseId = null;
    }
    
    showIncomeModal() {
        document.getElementById('incomeModal')?.classList.add('active');
        document.getElementById('overlay')?.classList.add('active');
        const currentIncome = this.dataManager.getIncome(this.currentMonth, this.currentYear);
        document.getElementById('incomeAmount').value = currentIncome || '';
        document.getElementById('incomeAmount').focus();
    }
    
    hideIncomeModal() {
        document.getElementById('incomeModal')?.classList.remove('active');
        document.getElementById('overlay')?.classList.remove('active');
    }
    
    hideBudgetModal() {
        document.getElementById('budgetModal')?.classList.remove('active');
        document.getElementById('overlay')?.classList.remove('active');
    }
    
    hideGoalModal() {
        document.getElementById('goalModal')?.classList.remove('active');
        document.getElementById('overlay')?.classList.remove('active');
    }
    
    hideSettingsModal() {
        document.getElementById('settingsModal')?.classList.remove('active');
        document.getElementById('overlay')?.classList.remove('active');
    }
    
    hideAllModals() {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
        document.getElementById('overlay')?.classList.remove('active');
    }
    
    // Form validation
    validateExpenseForm() {
        const name = document.getElementById('expenseName').value.trim();
        const amount = document.getElementById('expenseAmount').value;
        const saveBtn = document.getElementById('saveExpense');
        const updateBtn = document.getElementById('updateExpense');
        
        const isValid = name && amount && parseFloat(amount) > 0;
        saveBtn.disabled = !isValid;
        updateBtn.disabled = !isValid;
    }
    
    validateIncomeForm() {
        const amount = document.getElementById('incomeAmount').value;
        const saveBtn = document.getElementById('saveIncome');
        saveBtn.disabled = !amount || parseFloat(amount) <= 0;
    }
    
    // Expense operations
    saveExpense() {
        const name = document.getElementById('expenseName').value.trim();
        const category = document.getElementById('expenseCategory').value;
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        
        if (name && amount && amount > 0 && this.selectedDate) {
            const expense = { name, category, amount };
            this.dataManager.addExpenseForDate(this.selectedDate, expense);
            
            this.clearExpenseForm();
            this.renderExpensesList(this.selectedDate);
            this.refreshDisplay();
            
            // Check budget after adding expense
            this.budgetManager.checkBudgetAfterExpense(category, amount);
            
            this.notificationManager.showSuccess('Expense added successfully');
        }
    }
    
    saveIncome() {
        const amount = parseFloat(document.getElementById('incomeAmount').value);
        if (amount && amount > 0) {
            this.dataManager.setIncome(amount, this.currentMonth, this.currentYear);
            this.refreshDisplay();
            this.hideIncomeModal();
            this.notificationManager.showSuccess('Income updated successfully');
        }
    }
    
    clearExpenseForm() {
        document.getElementById('expenseName').value = '';
        document.getElementById('expenseCategory').value = 'Food';
        document.getElementById('expenseAmount').value = '';
    }
    
    // Utility methods
    checkFirstTimeSetup() {
        if (!this.dataManager.getIncome(this.currentMonth, this.currentYear)) {
            setTimeout(() => {
                this.showIncomeModal();
            }, 1000);
        }
    }
    
    checkGoalsAndBudgets() {
        this.budgetManager.checkBudgetAlerts();
        this.goalsManager.checkGoalProgress();
    }
    
    switchSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.app-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        document.getElementById(`${sectionName}Section`)?.classList.add('active');
        
        // Update navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`)?.classList.add('active');
    }
}

// Global app instance
window.expenseTracker = null;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.expenseTracker = new ExpenseTrackerApp();
});
