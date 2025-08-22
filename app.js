/**
 * Smart Expense Tracker - Main Application
 * Works with separate authentication system (auth.html)
 * Features: Multiple user profiles, Profile-specific data storage, Advanced analytics
 */

class SmartExpenseTracker {
    constructor() {
        this.currentProfile = null;
        this.currentUser = null;
        this.mainApp = null;
        
        // Storage keys
        this.STORAGE_KEYS = {
            APP_PIN: 'app_security_pin',
            PROFILES: 'user_profiles',
            CURRENT_PROFILE: 'current_profile_id',
            PROFILE_DATA: 'profile_data_'
        };

        // Icon helper functions
        this.getCategoryIcon = (category, size = '') => {
            const iconMap = {
                'Food': 'icon-food',
                'Transportation': 'icon-transportation',
                'Entertainment': 'icon-entertainment',
                'Shopping': 'icon-shopping',
                'Bills': 'icon-bills',
                'Health': 'icon-health',
                'Education': 'icon-education',
                'Other': 'icon-bills'
            };
            const iconClass = iconMap[category] || 'icon-money';
            const sizeClass = size ? ` ${size}` : '';
            return `<div class="icon-bg ${iconClass}${sizeClass}"></div>`;
        };

        this.getUIIcon = (type, size = '') => {
            const iconMap = {
                'user': 'icon-user',
                'money': 'icon-money',
                'analytics': 'icon-analytics',
                'reports': 'icon-bills',
                'trending-up': 'icon-analytics',
                'trending-down': 'icon-money'
            };
            const iconClass = iconMap[type] || 'icon-money';
            const sizeClass = size ? ` ${size}` : '';
            return `<div class="icon-bg ${iconClass}${sizeClass}"></div>`;
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
    
    // Logout button is now directly in HTML
    
    // Initialize the application
    init() {
        try {
            console.log('Initializing Smart Expense Tracker...');

            this.mainApp = document.getElementById('mainApp');

            // Get authenticated user data
            this.loadAuthenticatedUser();

            this.hideLoadingScreen();
            this.initMainTracker();

        } catch (error) {
            this.showError('Failed to initialize application: ' + error.message);
            console.error('Initialization error:', error);
        }
    }

    // Load authenticated user data
    loadAuthenticatedUser() {
        try {
            // First try to get user from family users (new system)
            const allUsers = this.getAllFamilyUsers();
            const currentUserId = localStorage.getItem('current_user_id');

            if (currentUserId && allUsers[currentUserId]) {
                this.currentUser = allUsers[currentUserId];
                console.log(`Logged in as: ${this.currentUser.name} (${this.currentUser.email}) - Family System`);
                return;
            }

            // Fallback to legacy system
            const userData = localStorage.getItem('user_account_data');
            if (userData) {
                this.currentUser = JSON.parse(userData);
                console.log(`Logged in as: ${this.currentUser.name} (${this.currentUser.email}) - Legacy System`);
            } else {
                throw new Error('No authenticated user found');
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
            // Redirect to auth if no valid user data
            window.location.href = 'auth.html';
        }
    }

    // Get all family users
    getAllFamilyUsers() {
        try {
            const allUsers = localStorage.getItem('all_family_users');
            return allUsers ? JSON.parse(allUsers) : {};
        } catch (error) {
            console.error('Error getting family users:', error);
            return {};
        }
    }
    
    // Hide loading screen
    hideLoadingScreen() {
        try {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                setTimeout(() => {
                    loadingScreen.style.opacity = '0';
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';
                    }, 500);
                }, 1000);
            }
        } catch (error) {
            console.error('Error hiding loading screen:', error);
        }
    }
    
    // Safe event listener helper
    safeAddEventListener(elementId, event, handler) {
        try {
            const element = document.getElementById(elementId);
            if (element) {
                element.addEventListener(event, handler);
            } else {
                console.warn(`Element ${elementId} not found`);
            }
        } catch (error) {
            console.error(`Error binding event to ${elementId}:`, error);
        }
    }
    
    // Get all profiles (user-specific)
    getProfiles() {
        try {
            const userSpecificKey = this.getUserSpecificKey(this.STORAGE_KEYS.PROFILES);
            const profiles = localStorage.getItem(userSpecificKey);
            return profiles ? JSON.parse(profiles) : {};
        } catch (error) {
            console.error('Error getting profiles:', error);
            return {};
        }
    }

    // Save profiles (user-specific)
    saveProfiles(profiles) {
        try {
            const userSpecificKey = this.getUserSpecificKey(this.STORAGE_KEYS.PROFILES);
            localStorage.setItem(userSpecificKey, JSON.stringify(profiles));
            return true;
        } catch (error) {
            this.showError('Failed to save profiles: ' + error.message);
            console.error('Error saving profiles:', error);
            return false;
        }
    }

    // Get user-specific storage key
    getUserSpecificKey(baseKey) {
        const userId = this.currentUser?.userId || this.currentUser?.email || 'default';
        return `${baseKey}_${userId.replace(/[^a-zA-Z0-9]/g, '_')}`;
    }

    // Logout (redirect to auth)
    logout() {
        try {
            if (confirm('Are you sure you want to logout? You will need to enter your PIN again.')) {
                // Save current profile data before logout
                this.saveProfileData();

                // Clear session data
                localStorage.removeItem('app_session_token');
                localStorage.removeItem('current_user_id');

                this.showSuccess('Logged out successfully');

                // Redirect to auth page immediately
                setTimeout(() => {
                    window.location.href = 'auth.html';
                }, 1000);
            }
        } catch (error) {
            this.showError('Failed to logout: ' + error.message);
            console.error('Logout error:', error);
            // Force redirect even on error
            setTimeout(() => {
                window.location.href = 'auth.html';
            }, 2000);
        }
    }
    
    // Initialize main expense tracker functionality
    initMainTracker() {
        try {
            // Initialize tracker properties
            this.currentDate = new Date();
            this.currentMonth = this.currentDate.getMonth();
            this.currentYear = this.currentDate.getFullYear();
            this.selectedDate = null;
            this.editingExpenseId = null;

            // Check if user has profiles, if not create a default one
            this.ensureDefaultProfile();

            this.bindEvents();
            this.loadProfileData();
            this.renderCalendar();
            this.updateDashboard();
            this.updateAnalytics();
            this.renderCharts();
            this.updateFamilyMemberDisplay();
            this.checkFirstTimeSetup();

            console.log('Main tracker initialized successfully');
        } catch (error) {
            this.showError('Failed to initialize main tracker: ' + error.message);
            console.error('Main tracker initialization error:', error);
        }
    }

    // Ensure user has at least one profile
    ensureDefaultProfile() {
        try {
            const profiles = this.getProfiles();

            if (Object.keys(profiles).length === 0) {
                // Create default profile for the user
                const defaultProfile = {
                    id: 'profile_default',
                    name: this.currentUser?.name || 'My Profile',
                    icon: this.getUIIcon('user'),
                    createdAt: new Date().toISOString(),
                    lastAccessed: new Date().toISOString()
                };

                profiles[defaultProfile.id] = defaultProfile;
                this.saveProfiles(profiles);
                this.currentProfile = defaultProfile;
                const userSpecificCurrentProfileKey = this.getUserSpecificKey(this.STORAGE_KEYS.CURRENT_PROFILE);
                localStorage.setItem(userSpecificCurrentProfileKey, defaultProfile.id);

                console.log('Created default profile');
            } else {
                // Load existing profile or first available profile
                const userSpecificCurrentProfileKey = this.getUserSpecificKey(this.STORAGE_KEYS.CURRENT_PROFILE);
                const currentProfileId = localStorage.getItem(userSpecificCurrentProfileKey);
                const profile = profiles[currentProfileId] || Object.values(profiles)[0];

                this.currentProfile = profile;
                if (currentProfileId !== profile.id) {
                    localStorage.setItem(userSpecificCurrentProfileKey, profile.id);
                }

                console.log(`Loaded profile: ${profile.name}`);
            }
        } catch (error) {
            console.error('Error ensuring default profile:', error);
        }
    }
    
    // Bind all application events
    bindEvents() {
        try {
            // Income modal events
            this.safeAddEventListener('setIncomeBtn', 'click', () => this.showIncomeModal());
            this.safeAddEventListener('saveIncome', 'click', () => this.saveIncome());
            
            // Expense modal events
            this.safeAddEventListener('saveExpense', 'click', () => this.saveExpense());
            this.safeAddEventListener('updateExpense', 'click', () => this.updateExpense());
            
            // Calendar navigation
            this.safeAddEventListener('prevMonth', 'click', () => this.previousMonth());
            this.safeAddEventListener('nextMonth', 'click', () => this.nextMonth());
            
            // Overlay events
            this.safeAddEventListener('overlay', 'click', () => this.hideAllModals());
            
            // Form validation
            this.safeAddEventListener('incomeAmount', 'input', () => this.validateIncomeForm());
            this.safeAddEventListener('expenseName', 'input', () => this.validateExpenseForm());
            this.safeAddEventListener('expenseAmount', 'input', () => this.validateExpenseForm());
            
            // Quick action buttons
            this.safeAddEventListener('quickAddExpense', 'click', () => this.showExpenseModal(new Date()));
            
            // Navigation tabs
            this.bindNavigationTabs();
            
            // Keyboard shortcuts
            this.bindKeyboardShortcuts();
            
            // Logout button event
            this.safeAddEventListener('logoutBtn', 'click', () => this.logout());

            // Prevent modal close on content click
            document.querySelectorAll('.modal-content').forEach(content => {
                content.addEventListener('click', (e) => e.stopPropagation());
            });

            // Modal close buttons
            document.querySelectorAll('.close-btn').forEach(btn => {
                btn.addEventListener('click', () => this.hideAllModals());
            });

            console.log('Events bound successfully');
        } catch (error) {
            this.showError('Failed to bind main events: ' + error.message);
            console.error('Main event binding error:', error);
        }
    }
    
    // Update family member display in header
    updateFamilyMemberDisplay() {
        try {
            const familyMemberName = document.getElementById('familyMemberName');
            if (familyMemberName && this.currentUser) {
                familyMemberName.textContent = this.currentUser.name;
            }
        } catch (error) {
            console.error('Error updating family member display:', error);
        }
    }

    // Simplified - no profile switcher needed

    // Load profile-specific data (user-specific)
    loadProfileData() {
        try {
            if (!this.currentProfile) return;

            const userSpecificKey = this.getUserSpecificKey(this.STORAGE_KEYS.PROFILE_DATA + this.currentProfile.id);
            const profileData = localStorage.getItem(userSpecificKey);

            if (profileData) {
                const data = JSON.parse(profileData);
                this.income = data.income || {};
                this.expenses = data.expenses || {};
            } else {
                this.income = {};
                this.expenses = {};
            }

            console.log(`Profile data loaded successfully for user: ${this.currentUser?.name}`);
        } catch (error) {
            this.showError('Failed to load profile data: ' + error.message);
            console.error('Profile data loading error:', error);
            this.income = {};
            this.expenses = {};
        }
    }

    // Save profile-specific data (user-specific)
    saveProfileData() {
        try {
            if (!this.currentProfile) return false;

            const userSpecificKey = this.getUserSpecificKey(this.STORAGE_KEYS.PROFILE_DATA + this.currentProfile.id);
            const profileData = {
                income: this.income || {},
                expenses: this.expenses || {},
                lastSaved: new Date().toISOString(),
                user: this.currentUser?.name || 'Unknown'
            };

            localStorage.setItem(userSpecificKey, JSON.stringify(profileData));
            return true;
        } catch (error) {
            this.showError('Failed to save profile data: ' + error.message);
            console.error('Profile data saving error:', error);
            return false;
        }
    }
    
    // Profile switcher removed - method no longer needed
    
    // Old profile dropdown methods removed - interface simplified
    
    // switchProfile method removed - interface simplified
    
    // Old logout function removed - using the correct one at line 159
    
    // Select icon in profile creation
    selectIcon(iconValue) {
        document.querySelectorAll('.icon-option').forEach(icon => {
            icon.classList.remove('selected');
        });
        
        const selectedIcon = document.querySelector(`[data-icon="${iconValue}"]`);
        if (selectedIcon) {
            selectedIcon.classList.add('selected');
        }
    }
    
    // Utility function to escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // All the expense tracker methods from the original implementation
    // Income and expense management methods
    getIncome(month = this.currentMonth, year = this.currentYear) {
        try {
            const key = `${year}-${String(month + 1).padStart(2, '0')}`;
            return parseFloat(this.income[key]) || 0;
        } catch (error) {
            console.error('Error getting income:', error);
            return 0;
        }
    }
    
    setIncome(amount, month = this.currentMonth, year = this.currentYear) {
        try {
            if (amount < 0) {
                throw new Error('Income cannot be negative');
            }
            const key = `${year}-${String(month + 1).padStart(2, '0')}`;
            this.income[key] = amount;
            this.saveProfileData();
            return true;
        } catch (error) {
            this.showError('Failed to save income: ' + error.message);
            console.error('Error setting income:', error);
            return false;
        }
    }
    
    getExpenses() {
        return this.expenses || {};
    }
    
    setExpenses(expenses) {
        try {
            this.expenses = expenses;
            this.saveProfileData();
            return true;
        } catch (error) {
            this.showError('Failed to save expenses: ' + error.message);
            console.error('Error setting expenses:', error);
            return false;
        }
    }
    
    getDateKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
    
    getExpensesForDate(date) {
        try {
            const dateKey = this.getDateKey(date);
            return this.expenses[dateKey] || [];
        } catch (error) {
            console.error('Error getting expenses for date:', error);
            return [];
        }
    }
    
    addExpenseForDate(date, expense) {
        try {
            if (!expense.name || !expense.amount || expense.amount <= 0) {
                throw new Error('Invalid expense data');
            }
            
            const dateKey = this.getDateKey(date);
            if (!this.expenses[dateKey]) {
                this.expenses[dateKey] = [];
            }
            
            expense.id = Date.now().toString();
            expense.timestamp = new Date().toISOString();
            this.expenses[dateKey].push(expense);
            this.setExpenses(this.expenses);
            return true;
        } catch (error) {
            this.showError('Failed to add expense: ' + error.message);
            console.error('Error adding expense:', error);
            return false;
        }
    }
    
    deleteExpenseForDate(date, expenseId) {
        try {
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
        } catch (error) {
            this.showError('Failed to delete expense: ' + error.message);
            console.error('Error deleting expense:', error);
            return false;
        }
    }
    
    getTotalExpensesForDate(date) {
        try {
            const expenses = this.getExpensesForDate(date);
            return expenses.reduce((total, expense) => total + parseFloat(expense.amount), 0);
        } catch (error) {
            console.error('Error calculating total expenses for date:', error);
            return 0;
        }
    }
    
    getTotalMonthlyExpenses(month = this.currentMonth, year = this.currentYear) {
        try {
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
        } catch (error) {
            console.error('Error calculating monthly expenses:', error);
            return 0;
        }
    }
    
    // Modal Management
    showIncomeModal() {
        try {
            const modal = document.getElementById('incomeModal');
            const overlay = document.getElementById('overlay');
            const input = document.getElementById('incomeAmount');
            
            if (modal && overlay && input) {
                modal.classList.add('active');
                overlay.classList.add('active');
                input.value = this.getIncome() || '';
                input.focus();
            }
        } catch (error) {
            this.showError('Failed to show income modal: ' + error.message);
            console.error('Error showing income modal:', error);
        }
    }
    
    hideIncomeModal() {
        try {
            const modal = document.getElementById('incomeModal');
            const overlay = document.getElementById('overlay');
            
            if (modal && overlay) {
                modal.classList.remove('active');
                overlay.classList.remove('active');
            }
        } catch (error) {
            console.error('Error hiding income modal:', error);
        }
    }
    
    showExpenseModal(date) {
        try {
            this.selectedDate = date;
            const modal = document.getElementById('expenseModal');
            const overlay = document.getElementById('overlay');
            const title = document.getElementById('expenseModalTitle');
            
            if (modal && overlay && title) {
                title.textContent = `Expenses for ${date.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}`;
                
                this.clearExpenseForm();
                this.renderExpensesList(date);
                
                modal.classList.add('active');
                overlay.classList.add('active');
                
                const nameInput = document.getElementById('expenseName');
                if (nameInput) nameInput.focus();
            }
        } catch (error) {
            this.showError('Failed to show expense modal: ' + error.message);
            console.error('Error showing expense modal:', error);
        }
    }
    
    hideExpenseModal() {
        try {
            const modal = document.getElementById('expenseModal');
            const overlay = document.getElementById('overlay');
            
            if (modal && overlay) {
                modal.classList.remove('active');
                overlay.classList.remove('active');
            }
            
            this.selectedDate = null;
            this.editingExpenseId = null;
        } catch (error) {
            console.error('Error hiding expense modal:', error);
        }
    }
    
    hideAllModals() {
        try {
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
            });
            
            const overlay = document.getElementById('overlay');
            if (overlay) {
                overlay.classList.remove('active');
            }
            
            this.selectedDate = null;
            this.editingExpenseId = null;
        } catch (error) {
            console.error('Error hiding all modals:', error);
        }
    }
    
    // Form Management
    clearExpenseForm() {
        try {
            const nameInput = document.getElementById('expenseName');
            const categorySelect = document.getElementById('expenseCategory');
            const amountInput = document.getElementById('expenseAmount');
            const saveBtn = document.getElementById('saveExpense');
            const updateBtn = document.getElementById('updateExpense');
            
            if (nameInput) nameInput.value = '';
            if (categorySelect) categorySelect.value = 'Food';
            if (amountInput) amountInput.value = '';
            if (saveBtn) saveBtn.style.display = 'block';
            if (updateBtn) updateBtn.style.display = 'none';
            
            this.editingExpenseId = null;
        } catch (error) {
            console.error('Error clearing expense form:', error);
        }
    }
    
    validateIncomeForm() {
        try {
            const amountInput = document.getElementById('incomeAmount');
            const saveBtn = document.getElementById('saveIncome');
            
            if (amountInput && saveBtn) {
                const amount = amountInput.value;
                saveBtn.disabled = !amount || parseFloat(amount) <= 0;
            }
        } catch (error) {
            console.error('Error validating income form:', error);
        }
    }
    
    validateExpenseForm() {
        try {
            const nameInput = document.getElementById('expenseName');
            const amountInput = document.getElementById('expenseAmount');
            const saveBtn = document.getElementById('saveExpense');
            const updateBtn = document.getElementById('updateExpense');
            
            if (nameInput && amountInput && saveBtn && updateBtn) {
                const name = nameInput.value.trim();
                const amount = amountInput.value;
                const isValid = name && amount && parseFloat(amount) > 0;
                
                saveBtn.disabled = !isValid;
                updateBtn.disabled = !isValid;
            }
        } catch (error) {
            console.error('Error validating expense form:', error);
        }
    }
    
    saveIncome() {
        try {
            const amountInput = document.getElementById('incomeAmount');
            if (!amountInput) return;
            
            const amount = parseFloat(amountInput.value);
            if (amount && amount > 0) {
                if (this.setIncome(amount)) {
                    this.updateDashboard();
                    this.hideIncomeModal();
                    this.showSuccess('Income saved successfully!');
                }
            } else {
                this.showError('Please enter a valid income amount');
            }
        } catch (error) {
            this.showError('Failed to save income: ' + error.message);
            console.error('Error saving income:', error);
        }
    }
    
    saveExpense() {
        try {
            const nameInput = document.getElementById('expenseName');
            const categorySelect = document.getElementById('expenseCategory');
            const amountInput = document.getElementById('expenseAmount');
            
            if (!nameInput || !categorySelect || !amountInput || !this.selectedDate) {
                this.showError('Missing form data or date');
                return;
            }
            
            const name = nameInput.value.trim();
            const category = categorySelect.value;
            const amount = parseFloat(amountInput.value);
            
            if (name && amount && amount > 0) {
                const expense = { name, category, amount };
                if (this.addExpenseForDate(this.selectedDate, expense)) {
                    this.clearExpenseForm();
                    this.renderExpensesList(this.selectedDate);
                    this.updateDashboard();
                    this.updateAnalytics();
                    this.renderCalendar();
                    this.renderCharts();
                    this.showSuccess('Expense added successfully!');
                }
            } else {
                this.showError('Please enter valid expense details');
            }
        } catch (error) {
            this.showError('Failed to save expense: ' + error.message);
            console.error('Error saving expense:', error);
        }
    }
    
    editExpense(expenseId) {
        try {
            if (!this.selectedDate) return;
            
            const expenses = this.getExpensesForDate(this.selectedDate);
            const expense = expenses.find(exp => exp.id === expenseId);
            
            if (expense) {
                const nameInput = document.getElementById('expenseName');
                const categorySelect = document.getElementById('expenseCategory');
                const amountInput = document.getElementById('expenseAmount');
                const saveBtn = document.getElementById('saveExpense');
                const updateBtn = document.getElementById('updateExpense');
                
                if (nameInput) nameInput.value = expense.name;
                if (categorySelect) categorySelect.value = expense.category;
                if (amountInput) amountInput.value = expense.amount;
                if (saveBtn) saveBtn.style.display = 'none';
                if (updateBtn) updateBtn.style.display = 'block';
                
                this.editingExpenseId = expenseId;
            }
        } catch (error) {
            this.showError('Failed to edit expense: ' + error.message);
            console.error('Error editing expense:', error);
        }
    }
    
    updateExpense() {
        try {
            if (!this.selectedDate || !this.editingExpenseId) return;
            
            const nameInput = document.getElementById('expenseName');
            const categorySelect = document.getElementById('expenseCategory');
            const amountInput = document.getElementById('expenseAmount');
            
            if (!nameInput || !categorySelect || !amountInput) return;
            
            const name = nameInput.value.trim();
            const category = categorySelect.value;
            const amount = parseFloat(amountInput.value);
            
            if (name && amount && amount > 0) {
                const dateKey = this.getDateKey(this.selectedDate);
                if (this.expenses[dateKey]) {
                    const index = this.expenses[dateKey].findIndex(exp => exp.id === this.editingExpenseId);
                    if (index !== -1) {
                        this.expenses[dateKey][index] = { 
                            ...this.expenses[dateKey][index], 
                            name, 
                            category, 
                            amount,
                            updated: new Date().toISOString()
                        };
                        
                        if (this.setExpenses(this.expenses)) {
                            this.clearExpenseForm();
                            this.renderExpensesList(this.selectedDate);
                            this.updateDashboard();
                            this.updateAnalytics();
                            this.renderCalendar();
                            this.renderCharts();
                            this.showSuccess('Expense updated successfully!');
                        }
                    }
                }
            } else {
                this.showError('Please enter valid expense details');
            }
        } catch (error) {
            this.showError('Failed to update expense: ' + error.message);
            console.error('Error updating expense:', error);
        }
    }
    
    deleteExpense(expenseId) {
        try {
            if (!this.selectedDate) return;
            
            if (confirm('Are you sure you want to delete this expense?')) {
                if (this.deleteExpenseForDate(this.selectedDate, expenseId)) {
                    this.renderExpensesList(this.selectedDate);
                    this.updateDashboard();
                    this.updateAnalytics();
                    this.renderCalendar();
                    this.renderCharts();
                    this.showSuccess('Expense deleted successfully!');
                }
            }
        } catch (error) {
            this.showError('Failed to delete expense: ' + error.message);
            console.error('Error deleting expense:', error);
        }
    }
    
    renderExpensesList(date) {
        try {
            const expenses = this.getExpensesForDate(date);
            const container = document.getElementById('expensesList');
            
            if (!container) return;
            
            if (expenses.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); margin: var(--spacing-4) 0;">No expenses recorded for this date.</p>';
                return;
            }
            
            container.innerHTML = expenses.map(expense => `
                <div class="expense-item">
                    <div class="expense-info">
                        <div class="expense-name">${this.escapeHtml(expense.name)}</div>
                        <div class="expense-category">${this.escapeHtml(expense.category)}</div>
                    </div>
                    <div class="expense-amount">₹${parseFloat(expense.amount).toFixed(2)}</div>
                    <div class="expense-actions">
                        <button class="edit-btn" onclick="tracker.editExpense('${expense.id}')" title="Edit">✏️</button>
                        <button class="delete-btn" onclick="tracker.deleteExpense('${expense.id}')" title="Delete">🗑️</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            this.showError('Failed to render expenses list: ' + error.message);
            console.error('Error rendering expenses list:', error);
        }
    }

    // Export data functionality
    exportData() {
        try {
            if (!this.currentProfile) {
                this.showError('No profile selected');
                return;
            }

            const data = {
                profile: this.currentProfile,
                income: this.income,
                expenses: this.expenses,
                exportDate: new Date().toISOString(),
                appVersion: '3.0.0'
            };

            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `expense-tracker-${this.currentProfile.name}-export-${new Date().toISOString().split('T')[0]}.json`;
            link.click();

            URL.revokeObjectURL(url);
            this.showSuccess('Data exported successfully!');
        } catch (error) {
            this.showError('Failed to export data: ' + error.message);
            console.error('Export error:', error);
        }
    }

    // Generate monthly report
    generateMonthlyReport() {
        try {
            const income = this.getIncome();
            const totalSpent = this.getTotalMonthlyExpenses();
            const balance = income - totalSpent;
            const categoryTotals = this.getCategoryTotals();
            const dailyTotals = this.getDailyTotals();

            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];

            const reportContent = document.getElementById('reportContent');
            if (!reportContent) return;

            const topCategory = Object.keys(categoryTotals).reduce((a, b) =>
                categoryTotals[a] > categoryTotals[b] ? a : b, 'None');

            const avgDailySpending = Object.keys(dailyTotals).length > 0 ?
                totalSpent / Object.keys(dailyTotals).length : 0;

            const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : 0;

            reportContent.innerHTML = `<div class="report-summary">
                    <h3>${this.getUIIcon('analytics', 'small')} Monthly Report - ${monthNames[this.currentMonth]} ${this.currentYear}</h3>
                    <h4>Profile: ${this.escapeHtml(this.currentProfile?.name || 'Unknown')}</h4>

                    <div class="report-grid">
                        <div class="report-card">
                            <h4>${this.getUIIcon('money', 'small')} Financial Summary</h4>
                            <p><strong>Income:</strong> ₹${income.toLocaleString()}</p>
                            <p><strong>Expenses:</strong> ₹${totalSpent.toLocaleString()}</p>
                            <p><strong>Balance:</strong> <span class="${balance >= 0 ? 'positive-balance' : 'negative-balance'}">₹${balance.toLocaleString()}</span></p>
                            <p><strong>Savings Rate:</strong> ${savingsRate}%</p>
                        </div>

                        <div class="report-card">
                            <h4>${this.getUIIcon('trending-up', 'small')} Spending Analysis</h4>
                            <p><strong>Top Category:</strong> ${topCategory}</p>
                            <p><strong>Category Amount:</strong> ₹${(categoryTotals[topCategory] || 0).toLocaleString()}</p>
                            <p><strong>Avg Daily Spending:</strong> ₹${avgDailySpending.toFixed(0)}</p>
                            <p><strong>Days with Expenses:</strong> ${Object.keys(dailyTotals).length}</p>
                        </div>

                        <div class="report-card">
                            <h4>${this.getUIIcon('reports', 'small')} Category Breakdown</h4>
                            ${Object.entries(categoryTotals).map(([category, amount]) =>
                                `<p><strong>${category}:</strong> ₹${amount.toLocaleString()}</p>`
                            ).join('')}
                        </div>

                        <div class="report-card">
                            <h4>💡 Insights & Tips</h4>
                            ${this.generateInsights(income, totalSpent, balance, categoryTotals)}
                        </div>
                    </div>
                </div>
            `;

            this.showSuccess('Monthly report generated successfully!');
        } catch (error) {
            this.showError('Failed to generate report: ' + error.message);
            console.error('Report generation error:', error);
        }
    }

    // Generate insights based on spending patterns
    generateInsights(income, totalSpent, balance, categoryTotals) {
        const insights = [];

        if (balance < 0) {
            insights.push('<p>⚠️ You\'re spending more than your income. Consider reducing expenses.</p>');
        } else if (balance / income < 0.1) {
            insights.push('<p>⚠️ Low savings rate. Try to save at least 10% of your income.</p>');
        } else if (balance / income > 0.3) {
            insights.push('<p>✅ Great savings rate! You\'re saving over 30% of your income.</p>');
        }

        const topCategory = Object.keys(categoryTotals).reduce((a, b) =>
            categoryTotals[a] > categoryTotals[b] ? a : b, '');

        if (topCategory && categoryTotals[topCategory] / totalSpent > 0.4) {
            insights.push(`<p>💡 ${topCategory} takes up ${((categoryTotals[topCategory] / totalSpent) * 100).toFixed(1)}% of your spending. Consider if this aligns with your priorities.</p>`);
        }

        if (totalSpent > income * 0.8) {
            insights.push('<p>💡 You\'re spending over 80% of your income. Consider creating a budget to track expenses better.</p>');
        }

        if (insights.length === 0) {
            insights.push('<p>✅ Your spending patterns look healthy! Keep up the good work.</p>');
        }

        return insights.join('');
    }
    
    // Calendar Methods
    renderCalendar() {
        try {
            const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            
            const currentMonthElement = document.getElementById('currentMonth');
            if (currentMonthElement) {
                currentMonthElement.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
            }
            
            const calendarDates = document.getElementById('calendarDates');
            if (!calendarDates) return;
            
            const firstDay = new Date(this.currentYear, this.currentMonth, 1);
            const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
            const daysInMonth = lastDay.getDate();
            const startingDayOfWeek = firstDay.getDay();
            
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
            
            console.log('Calendar rendered successfully');
        } catch (error) {
            this.showError('Failed to render calendar: ' + error.message);
            console.error('Error rendering calendar:', error);
        }
    }
    
    createDateElement(date, isOtherMonth) {
        try {
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
        } catch (error) {
            console.error('Error creating date element:', error);
            return document.createElement('div');
        }
    }
    
    previousMonth() {
        try {
            this.currentMonth--;
            if (this.currentMonth < 0) {
                this.currentMonth = 11;
                this.currentYear--;
            }
            this.refreshDisplay();
        } catch (error) {
            this.showError('Failed to navigate to previous month: ' + error.message);
            console.error('Error navigating to previous month:', error);
        }
    }
    
    nextMonth() {
        try {
            this.currentMonth++;
            if (this.currentMonth > 11) {
                this.currentMonth = 0;
                this.currentYear++;
            }
            this.refreshDisplay();
        } catch (error) {
            this.showError('Failed to navigate to next month: ' + error.message);
            console.error('Error navigating to next month:', error);
        }
    }
    
    refreshDisplay() {
        try {
            this.renderCalendar();
            this.updateDashboard();
            this.updateAnalytics();
            this.renderCharts();
        } catch (error) {
            this.showError('Failed to refresh display: ' + error.message);
            console.error('Error refreshing display:', error);
        }
    }
    
    // Dashboard Methods
    updateDashboard() {
        try {
            const income = this.getIncome();
            const totalSpent = this.getTotalMonthlyExpenses();
            const balance = income - totalSpent;
            
            // Update dashboard cards
            this.updateElement('monthlyIncome', `₹${income.toLocaleString()}`);
            this.updateElement('totalSpent', `₹${totalSpent.toLocaleString()}`);
            this.updateElement('remainingBalance', `₹${balance.toLocaleString()}`);
            this.updateElement('headerBalance', `₹${balance.toLocaleString()}`);
            
            // Update savings rate
            const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : 0;
            this.updateElement('savingsRate', `${savingsRate}%`);
            
            // Apply color classes based on balance
            const balanceElements = [
                document.getElementById('remainingBalance'),
                document.getElementById('headerBalance')
            ];
            
            balanceElements.forEach(element => {
                if (element) {
                    element.classList.remove('positive-balance', 'negative-balance');
                    if (balance >= 0) {
                        element.classList.add('positive-balance');
                    } else {
                        element.classList.add('negative-balance');
                    }
                }
            });
            
            this.updateMonthComparison();
            this.updateAllTimeTotals();
            
            console.log('Dashboard updated successfully');
        } catch (error) {
            this.showError('Failed to update dashboard: ' + error.message);
            console.error('Error updating dashboard:', error);
        }
    }
    
    updateElement(elementId, content) {
        try {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = content;
            }
        } catch (error) {
            console.error(`Error updating element ${elementId}:`, error);
        }
    }
    
    updateMonthComparison() {
        try {
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
            const prevSpent = this.getTotalMonthlyExpenses(prevMonth, prevYear);
            const prevSavings = prevIncome - prevSpent;
            
            const currentHasData = currentIncome > 0 || currentSpent > 0;
            const prevHasData = prevIncome > 0 || prevSpent > 0;
            
            let comparisonHTML = '';
            
            if (!prevHasData && !currentHasData) {
                comparisonHTML = '<div class="comparison-message">No data available for comparison</div>';
            } else if (!prevHasData) {
                comparisonHTML = '<div class="comparison-message">No previous month data to compare</div>';
            } else if (!currentHasData) {
                comparisonHTML = '<div class="comparison-message">No current month data yet</div>';
            } else {
                const savingsChange = currentSavings - prevSavings;
                const spendingChange = currentSpent - prevSpent;
                
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const prevMonthName = monthNames[prevMonth];
                
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
                                ${currentSavings >= prevSavings ? this.getUIIcon('trending-up', 'xsmall') + ' Better' : this.getUIIcon('trending-down', 'xsmall') + ' Needs Improvement'}
                            </span>
                        </div>
                    </div>
                `;
            }
            
            comparisonElement.innerHTML = comparisonHTML;
        } catch (error) {
            console.error('Error updating month comparison:', error);
        }
    }

    // Analytics Methods
    updateAnalytics() {
        try {
            const categoryTotals = this.getCategoryTotals();
            const dailyTotals = this.getDailyTotals();
            const totalSpent = this.getTotalMonthlyExpenses();

            // Calculate average daily spending
            const daysWithExpenses = Object.keys(dailyTotals).length;
            const avgDailySpending = daysWithExpenses > 0 ? totalSpent / daysWithExpenses : 0;

            // Find top category
            const topCategory = Object.keys(categoryTotals).length > 0 ?
                Object.keys(categoryTotals).reduce((a, b) =>
                    categoryTotals[a] > categoryTotals[b] ? a : b
                ) : 'N/A';

            // Calculate spending streak (consecutive days with expenses)
            const spendingStreak = this.calculateSpendingStreak();

            // Update analytics display
            this.updateElement('avgDailySpending', `₹${avgDailySpending.toFixed(0)}`);
            this.updateElement('topCategory', topCategory);
            this.updateElement('expenseDays', daysWithExpenses.toString());
            this.updateElement('spendingStreak', `${spendingStreak} days`);

            console.log('Analytics updated successfully');
        } catch (error) {
            this.showError('Failed to update analytics: ' + error.message);
            console.error('Error updating analytics:', error);
        }
    }

    calculateSpendingStreak() {
        try {
            const today = new Date();
            let streak = 0;
            let currentDate = new Date(today);
            let foundExpenseToday = false;

            // Check if there are expenses today first
            const todayExpenses = this.getTotalExpensesForDate(currentDate);
            if (todayExpenses <= 0) {
                return 0; // No streak if no expenses today
            }

            // Go back day by day until we find a day without expenses
            while (currentDate.getMonth() === this.currentMonth && currentDate.getFullYear() === this.currentYear) {
                const totalForDate = this.getTotalExpensesForDate(currentDate);
                if (totalForDate > 0) {
                    streak++;
                    foundExpenseToday = true;
                } else if (foundExpenseToday) {
                    break; // Stop at first day without expenses after finding expenses
                }
                currentDate.setDate(currentDate.getDate() - 1);

                // Prevent infinite loop - max 31 days
                if (streak > 31) break;
            }

            return streak;
        } catch (error) {
            console.error('Error calculating spending streak:', error);
            return 0;
        }
    }

    updateAllTimeTotals() {
        try {
            const totalIncome = this.getAllTimeIncome();
            const totalExpenses = this.getAllTimeExpenses();
            const totalSavings = totalIncome - totalExpenses;
            
            this.updateElement('allTimeIncome', `₹${totalIncome.toLocaleString()}`);
            this.updateElement('allTimeExpenses', `₹${totalExpenses.toLocaleString()}`);
            
            const savingsElement = document.getElementById('allTimeSavings');
            if (savingsElement) {
                savingsElement.textContent = `₹${totalSavings.toLocaleString()}`;
                savingsElement.classList.remove('positive-balance', 'negative-balance');
                if (totalSavings >= 0) {
                    savingsElement.classList.add('positive-balance');
                } else {
                    savingsElement.classList.add('negative-balance');
                }
            }
        } catch (error) {
            console.error('Error updating all-time totals:', error);
        }
    }
    
    getAllTimeIncome() {
        try {
            return Object.values(this.income).reduce((total, income) => total + parseFloat(income), 0);
        } catch (error) {
            console.error('Error calculating all-time income:', error);
            return 0;
        }
    }
    
    getAllTimeExpenses() {
        try {
            let total = 0;
            Object.keys(this.expenses).forEach(dateKey => {
                this.expenses[dateKey].forEach(expense => {
                    total += parseFloat(expense.amount);
                });
            });
            return total;
        } catch (error) {
            console.error('Error calculating all-time expenses:', error);
            return 0;
        }
    }
    
    // Chart Methods
    renderCharts() {
        try {
            this.renderCategoryChart();
            this.renderDailyChart();
            console.log('Charts rendered successfully');
        } catch (error) {
            this.showError('Failed to render charts: ' + error.message);
            console.error('Error rendering charts:', error);
        }
    }
    
    renderCategoryChart() {
        try {
            const canvas = document.getElementById('categoryChart');
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const categoryTotals = this.getCategoryTotals();
            const categories = Object.keys(categoryTotals);
            
            if (categories.length === 0) {
                this.drawNoDataMessage(ctx, canvas, 'No expenses this month');
                this.drawHTMLLegend([], {});
                return;
            }
            
            const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
            
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(centerX, centerY) - 30;
            
            let currentAngle = -Math.PI / 2;
            
            categories.forEach(category => {
                const percentage = categoryTotals[category] / total;
                const sliceAngle = percentage * 2 * Math.PI;
                
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
                ctx.closePath();
                ctx.fillStyle = this.categoryColors[category] || '#64748B';
                ctx.fill();
                
                // Draw percentage label
                const labelAngle = currentAngle + sliceAngle / 2;
                const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
                const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
                
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '12px Inter';
                ctx.textAlign = 'center';
                ctx.fillText(`${Math.round(percentage * 100)}%`, labelX, labelY);
                
                currentAngle += sliceAngle;
            });
            
            this.drawHTMLLegend(categories, categoryTotals);
        } catch (error) {
            console.error('Error rendering category chart:', error);
        }
    }
    
    renderDailyChart() {
        try {
            const canvas = document.getElementById('dailyChart');
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const dailyTotals = this.getDailyTotals();
            const days = Object.keys(dailyTotals).sort((a, b) => parseInt(a) - parseInt(b));
            
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
        } catch (error) {
            console.error('Error rendering daily chart:', error);
        }
    }
    
    getCategoryTotals() {
        try {
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
        } catch (error) {
            console.error('Error calculating category totals:', error);
            return {};
        }
    }
    
    getDailyTotals() {
        try {
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
        } catch (error) {
            console.error('Error calculating daily totals:', error);
            return {};
        }
    }
    
    drawHTMLLegend(categories, totals) {
        try {
            const legendContainer = document.getElementById('categoryLegend');
            if (!legendContainer) return;
            
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
        } catch (error) {
            console.error('Error drawing HTML legend:', error);
        }
    }
    
    drawNoDataMessage(ctx, canvas, message) {
        try {
            ctx.fillStyle = '#9CA3AF';
            ctx.font = '14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(message, canvas.width / 2, canvas.height / 2);
        } catch (error) {
            console.error('Error drawing no data message:', error);
        }
    }
    
    // Section switching
    switchSection(sectionName) {
        try {
            // Hide all sections
            document.querySelectorAll('.app-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Show target section
            const targetSection = document.getElementById(`${sectionName}Section`);
            if (targetSection) {
                targetSection.classList.add('active');
            }
            
            // Update navigation
            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            const activeTab = document.querySelector(`[data-section="${sectionName}"]`);
            if (activeTab) {
                activeTab.classList.add('active');
            }
        } catch (error) {
            console.error('Error switching section:', error);
        }
    }
    
    // Bind navigation tabs
    bindNavigationTabs() {
        try {
            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.addEventListener('click', (e) => {
                    const targetSection = e.target.closest('.nav-tab').dataset.section;
                    this.switchSection(targetSection);
                });
            });
        } catch (error) {
            console.error('Error binding navigation tabs:', error);
        }
    }
    
    // Bind keyboard shortcuts
    bindKeyboardShortcuts() {
        try {
            document.addEventListener('keydown', (e) => {
                if (document.querySelector('.modal.active')) return;
                
                switch(e.key.toLowerCase()) {
                    case 'i':
                        if (e.ctrlKey || e.metaKey) {
                            e.preventDefault();
                            this.showIncomeModal();
                        }
                        break;
                    case 'e':
                        if (e.ctrlKey || e.metaKey) {
                            e.preventDefault();
                            this.showExpenseModal(new Date());
                        }
                        break;
                    case 'escape':
                        this.hideAllModals();
                        // closeProfileDropdown() removed - no longer needed
                        break;
                }
            });
        } catch (error) {
            console.error('Error binding keyboard shortcuts:', error);
        }
    }
    
    // First time setup check
    checkFirstTimeSetup() {
        try {
            if (!this.getIncome()) {
                setTimeout(() => {
                    this.showIncomeModal();
                    this.showInfo('Welcome! Please set your monthly income to get started.');
                }, 2000);
            }
        } catch (error) {
            console.error('Error checking first time setup:', error);
        }
    }
    
    // Notification Methods
    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    showInfo(message) {
        this.showNotification(message, 'info');
    }
    
    showNotification(message, type = 'info') {
        try {
            // Remove existing notifications
            const existingNotifications = document.querySelectorAll('.notification');
            existingNotifications.forEach(notification => {
                notification.remove();
            });
            
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                    <span class="notification-message">${this.escapeHtml(message)}</span>
                    <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
            `;
            
            // Add to page
            document.body.appendChild(notification);
            
            // Auto-remove after delay
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, type === 'error' ? 5000 : 3000);
            
            // Also log to console
            console.log(`[${type.toUpperCase()}] ${message}`);
        } catch (error) {
            console.error('Error showing notification:', error);
            // Fallback to alert
            alert(`${type.toUpperCase()}: ${message}`);
        }
    }
    
    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌', 
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }
}

// Initialize the tracker when DOM is loaded
let tracker;
document.addEventListener('DOMContentLoaded', () => {
    tracker = new SmartExpenseTracker();
});

// Make tracker globally available for onclick handlers
window.tracker = tracker;
