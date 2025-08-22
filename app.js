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
            const iconClass = iconMap[category] || 'icon-bills';
            const sizeClass = size ? ` ${size}` : '';
            return `<div class="icon-bg ${iconClass}${sizeClass}"></div>`;
        };

        this.getUIIcon = (type, size = '') => {
            const iconMap = {
                'user': 'icon-user',
                'money': 'icon-app-logo',
                'income': 'icon-income',
                'expense': 'icon-expense',
                'savings': 'icon-savings',
                'balance': 'icon-balance',
                'analytics': 'icon-analytics',
                'reports': 'icon-bills',
                'trending-up': 'icon-income',
                'trending-down': 'icon-expense',
                'logout': 'icon-logout',
                'upload': 'icon-upload',
                'welcome': 'icon-welcome',
                'add': 'icon-add',
                'total': 'icon-total'
            };
            const iconClass = iconMap[type] || 'icon-app-logo';
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

        // Profile data structure
        this.profileData = {
            name: '',
            email: '',
            dateOfBirth: '',
            bio: '',
            phone: '',
            profilePicture: null,
            memberSince: '',
            lastLogin: '',
            totalExpenses: 0,
            expenseCount: 0
        };

        // Initialize data structures to prevent undefined errors
        this.income = {};
        this.expenses = {};
        this.tasks = {};

        // Task management properties
        this.editingTaskId = null;
        this.taskFilters = {
            status: 'all',
            category: 'all'
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

            // Display current user name
            this.displayCurrentUser();

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
            console.log('=== LOADING AUTHENTICATED USER DATA ===');

            // First try to get user from family users (new system)
            const allUsers = this.getAllFamilyUsers();
            const currentUserId = localStorage.getItem('current_user_id');
            const sessionData = localStorage.getItem('app_session_token');

            console.log('User loading data:', {
                currentUserId: currentUserId,
                hasAllUsers: !!allUsers,
                allUsersCount: allUsers ? Object.keys(allUsers).length : 0,
                hasSession: !!sessionData
            });

            // Log all available user IDs for debugging
            if (allUsers && Object.keys(allUsers).length > 0) {
                console.log('Available user IDs:', Object.keys(allUsers));
                console.log('Looking for user ID:', currentUserId);
            }

            if (currentUserId && allUsers[currentUserId]) {
                this.currentUser = allUsers[currentUserId];
                console.log(`✅ Logged in as: ${this.currentUser.name} (${this.currentUser.email}) - Family System`);
                console.log('User data loaded:', {
                    userId: this.currentUser.userId,
                    name: this.currentUser.name,
                    email: this.currentUser.email
                });
                return;
            }

            // If session has user info but no match found, log details
            if (sessionData) {
                const session = JSON.parse(sessionData);
                console.log('Session user info:', {
                    sessionUserId: session.userId,
                    sessionUserEmail: session.userEmail,
                    sessionUserName: session.userName
                });

                // Try to find user by session userId if different from currentUserId
                if (session.userId && session.userId !== currentUserId && allUsers[session.userId]) {
                    console.log('⚠️ Found user using session userId instead of current user ID');
                    this.currentUser = allUsers[session.userId];
                    // Update current user ID to match session
                    localStorage.setItem('current_user_id', session.userId);
                    console.log(`✅ Logged in as: ${this.currentUser.name} (${this.currentUser.email}) - Family System (Fixed)`);
                    return;
                }
            }

            console.log('⚠️ User not found in family system, trying legacy system...');

            // Fallback to legacy system
            const userData = localStorage.getItem('user_account_data');
            if (userData) {
                this.currentUser = JSON.parse(userData);
                console.log(`✅ Logged in as: ${this.currentUser.name} (${this.currentUser.email}) - Legacy System`);
            } else {
                throw new Error('No authenticated user found in any system');
            }

            console.log('=== USER DATA LOADING COMPLETED ===');
        } catch (error) {
            console.error('❌ Failed to load user data:', error);
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
        // Always use email as the primary identifier for consistency
        // This ensures the same key is generated regardless of session
        const userIdentifier = this.currentUser?.email || this.currentUser?.userId || 'default';
        const cleanIdentifier = userIdentifier.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const key = `${baseKey}_${cleanIdentifier}`;

        console.log('Generated storage key:', {
            baseKey: baseKey,
            userIdentifier: userIdentifier,
            cleanIdentifier: cleanIdentifier,
            finalKey: key
        });

        return key;
    }

    // Logout (redirect to auth)
    logout() {
        try {
            if (confirm('Are you sure you want to logout? Your data will be preserved and available when you log back in.')) {
                // Save current profile data before logout
                console.log('Saving profile data before logout...');
                const saveSuccess = this.saveProfileData();

                if (saveSuccess) {
                    console.log('Profile data saved successfully before logout');
                } else {
                    console.warn('Failed to save profile data before logout');
                }

                // Only clear session data, keep user data intact
                localStorage.removeItem('app_session_token');
                localStorage.removeItem('current_user_id');

                // Note: We do NOT clear user data like expenses, tasks, income, etc.
                // This preserves all the user's data for when they log back in

                this.showSuccess('Logged out successfully. Your data is preserved and will be available when you log back in.');

                // Redirect to auth page
                setTimeout(() => {
                    window.location.href = 'auth.html';
                }, 1500);
            }
        } catch (error) {
            this.showError('Failed to logout: ' + error.message);
            console.error('Logout error:', error);
            // Force redirect even on error after trying to save data
            try {
                this.saveProfileData();
            } catch (saveError) {
                console.error('Failed to save data during error logout:', saveError);
            }
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
            this.initTaskManager();
            this.checkFirstTimeSetup();

            // Set up auto-save interval to prevent data loss
            this.setupAutoSave();

            console.log('Main tracker initialized successfully');
        } catch (error) {
            this.showError('Failed to initialize main tracker: ' + error.message);
            console.error('Main tracker initialization error:', error);
        }
    }

    // Setup auto-save functionality
    setupAutoSave() {
        try {
            // Auto-save every 30 seconds
            setInterval(() => {
                if (this.currentProfile) {
                    this.saveProfileData();
                }
            }, 30000);

            // Save on page visibility change (when user switches tabs)
            document.addEventListener('visibilitychange', () => {
                if (document.hidden && this.currentProfile) {
                    this.saveProfileData();
                }
            });

            console.log('Auto-save functionality enabled');
        } catch (error) {
            console.error('Failed to setup auto-save:', error);
        }
    }

    // Migrate legacy data to user-specific storage
    migrateLegacyData() {
        try {
            // Check for legacy storage keys
            const legacyKeys = ['income_data', 'expenses_data', 'tasks_data'];
            let hasLegacyData = false;

            legacyKeys.forEach(key => {
                if (localStorage.getItem(key)) {
                    hasLegacyData = true;
                }
            });

            if (!hasLegacyData) {
                console.log('No legacy data found for migration');
                return;
            }

            console.log('Migrating legacy data to user-specific storage...');

            // Migrate income data
            const legacyIncome = localStorage.getItem('income_data');
            if (legacyIncome && Object.keys(this.income).length === 0) {
                try {
                    this.income = JSON.parse(legacyIncome);
                    console.log('Migrated legacy income data');
                } catch (e) {
                    console.error('Failed to migrate income data:', e);
                }
            }

            // Migrate expenses data
            const legacyExpenses = localStorage.getItem('expenses_data');
            if (legacyExpenses && Object.keys(this.expenses).length === 0) {
                try {
                    this.expenses = JSON.parse(legacyExpenses);
                    console.log('Migrated legacy expenses data');
                } catch (e) {
                    console.error('Failed to migrate expenses data:', e);
                }
            }

            // Migrate tasks data
            const legacyTasks = localStorage.getItem('tasks_data');
            if (legacyTasks && Object.keys(this.tasks).length === 0) {
                try {
                    this.tasks = JSON.parse(legacyTasks);
                    console.log('Migrated legacy tasks data');
                } catch (e) {
                    console.error('Failed to migrate tasks data:', e);
                }
            }

            // Save migrated data with new user-specific keys
            if (hasLegacyData) {
                this.saveProfileData();
                console.log('Legacy data migration completed successfully');

                // Optionally remove legacy keys after successful migration
                // legacyKeys.forEach(key => localStorage.removeItem(key));
            }

        } catch (error) {
            console.error('Error during legacy data migration:', error);
        }
    }

    // Ensure user has at least one profile
    ensureDefaultProfile() {
        try {
            const profiles = this.getProfiles();
            const userSpecificCurrentProfileKey = this.getUserSpecificKey(this.STORAGE_KEYS.CURRENT_PROFILE);

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
                localStorage.setItem(userSpecificCurrentProfileKey, defaultProfile.id);

                console.log('Created default profile for user:', this.currentUser?.name);
            } else {
                // Load existing profile or first available profile
                const currentProfileId = localStorage.getItem(userSpecificCurrentProfileKey);
                const profile = profiles[currentProfileId] || Object.values(profiles)[0];

                this.currentProfile = profile;
                if (currentProfileId !== profile.id) {
                    localStorage.setItem(userSpecificCurrentProfileKey, profile.id);
                }

                // Update last accessed time
                profile.lastAccessed = new Date().toISOString();
                profiles[profile.id] = profile;
                this.saveProfiles(profiles);

                console.log(`Loaded existing profile: ${profile.name}`);
            }
        } catch (error) {
            console.error('Error ensuring default profile:', error);
            // Fallback: create a minimal profile to prevent crashes
            this.currentProfile = {
                id: 'profile_fallback',
                name: this.currentUser?.name || 'My Profile',
                icon: this.getUIIcon('user'),
                createdAt: new Date().toISOString(),
                lastAccessed: new Date().toISOString()
            };
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

            // Task manager events
            this.safeAddEventListener('addTaskBtn', 'click', () => this.showTaskModal());
            this.safeAddEventListener('saveTask', 'click', () => this.saveTask());
            this.safeAddEventListener('updateTask', 'click', () => this.updateTask());
            this.safeAddEventListener('taskFilter', 'change', (e) => this.filterTasks(e.target.value, 'status'));
            this.safeAddEventListener('taskCategory', 'change', (e) => this.filterTasks(e.target.value, 'category'));
            this.safeAddEventListener('hasBudget', 'change', (e) => this.toggleBudgetFields(e.target.checked));

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
            // Always ensure data structures exist first
            this.income = this.income || {};
            this.expenses = this.expenses || {};
            this.tasks = this.tasks || {};

            // If no current profile, try to load any existing data or keep empty structures
            if (!this.currentProfile) {
                console.log('No current profile, using empty data structures');
                return;
            }

            const userSpecificKey = this.getUserSpecificKey(this.STORAGE_KEYS.PROFILE_DATA + this.currentProfile.id);
            console.log(`Loading profile data with key: ${userSpecificKey}`);

            const profileData = localStorage.getItem(userSpecificKey);

            if (profileData) {
                const data = JSON.parse(profileData);
                this.income = data.income || {};
                this.expenses = data.expenses || {};
                this.tasks = data.tasks || {};
                console.log(`Profile data loaded successfully:`, {
                    income: Object.keys(this.income).length,
                    expenses: Object.keys(this.expenses).length,
                    tasks: Object.keys(this.tasks).length
                });
            } else {
                // Try to migrate from legacy storage if no user-specific data found
                console.log('No user-specific data found, checking for legacy data migration');
                this.migrateLegacyData();
            }

            console.log(`Profile data loaded successfully for user: ${this.currentUser?.name}`);
        } catch (error) {
            this.showError('Failed to load profile data: ' + error.message);
            console.error('Profile data loading error:', error);
            // Always ensure data structures exist, even on error
            this.income = this.income || {};
            this.expenses = this.expenses || {};
            this.tasks = this.tasks || {};
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
                tasks: this.tasks || {},
                lastSaved: new Date().toISOString(),
                user: this.currentUser?.name || 'Unknown',
                userEmail: this.currentUser?.email || 'Unknown'
            };

            localStorage.setItem(userSpecificKey, JSON.stringify(profileData));
            console.log(`Profile data saved with key: ${userSpecificKey}`);
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
            // Ensure income object exists
            if (!this.income) {
                this.income = {};
            }

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
            // Ensure expenses object exists
            if (!this.expenses || typeof this.expenses !== 'object') {
                this.expenses = {};
            }

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
                    this.saveProfileData(); // Save immediately after income change
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

                // Link to task if adding expense for a specific task
                if (window.currentTaskForExpense) {
                    expense.linkedTaskId = window.currentTaskForExpense;
                    window.currentTaskForExpense = null; // Clear the task link
                }

                if (this.addExpenseForDate(this.selectedDate, expense)) {
                    this.saveProfileData(); // Save immediately after expense addition
                    this.clearExpenseForm();
                    this.renderExpensesList(this.selectedDate);
                    this.updateDashboard();
                    this.updateAnalytics();
                    this.renderCalendar(); // Update calendar to show expense changes
                    this.renderCharts();
                    this.updateExpenseIntegration(); // Update task-expense integration

                    if (expense.linkedTaskId) {
                        this.showSuccess('Expense added and linked to task successfully!');
                    } else {
                        this.showSuccess('Expense added successfully!');
                    }
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
                            this.updateExpenseIntegration(); // Update task-expense integration
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
                    this.updateExpenseIntegration(); // Update task-expense integration
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
                        <button class="edit-btn" onclick="tracker.editExpense('${expense.id}')" title="Edit">
                            <div class="icon-bg icon-edit xsmall"></div>
                        </button>
                        <button class="delete-btn" onclick="tracker.deleteExpense('${expense.id}')" title="Delete">
                            <div class="icon-bg icon-delete xsmall"></div>
                        </button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            this.showError('Failed to render expenses list: ' + error.message);
            console.error('Error rendering expenses list:', error);
        }
    }

    // Export data functionality - show format selection modal
    exportData() {
        try {
            if (!this.currentProfile) {
                this.showError('No profile selected');
                return;
            }

            this.showExportModal();
        } catch (error) {
            this.showError('Failed to show export options: ' + error.message);
            console.error('Export error:', error);
        }
    }

    // Show export format selection modal
    showExportModal() {
        try {
            const modalHtml = `
                <div id="exportModal" class="modal active">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Export Data</h3>
                            <button class="close-btn" onclick="tracker.hideExportModal()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <p>Choose the format for exporting your expense and task data:</p>

                            <div class="export-options">
                                <div class="export-option">
                                    <input type="radio" id="exportJSON" name="exportFormat" value="json" checked>
                                    <label for="exportJSON">
                                        <div class="export-option-header">
                                            <strong>JSON Format</strong>
                                            <span class="export-option-subtitle">Complete data with structure</span>
                                        </div>
                                        <p class="export-option-description">
                                            Exports all data including expenses, tasks, income, and metadata in JSON format.
                                            Best for importing back into the application or for developers.
                                        </p>
                                    </label>
                                </div>

                                <div class="export-option">
                                    <input type="radio" id="exportCSV" name="exportFormat" value="csv">
                                    <label for="exportCSV">
                                        <div class="export-option-header">
                                            <strong>CSV Format</strong>
                                            <span class="export-option-subtitle">Spreadsheet-friendly</span>
                                        </div>
                                        <p class="export-option-description">
                                            Exports data as multiple CSV files (expenses, tasks, income) in a ZIP archive.
                                            Best for analysis in Excel, Google Sheets, or other spreadsheet applications.
                                        </p>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-primary" onclick="tracker.performExport()">
                                <div class="icon-bg icon-export xsmall" style="display: inline-block; margin-right: 6px;"></div>
                                Export Data
                            </button>
                            <button class="btn btn-secondary" onclick="tracker.hideExportModal()">Cancel</button>
                        </div>
                    </div>
                </div>
                <div id="exportOverlay" class="overlay active"></div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHtml);
        } catch (error) {
            console.error('Error showing export modal:', error);
        }
    }

    // Hide export modal
    hideExportModal() {
        try {
            const modal = document.getElementById('exportModal');
            const overlay = document.getElementById('exportOverlay');

            if (modal) modal.remove();
            if (overlay) overlay.remove();
        } catch (error) {
            console.error('Error hiding export modal:', error);
        }
    }

    // Perform export based on selected format
    performExport() {
        try {
            const selectedFormat = document.querySelector('input[name="exportFormat"]:checked');
            if (!selectedFormat) {
                this.showError('Please select an export format');
                return;
            }

            const format = selectedFormat.value;
            this.hideExportModal();

            if (format === 'json') {
                this.exportAsJSON();
            } else if (format === 'csv') {
                this.exportAsCSV();
            }
        } catch (error) {
            this.showError('Failed to export data: ' + error.message);
            console.error('Export error:', error);
        }
    }

    // Export data as JSON
    exportAsJSON() {
        try {
            const data = {
                profile: this.currentProfile,
                user: {
                    name: this.currentUser?.name || 'Unknown',
                    email: this.currentUser?.email || 'Unknown'
                },
                income: this.income,
                expenses: this.expenses,
                tasks: this.tasks,
                summary: {
                    totalIncome: this.getAllTimeIncome(),
                    totalExpenses: this.getAllTimeExpenses(),
                    totalTasks: Object.keys(this.tasks).length,
                    completedTasks: Object.values(this.tasks).filter(t => t.status === 'completed').length,
                    budgetTasks: Object.values(this.tasks).filter(t => t.budget && t.budget > 0).length
                },
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
            this.showSuccess('Data exported as JSON successfully!');
        } catch (error) {
            this.showError('Failed to export as JSON: ' + error.message);
            console.error('JSON export error:', error);
        }
    }

    // Export data as CSV (multiple files in ZIP)
    exportAsCSV() {
        try {
            // Create CSV content for expenses
            const expensesCsv = this.generateExpensesCsv();

            // Create CSV content for tasks
            const tasksCsv = this.generateTasksCsv();

            // Create CSV content for income
            const incomeCsv = this.generateIncomeCsv();

            // Create CSV content for summary
            const summaryCsv = this.generateSummaryCsv();

            // Since we can't create ZIP files without external libraries,
            // we'll create separate downloads for each CSV
            this.downloadCsvFile(expensesCsv, 'expenses');
            setTimeout(() => this.downloadCsvFile(tasksCsv, 'tasks'), 500);
            setTimeout(() => this.downloadCsvFile(incomeCsv, 'income'), 1000);
            setTimeout(() => this.downloadCsvFile(summaryCsv, 'summary'), 1500);

            this.showSuccess('CSV files exported successfully! Multiple files will be downloaded.');
        } catch (error) {
            this.showError('Failed to export as CSV: ' + error.message);
            console.error('CSV export error:', error);
        }
    }

    // Generate expenses CSV content
    generateExpensesCsv() {
        try {
            const headers = ['Date', 'Name', 'Category', 'Amount', 'Linked_Task', 'Auto_Generated'];
            const rows = [headers.join(',')];

            Object.entries(this.expenses).forEach(([dateKey, dailyExpenses]) => {
                if (Array.isArray(dailyExpenses)) {
                    dailyExpenses.forEach(expense => {
                        const linkedTask = expense.linkedTaskId ?
                            (this.tasks[expense.linkedTaskId]?.title || 'Unknown Task') : '';

                        const row = [
                            `"${dateKey}"`,
                            `"${(expense.name || '').replace(/"/g, '""')}"`,
                            `"${expense.category || ''}"`,
                            expense.amount || 0,
                            `"${linkedTask}"`,
                            expense.autoGenerated ? 'Yes' : 'No'
                        ];
                        rows.push(row.join(','));
                    });
                }
            });

            return rows.join('\n');
        } catch (error) {
            console.error('Error generating expenses CSV:', error);
            return 'Date,Name,Category,Amount,Linked_Task,Auto_Generated\n';
        }
    }

    // Generate tasks CSV content
    generateTasksCsv() {
        try {
            const headers = ['Title', 'Description', 'Category', 'Priority', 'Status', 'Due_Date', 'Created_Date', 'Completed_Date', 'Budget', 'Actual_Expense', 'Budget_Fully_Spent'];
            const rows = [headers.join(',')];

            Object.values(this.tasks).forEach(task => {
                const actualExpense = task.status === 'completed' && task.budget ? task.budget : (task.actualExpense || 0);

                const row = [
                    `"${(task.title || '').replace(/"/g, '""')}"`,
                    `"${(task.description || '').replace(/"/g, '""')}"`,
                    `"${task.category || ''}"`,
                    `"${task.priority || ''}"`,
                    `"${task.status || ''}"`,
                    `"${task.dueDate || ''}"`,
                    `"${task.createdAt || ''}"`,
                    `"${task.completedAt || ''}"`,
                    task.budget || 0,
                    actualExpense,
                    (task.status === 'completed' && task.budget) ? 'Yes' : 'No'
                ];
                rows.push(row.join(','));
            });

            return rows.join('\n');
        } catch (error) {
            console.error('Error generating tasks CSV:', error);
            return 'Title,Description,Category,Priority,Status,Due_Date,Created_Date,Completed_Date,Budget,Actual_Expense,Budget_Fully_Spent\n';
        }
    }

    // Generate income CSV content
    generateIncomeCsv() {
        try {
            const headers = ['Month_Year', 'Income_Amount'];
            const rows = [headers.join(',')];

            Object.entries(this.income).forEach(([monthKey, amount]) => {
                const row = [
                    `"${monthKey}"`,
                    amount || 0
                ];
                rows.push(row.join(','));
            });

            return rows.join('\n');
        } catch (error) {
            console.error('Error generating income CSV:', error);
            return 'Month_Year,Income_Amount\n';
        }
    }

    // Generate summary CSV content
    generateSummaryCsv() {
        try {
            const tasks = Object.values(this.tasks);
            const completedTasks = tasks.filter(t => t.status === 'completed');
            const pendingTasks = tasks.filter(t => t.status === 'pending');
            const budgetTasks = tasks.filter(t => t.budget && t.budget > 0);

            const headers = ['Metric', 'Value'];
            const rows = [headers.join(',')];

            const summaryData = [
                ['Export_Date', new Date().toISOString()],
                ['Profile_Name', this.currentProfile?.name || 'Unknown'],
                ['User_Name', this.currentUser?.name || 'Unknown'],
                ['Total_Income', this.getAllTimeIncome()],
                ['Total_Expenses', this.getAllTimeExpenses()],
                ['Total_Savings', this.getAllTimeIncome() - this.getAllTimeExpenses()],
                ['Total_Tasks', tasks.length],
                ['Completed_Tasks', completedTasks.length],
                ['Pending_Tasks', pendingTasks.length],
                ['Budget_Tasks', budgetTasks.length],
                ['Task_Completion_Rate', tasks.length > 0 ? ((completedTasks.length / tasks.length) * 100).toFixed(2) + '%' : '0%'],
                ['Total_Budget_Amount', budgetTasks.reduce((sum, task) => sum + (task.budget || 0), 0)],
                ['Completed_Budget_Amount', completedTasks.filter(t => t.budget).reduce((sum, task) => sum + (task.budget || 0), 0)]
            ];

            summaryData.forEach(([metric, value]) => {
                const row = [
                    `"${metric}"`,
                    `"${value}"`
                ];
                rows.push(row.join(','));
            });

            return rows.join('\n');
        } catch (error) {
            console.error('Error generating summary CSV:', error);
            return 'Metric,Value\n';
        }
    }

    // Download CSV file
    downloadCsvFile(csvContent, filename) {
        try {
            const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(dataBlob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `expense-tracker-${filename}-${new Date().toISOString().split('T')[0]}.csv`;
            link.click();

            URL.revokeObjectURL(url);
        } catch (error) {
            console.error(`Error downloading ${filename} CSV:`, error);
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

            // Get task data for this month
            const tasks = Object.values(this.tasks);
            const completedTasks = tasks.filter(task => {
                if (task.status !== 'completed' || !task.completedAt) return false;
                const completedDate = new Date(task.completedAt);
                return completedDate.getMonth() === this.currentMonth && completedDate.getFullYear() === this.currentYear;
            });
            const pendingTasks = tasks.filter(task => task.status === 'pending');
            const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
            const overdueTasks = tasks.filter(task => this.isTaskOverdue(task));
            const budgetTasks = tasks.filter(task => task.budget && task.budget > 0);
            const completedBudgetTasks = completedTasks.filter(task => task.budget && task.budget > 0);

            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];

            const reportContent = document.getElementById('reportContent');
            if (!reportContent) return;

            const topCategory = Object.keys(categoryTotals).reduce((a, b) =>
                categoryTotals[a] > categoryTotals[b] ? a : b, 'None');

            const avgDailySpending = Object.keys(dailyTotals).length > 0 ?
                totalSpent / Object.keys(dailyTotals).length : 0;

            const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : 0;
            const taskCompletionRate = tasks.length > 0 ? ((completedTasks.length / tasks.length) * 100).toFixed(1) : 0;

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
                            <h4><div class="icon-bg icon-tasks small" style="display: inline-block; margin-right: 8px;"></div>Task Overview</h4>
                            <p><strong>Total Tasks:</strong> ${tasks.length}</p>
                            <p><strong>Completed This Month:</strong> ${completedTasks.length}</p>
                            <p><strong>Pending Tasks:</strong> ${pendingTasks.length}</p>
                            <p><strong>In Progress:</strong> ${inProgressTasks.length}</p>
                            ${overdueTasks.length > 0 ? `<p><strong class="overdue">Overdue:</strong> ${overdueTasks.length}</p>` : ''}
                            <p><strong>Completion Rate:</strong> ${taskCompletionRate}%</p>
                        </div>

                        <div class="report-card">
                            <h4><div class="icon-bg icon-integration small" style="display: inline-block; margin-right: 8px;"></div>Budget Tasks</h4>
                            <p><strong>Total Budget Tasks:</strong> ${budgetTasks.length}</p>
                            <p><strong>Completed Budget Tasks:</strong> ${completedBudgetTasks.length}</p>
                            <p><strong>Total Budget Amount:</strong> ₹${budgetTasks.reduce((sum, task) => sum + (task.budget || 0), 0).toLocaleString()}</p>
                            <p><strong>Completed Budget Amount:</strong> ₹${completedBudgetTasks.reduce((sum, task) => sum + (task.budget || 0), 0).toLocaleString()}</p>
                        </div>

                        <div class="report-card">
                            <h4>${this.getUIIcon('reports', 'small')} Category Breakdown</h4>
                            ${Object.entries(categoryTotals).map(([category, amount]) =>
                                `<p><strong>${category}:</strong> ₹${amount.toLocaleString()}</p>`
                            ).join('')}
                        </div>

                        <div class="report-card">
                            <h4><div class="icon-bg icon-insights xsmall" style="display: inline-block; margin-right: 8px;"></div>Insights & Tips</h4>
                            ${this.generateInsights(income, totalSpent, balance, categoryTotals, { tasks, completedTasks, pendingTasks, overdueTasks })}
                        </div>
                    </div>

                    <!-- Detailed Task Lists -->
                    <div class="report-task-details">
                        <h3><div class="icon-bg icon-tasks small" style="display: inline-block; margin-right: 8px;"></div>Task Details</h3>

                        <div class="task-detail-grid">
                            <div class="task-detail-section">
                                <h4>✅ Completed Tasks This Month (${completedTasks.length})</h4>
                                ${completedTasks.length === 0 ?
                                    '<p class="no-tasks">No tasks completed this month</p>' :
                                    completedTasks.map(task => `
                                        <div class="task-detail-item completed">
                                            <div class="task-detail-header">
                                                <strong>${this.escapeHtml(task.title)}</strong>
                                                <span class="task-priority ${task.priority}">${task.priority}</span>
                                            </div>
                                            <div class="task-detail-meta">
                                                <span>Category: ${task.category}</span>
                                                <span>Completed: ${new Date(task.completedAt).toLocaleDateString()}</span>
                                                ${task.budget ? `<span>Budget: ₹${task.budget} (Fully Spent)</span>` : ''}
                                            </div>
                                            ${task.description ? `<p class="task-detail-desc">${this.escapeHtml(task.description)}</p>` : ''}
                                        </div>
                                    `).join('')
                                }
                            </div>

                            <div class="task-detail-section">
                                <h4>⏳ Pending Tasks (${pendingTasks.length})</h4>
                                ${pendingTasks.length === 0 ?
                                    '<p class="no-tasks">No pending tasks</p>' :
                                    pendingTasks.map(task => `
                                        <div class="task-detail-item pending ${this.isTaskOverdue(task) ? 'overdue' : ''}">
                                            <div class="task-detail-header">
                                                <strong>${this.escapeHtml(task.title)}</strong>
                                                <span class="task-priority ${task.priority}">${task.priority}</span>
                                                ${this.isTaskOverdue(task) ? '<span class="overdue-badge">OVERDUE</span>' : ''}
                                            </div>
                                            <div class="task-detail-meta">
                                                <span>Category: ${task.category}</span>
                                                ${task.dueDate ? `<span>Due: ${new Date(task.dueDate).toLocaleDateString()}</span>` : '<span>No due date</span>'}
                                                ${task.budget ? `<span>Budget: ₹${task.budget}</span>` : ''}
                                            </div>
                                            ${task.description ? `<p class="task-detail-desc">${this.escapeHtml(task.description)}</p>` : ''}
                                        </div>
                                    `).join('')
                                }
                            </div>

                            ${inProgressTasks.length > 0 ? `
                                <div class="task-detail-section">
                                    <h4>🔄 In Progress Tasks (${inProgressTasks.length})</h4>
                                    ${inProgressTasks.map(task => `
                                        <div class="task-detail-item in-progress">
                                            <div class="task-detail-header">
                                                <strong>${this.escapeHtml(task.title)}</strong>
                                                <span class="task-priority ${task.priority}">${task.priority}</span>
                                            </div>
                                            <div class="task-detail-meta">
                                                <span>Category: ${task.category}</span>
                                                ${task.dueDate ? `<span>Due: ${new Date(task.dueDate).toLocaleDateString()}</span>` : '<span>No due date</span>'}
                                                ${task.budget ? `<span>Budget: ₹${task.budget} | Spent: ₹${task.actualExpense || 0}</span>` : ''}
                                            </div>
                                            ${task.description ? `<p class="task-detail-desc">${this.escapeHtml(task.description)}</p>` : ''}
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;

            this.showSuccess('Monthly report with task details generated successfully!');
        } catch (error) {
            this.showError('Failed to generate report: ' + error.message);
            console.error('Report generation error:', error);
        }
    }

    // Generate insights based on spending patterns and task data
    generateInsights(income, totalSpent, balance, categoryTotals, taskData = null) {
        const insights = [];

        // Financial insights
        if (balance < 0) {
            insights.push('<p><span class="warning-icon">⚠</span> You\'re spending more than your income. Consider reducing expenses.</p>');
        } else if (balance / income < 0.1) {
            insights.push('<p><span class="warning-icon">⚠</span> Low savings rate. Try to save at least 10% of your income.</p>');
        } else if (balance / income > 0.3) {
            insights.push('<p><span class="success-icon">✓</span> Great savings rate! You\'re saving over 30% of your income.</p>');
        }

        const topCategory = Object.keys(categoryTotals).reduce((a, b) =>
            categoryTotals[a] > categoryTotals[b] ? a : b, '');

        if (topCategory && categoryTotals[topCategory] / totalSpent > 0.4) {
            insights.push(`<p><span class="info-icon">i</span> ${topCategory} takes up ${((categoryTotals[topCategory] / totalSpent) * 100).toFixed(1)}% of your spending. Consider if this aligns with your priorities.</p>`);
        }

        if (totalSpent > income * 0.8) {
            insights.push('<p><span class="info-icon">i</span> You\'re spending over 80% of your income. Consider creating a budget to track expenses better.</p>');
        }

        // Task-related insights
        if (taskData) {
            const { tasks, completedTasks, pendingTasks, overdueTasks } = taskData;

            if (tasks.length > 0) {
                const completionRate = (completedTasks.length / tasks.length) * 100;

                if (completionRate >= 80) {
                    insights.push('<p><span class="success-icon">✓</span> Excellent task completion rate! You\'re staying on top of your goals.</p>');
                } else if (completionRate < 50) {
                    insights.push('<p><span class="warning-icon">⚠</span> Low task completion rate. Consider reviewing your task priorities and deadlines.</p>');
                }

                if (overdueTasks.length > 0) {
                    insights.push(`<p><span class="warning-icon">⚠</span> You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}. Consider reviewing and updating your deadlines.</p>`);
                }

                if (pendingTasks.length > 10) {
                    insights.push('<p><span class="info-icon">i</span> You have many pending tasks. Consider prioritizing the most important ones to avoid overwhelm.</p>');
                }

                const budgetTasks = tasks.filter(task => task.budget && task.budget > 0);
                const completedBudgetTasks = completedTasks.filter(task => task.budget && task.budget > 0);

                if (budgetTasks.length > 0) {
                    const budgetCompletionRate = (completedBudgetTasks.length / budgetTasks.length) * 100;
                    if (budgetCompletionRate >= 75) {
                        insights.push('<p><span class="success-icon">✓</span> Great progress on your budget-related tasks! You\'re making good use of your allocated funds.</p>');
                    }
                }
            } else {
                insights.push('<p><span class="info-icon">i</span> Consider creating some tasks to better organize your goals and track progress!</p>');
            }
        }

        if (insights.length === 0) {
            insights.push('<p><span class="success-icon">✓</span> Your financial and task management patterns look healthy! Keep up the good work.</p>');
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

            // Check for completed tasks on this date
            const completedTasks = this.getCompletedTasksForDate(date);
            const budgetTasksCompleted = completedTasks.filter(task => task.budget && task.budget > 0);

            if (completedTasks.length > 0) {
                dateElement.classList.add('has-completed-tasks');
            }

            if (budgetTasksCompleted.length > 0) {
                dateElement.classList.add('has-budget-tasks');
            }

            // Build date content
            let dateContent = `<div class="date-number">${date.getDate()}</div>`;

            // Add expense amount if present
            if (totalExpenses > 0) {
                dateContent += `<div class="date-amount">₹${totalExpenses.toFixed(0)}</div>`;
            }

            // Add task completion indicators
            if (completedTasks.length > 0) {
                const taskTitles = completedTasks.map(t => t.title).join('\n');
                dateContent += `<div class="date-tasks">
                    <span class="task-indicator" title="${completedTasks.length} task(s) completed:\n${taskTitles}">
                        <div class="icon-bg icon-task-completed xsmall"></div>
                        ${completedTasks.length}
                    </span>
                </div>`;
            }

            // Add budget task indicator if present
            if (budgetTasksCompleted.length > 0) {
                const totalBudget = budgetTasksCompleted.reduce((sum, task) => sum + (task.budget || 0), 0);
                const budgetTaskTitles = budgetTasksCompleted.map(t => `${t.title} (₹${t.budget})`).join('\n');
                dateContent += `<div class="date-budget-tasks" title="Budget tasks completed:\n${budgetTaskTitles}">
                    <span class="budget-indicator">
                        <div class="icon-bg icon-integration xsmall"></div>
                        ₹${totalBudget.toFixed(0)}
                    </span>
                </div>`;
            }

            dateElement.innerHTML = dateContent;

            dateElement.addEventListener('click', () => {
                if (!isOtherMonth) {
                    if (completedTasks.length > 0) {
                        this.showDateDetailsModal(date, totalExpenses, completedTasks);
                    } else {
                        this.showExpenseModal(date);
                    }
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

            // Update task statistics
            const taskStats = this.getTaskStats();
            this.updateElement('activeTasks', (taskStats.pending + taskStats.inProgress).toString());
            this.updateElement('budgetTasks', taskStats.withBudget.toString());
            
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
            this.updateTaskExpenseSummary();
            
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
            // Ensure expenses object exists
            if (!this.expenses || typeof this.expenses !== 'object') {
                this.expenses = {};
                return 0;
            }

            let total = 0;
            Object.keys(this.expenses).forEach(dateKey => {
                if (Array.isArray(this.expenses[dateKey])) {
                    this.expenses[dateKey].forEach(expense => {
                        total += parseFloat(expense.amount) || 0;
                    });
                }
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

    // Display current user name in the header
    displayCurrentUser() {
        try {
            const familyMemberName = document.getElementById('familyMemberName');
            if (familyMemberName && this.currentUser) {
                familyMemberName.textContent = this.currentUser.name || 'Unknown User';
                console.log(`Displaying current user: ${this.currentUser.name}`);
            }
        } catch (error) {
            console.error('Error displaying current user:', error);
        }
    }

    // Profile functionality methods
    showProfile() {
        try {
            const modal = document.getElementById('profileModal');
            const overlay = document.getElementById('overlay');

            if (modal && overlay) {
                this.loadProfileData();
                modal.classList.add('active');
                overlay.classList.add('active');

                // Bind profile events
                this.bindProfileEvents();
            }
        } catch (error) {
            console.error('Error showing profile:', error);
        }
    }

    hideProfile() {
        try {
            const modal = document.getElementById('profileModal');
            const overlay = document.getElementById('overlay');

            if (modal && overlay) {
                modal.classList.remove('active');
                overlay.classList.remove('active');
            }
        } catch (error) {
            console.error('Error hiding profile:', error);
        }
    }

    loadProfileData() {
        try {
            // Get current user data
            const currentUserId = localStorage.getItem('current_user_id');
            const allUsers = JSON.parse(localStorage.getItem('all_family_users') || '{}');
            const currentUser = allUsers[currentUserId];

            if (!currentUser) {
                this.showError('User data not found');
                return;
            }

            // Load saved profile data
            const savedProfile = JSON.parse(localStorage.getItem(`profile_data_${currentUserId}`) || '{}');

            // Merge with current user data
            this.profileData = {
                name: currentUser.name || '',
                email: currentUser.email || '',
                dateOfBirth: savedProfile.dateOfBirth || '',
                phone: savedProfile.phone || '',
                profilePicture: savedProfile.profilePicture || null,
                memberSince: currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'Unknown',
                lastLogin: currentUser.lastLogin ? new Date(currentUser.lastLogin).toLocaleDateString() : 'Never',
                totalExpenses: this.getAllTimeExpenses(),
                expenseCount: this.getAllExpenseCount()
            };

            // Populate form fields
            document.getElementById('profileName').value = this.profileData.name;
            document.getElementById('profileEmail').value = this.profileData.email;
            document.getElementById('profileDOB').value = this.profileData.dateOfBirth;
            document.getElementById('profilePhone').value = this.profileData.phone;

            // Populate stats
            document.getElementById('profileMemberSince').textContent = this.profileData.memberSince;
            document.getElementById('profileLastLogin').textContent = this.profileData.lastLogin;
            document.getElementById('profileTotalExpenses').textContent = `₹${this.profileData.totalExpenses.toLocaleString()}`;
            document.getElementById('profileExpenseCount').textContent = this.profileData.expenseCount;

            // Load profile picture
            this.loadProfilePicture();
            // Ensure family member display is updated on app start
            this.updateFamilyMemberDisplay();

        } catch (error) {
            console.error('Error loading profile data:', error);
        }
    }

    loadProfilePicture() {
        try {
            const profileImage = document.getElementById('profileImage');
            const defaultIcon = document.getElementById('defaultProfileIcon');

            if (this.profileData.profilePicture) {
                profileImage.src = this.profileData.profilePicture;
                profileImage.style.display = 'block';
                defaultIcon.style.display = 'none';
            } else {
                profileImage.style.display = 'none';
                defaultIcon.style.display = 'flex';
            }

            // Also update family member display
            this.updateFamilyMemberDisplay();

        } catch (error) {
            console.error('Error loading profile picture:', error);
        }
    }

    bindProfileEvents() {
        try {
            // Profile picture upload
            const profilePictureInput = document.getElementById('profilePictureInput');
            profilePictureInput.addEventListener('change', (e) => this.handleProfilePictureUpload(e));

            // Save profile button
            const saveProfileBtn = document.getElementById('saveProfile');
            saveProfileBtn.addEventListener('click', () => this.saveProfileData());

            // Delete profile button
            const deleteProfileBtn = document.getElementById('deleteProfile');
            deleteProfileBtn.addEventListener('click', () => this.deleteProfile());

        } catch (error) {
            console.error('Error binding profile events:', error);
        }
    }

    handleProfilePictureUpload(event) {
        try {
            const file = event.target.files[0];
            if (!file) return;

            // Validate file type
            if (!file.type.startsWith('image/')) {
                this.showError('Please select a valid image file');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                this.showError('Image size must be less than 5MB');
                return;
            }

            // Read file as data URL
            const reader = new FileReader();
            reader.onload = (e) => {
                this.profileData.profilePicture = e.target.result;
                this.loadProfilePicture();
                this.saveProfileToStorage(); // Save immediately when picture is uploaded
                this.showSuccess('Profile picture uploaded successfully');
            };
            reader.readAsDataURL(file);

        } catch (error) {
            console.error('Error handling profile picture upload:', error);
            this.showError('Failed to upload profile picture');
        }
    }

    saveProfileData() {
        try {
            // Get form data
            const name = document.getElementById('profileName').value.trim();
            const dob = document.getElementById('profileDOB').value;
            const phone = document.getElementById('profilePhone').value.trim();

            // Validate required fields
            if (!name) {
                this.showError('Name is required');
                return;
            }

            // Update profile data
            this.profileData.name = name;
            this.profileData.dateOfBirth = dob;
            this.profileData.phone = phone;

            // Save to localStorage
            const currentUserId = localStorage.getItem('current_user_id');
            localStorage.setItem(`profile_data_${currentUserId}`, JSON.stringify(this.profileData));

            // Update user data with name change
            const allUsers = JSON.parse(localStorage.getItem('all_family_users') || '{}');
            if (allUsers[currentUserId]) {
                allUsers[currentUserId].name = name;
                localStorage.setItem('all_family_users', JSON.stringify(allUsers));
            }

            // Update UI
            document.getElementById('familyMemberName').textContent = name;
            this.updateFamilyMemberDisplay(); // Update family member icon too

            this.showSuccess('Profile updated successfully');
            this.hideProfile();

        } catch (error) {
            console.error('Error saving profile data:', error);
            this.showError('Failed to save profile data');
        }
    }

    // Update family member display with profile picture
    updateFamilyMemberDisplay() {
        try {
            const familyMemberIcon = document.querySelector('.family-member-icon');
            if (!familyMemberIcon) return;

            if (this.profileData.profilePicture) {
                // Create or update profile image in family member display
                let profileImg = familyMemberIcon.querySelector('.profile-img');
                if (!profileImg) {
                    profileImg = document.createElement('img');
                    profileImg.className = 'profile-img small';
                    familyMemberIcon.innerHTML = ''; // Clear existing content
                    familyMemberIcon.appendChild(profileImg);
                }
                profileImg.src = this.profileData.profilePicture;
            } else {
                // Show default icon
                familyMemberIcon.innerHTML = '<div class="icon-bg icon-user small"></div>';
            }

        } catch (error) {
            console.error('Error updating family member display:', error);
        }
    }

    // Save profile data immediately to storage
    saveProfileToStorage() {
        try {
            const currentUserId = localStorage.getItem('current_user_id');
            if (currentUserId) {
                localStorage.setItem(`profile_data_${currentUserId}`, JSON.stringify(this.profileData));
            }
        } catch (error) {
            console.error('Error saving profile to storage:', error);
        }
    }

    deleteProfile() {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                // Clear all user data
                const currentUserId = localStorage.getItem('current_user_id');

                // Remove from family users
                const allUsers = JSON.parse(localStorage.getItem('all_family_users') || '{}');
                delete allUsers[currentUserId];
                localStorage.setItem('all_family_users', JSON.stringify(allUsers));

                // Clear profile data
                localStorage.removeItem(`profile_data_${currentUserId}`);

                // Clear session
                localStorage.removeItem('app_session_token');
                localStorage.removeItem('current_user_id');

                this.showSuccess('Account deleted successfully');

                // Redirect to auth
                setTimeout(() => {
                    window.location.href = 'auth.html';
                }, 2000);

            } catch (error) {
                console.error('Error deleting profile:', error);
                this.showError('Failed to delete account');
            }
        }
    }

    getAllExpenseCount() {
        try {
            // Ensure expenses object exists
            if (!this.expenses || typeof this.expenses !== 'object') {
                this.expenses = {};
                return 0;
            }

            let count = 0;
            Object.values(this.expenses).forEach(dayExpenses => {
                if (Array.isArray(dayExpenses)) {
                    count += dayExpenses.length;
                }
            });
            return count;
        } catch (error) {
            console.error('Error getting expense count:', error);
            return 0;
        }
    }

    // ==============================================
    // TASK MANAGER METHODS
    // ==============================================

    // Initialize task manager
    initTaskManager() {
        try {
            this.renderTasks();
            this.updateTaskStats();
            this.updateExpenseIntegration();
            console.log('Task manager initialized successfully');
        } catch (error) {
            this.showError('Failed to initialize task manager: ' + error.message);
            console.error('Task manager initialization error:', error);
        }
    }

    // Get tasks
    getTasks() {
        return this.tasks || {};
    }

    // Set tasks
    setTasks(tasks) {
        try {
            this.tasks = tasks;
            this.saveProfileData();
            return true;
        } catch (error) {
            this.showError('Failed to save tasks: ' + error.message);
            console.error('Error setting tasks:', error);
            return false;
        }
    }

    // Task modal management
    showTaskModal(taskId = null) {
        try {
            this.editingTaskId = taskId;
            const modal = document.getElementById('taskModal');
            const overlay = document.getElementById('overlay');
            const title = document.getElementById('taskModalTitle');

            if (modal && overlay && title) {
                if (taskId) {
                    title.textContent = 'Edit Task';
                    this.loadTaskForEditing(taskId);
                } else {
                    title.textContent = 'Add New Task';
                    this.clearTaskForm();
                }

                modal.classList.add('active');
                overlay.classList.add('active');

                const titleInput = document.getElementById('taskTitle');
                if (titleInput) titleInput.focus();
            }
        } catch (error) {
            this.showError('Failed to show task modal: ' + error.message);
            console.error('Error showing task modal:', error);
        }
    }

    hideTaskModal() {
        try {
            const modal = document.getElementById('taskModal');
            const overlay = document.getElementById('overlay');

            if (modal && overlay) {
                modal.classList.remove('active');
                overlay.classList.remove('active');
            }

            this.editingTaskId = null;
            this.clearTaskForm();
        } catch (error) {
            console.error('Error hiding task modal:', error);
        }
    }

    // Clear task form
    clearTaskForm() {
        try {
            const fields = ['taskTitle', 'taskDescription', 'taskDueDate', 'taskBudget'];
            fields.forEach(fieldId => {
                const element = document.getElementById(fieldId);
                if (element) element.value = '';
            });

            const selects = [
                { id: 'taskPriority', value: 'medium' },
                { id: 'taskCategorySelect', value: 'work' },
                { id: 'taskStatus', value: 'pending' },
                { id: 'expenseCategory', value: 'Food' }
            ];

            selects.forEach(select => {
                const element = document.getElementById(select.id);
                if (element) element.value = select.value;
            });

            const hasBudget = document.getElementById('hasBudget');
            if (hasBudget) {
                hasBudget.checked = false;
                this.toggleBudgetFields(false);
            }

            const saveBtn = document.getElementById('saveTask');
            const updateBtn = document.getElementById('updateTask');
            if (saveBtn) saveBtn.style.display = 'block';
            if (updateBtn) updateBtn.style.display = 'none';
        } catch (error) {
            console.error('Error clearing task form:', error);
        }
    }

    // Load task for editing
    loadTaskForEditing(taskId) {
        try {
            const task = this.tasks[taskId];
            if (!task) return;

            document.getElementById('taskTitle').value = task.title || '';
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskPriority').value = task.priority || 'medium';
            document.getElementById('taskCategorySelect').value = task.category || 'work';
            document.getElementById('taskStatus').value = task.status || 'pending';
            document.getElementById('taskDueDate').value = task.dueDate || '';

            const hasBudget = task.budget && task.budget > 0;
            document.getElementById('hasBudget').checked = hasBudget;
            this.toggleBudgetFields(hasBudget);

            if (hasBudget) {
                document.getElementById('taskBudget').value = task.budget || '';
                document.getElementById('expenseCategory').value = task.expenseCategory || 'Food';
            }

            const saveBtn = document.getElementById('saveTask');
            const updateBtn = document.getElementById('updateTask');
            if (saveBtn) saveBtn.style.display = 'none';
            if (updateBtn) updateBtn.style.display = 'block';
        } catch (error) {
            console.error('Error loading task for editing:', error);
        }
    }

    // Toggle budget fields
    toggleBudgetFields(show) {
        try {
            const budgetFields = document.getElementById('budgetFields');
            if (budgetFields) {
                budgetFields.style.display = show ? 'block' : 'none';
            }
        } catch (error) {
            console.error('Error toggling budget fields:', error);
        }
    }

    // Save task
    saveTask() {
        try {
            const taskData = this.getTaskFormData();
            if (!taskData) return;

            const taskId = Date.now().toString();
            taskData.id = taskId;
            taskData.createdAt = new Date().toISOString();
            taskData.updatedAt = new Date().toISOString();

            this.tasks[taskId] = taskData;

            if (this.setTasks(this.tasks)) {
                this.hideTaskModal();
                this.refreshTaskManagerDisplay();
                this.showSuccess('Task added successfully!');
            }
        } catch (error) {
            this.showError('Failed to save task: ' + error.message);
            console.error('Error saving task:', error);
        }
    }

    // Update task
    updateTask() {
        try {
            if (!this.editingTaskId) return;

            const taskData = this.getTaskFormData();
            if (!taskData) return;

            const existingTask = this.tasks[this.editingTaskId];
            if (existingTask) {
                this.tasks[this.editingTaskId] = {
                    ...existingTask,
                    ...taskData,
                    updatedAt: new Date().toISOString()
                };

                if (this.setTasks(this.tasks)) {
                    this.hideTaskModal();
                    this.refreshTaskManagerDisplay();
                    this.showSuccess('Task updated successfully!');
                }
            }
        } catch (error) {
            this.showError('Failed to update task: ' + error.message);
            console.error('Error updating task:', error);
        }
    }

    // Get task form data
    getTaskFormData() {
        try {
            const title = document.getElementById('taskTitle').value.trim();
            const description = document.getElementById('taskDescription').value.trim();
            const priority = document.getElementById('taskPriority').value;
            const category = document.getElementById('taskCategorySelect').value;
            const status = document.getElementById('taskStatus').value;
            const dueDate = document.getElementById('taskDueDate').value;
            const hasBudget = document.getElementById('hasBudget').checked;

            if (!title) {
                this.showError('Task title is required');
                return null;
            }

            const taskData = {
                title,
                description,
                priority,
                category,
                status,
                dueDate
            };

            if (hasBudget) {
                const budget = parseFloat(document.getElementById('taskBudget').value);
                const expenseCategory = document.getElementById('expenseCategory').value;

                if (budget && budget > 0) {
                    taskData.budget = budget;
                    taskData.expenseCategory = expenseCategory;
                    taskData.actualExpense = 0; // Track actual expenses
                }
            }

            return taskData;
        } catch (error) {
            console.error('Error getting task form data:', error);
            return null;
        }
    }

    // Delete task
    deleteTask(taskId) {
        try {
            if (confirm('Are you sure you want to delete this task?')) {
                delete this.tasks[taskId];

                if (this.setTasks(this.tasks)) {
                    this.refreshTaskManagerDisplay();
                    this.showSuccess('Task deleted successfully!');
                }
            }
        } catch (error) {
            this.showError('Failed to delete task: ' + error.message);
            console.error('Error deleting task:', error);
        }
    }

    // Toggle task status
    toggleTaskStatus(taskId, newStatus) {
        try {
            if (this.tasks[taskId]) {
                const task = this.tasks[taskId];
                const previousStatus = task.status;

                task.status = newStatus;
                task.updatedAt = new Date().toISOString();

                if (newStatus === 'completed') {
                    task.completedAt = new Date().toISOString();

                    // Handle budget task completion
                    if (task.budget && task.budget > 0) {
                        this.handleBudgetTaskCompletion(task);
                    }
                }

                if (this.setTasks(this.tasks)) {
                    this.refreshTaskManagerDisplay();

                    if (newStatus === 'completed' && task.budget) {
                        this.showSuccess(`Task completed! Calendar and expenses updated.`);
                    } else {
                        this.showSuccess('Task status updated!');
                    }
                }
            }
        } catch (error) {
            this.showError('Failed to update task status: ' + error.message);
            console.error('Error toggling task status:', error);
        }
    }

    // Filter tasks
    filterTasks(value, type) {
        try {
            this.taskFilters[type] = value;
            this.renderTasks();
        } catch (error) {
            console.error('Error filtering tasks:', error);
        }
    }

    // Get filtered tasks
    getFilteredTasks() {
        try {
            const tasks = Object.values(this.tasks);

            return tasks.filter(task => {
                const statusMatch = this.taskFilters.status === 'all' ||
                    this.taskFilters.status === task.status ||
                    (this.taskFilters.status === 'today' && this.isTaskDueToday(task)) ||
                    (this.taskFilters.status === 'overdue' && this.isTaskOverdue(task));

                const categoryMatch = this.taskFilters.category === 'all' ||
                    this.taskFilters.category === task.category;

                return statusMatch && categoryMatch;
            });
        } catch (error) {
            console.error('Error getting filtered tasks:', error);
            return [];
        }
    }

    // Check if task is due today
    isTaskDueToday(task) {
        if (!task.dueDate) return false;
        const today = new Date().toDateString();
        const dueDate = new Date(task.dueDate).toDateString();
        return today === dueDate;
    }

    // Check if task is overdue
    isTaskOverdue(task) {
        if (!task.dueDate || task.status === 'completed') return false;
        const today = new Date();
        const dueDate = new Date(task.dueDate);
        return dueDate < today;
    }

    // Render tasks
    renderTasks() {
        try {
            const pendingList = document.getElementById('pendingTasksList');
            const inProgressList = document.getElementById('inProgressTasksList');
            const completedList = document.getElementById('completedTasksList');

            if (!pendingList || !inProgressList || !completedList) return;

            // Clear lists
            pendingList.innerHTML = '';
            inProgressList.innerHTML = '';
            completedList.innerHTML = '';

            // Get filtered tasks
            const filteredTasks = this.getFilteredTasks();

            // Group tasks by status
            const tasksByStatus = {
                pending: filteredTasks.filter(task => task.status === 'pending'),
                'in-progress': filteredTasks.filter(task => task.status === 'in-progress'),
                completed: filteredTasks.filter(task => task.status === 'completed')
            };

            // Render each status group
            Object.keys(tasksByStatus).forEach(status => {
                const tasks = tasksByStatus[status];
                const listElement = document.getElementById(`${status === 'in-progress' ? 'inProgress' : status}TasksList`);

                if (tasks.length === 0) {
                    listElement.innerHTML = '<p class="placeholder-text">No tasks</p>';
                } else {
                    listElement.innerHTML = tasks.map(task => this.renderTaskItem(task)).join('');
                }

                // Update count
                const countElement = document.getElementById(`${status === 'in-progress' ? 'inProgress' : status}Count`);
                if (countElement) {
                    countElement.textContent = tasks.length;
                }
            });

        } catch (error) {
            this.showError('Failed to render tasks: ' + error.message);
            console.error('Error rendering tasks:', error);
        }
    }

    // Render task item
    renderTaskItem(task) {
        try {
            const isOverdue = this.isTaskOverdue(task);
            const isDueToday = this.isTaskDueToday(task);

            const dueDateText = task.dueDate ?
                new Date(task.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                }) : 'No due date';

            const statusOptions = ['pending', 'in-progress', 'completed'];
            const otherStatuses = statusOptions.filter(s => s !== task.status);

            return `
                <div class="task-item priority-${task.priority}" onclick="tracker.showTaskModal('${task.id}')">
                    <div class="task-header">
                        <h4 class="task-title">${this.escapeHtml(task.title)}</h4>
                        <span class="task-priority ${task.priority}">${task.priority}</span>
                    </div>

                    ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}

                    <div class="task-meta">
                        <span class="task-category">${task.category}</span>
                        <span class="task-due ${isOverdue ? 'overdue' : isDueToday ? 'today' : ''}">${dueDateText}</span>
                    </div>

                    ${task.budget ? `<div class="task-budget-indicator">Budget: ₹${task.budget}</div>` : ''}

                    <div class="task-actions-menu" onclick="event.stopPropagation()">
                        ${otherStatuses.map(status => `
                            <button class="task-action-btn" onclick="tracker.toggleTaskStatus('${task.id}', '${status}')">
                                <div class="icon-bg icon-task-${status === 'in-progress' ? 'progress' : status} xsmall"></div>
                                ${status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        `).join('')}
                        <button class="task-action-btn" onclick="tracker.deleteTask('${task.id}')">
                            <div class="icon-bg icon-delete xsmall"></div>
                            Delete
                        </button>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error rendering task item:', error);
            return '<div class="task-item">Error rendering task</div>';
        }
    }

    // Update task statistics
    updateTaskStats() {
        try {
            const tasks = Object.values(this.tasks);
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(task => task.status === 'completed').length;
            const pendingTasks = tasks.filter(task => task.status === 'pending').length;
            const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            this.updateElement('totalTasks', totalTasks.toString());
            this.updateElement('completedTasks', completedTasks.toString());
            this.updateElement('pendingTasks', pendingTasks.toString());
            this.updateElement('taskProgress', `${progressPercentage}%`);

        } catch (error) {
            console.error('Error updating task statistics:', error);
        }
    }

    // Update expense integration
    updateExpenseIntegration() {
        try {
            this.calculateTaskExpenses(); // Update actual expenses for tasks
            const tasksWithBudget = Object.values(this.tasks).filter(task => task.budget && task.budget > 0);
            const tasksWithBudgetElement = document.getElementById('tasksWithBudget');
            const spendingGoalsElement = document.getElementById('spendingGoals');

            if (tasksWithBudgetElement) {
                if (tasksWithBudget.length === 0) {
                    tasksWithBudgetElement.innerHTML = '<p class="placeholder-text">No budget-related tasks yet</p>';
                } else {
                    tasksWithBudgetElement.innerHTML = tasksWithBudget.map(task => {
                        const isCompleted = task.status === 'completed';
                        const actualExpense = isCompleted ? task.budget : (task.actualExpense || 0);
                        const budgetStatus = isCompleted ? 'completed' : (task.actualExpense > task.budget ? 'over-budget' : 'within-budget');
                        const percentage = ((actualExpense / task.budget) * 100).toFixed(1);

                        return `
                            <div class="integration-item ${budgetStatus}">
                                <div class="integration-title">
                                    ${this.escapeHtml(task.title)}
                                    ${isCompleted ? '<span class="task-status-badge completed">✓ Completed</span>' : ''}
                                </div>
                                <div class="integration-budget">
                                    Budget: ₹${task.budget} | Spent: ₹${actualExpense} (${percentage}%)
                                    ${isCompleted ? '<br><em>Full budget marked as spent upon completion</em>' : ''}
                                </div>
                                <div class="integration-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill ${isCompleted ? 'completed' : ''}" style="width: ${Math.min(percentage, 100)}%"></div>
                                    </div>
                                </div>
                                <div class="integration-actions">
                                    <button class="btn-small" onclick="tracker.viewTaskExpenses('${task.id}')">View Expenses</button>
                                    ${!isCompleted ? `<button class="btn-small" onclick="tracker.addExpenseForTask('${task.id}')">Add Expense</button>` : ''}
                                </div>
                            </div>
                        `;
                    }).join('');
                }
            }

            if (spendingGoalsElement) {
                const totalBudget = tasksWithBudget.reduce((sum, task) => sum + (task.budget || 0), 0);
                const totalSpent = tasksWithBudget.reduce((sum, task) => sum + (task.actualExpense || 0), 0);

                if (totalBudget > 0) {
                    const totalPercentage = ((totalSpent / totalBudget) * 100).toFixed(1);
                    const statusClass = totalSpent > totalBudget ? 'over-budget' : 'within-budget';

                    spendingGoalsElement.innerHTML = `
                        <div class="integration-item ${statusClass}">
                            <div class="integration-title">Total Task Budget</div>
                            <div class="integration-budget">₹${totalBudget} planned | ₹${totalSpent} spent (${totalPercentage}%)</div>
                            <div class="integration-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${Math.min(totalPercentage, 100)}%"></div>
                                </div>
                            </div>
                            <div class="budget-summary">
                                <div class="summary-item">
                                    <span>Remaining Budget:</span>
                                    <span class="${totalBudget - totalSpent >= 0 ? 'positive' : 'negative'}">
                                        ₹${Math.abs(totalBudget - totalSpent)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    spendingGoalsElement.innerHTML = '<p class="placeholder-text">No spending goals set</p>';
                }
            }

        } catch (error) {
            console.error('Error updating expense integration:', error);
        }
    }

    // Calculate actual expenses for tasks based on expense category matching
    calculateTaskExpenses() {
        try {
            const tasksWithBudget = Object.values(this.tasks).filter(task => task.budget && task.budget > 0);

            tasksWithBudget.forEach(task => {
                let actualExpense = 0;

                // Find expenses that match the task's expense category
                Object.values(this.expenses).forEach(dailyExpenses => {
                    if (Array.isArray(dailyExpenses)) {
                        dailyExpenses.forEach(expense => {
                            if (expense.category === task.expenseCategory) {
                                // Add a task identifier to link expenses to tasks if not already present
                                if (!expense.linkedTaskId && expense.name.toLowerCase().includes(task.title.toLowerCase())) {
                                    expense.linkedTaskId = task.id;
                                }

                                if (expense.linkedTaskId === task.id) {
                                    actualExpense += parseFloat(expense.amount) || 0;
                                }
                            }
                        });
                    }
                });

                task.actualExpense = actualExpense;
            });

            // Save updated tasks
            this.setTasks(this.tasks);
        } catch (error) {
            console.error('Error calculating task expenses:', error);
        }
    }

    // View expenses for a specific task
    viewTaskExpenses(taskId) {
        try {
            const task = this.tasks[taskId];
            if (!task) return;

            const taskExpenses = [];
            Object.entries(this.expenses).forEach(([dateKey, dailyExpenses]) => {
                if (Array.isArray(dailyExpenses)) {
                    dailyExpenses.forEach(expense => {
                        if (expense.linkedTaskId === taskId ||
                            (expense.category === task.expenseCategory &&
                             expense.name.toLowerCase().includes(task.title.toLowerCase()))) {
                            taskExpenses.push({
                                ...expense,
                                date: dateKey
                            });
                        }
                    });
                }
            });

            this.showTaskExpensesModal(task, taskExpenses);
        } catch (error) {
            console.error('Error viewing task expenses:', error);
        }
    }

    // Show task expenses modal
    showTaskExpensesModal(task, expenses) {
        try {
            const modalHtml = `
                <div id="taskExpensesModal" class="modal active">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Expenses for: ${this.escapeHtml(task.title)}</h3>
                            <button class="close-btn" onclick="tracker.hideTaskExpensesModal()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="task-budget-summary">
                                <div class="budget-info">
                                    <span>Budget: ₹${task.budget}</span>
                                    <span>Spent: ₹${task.status === 'completed' ? task.budget : (task.actualExpense || 0)}</span>
                                    <span class="${task.status === 'completed' ? 'completed' : (task.actualExpense <= task.budget ? 'within-budget' : 'over-budget')}">
                                        ${task.status === 'completed' ? 'Completed - Full Budget Spent' : (task.actualExpense <= task.budget ? 'Within Budget' : 'Over Budget')}
                                    </span>
                                </div>
                            </div>

                            <div class="task-expenses-list">
                                ${expenses.length === 0 ?
                                    '<p class="placeholder-text">No expenses linked to this task yet</p>' :
                                    expenses.map(expense => `
                                        <div class="expense-item">
                                            <div class="expense-info">
                                                <div class="expense-name">${this.escapeHtml(expense.name)}</div>
                                                <div class="expense-meta">
                                                    ${new Date(expense.date).toLocaleDateString()} • ${expense.category}
                                                </div>
                                            </div>
                                            <div class="expense-amount">₹${parseFloat(expense.amount).toFixed(2)}</div>
                                        </div>
                                    `).join('')
                                }
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-primary" onclick="tracker.addExpenseForTask('${task.id}')">Add Expense</button>
                            <button class="btn btn-secondary" onclick="tracker.hideTaskExpensesModal()">Close</button>
                        </div>
                    </div>
                </div>
                <div id="taskExpensesOverlay" class="overlay active"></div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHtml);
        } catch (error) {
            console.error('Error showing task expenses modal:', error);
        }
    }

    // Hide task expenses modal
    hideTaskExpensesModal() {
        try {
            const modal = document.getElementById('taskExpensesModal');
            const overlay = document.getElementById('taskExpensesOverlay');

            if (modal) modal.remove();
            if (overlay) overlay.remove();
        } catch (error) {
            console.error('Error hiding task expenses modal:', error);
        }
    }

    // Add expense for a specific task
    addExpenseForTask(taskId) {
        try {
            const task = this.tasks[taskId];
            if (!task) return;

            // Hide task expenses modal if open
            this.hideTaskExpensesModal();

            // Show expense modal with pre-filled data
            this.showExpenseModal(new Date());

            // Pre-fill the expense form with task data
            setTimeout(() => {
                const nameInput = document.getElementById('expenseName');
                const categorySelect = document.getElementById('expenseCategory');

                if (nameInput && !nameInput.value) {
                    nameInput.value = `${task.title} - `;
                    nameInput.focus();
                    nameInput.setSelectionRange(nameInput.value.length, nameInput.value.length);
                }

                if (categorySelect && task.expenseCategory) {
                    categorySelect.value = task.expenseCategory;
                }

                // Store the task ID for linking
                window.currentTaskForExpense = taskId;
            }, 100);
        } catch (error) {
            console.error('Error adding expense for task:', error);
        }
    }

    // Get task statistics for dashboard integration
    getTaskStats() {
        try {
            const tasks = Object.values(this.tasks);
            return {
                total: tasks.length,
                completed: tasks.filter(t => t.status === 'completed').length,
                pending: tasks.filter(t => t.status === 'pending').length,
                inProgress: tasks.filter(t => t.status === 'in-progress').length,
                overdue: tasks.filter(t => this.isTaskOverdue(t)).length,
                withBudget: tasks.filter(t => t.budget && t.budget > 0).length
            };
        } catch (error) {
            console.error('Error getting task stats:', error);
            return { total: 0, completed: 0, pending: 0, inProgress: 0, overdue: 0, withBudget: 0 };
        }
    }

    // Handle budget task completion - update expenses and calendar
    handleBudgetTaskCompletion(task) {
        try {
            const completionDate = new Date(task.completedAt);
            const actualExpense = task.actualExpense || 0;
            const remainingBudget = task.budget - actualExpense;

            // When completing a task, mark the entire budget as spent
            if (remainingBudget > 0) {
                // Create an expense entry for the remaining budget amount
                const finalExpense = {
                    id: Date.now().toString(),
                    name: `${task.title} - Task Completion`,
                    category: task.expenseCategory || 'Other',
                    amount: remainingBudget,
                    linkedTaskId: task.id,
                    timestamp: task.completedAt,
                    autoGenerated: true // Mark as auto-generated
                };

                // Add to expenses on completion date
                if (this.addExpenseForDate(completionDate, finalExpense)) {
                    task.actualExpense = task.budget; // Mark full budget as spent
                    this.showSuccess(`Task completed! Entire budget of ₹${task.budget} has been marked as spent.`);
                } else {
                    this.showError('Failed to record final budget expense');
                }
            } else if (actualExpense >= task.budget) {
                this.showSuccess(`Task completed! All budget expenses have been recorded.`);
            }

            // Mark task as budget-reconciled
            task.budgetReconciled = true;
            task.budgetVariance = 0; // Always 0 since we spend the full budget
            task.budgetFullySpent = true;

            console.log(`Budget task "${task.title}" completed. Full budget of ₹${task.budget} marked as spent.`);

        } catch (error) {
            console.error('Error handling budget task completion:', error);
        }
    }

    // Add final expense for completed task (now auto-handled in completion)
    addFinalExpenseForTask(task, completionDate) {
        try {
            // This method is now primarily for manual expense addition
            // The automatic budget completion is handled in handleBudgetTaskCompletion

            this.showExpenseModal(completionDate);

            setTimeout(() => {
                const nameInput = document.getElementById('expenseName');
                const categorySelect = document.getElementById('expenseCategory');
                const amountInput = document.getElementById('expenseAmount');

                if (nameInput) {
                    nameInput.value = `${task.title} - Additional Expense`;
                }

                if (categorySelect && task.expenseCategory) {
                    categorySelect.value = task.expenseCategory;
                }

                if (amountInput) {
                    amountInput.focus();
                }

                // Store task ID for automatic linking
                window.currentTaskForExpense = task.id;
            }, 200);

        } catch (error) {
            console.error('Error adding final expense for task:', error);
        }
    }

    // Get completed tasks for a specific date
    getCompletedTasksForDate(date) {
        try {
            const dateString = date.toDateString();
            const completedTasks = [];

            Object.values(this.tasks).forEach(task => {
                if (task.status === 'completed' && task.completedAt) {
                    const completedDate = new Date(task.completedAt);
                    if (completedDate.toDateString() === dateString) {
                        completedTasks.push(task);
                    }
                }
            });

            return completedTasks;
        } catch (error) {
            console.error('Error getting completed tasks for date:', error);
            return [];
        }
    }

    // Show detailed modal for date with both expenses and completed tasks
    showDateDetailsModal(date, totalExpenses, completedTasks) {
        try {
            const budgetTasks = completedTasks.filter(task => task.budget && task.budget > 0);
            const regularTasks = completedTasks.filter(task => !task.budget || task.budget === 0);

            const modalHtml = `
                <div id="dateDetailsModal" class="modal active">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>${date.toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</h3>
                            <button class="close-btn" onclick="tracker.hideDateDetailsModal()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="date-summary">
                                <div class="summary-item">
                                    <span class="summary-label">Expenses:</span>
                                    <span class="summary-value">₹${totalExpenses.toFixed(2)}</span>
                                </div>
                                <div class="summary-item">
                                    <span class="summary-label">Tasks Completed:</span>
                                    <span class="summary-value">${completedTasks.length}</span>
                                </div>
                                ${budgetTasks.length > 0 ? `
                                    <div class="summary-item">
                                        <span class="summary-label">Budget Tasks:</span>
                                        <span class="summary-value">${budgetTasks.length}</span>
                                    </div>
                                ` : ''}
                            </div>

                            ${budgetTasks.length > 0 ? `
                                <div class="task-section">
                                    <h4><div class="icon-bg icon-integration small" style="display: inline-block; margin-right: 8px;"></div>Budget Tasks Completed</h4>
                                    <div class="task-list">
                                        ${budgetTasks.map(task => `
                                            <div class="task-summary-item">
                                                <div class="task-info">
                                                    <div class="task-name">${this.escapeHtml(task.title)}</div>
                                                    <div class="task-meta">${task.category} • ${task.priority} priority</div>
                                                </div>
                                                <div class="task-budget">
                                                    <div class="budget-info">
                                                        Budget: ₹${task.budget}
                                                        <br>Spent: ₹${task.budget} (100%)
                                                        <br><em>Full budget marked as spent upon completion</em>
                                                    </div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}

                            ${regularTasks.length > 0 ? `
                                <div class="task-section">
                                    <h4><div class="icon-bg icon-task-completed small" style="display: inline-block; margin-right: 8px;"></div>Other Tasks Completed</h4>
                                    <div class="task-list">
                                        ${regularTasks.map(task => `
                                            <div class="task-summary-item">
                                                <div class="task-info">
                                                    <div class="task-name">${this.escapeHtml(task.title)}</div>
                                                    <div class="task-meta">${task.category} • ${task.priority} priority</div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-primary" onclick="tracker.showExpenseModal(new Date('${date.toISOString()}'))">
                                <div class="icon-bg icon-add xsmall" style="display: inline-block; margin-right: 6px;"></div>
                                Add Expense
                            </button>
                            <button class="btn btn-secondary" onclick="tracker.hideDateDetailsModal()">Close</button>
                        </div>
                    </div>
                </div>
                <div id="dateDetailsOverlay" class="overlay active"></div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHtml);
        } catch (error) {
            console.error('Error showing date details modal:', error);
        }
    }

    // Hide date details modal
    hideDateDetailsModal() {
        try {
            const modal = document.getElementById('dateDetailsModal');
            const overlay = document.getElementById('dateDetailsOverlay');

            if (modal) modal.remove();
            if (overlay) overlay.remove();
        } catch (error) {
            console.error('Error hiding date details modal:', error);
        }
    }

    // Refresh all task manager related displays
    refreshTaskManagerDisplay() {
        try {
            this.renderTasks();
            this.updateTaskStats();
            this.renderCalendar(); // Update calendar with latest task completion data
            this.updateDashboard(); // Update dashboard with latest stats
            this.updateExpenseIntegration(); // Update task-expense integration
            this.updateTaskExpenseSummary(); // Update task-expense summary on dashboard
        } catch (error) {
            console.error('Error refreshing task manager display:', error);
        }
    }

    // Update task-expense summary on dashboard
    updateTaskExpenseSummary() {
        try {
            const summaryElement = document.getElementById('taskExpenseSummary');
            if (!summaryElement) return;

            const taskStats = this.getTaskStats();
            const tasksWithBudget = Object.values(this.tasks).filter(task => task.budget && task.budget > 0);
            const totalTaskBudget = tasksWithBudget.reduce((sum, task) => sum + (task.budget || 0), 0);
            const totalTaskSpent = tasksWithBudget.reduce((sum, task) => sum + (task.actualExpense || 0), 0);
            const monthlyExpenses = this.getTotalMonthlyExpenses();

            if (taskStats.total === 0) {
                summaryElement.innerHTML = `
                    <div class="summary-message">
                        <p>No tasks created yet. <a href="#" onclick="tracker.switchSection('tasks')" class="summary-link">Create your first task</a> to start organizing your goals!</p>
                    </div>
                `;
                return;
            }

            const taskProgressPercentage = taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0;
            const budgetProgressPercentage = totalTaskBudget > 0 ? Math.round((totalTaskSpent / totalTaskBudget) * 100) : 0;
            const linkedExpensePercentage = monthlyExpenses > 0 ? Math.round((totalTaskSpent / monthlyExpenses) * 100) : 0;

            summaryElement.innerHTML = `
                <div class="summary-grid">
                    <div class="summary-card">
                        <div class="summary-header">
                            <div class="icon-bg icon-tasks small"></div>
                            <h4>Task Progress</h4>
                        </div>
                        <div class="summary-content">
                            <div class="summary-stat">
                                <span class="stat-value">${taskStats.completed}/${taskStats.total}</span>
                                <span class="stat-label">Completed</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${taskProgressPercentage}%"></div>
                            </div>
                            <div class="summary-details">
                                <span>Pending: ${taskStats.pending}</span>
                                <span>In Progress: ${taskStats.inProgress}</span>
                                ${taskStats.overdue > 0 ? `<span class="overdue">Overdue: ${taskStats.overdue}</span>` : ''}
                            </div>
                        </div>
                    </div>

                    <div class="summary-card">
                        <div class="summary-header">
                            <div class="icon-bg icon-integration small"></div>
                            <h4>Budget Tracking</h4>
                        </div>
                        <div class="summary-content">
                            <div class="summary-stat">
                                <span class="stat-value">₹${totalTaskSpent}/₹${totalTaskBudget}</span>
                                <span class="stat-label">Spent/Budgeted</span>
                            </div>
                            ${totalTaskBudget > 0 ? `
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${Math.min(budgetProgressPercentage, 100)}%"></div>
                                </div>
                                <div class="summary-details">
                                    <span>Budget Usage: ${budgetProgressPercentage}%</span>
                                    <span class="${totalTaskBudget - totalTaskSpent >= 0 ? 'positive' : 'negative'}">
                                        Remaining: ₹${Math.abs(totalTaskBudget - totalTaskSpent)}
                                    </span>
                                </div>
                            ` : '<p class="no-data">No budget tasks created yet</p>'}
                        </div>
                    </div>

                    <div class="summary-card">
                        <div class="summary-header">
                            <div class="icon-bg icon-expense small"></div>
                            <h4>Expense Integration</h4>
                        </div>
                        <div class="summary-content">
                            <div class="summary-stat">
                                <span class="stat-value">${linkedExpensePercentage}%</span>
                                <span class="stat-label">Task-Linked Expenses</span>
                            </div>
                            <div class="summary-details">
                                <span>Total Monthly: ₹${monthlyExpenses}</span>
                                <span>Task Related: ₹${totalTaskSpent}</span>
                                <span>Other: ₹${monthlyExpenses - totalTaskSpent}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="summary-actions">
                    <button class="btn btn-primary" onclick="tracker.switchSection('tasks')">
                        <div class="icon-bg icon-tasks xsmall" style="display: inline-block; margin-right: 6px;"></div>
                        Manage Tasks
                    </button>
                    <button class="btn btn-secondary" onclick="tracker.showTaskModal()">
                        <div class="icon-bg icon-add xsmall" style="display: inline-block; margin-right: 6px;"></div>
                        Add New Task
                    </button>
                </div>
            `;

        } catch (error) {
            console.error('Error updating task-expense summary:', error);
        }
    }
}

// Initialize the tracker when DOM is loaded
let tracker;
document.addEventListener('DOMContentLoaded', () => {
    tracker = new SmartExpenseTracker();
});

// Make tracker globally available for onclick handlers
window.tracker = tracker;
