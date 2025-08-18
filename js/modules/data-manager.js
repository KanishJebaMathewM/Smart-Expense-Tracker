/**
 * Data Manager Module
 * Handles all data storage, retrieval, and management operations
 */

class DataManager {
    constructor() {
        this.STORAGE_KEYS = {
            INCOME: 'monthlyIncomes',
            EXPENSES: 'expenses',
            BUDGETS: 'budgets',
            GOALS: 'goals',
            RECURRING: 'recurringExpenses',
            SETTINGS: 'appSettings',
            BACKUP: 'dataBackup'
        };
        
        this.expenses = this.getExpenses();
    }
    
    // Income management
    getIncome(month, year) {
        const incomes = this.getAllIncomes();
        const key = `${year}-${String(month + 1).padStart(2, '0')}`;
        return parseFloat(incomes[key]) || 0;
    }
    
    setIncome(amount, month, year) {
        const incomes = this.getAllIncomes();
        const key = `${year}-${String(month + 1).padStart(2, '0')}`;
        incomes[key] = amount;
        localStorage.setItem(this.STORAGE_KEYS.INCOME, JSON.stringify(incomes));
        return true;
    }
    
    getAllIncomes() {
        const incomes = localStorage.getItem(this.STORAGE_KEYS.INCOME);
        return incomes ? JSON.parse(incomes) : {};
    }
    
    getAllTimeIncome() {
        const allIncomes = this.getAllIncomes();
        return Object.values(allIncomes).reduce((total, income) => total + parseFloat(income), 0);
    }
    
    // Expense management
    getExpenses() {
        const expenses = localStorage.getItem(this.STORAGE_KEYS.EXPENSES);
        return expenses ? JSON.parse(expenses) : {};
    }
    
    setExpenses(expenses) {
        localStorage.setItem(this.STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
        this.expenses = expenses;
    }
    
    getDateKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
    
    getExpensesForDate(date) {
        const dateKey = this.getDateKey(date);
        return this.expenses[dateKey] || [];
    }
    
    addExpenseForDate(date, expense) {
        const dateKey = this.getDateKey(date);
        if (!this.expenses[dateKey]) {
            this.expenses[dateKey] = [];
        }
        
        expense.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        expense.timestamp = new Date().toISOString();
        this.expenses[dateKey].push(expense);
        this.setExpenses(this.expenses);
        return expense.id;
    }
    
    updateExpenseForDate(date, expenseId, updatedExpense) {
        const dateKey = this.getDateKey(date);
        if (this.expenses[dateKey]) {
            const index = this.expenses[dateKey].findIndex(exp => exp.id === expenseId);
            if (index !== -1) {
                this.expenses[dateKey][index] = { 
                    ...updatedExpense, 
                    id: expenseId,
                    timestamp: this.expenses[dateKey][index].timestamp,
                    lastModified: new Date().toISOString()
                };
                this.setExpenses(this.expenses);
                return true;
            }
        }
        return false;
    }
    
    deleteExpenseForDate(date, expenseId) {
        const dateKey = this.getDateKey(date);
        if (this.expenses[dateKey]) {
            this.expenses[dateKey] = this.expenses[dateKey].filter(exp => exp.id !== expenseId);
            if (this.expenses[dateKey].length === 0) {
                delete this.expenses[dateKey];
            }
            this.setExpenses(this.expenses);
            return true;
        }
        return false;
    }
    
    getTotalExpensesForDate(date) {
        const expenses = this.getExpensesForDate(date);
        return expenses.reduce((total, expense) => total + parseFloat(expense.amount), 0);
    }
    
    getTotalMonthlyExpenses(month, year) {
        let total = 0;
        Object.keys(this.expenses).forEach(dateKey => {
            const [expenseYear, expenseMonth] = dateKey.split('-');
            if (parseInt(expenseYear) === year && parseInt(expenseMonth) === month + 1) {
                this.expenses[dateKey].forEach(expense => {
                    total += parseFloat(expense.amount);
                });
            }
        });
        return total;
    }
    
    getAllTimeExpenses() {
        let total = 0;
        Object.keys(this.expenses).forEach(dateKey => {
            this.expenses[dateKey].forEach(expense => {
                total += parseFloat(expense.amount);
            });
        });
        return total;
    }
    
    // Category analysis
    getCategoryTotals(month, year) {
        const totals = {};
        
        Object.keys(this.expenses).forEach(dateKey => {
            const [expenseYear, expenseMonth] = dateKey.split('-');
            if (parseInt(expenseYear) === year && parseInt(expenseMonth) === month + 1) {
                this.expenses[dateKey].forEach(expense => {
                    if (!totals[expense.category]) {
                        totals[expense.category] = 0;
                    }
                    totals[expense.category] += parseFloat(expense.amount);
                });
            }
        });
        
        return totals;
    }
    
    getDailyTotals(month, year) {
        const totals = {};
        
        Object.keys(this.expenses).forEach(dateKey => {
            const [expenseYear, expenseMonth, day] = dateKey.split('-');
            if (parseInt(expenseYear) === year && parseInt(expenseMonth) === month + 1) {
                const dayNum = parseInt(day);
                if (!totals[dayNum]) {
                    totals[dayNum] = 0;
                }
                this.expenses[dateKey].forEach(expense => {
                    totals[dayNum] += parseFloat(expense.amount);
                });
            }
        });
        
        return totals;
    }
    
    // Search functionality
    searchExpenses(query, filters = {}) {
        const results = [];
        const queryLower = query.toLowerCase();
        
        Object.keys(this.expenses).forEach(dateKey => {
            const [year, month, day] = dateKey.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            
            // Apply date range filter
            if (filters.startDate && date < filters.startDate) return;
            if (filters.endDate && date > filters.endDate) return;
            
            this.expenses[dateKey].forEach(expense => {
                // Apply category filter
                if (filters.categories && filters.categories.length > 0 && !filters.categories.includes(expense.category)) {
                    return;
                }
                
                // Apply amount range filter
                if (filters.minAmount && expense.amount < filters.minAmount) return;
                if (filters.maxAmount && expense.amount > filters.maxAmount) return;
                
                // Apply text search
                if (!query || 
                    expense.name.toLowerCase().includes(queryLower) || 
                    expense.category.toLowerCase().includes(queryLower)) {
                    results.push({
                        ...expense,
                        date: dateKey,
                        dateObj: date
                    });
                }
            });
        });
        
        return results.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    // Budget management
    getBudgets() {
        const budgets = localStorage.getItem(this.STORAGE_KEYS.BUDGETS);
        return budgets ? JSON.parse(budgets) : {};
    }
    
    setBudgets(budgets) {
        localStorage.setItem(this.STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    }
    
    getBudgetForCategory(category, month, year) {
        const budgets = this.getBudgets();
        const key = `${year}-${String(month + 1).padStart(2, '0')}`;
        return budgets[key] && budgets[key][category] ? parseFloat(budgets[key][category]) : 0;
    }
    
    setBudgetForCategory(category, amount, month, year) {
        const budgets = this.getBudgets();
        const key = `${year}-${String(month + 1).padStart(2, '0')}`;
        
        if (!budgets[key]) {
            budgets[key] = {};
        }
        
        budgets[key][category] = amount;
        this.setBudgets(budgets);
    }
    
    // Goals management
    getGoals() {
        const goals = localStorage.getItem(this.STORAGE_KEYS.GOALS);
        return goals ? JSON.parse(goals) : [];
    }
    
    setGoals(goals) {
        localStorage.setItem(this.STORAGE_KEYS.GOALS, JSON.stringify(goals));
    }
    
    addGoal(goal) {
        const goals = this.getGoals();
        goal.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        goal.createdAt = new Date().toISOString();
        goals.push(goal);
        this.setGoals(goals);
        return goal.id;
    }
    
    updateGoal(goalId, updatedGoal) {
        const goals = this.getGoals();
        const index = goals.findIndex(g => g.id === goalId);
        if (index !== -1) {
            goals[index] = { ...goals[index], ...updatedGoal, lastModified: new Date().toISOString() };
            this.setGoals(goals);
            return true;
        }
        return false;
    }
    
    deleteGoal(goalId) {
        const goals = this.getGoals();
        const filtered = goals.filter(g => g.id !== goalId);
        this.setGoals(filtered);
        return filtered.length < goals.length;
    }
    
    // Recurring expenses
    getRecurringExpenses() {
        const recurring = localStorage.getItem(this.STORAGE_KEYS.RECURRING);
        return recurring ? JSON.parse(recurring) : [];
    }
    
    setRecurringExpenses(recurring) {
        localStorage.setItem(this.STORAGE_KEYS.RECURRING, JSON.stringify(recurring));
    }
    
    addRecurringExpense(recurringExpense) {
        const recurring = this.getRecurringExpenses();
        recurringExpense.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        recurringExpense.createdAt = new Date().toISOString();
        recurring.push(recurringExpense);
        this.setRecurringExpenses(recurring);
        return recurringExpense.id;
    }
    
    updateRecurringExpense(id, updatedExpense) {
        const recurring = this.getRecurringExpenses();
        const index = recurring.findIndex(r => r.id === id);
        if (index !== -1) {
            recurring[index] = { ...recurring[index], ...updatedExpense, lastModified: new Date().toISOString() };
            this.setRecurringExpenses(recurring);
            return true;
        }
        return false;
    }
    
    deleteRecurringExpense(id) {
        const recurring = this.getRecurringExpenses();
        const filtered = recurring.filter(r => r.id !== id);
        this.setRecurringExpenses(filtered);
        return filtered.length < recurring.length;
    }
    
    // Settings management
    getSettings() {
        const settings = localStorage.getItem(this.STORAGE_KEYS.SETTINGS);
        return settings ? JSON.parse(settings) : this.getDefaultSettings();
    }
    
    setSettings(settings) {
        localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    }
    
    getDefaultSettings() {
        return {
            theme: 'light',
            currency: '₹',
            dateFormat: 'DD/MM/YYYY',
            notifications: true,
            autoBackup: false,
            budgetAlerts: true,
            goalReminders: true,
            categories: [
                'Food', 'Transportation', 'Entertainment', 'Shopping', 
                'Bills', 'Health', 'Education', 'Other'
            ],
            language: 'en'
        };
    }
    
    // Data export/import
    exportData() {
        const data = {
            incomes: this.getAllIncomes(),
            expenses: this.getExpenses(),
            budgets: this.getBudgets(),
            goals: this.getGoals(),
            recurring: this.getRecurringExpenses(),
            settings: this.getSettings(),
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };
        
        return data;
    }
    
    importData(data) {
        try {
            if (data.incomes) {
                localStorage.setItem(this.STORAGE_KEYS.INCOME, JSON.stringify(data.incomes));
            }
            if (data.expenses) {
                localStorage.setItem(this.STORAGE_KEYS.EXPENSES, JSON.stringify(data.expenses));
                this.expenses = data.expenses;
            }
            if (data.budgets) {
                localStorage.setItem(this.STORAGE_KEYS.BUDGETS, JSON.stringify(data.budgets));
            }
            if (data.goals) {
                localStorage.setItem(this.STORAGE_KEYS.GOALS, JSON.stringify(data.goals));
            }
            if (data.recurring) {
                localStorage.setItem(this.STORAGE_KEYS.RECURRING, JSON.stringify(data.recurring));
            }
            if (data.settings) {
                localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
            }
            
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
    
    // Data backup
    createBackup() {
        const backup = {
            data: this.exportData(),
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem(this.STORAGE_KEYS.BACKUP, JSON.stringify(backup));
        return backup;
    }
    
    restoreBackup() {
        const backup = localStorage.getItem(this.STORAGE_KEYS.BACKUP);
        if (backup) {
            const backupData = JSON.parse(backup);
            return this.importData(backupData.data);
        }
        return false;
    }
    
    // Clear all data
    clearAllData() {
        Object.values(this.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        this.expenses = {};
    }
    
    // Get statistics
    getStatistics() {
        const allIncomes = this.getAllIncomes();
        const totalMonths = Object.keys(allIncomes).length;
        const totalExpenseDays = Object.keys(this.expenses).length;
        const totalExpenseEntries = Object.values(this.expenses).reduce((sum, dayExpenses) => sum + dayExpenses.length, 0);
        
        return {
            totalIncome: this.getAllTimeIncome(),
            totalExpenses: this.getAllTimeExpenses(),
            totalSavings: this.getAllTimeIncome() - this.getAllTimeExpenses(),
            totalMonths,
            totalExpenseDays,
            totalExpenseEntries,
            averageMonthlyIncome: totalMonths > 0 ? this.getAllTimeIncome() / totalMonths : 0,
            averageMonthlyExpenses: totalMonths > 0 ? this.getAllTimeExpenses() / totalMonths : 0
        };
    }
    
    // Get trends data
    getTrendsData(months = 12) {
        const trends = [];
        const currentDate = new Date();
        
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const month = date.getMonth();
            const year = date.getFullYear();
            
            trends.push({
                month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                income: this.getIncome(month, year),
                expenses: this.getTotalMonthlyExpenses(month, year),
                savings: this.getIncome(month, year) - this.getTotalMonthlyExpenses(month, year),
                date: date
            });
        }
        
        return trends;
    }
}
