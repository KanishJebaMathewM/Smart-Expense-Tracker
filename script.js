// Smart Expense Tracker - Main JavaScript File
class ExpenseTracker {
    constructor() {
        this.currentDate = new Date();
        this.currentMonth = this.currentDate.getMonth();
        this.currentYear = this.currentDate.getFullYear();
        this.selectedDate = null;
        this.editingExpenseId = null;
        
        // Data storage keys
        this.STORAGE_KEYS = {
            INCOME: 'monthlyIncomes', // Changed to plural for month-specific storage
            EXPENSES: 'expenses'
        };
        
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
    
    init() {
        this.bindEvents();
        this.loadData();
        this.renderCalendar();
        this.updateDashboard();
        this.renderCharts();
        
        // Check if income is set, if not show modal
        if (!this.getIncome()) {
            // Delay showing modal for better initial load experience
            setTimeout(() => {
                this.showIncomeModal();
            }, 1000);
        }
    }
    
    bindEvents() {
        // Income modal events
        document.getElementById('setIncomeBtn').addEventListener('click', () => this.showIncomeModal());
        document.getElementById('closeIncomeModal').addEventListener('click', () => this.hideIncomeModal());
        document.getElementById('saveIncome').addEventListener('click', () => this.saveIncome());
        
        // Expense modal events
        document.getElementById('closeExpenseModal').addEventListener('click', () => this.hideExpenseModal());
        document.getElementById('saveExpense').addEventListener('click', () => this.saveExpense());
        document.getElementById('updateExpense').addEventListener('click', () => this.updateExpense());
        
        // Calendar navigation
        document.getElementById('prevMonth').addEventListener('click', () => this.previousMonth());
        document.getElementById('nextMonth').addEventListener('click', () => this.nextMonth());
        
        // Overlay events
        document.getElementById('overlay').addEventListener('click', () => {
            this.hideIncomeModal();
            this.hideExpenseModal();
        });
        
        // Form validation
        document.getElementById('incomeAmount').addEventListener('input', this.validateIncomeForm);
        document.getElementById('expenseName').addEventListener('input', this.validateExpenseForm);
        document.getElementById('expenseAmount').addEventListener('input', this.validateExpenseForm);
        
        // Prevent modal close on content click
        document.querySelectorAll('.modal-content').forEach(content => {
            content.addEventListener('click', (e) => e.stopPropagation());
        });
        
        // Enter key submissions
        document.getElementById('incomeAmount').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveIncome();
        });
        
        ['expenseName', 'expenseAmount'].forEach(id => {
            document.getElementById(id).addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.saveExpense();
            });
        });
    }
    
    // Data Management Methods
    loadData() {
        this.income = this.getIncome();
        this.expenses = this.getExpenses();
    }

    addSampleData() {
        // Add some sample expenses for current month
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        const sampleExpenses = [
            { name: 'Groceries', category: 'Food', amount: 2500, date: new Date(currentYear, currentMonth, 5) },
            { name: 'Bus Pass', category: 'Transportation', amount: 800, date: new Date(currentYear, currentMonth, 8) },
            { name: 'Movie Tickets', category: 'Entertainment', amount: 600, date: new Date(currentYear, currentMonth, 12) },
            { name: 'Electricity Bill', category: 'Bills', amount: 1200, date: new Date(currentYear, currentMonth, 15) },
            { name: 'Restaurant', category: 'Food', amount: 800, date: new Date(currentYear, currentMonth, 18) },
            { name: 'Medicine', category: 'Health', amount: 400, date: new Date(currentYear, currentMonth, 20) }
        ];

        sampleExpenses.forEach(expense => {
            this.addExpenseForDate(expense.date, {
                name: expense.name,
                category: expense.category,
                amount: expense.amount
            });
        });
    }
    
    getIncome(month = this.currentMonth, year = this.currentYear) {
        const incomes = this.getAllIncomes();
        const key = `${year}-${String(month + 1).padStart(2, '0')}`;
        return parseFloat(incomes[key]) || 0;
    }

    setIncome(amount, month = this.currentMonth, year = this.currentYear) {
        const incomes = this.getAllIncomes();
        const key = `${year}-${String(month + 1).padStart(2, '0')}`;
        incomes[key] = amount;
        localStorage.setItem(this.STORAGE_KEYS.INCOME, JSON.stringify(incomes));
        this.income = amount;
    }

    getAllIncomes() {
        const incomes = localStorage.getItem(this.STORAGE_KEYS.INCOME);
        return incomes ? JSON.parse(incomes) : {};
    }
    
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
        
        expense.id = Date.now().toString();
        this.expenses[dateKey].push(expense);
        this.setExpenses(this.expenses);
    }
    
    updateExpenseForDate(date, expenseId, updatedExpense) {
        const dateKey = this.getDateKey(date);
        if (this.expenses[dateKey]) {
            const index = this.expenses[dateKey].findIndex(exp => exp.id === expenseId);
            if (index !== -1) {
                this.expenses[dateKey][index] = { ...updatedExpense, id: expenseId };
                this.setExpenses(this.expenses);
            }
        }
    }
    
    deleteExpenseForDate(date, expenseId) {
        const dateKey = this.getDateKey(date);
        if (this.expenses[dateKey]) {
            this.expenses[dateKey] = this.expenses[dateKey].filter(exp => exp.id !== expenseId);
            if (this.expenses[dateKey].length === 0) {
                delete this.expenses[dateKey];
            }
            this.setExpenses(this.expenses);
        }
    }
    
    getTotalExpensesForDate(date) {
        const expenses = this.getExpensesForDate(date);
        return expenses.reduce((total, expense) => total + parseFloat(expense.amount), 0);
    }
    
    getTotalMonthlyExpenses() {
        let total = 0;
        Object.keys(this.expenses).forEach(dateKey => {
            const [year, month] = dateKey.split('-');
            if (parseInt(year) === this.currentYear && parseInt(month) === this.currentMonth + 1) {
                this.expenses[dateKey].forEach(expense => {
                    total += parseFloat(expense.amount);
                });
            }
        });
        return total;
    }
    
    // Modal Management
    showIncomeModal() {
        document.getElementById('incomeModal').classList.add('active');
        document.getElementById('overlay').classList.add('active');
        document.getElementById('incomeAmount').value = this.income || '';
        document.getElementById('incomeAmount').focus();
    }
    
    hideIncomeModal() {
        document.getElementById('incomeModal').classList.remove('active');
        document.getElementById('overlay').classList.remove('active');
    }
    
    showExpenseModal(date) {
        this.selectedDate = date;
        const modal = document.getElementById('expenseModal');
        const title = document.getElementById('expenseModalTitle');
        const saveBtn = document.getElementById('saveExpense');
        const updateBtn = document.getElementById('updateExpense');
        
        title.textContent = `Expenses for ${date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })}`;
        
        // Reset form
        this.clearExpenseForm();
        saveBtn.style.display = 'block';
        updateBtn.style.display = 'none';
        this.editingExpenseId = null;
        
        // Load existing expenses
        this.renderExpensesList(date);
        
        modal.classList.add('active');
        document.getElementById('overlay').classList.add('active');
        document.getElementById('expenseName').focus();
    }
    
    hideExpenseModal() {
        document.getElementById('expenseModal').classList.remove('active');
        document.getElementById('overlay').classList.remove('active');
        this.selectedDate = null;
        this.editingExpenseId = null;
    }
    
    // Form Management
    clearExpenseForm() {
        document.getElementById('expenseName').value = '';
        document.getElementById('expenseCategory').value = 'Food';
        document.getElementById('expenseAmount').value = '';
    }
    
    validateIncomeForm() {
        const amount = document.getElementById('incomeAmount').value;
        const saveBtn = document.getElementById('saveIncome');
        saveBtn.disabled = !amount || parseFloat(amount) <= 0;
    }
    
    validateExpenseForm() {
        const name = document.getElementById('expenseName').value.trim();
        const amount = document.getElementById('expenseAmount').value;
        const saveBtn = document.getElementById('saveExpense');
        const updateBtn = document.getElementById('updateExpense');
        
        const isValid = name && amount && parseFloat(amount) > 0;
        saveBtn.disabled = !isValid;
        updateBtn.disabled = !isValid;
    }
    
    saveIncome() {
        const amount = parseFloat(document.getElementById('incomeAmount').value);
        if (amount && amount > 0) {
            this.setIncome(amount);
            this.updateDashboard();
            this.hideIncomeModal();
        }
    }
    
    saveExpense() {
        const name = document.getElementById('expenseName').value.trim();
        const category = document.getElementById('expenseCategory').value;
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        
        if (name && amount && amount > 0 && this.selectedDate) {
            const expense = { name, category, amount };
            this.addExpenseForDate(this.selectedDate, expense);
            
            this.clearExpenseForm();
            this.renderExpensesList(this.selectedDate);
            this.updateDashboard();
            this.renderCalendar();
            this.renderCharts();
        }
    }
    
    updateExpense() {
        const name = document.getElementById('expenseName').value.trim();
        const category = document.getElementById('expenseCategory').value;
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        
        if (name && amount && amount > 0 && this.selectedDate && this.editingExpenseId) {
            const expense = { name, category, amount };
            this.updateExpenseForDate(this.selectedDate, this.editingExpenseId, expense);
            
            this.clearExpenseForm();
            this.renderExpensesList(this.selectedDate);
            this.updateDashboard();
            this.renderCalendar();
            this.renderCharts();
            
            // Switch back to add mode
            document.getElementById('saveExpense').style.display = 'block';
            document.getElementById('updateExpense').style.display = 'none';
            this.editingExpenseId = null;
        }
    }
    
    editExpense(expenseId) {
        const expenses = this.getExpensesForDate(this.selectedDate);
        const expense = expenses.find(exp => exp.id === expenseId);
        
        if (expense) {
            document.getElementById('expenseName').value = expense.name;
            document.getElementById('expenseCategory').value = expense.category;
            document.getElementById('expenseAmount').value = expense.amount;
            
            document.getElementById('saveExpense').style.display = 'none';
            document.getElementById('updateExpense').style.display = 'block';
            this.editingExpenseId = expenseId;
        }
    }
    
    deleteExpense(expenseId) {
        if (confirm('Are you sure you want to delete this expense?')) {
            this.deleteExpenseForDate(this.selectedDate, expenseId);
            this.renderExpensesList(this.selectedDate);
            this.updateDashboard();
            this.renderCalendar();
            this.renderCharts();
        }
    }
    
    renderExpensesList(date) {
        const expenses = this.getExpensesForDate(date);
        const container = document.getElementById('expensesList');
        
        if (expenses.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); margin: var(--spacing-unit) 0;">No expenses recorded for this date.</p>';
            return;
        }
        
        container.innerHTML = expenses.map(expense => `
            <div class="expense-item">
                <div class="expense-info">
                    <div class="expense-name">${expense.name}</div>
                    <div class="expense-category">${expense.category}</div>
                </div>
                <div class="expense-amount">₹${expense.amount.toFixed(2)}</div>
                <div class="expense-actions">
                    <button class="edit-btn" onclick="expenseTracker.editExpense('${expense.id}')">✏️</button>
                    <button class="delete-btn" onclick="expenseTracker.deleteExpense('${expense.id}')">🗑️</button>
                </div>
            </div>
        `).join('');
    }
    
    // Calendar Methods
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
        const remainingCells = 42 - totalCells; // 6 rows × 7 days
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
        const totalExpenses = this.getTotalExpensesForDate(date);
        if (totalExpenses > 0) {
            dateElement.classList.add('has-expenses');
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
    
    previousMonth() {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.renderCalendar();
        this.updateDashboard();
        this.renderCharts();
    }
    
    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.renderCalendar();
        this.updateDashboard();
        this.renderCharts();
    }
    
    // Dashboard Methods
    updateDashboard() {
        const income = this.getIncome();
        const totalSpent = this.getTotalMonthlyExpenses();
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
        const comparisonElement = document.getElementById('monthComparison');
        if (!comparisonElement) return;

        // Get current month data
        const currentIncome = this.getIncome();
        const currentSpent = this.getTotalMonthlyExpenses();
        const currentSavings = currentIncome - currentSpent;

        // Get previous month data
        let prevMonth = this.currentMonth - 1;
        let prevYear = this.currentYear;
        if (prevMonth < 0) {
            prevMonth = 11;
            prevYear = this.currentYear - 1;
        }

        const prevIncome = this.getIncome(prevMonth, prevYear);
        const prevSpent = this.getTotalMonthlyExpensesForMonth(prevMonth, prevYear);
        const prevSavings = prevIncome - prevSpent;

        // Check if both months have meaningful data
        const currentHasData = currentIncome > 0 || currentSpent > 0;
        const prevHasData = prevIncome > 0 || prevSpent > 0;

        // Calculate comparison
        let comparisonHTML = '';

        if (!prevHasData && !currentHasData) {
            comparisonHTML = '<div class="comparison-message">No data available for comparison</div>';
        } else if (!prevHasData) {
            comparisonHTML = '<div class="comparison-message">No previous month data to compare</div>';
        } else if (!currentHasData) {
            comparisonHTML = '<div class="comparison-message">No current month data yet - start adding expenses or set income to see comparison</div>';
        } else {
            const savingsChange = currentSavings - prevSavings;
            const spendingChange = currentSpent - prevSpent;
            const savingsPercentage = prevSavings !== 0 ? ((savingsChange / Math.abs(prevSavings)) * 100) : 0;

            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const prevMonthName = monthNames[prevMonth];
            const currentMonthName = monthNames[this.currentMonth];

            comparisonHTML = `
                <div class="comparison-header">vs ${prevMonthName} ${prevYear}</div>
                <div class="comparison-stats">
                    <div class="comparison-item">
                        <span class="comparison-label">Savings Change:</span>
                        <span class="comparison-value ${savingsChange >= 0 ? 'positive' : 'negative'}">
                            ${savingsChange >= 0 ? '+' : ''}₹${savingsChange.toLocaleString()}
                        </span>
                    </div>
                    <div class="comparison-item">
                        <span class="comparison-label">Spending Change:</span>
                        <span class="comparison-value ${spendingChange <= 0 ? 'positive' : 'negative'}">
                            ${spendingChange >= 0 ? '+' : ''}₹${spendingChange.toLocaleString()}
                        </span>
                    </div>
                    <div class="comparison-item">
                        <span class="comparison-label">Performance:</span>
                        <span class="comparison-performance ${currentSavings >= prevSavings ? 'better' : 'worse'}">
                            ${currentSavings >= prevSavings ? '📈 Better' : '📉 Needs Improvement'}
                        </span>
                    </div>
                </div>
            `;
        }

        comparisonElement.innerHTML = comparisonHTML;
    }

    getTotalMonthlyExpensesForMonth(month, year) {
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

    // Helper method to check if a month has meaningful data
    hasMonthData(month = this.currentMonth, year = this.currentYear) {
        const income = this.getIncome(month, year);
        const expenses = this.getTotalMonthlyExpensesForMonth(month, year);
        return income > 0 || expenses > 0;
    }

    // All-time totals calculation methods
    getAllTimeIncome() {
        const allIncomes = this.getAllIncomes();
        return Object.values(allIncomes).reduce((total, income) => total + parseFloat(income), 0);
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

    getAllTimeSavings() {
        return this.getAllTimeIncome() - this.getAllTimeExpenses();
    }

    // Update all-time totals display
    updateAllTimeTotals() {
        const totalIncome = this.getAllTimeIncome();
        const totalExpenses = this.getAllTimeExpenses();
        const totalSavings = this.getAllTimeSavings();

        // Update all-time totals display
        document.getElementById('allTimeIncome').textContent = `₹${totalIncome.toLocaleString()}`;
        document.getElementById('allTimeExpenses').textContent = `₹${totalExpenses.toLocaleString()}`;

        const savingsElement = document.getElementById('allTimeSavings');
        savingsElement.textContent = `₹${totalSavings.toLocaleString()}`;

        // Apply color classes based on total savings
        savingsElement.classList.remove('positive-balance', 'negative-balance');
        if (totalSavings >= 0) {
            savingsElement.classList.add('positive-balance');
        } else {
            savingsElement.classList.add('negative-balance');
        }
    }
    
    // Chart Methods
    renderCharts() {
        this.renderCategoryChart();
        this.renderDailyChart();
    }
    
    renderCategoryChart() {
        const canvas = document.getElementById('categoryChart');
        const ctx = canvas.getContext('2d');

        // Clear canvas completely
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Get category data for current month ONLY
        const categoryTotals = this.getCategoryTotals();
        const categories = Object.keys(categoryTotals);

        if (categories.length === 0) {
            this.drawNoDataMessage(ctx, canvas, 'No expenses this month');
            // Also clear the legend when no data
            this.drawHTMLLegend([], {});
            return;
        }
        
        // Calculate total for percentages
        const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
        
        // Draw pie chart
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 30;
        
        let currentAngle = -Math.PI / 2; // Start from top
        
        categories.forEach(category => {
            const percentage = categoryTotals[category] / total;
            const sliceAngle = percentage * 2 * Math.PI;
            
            // Draw slice
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = this.categoryColors[category] || '#64748B';
            ctx.fill();
            
            // Draw label
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
            const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(`${Math.round(percentage * 100)}%`, labelX, labelY);
            
            currentAngle += sliceAngle;
        });
        
        // Draw legend in HTML
        this.drawHTMLLegend(categories, categoryTotals);
    }
    
    renderDailyChart() {
        const canvas = document.getElementById('dailyChart');
        const ctx = canvas.getContext('2d');

        // Clear canvas completely
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Get daily data for current month ONLY
        const dailyTotals = this.getDailyTotals();
        const days = Object.keys(dailyTotals).sort();

        if (days.length === 0) {
            this.drawNoDataMessage(ctx, canvas, 'No daily expenses to show');
            return;
        }
        
        const maxAmount = Math.max(...Object.values(dailyTotals));
        const chartHeight = canvas.height - 60;
        const chartWidth = canvas.width - 40;
        const barWidth = Math.max(chartWidth / days.length - 10, 20);
        const startX = 30;
        const startY = canvas.height - 30;
        
        days.forEach((day, index) => {
            const amount = dailyTotals[day];
            const barHeight = (amount / maxAmount) * chartHeight;
            const x = startX + index * (barWidth + 10);
            const y = startY - barHeight;
            
            // Draw bar
            ctx.fillStyle = '#3B82F6';
            ctx.fillRect(x, y, barWidth, barHeight);
            
            // Draw day label
            ctx.fillStyle = '#64748B';
            ctx.font = '10px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(day, x + barWidth / 2, startY + 15);
            
            // Draw amount label
            if (barHeight > 20) {
                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 10px Inter';
                ctx.fillText(`₹${amount.toFixed(0)}`, x + barWidth / 2, y + 15);
            }
        });
    }
    
    getCategoryTotals() {
        const totals = {};
        
        Object.keys(this.expenses).forEach(dateKey => {
            const [year, month] = dateKey.split('-');
            if (parseInt(year) === this.currentYear && parseInt(month) === this.currentMonth + 1) {
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
    
    getDailyTotals() {
        const totals = {};
        
        Object.keys(this.expenses).forEach(dateKey => {
            const [year, month, day] = dateKey.split('-');
            if (parseInt(year) === this.currentYear && parseInt(month) === this.currentMonth + 1) {
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
    
    drawHTMLLegend(categories, totals) {
        const legendContainer = document.getElementById('categoryLegend');
        if (!legendContainer) return;

        // Clear existing legend items (keep title)
        const existingItems = legendContainer.querySelectorAll('.legend-item');
        existingItems.forEach(item => item.remove());

        if (categories.length === 0) {
            const noDataDiv = document.createElement('div');
            noDataDiv.className = 'legend-item';
            noDataDiv.innerHTML = '<span class="legend-text" style="color: var(--text-muted);">No data</span>';
            legendContainer.appendChild(noDataDiv);
            return;
        }

        categories.forEach(category => {
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';

            const colorBox = document.createElement('div');
            colorBox.className = 'legend-color';
            colorBox.style.backgroundColor = this.categoryColors[category] || '#64748B';

            const textContainer = document.createElement('div');
            textContainer.style.flex = '1';

            const categoryName = document.createElement('div');
            categoryName.className = 'legend-text';
            categoryName.textContent = category;

            const amount = document.createElement('div');
            amount.className = 'legend-amount';
            amount.textContent = `₹${totals[category].toFixed(0)}`;

            textContainer.appendChild(categoryName);
            textContainer.appendChild(amount);

            legendItem.appendChild(colorBox);
            legendItem.appendChild(textContainer);

            legendContainer.appendChild(legendItem);
        });
    }

    // Keep the old canvas legend method for backward compatibility
    drawLegend(ctx, canvas, categories, totals) {
        // This method is no longer used but kept for compatibility
        return;
    }
    
    drawNoDataMessage(ctx, canvas, message) {
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    }
}

// Initialize the application
const expenseTracker = new ExpenseTracker();

// Make expenseTracker globally available for onclick handlers
window.expenseTracker = expenseTracker;
