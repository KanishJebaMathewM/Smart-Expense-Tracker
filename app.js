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

        // Nutrition planner data structures
        this.inventory = {}; // Kitchen stock items
        this.mealPlans = {}; // Weekly meal plans
        this.recipes = {}; // User saved recipes
        this.shoppingList = {}; // Shopping list items
        this.nutritionLog = {}; // Daily nutrition tracking
        this.userPreferences = { // User dietary preferences
            dietType: 'mixed', // 'veg', 'non-veg', 'mixed'
            allergies: [],
            calorieTarget: 2000,
            proteinTarget: 150,
            carbTarget: 250,
            fatTarget: 65
        };

        // Task management properties
        this.editingTaskId = null;
        this.taskFilters = {
            status: 'all',
            category: 'all'
        };

        // Nutrition planner properties
        this.editingMealId = null;
        this.editingInventoryId = null;
        this.currentMealPlan = null;

        // Comprehensive food nutrition database
        this.foodDatabase = {
            // Grains & Cereals (per 100g)
            'rice': { name: 'Rice (White, Cooked)', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, category: 'grains', unit: 'cups' },
            'brown_rice': { name: 'Brown Rice (Cooked)', calories: 112, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8, category: 'grains', unit: 'cups' },
            'wheat_flour': { name: 'Wheat Flour', calories: 364, protein: 10.3, carbs: 76, fat: 1.5, fiber: 2.7, category: 'grains', unit: 'cups' },
            'oats': { name: 'Oats', calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 10.6, category: 'grains', unit: 'cups' },
            'quinoa': { name: 'Quinoa (Cooked)', calories: 120, protein: 4.4, carbs: 22, fat: 1.9, fiber: 2.8, category: 'grains', unit: 'cups' },

            // Vegetables (per 100g)
            'tomato': { name: 'Tomato', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, category: 'vegetables', unit: 'pieces' },
            'onion': { name: 'Onion', calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, category: 'vegetables', unit: 'pieces' },
            'potato': { name: 'Potato', calories: 77, protein: 2.0, carbs: 17, fat: 0.1, fiber: 2.2, category: 'vegetables', unit: 'pieces' },
            'carrot': { name: 'Carrot', calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fiber: 2.8, category: 'vegetables', unit: 'pieces' },
            'spinach': { name: 'Spinach', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, category: 'vegetables', unit: 'cups' },
            'broccoli': { name: 'Broccoli', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, category: 'vegetables', unit: 'cups' },
            'cauliflower': { name: 'Cauliflower', calories: 25, protein: 1.9, carbs: 5, fat: 0.3, fiber: 2.0, category: 'vegetables', unit: 'cups' },
            'bell_pepper': { name: 'Bell Pepper', calories: 31, protein: 1.0, carbs: 7, fat: 0.3, fiber: 2.5, category: 'vegetables', unit: 'pieces' },

            // Proteins (per 100g)
            'chicken': { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, category: 'protein', unit: 'grams' },
            'fish': { name: 'Fish (General)', calories: 206, protein: 22, carbs: 0, fat: 12, fiber: 0, category: 'protein', unit: 'grams' },
            'eggs': { name: 'Eggs', calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, category: 'protein', unit: 'pieces' },
            'paneer': { name: 'Paneer', calories: 265, protein: 18.3, carbs: 1.2, fat: 20.8, fiber: 0, category: 'protein', unit: 'grams' },
            'tofu': { name: 'Tofu', calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3, category: 'protein', unit: 'grams' },
            'lentils': { name: 'Lentils (Cooked)', calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 7.9, category: 'protein', unit: 'cups' },
            'chickpeas': { name: 'Chickpeas (Cooked)', calories: 164, protein: 8.9, carbs: 27, fat: 2.6, fiber: 7.6, category: 'protein', unit: 'cups' },

            // Dairy (per 100g/ml)
            'milk': { name: 'Milk (Whole)', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0, category: 'dairy', unit: 'ml' },
            'yogurt': { name: 'Yogurt (Plain)', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, category: 'dairy', unit: 'grams' },
            'cheese': { name: 'Cheese', calories: 113, protein: 7, carbs: 1, fat: 9, fiber: 0, category: 'dairy', unit: 'grams' },

            // Oils & Fats (per 100g)
            'oil': { name: 'Cooking Oil', calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, category: 'fats', unit: 'ml' },
            'butter': { name: 'Butter', calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0, category: 'fats', unit: 'grams' },
            'ghee': { name: 'Ghee', calories: 900, protein: 0, carbs: 0, fat: 100, fiber: 0, category: 'fats', unit: 'grams' },

            // Fruits (per 100g)
            'apple': { name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, category: 'fruits', unit: 'pieces' },
            'banana': { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, category: 'fruits', unit: 'pieces' },
            'orange': { name: 'Orange', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4, category: 'fruits', unit: 'pieces' },

            // Spices & Others (per 100g)
            'salt': { name: 'Salt', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, category: 'spices', unit: 'grams' },
            'sugar': { name: 'Sugar', calories: 387, protein: 0, carbs: 100, fat: 0, fiber: 0, category: 'spices', unit: 'grams' },
            'turmeric': { name: 'Turmeric', calories: 354, protein: 7.8, carbs: 65, fat: 9.9, fiber: 21, category: 'spices', unit: 'grams' }
        };

        this.init();

        // Initialize nutrition planner
        this.initNutritionPlanner();
    }

    // Utility function for debouncing
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
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
    
    // Safe event listener helper with caching
    safeAddEventListener(elementId, event, handler) {
        try {
            // Cache DOM elements to avoid repeated queries
            if (!this.elementCache) {
                this.elementCache = new Map();
            }

            let element = this.elementCache.get(elementId);
            if (!element) {
                element = document.getElementById(elementId);
                if (element) {
                    this.elementCache.set(elementId, element);
                }
            }

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
    async logout() {
        try {
            const shouldLogout = await confirmAsync('Are you sure you want to logout? Your data will be preserved and available when you log back in.', {
                title: 'Confirm Logout',
                confirmText: 'Logout',
                cancelText: 'Stay Logged In',
                confirmClass: 'btn-danger'
            });

            if (shouldLogout) {
                console.log('🔓 Starting logout process...');

                // Check current state before saving
                console.log('Current state:', {
                    hasCurrentUser: !!this.currentUser,
                    currentUserName: this.currentUser?.name,
                    hasCurrentProfile: !!this.currentProfile,
                    currentProfileId: this.currentProfile?.id,
                    dataToSave: {
                        income: Object.keys(this.income || {}).length,
                        expenses: Object.keys(this.expenses || {}).length,
                        tasks: Object.keys(this.tasks || {}).length
                    }
                });

                // Ensure we have a profile before saving
                if (!this.currentProfile && this.currentUser) {
                    console.log('⚠️ No current profile found, ensuring default profile...');
                    this.ensureDefaultProfile();
                }

                // Save current profile data before logout
                console.log('💾 Saving profile data before logout...');
                let saveSuccess = false;
                let saveMessage = '';

                if (this.currentProfile) {
                    saveSuccess = this.saveProfileData();
                    saveMessage = saveSuccess ? 'Profile data saved successfully before logout' : 'Failed to save profile data (but continuing logout)';
                } else {
                    // If still no profile, try to save data directly
                    console.log('⚠️ Still no profile, attempting direct data save...');
                    try {
                        if (this.currentUser && (Object.keys(this.income || {}).length > 0 || Object.keys(this.expenses || {}).length > 0 || Object.keys(this.tasks || {}).length > 0)) {
                            const userEmail = this.currentUser.email || 'unknown';
                            const cleanIdentifier = userEmail.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
                            const directKey = `profile_data_profile_default_${cleanIdentifier}`;

                            const directData = {
                                income: this.income || {},
                                expenses: this.expenses || {},
                                tasks: this.tasks || {},
                                lastSaved: new Date().toISOString(),
                                user: this.currentUser.name || 'Unknown',
                                userEmail: this.currentUser.email || 'Unknown'
                            };

                            localStorage.setItem(directKey, JSON.stringify(directData));
                            console.log(`✅ Direct save successful with key: ${directKey}`);
                            saveSuccess = true;
                            saveMessage = 'Data saved directly before logout';
                        } else {
                            saveMessage = 'No data to save (new user or empty profile)';
                            saveSuccess = true; // Not an error condition
                        }
                    } catch (directSaveError) {
                        console.error('❌ Direct save failed:', directSaveError);
                        saveMessage = 'Direct save failed, but continuing logout';
                    }
                }

                console.log(saveSuccess ? '✅' : '��️', saveMessage);

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
            console.error('❌ Logout error:', error);

            // Force redirect even on error after trying to save data
            try {
                if (this.currentProfile) {
                    this.saveProfileData();
                }
            } catch (saveError) {
                console.error('❌ Failed to save data during error logout:', saveError);
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

    // Setup auto-save functionality with debouncing
    setupAutoSave() {
        try {
            // Debounced save function to prevent excessive saves
            this.debouncedSave = this.debounce(() => {
                if (this.currentProfile) {
                    this.saveProfileData();
                }
            }, 5000); // Save 5 seconds after last change

            // Auto-save every 2 minutes as backup
            setInterval(() => {
                if (this.currentProfile && this.hasUnsavedChanges) {
                    this.saveProfileData();
                    this.hasUnsavedChanges = false;
                }
            }, 120000);

            // Save on page visibility change (when user switches tabs)
            document.addEventListener('visibilitychange', () => {
                if (document.hidden && this.currentProfile && this.hasUnsavedChanges) {
                    this.saveProfileData();
                    this.hasUnsavedChanges = false;
                }
            });

            // Initialize change tracking
            this.hasUnsavedChanges = false;

            console.log('Auto-save functionality enabled');
        } catch (error) {
            console.error('Failed to setup auto-save:', error);
        }
    }

    // Migrate legacy data to user-specific storage
    migrateLegacyData() {
        try {
            console.log('🔄 Starting legacy data migration...');

            // Check for legacy storage keys and any other potential data sources
            const allKeys = Object.keys(localStorage);
            const legacyKeys = ['income_data', 'expenses_data', 'tasks_data'];
            const potentialDataKeys = allKeys.filter(key =>
                key.includes('income') || key.includes('expense') || key.includes('task') ||
                key.includes('profile_data')
            );

            console.log('🔍 Searching for data:', {
                legacyKeys: legacyKeys,
                potentialKeys: potentialDataKeys,
                allStorageKeys: allKeys.length
            });

            let hasLegacyData = false;
            let migrationLog = [];

            // Check standard legacy keys
            legacyKeys.forEach(key => {
                const data = localStorage.getItem(key);
                if (data) {
                    hasLegacyData = true;
                    console.log(`📋 Found legacy data in: ${key}`);
                    try {
                        const parsed = JSON.parse(data);
                        migrationLog.push({
                            key: key,
                            type: 'legacy',
                            entries: Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length
                        });
                    } catch (e) {
                        console.warn(`⚠️ Could not parse legacy data in ${key}:`, e);
                    }
                }
            });

            // Check for any existing profile data that might belong to this user
            const profileDataKeys = potentialDataKeys.filter(key => key.startsWith('profile_data_'));
            if (profileDataKeys.length > 0) {
                console.log('🔍 Found existing profile data keys:', profileDataKeys);

                // Try to find data that might belong to current user
                profileDataKeys.forEach(key => {
                    try {
                        const data = localStorage.getItem(key);
                        if (data) {
                            const parsed = JSON.parse(data);
                            if (parsed.userEmail === this.currentUser?.email ||
                                parsed.user === this.currentUser?.name) {
                                console.log(`🎯 Found matching profile data: ${key}`);

                                if (parsed.income && Object.keys(this.income).length === 0) {
                                    this.income = parsed.income;
                                    migrationLog.push({key: key, type: 'profile-income', entries: Object.keys(parsed.income).length});
                                }
                                if (parsed.expenses && Object.keys(this.expenses).length === 0) {
                                    this.expenses = parsed.expenses;
                                    migrationLog.push({key: key, type: 'profile-expenses', entries: Object.keys(parsed.expenses).length});
                                }
                                if (parsed.tasks && Object.keys(this.tasks).length === 0) {
                                    this.tasks = parsed.tasks;
                                    migrationLog.push({key: key, type: 'profile-tasks', entries: Object.keys(parsed.tasks).length});
                                }
                                hasLegacyData = true;
                            }
                        }
                    } catch (e) {
                        console.warn(`⚠️ Could not parse profile data in ${key}:`, e);
                    }
                });
            }

            if (!hasLegacyData) {
                console.log('❌ No legacy data found for migration');
                return;
            }

            console.log('📊 Migration summary:', migrationLog);

            // Migrate standard legacy data if no profile data was found
            if (migrationLog.filter(m => m.type.startsWith('profile')).length === 0) {
                console.log('🔄 Migrating standard legacy data...');

                // Migrate income data
                const legacyIncome = localStorage.getItem('income_data');
                if (legacyIncome && Object.keys(this.income).length === 0) {
                    try {
                        this.income = JSON.parse(legacyIncome);
                        console.log('✅ Migrated legacy income data');
                    } catch (e) {
                        console.error('❌ Failed to migrate income data:', e);
                    }
                }

                // Migrate expenses data
                const legacyExpenses = localStorage.getItem('expenses_data');
                if (legacyExpenses && Object.keys(this.expenses).length === 0) {
                    try {
                        this.expenses = JSON.parse(legacyExpenses);
                        console.log('�� Migrated legacy expenses data');
                    } catch (e) {
                        console.error('❌ Failed to migrate expenses data:', e);
                    }
                }

                // Migrate tasks data
                const legacyTasks = localStorage.getItem('tasks_data');
                if (legacyTasks && Object.keys(this.tasks).length === 0) {
                    try {
                        this.tasks = JSON.parse(legacyTasks);
                        console.log('✅ Migrated legacy tasks data');
                    } catch (e) {
                        console.error('�� Failed to migrate tasks data:', e);
                    }
                }
            }

            // Save migrated data with new user-specific keys
            if (hasLegacyData) {
                console.log('💾 Saving migrated data...');
                const saveSuccess = this.saveProfileData();
                if (saveSuccess) {
                    console.log('✅ Legacy data migration completed successfully');
                    console.log('📊 Final data summary:', {
                        income: Object.keys(this.income).length,
                        expenses: Object.keys(this.expenses).length,
                        tasks: Object.keys(this.tasks).length
                    });
                } else {
                    console.error('❌ Failed to save migrated data');
                }
            }

        } catch (error) {
            console.error('❌ Error during legacy data migration:', error);
        }
    }

    // Ensure user has at least one profile
    ensureDefaultProfile() {
        try {
            console.log('🔧 Ensuring default profile...');

            if (!this.currentUser) {
                console.error('❌ Cannot ensure profile: No current user');
                return;
            }

            const profiles = this.getProfiles();
            const userSpecificCurrentProfileKey = this.getUserSpecificKey(this.STORAGE_KEYS.CURRENT_PROFILE);

            console.log('Profile check:', {
                existingProfilesCount: Object.keys(profiles).length,
                userSpecificKey: userSpecificCurrentProfileKey,
                currentUser: this.currentUser?.name
            });

            if (Object.keys(profiles).length === 0) {
                // Create default profile for the user
                console.log('📝 Creating new default profile...');
                const defaultProfile = {
                    id: 'profile_default',
                    name: this.currentUser?.name || 'My Profile',
                    icon: this.getUIIcon('user'),
                    createdAt: new Date().toISOString(),
                    lastAccessed: new Date().toISOString()
                };

                profiles[defaultProfile.id] = defaultProfile;
                const profilesSaved = this.saveProfiles(profiles);
                this.currentProfile = defaultProfile;
                localStorage.setItem(userSpecificCurrentProfileKey, defaultProfile.id);

                console.log('✅ Created default profile for user:', this.currentUser?.name, 'Saved:', profilesSaved);
            } else {
                // Load existing profile or first available profile
                console.log('📂 Loading existing profile...');
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

                console.log(`✅ Loaded existing profile: ${profile.name}`);
            }

            // Verify profile was set
            if (this.currentProfile) {
                console.log('✅ Profile successfully ensured:', this.currentProfile.id);
            } else {
                console.error('❌ Profile was not set after ensure operation');
            }
        } catch (error) {
            console.error('❌ Error ensuring default profile:', error);
            // Fallback: create a minimal profile to prevent crashes
            console.log('🆘 Creating fallback profile...');
            this.currentProfile = {
                id: 'profile_fallback',
                name: this.currentUser?.name || 'My Profile',
                icon: this.getUIIcon('user'),
                createdAt: new Date().toISOString(),
                lastAccessed: new Date().toISOString()
            };
            console.log('✅ Fallback profile created');
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

            // Nutrition planner events
            this.safeAddEventListener('addInventoryBtn', 'click', () => this.showInventoryModal());
            this.safeAddEventListener('addRecipeBtn', 'click', () => this.showRecipeModal());
            this.safeAddEventListener('addShoppingItemBtn', 'click', () => this.showShoppingModal());
            this.safeAddEventListener('generateMealPlanBtn', 'click', () => this.generateWeeklyMealPlan());
            this.safeAddEventListener('setNutritionGoalsBtn', 'click', () => this.showNutritionGoalsModal());
            this.safeAddEventListener('exportShoppingListBtn', 'click', () => this.exportShoppingList());

            // Nutrition tab switching
            document.querySelectorAll('.nutrition-tab-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const tabName = e.target.closest('.nutrition-tab-btn').dataset.nutritionTab;
                    this.switchNutritionTab(tabName);
                });
            });

            // Nutrition filters
            this.safeAddEventListener('inventoryCategory', 'change', () => this.filterInventory());
            this.safeAddEventListener('lowStockFilter', 'click', () => this.toggleLowStockFilter());
            this.safeAddEventListener('expiringFilter', 'click', () => this.toggleExpiringFilter());
            this.safeAddEventListener('recipeDiet', 'change', () => this.filterRecipes());
            this.safeAddEventListener('recipeCategory', 'change', () => this.filterRecipes());
            this.safeAddEventListener('availableOnlyFilter', 'click', () => this.toggleAvailableRecipesFilter());

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
            console.log('%c=== LOADING PROFILE DATA ===', 'color: blue; font-size: 16px; font-weight: bold;');

            // Always ensure data structures exist first
            this.income = this.income || {};
            this.expenses = this.expenses || {};
            this.tasks = this.tasks || {};

            // If no current profile, try to load any existing data or keep empty structures
            if (!this.currentProfile) {
                console.log('⚠️ No current profile, using empty data structures');
                return;
            }

            console.log('Current profile info:', {
                id: this.currentProfile.id,
                name: this.currentProfile.name,
                userEmail: this.currentUser?.email,
                userId: this.currentUser?.userId
            });

            const userSpecificKey = this.getUserSpecificKey(this.STORAGE_KEYS.PROFILE_DATA + this.currentProfile.id);
            console.log(`📁 Loading profile data with key: ${userSpecificKey}`);

            const profileData = localStorage.getItem(userSpecificKey);

            if (profileData) {
                console.log('✅ Found existing profile data');
                const data = JSON.parse(profileData);
                console.log('Profile data content:', {
                    hasIncome: !!data.income,
                    hasExpenses: !!data.expenses,
                    hasTasks: !!data.tasks,
                    lastSaved: data.lastSaved,
                    user: data.user,
                    userEmail: data.userEmail
                });

                this.income = data.income || {};
                this.expenses = data.expenses || {};
                this.tasks = data.tasks || {};

                // Load nutrition planner data
                this.inventory = data.inventory || {};
                this.mealPlans = data.mealPlans || {};
                this.recipes = data.recipes || {};
                this.shoppingList = data.shoppingList || {};
                this.nutritionLog = data.nutritionLog || {};
                this.userPreferences = { ...this.userPreferences, ...(data.userPreferences || {}) };

                console.log(`📊 Profile data loaded successfully:`, {
                    incomeEntries: Object.keys(this.income).length,
                    expenseEntries: Object.keys(this.expenses).length,
                    taskEntries: Object.keys(this.tasks).length
                });

                // Show obvious alert if data is found
                const totalEntries = Object.keys(this.income).length + Object.keys(this.expenses).length + Object.keys(this.tasks).length;
                if (totalEntries > 0) {
                    console.log(`%c🎉 DATA FOUND! Found ${totalEntries} total entries (${Object.keys(this.expenses).length} expense days, ${Object.keys(this.income).length} income entries, ${Object.keys(this.tasks).length} tasks)`, 'color: green; font-size: 16px; font-weight: bold;');
                }

                // Show detailed expense data for debugging
                if (Object.keys(this.expenses).length > 0) {
                    console.log('📝 Expense data details:', {
                        dates: Object.keys(this.expenses),
                        totalDays: Object.keys(this.expenses).length,
                        firstEntries: Object.keys(this.expenses).slice(0, 3).map(date => ({
                            date,
                            count: this.expenses[date].length
                        }))
                    });
                }
            } else {
                console.log('❌ No user-specific data found');
                console.log(`%c⚠️ NO DATA FOUND for key: ${userSpecificKey}`, 'color: red; font-size: 16px; font-weight: bold;');

                // Check if there are any storage keys that might match
                const allKeys = Object.keys(localStorage);
                const profileKeys = allKeys.filter(key => key.includes('profile_data'));
                console.log('📋 All profile-related keys in storage:', profileKeys);

                // Try to migrate from legacy storage if no user-specific data found
                console.log('🔄 Checking for legacy data migration...');
                this.migrateLegacyData();

                // Check if migration found anything
                const totalAfterMigration = Object.keys(this.income).length + Object.keys(this.expenses).length + Object.keys(this.tasks).length;
                if (totalAfterMigration === 0) {
                    console.log(`%c📝 NO DATA FOUND ANYWHERE - This appears to be a fresh start`, 'color: orange; font-size: 14px; font-weight: bold;');
                }
            }

            console.log(`✅ Profile data loading completed for user: ${this.currentUser?.name}`);
            console.log('=== PROFILE DATA LOADING COMPLETED ===');
        } catch (error) {
            this.showError('Failed to load profile data: ' + error.message);
            console.error('❌ Profile data loading error:', error);
            // Always ensure data structures exist, even on error
            this.income = this.income || {};
            this.expenses = this.expenses || {};
            this.tasks = this.tasks || {};
        }
    }

    // Save profile-specific data (user-specific)
    saveProfileData() {
        try {
            if (!this.currentProfile) {
                console.warn('⚠️ Cannot save: No current profile found');
                console.log('Debug info:', {
                    hasCurrentUser: !!this.currentUser,
                    userName: this.currentUser?.name,
                    userEmail: this.currentUser?.email,
                    profiles: this.getProfiles()
                });

                // Try to create a profile if we have user data
                if (this.currentUser) {
                    console.log('�� Attempting to create emergency profile for save...');
                    try {
                        this.ensureDefaultProfile();
                        if (this.currentProfile) {
                            console.log('✅ Emergency profile created successfully');
                        } else {
                            console.error('❌ Failed to create emergency profile');
                            return false;
                        }
                    } catch (profileError) {
                        console.error('❌ Error creating emergency profile:', profileError);
                        return false;
                    }
                } else {
                    console.error('❌ No current user data available for profile creation');
                    return false;
                }
            }

            console.log('💾 Saving profile data...');

            const userSpecificKey = this.getUserSpecificKey(this.STORAGE_KEYS.PROFILE_DATA + this.currentProfile.id);
            const profileData = {
                income: this.income || {},
                expenses: this.expenses || {},
                tasks: this.tasks || {},

                // Nutrition planner data
                inventory: this.inventory || {},
                mealPlans: this.mealPlans || {},
                recipes: this.recipes || {},
                shoppingList: this.shoppingList || {},
                nutritionLog: this.nutritionLog || {},
                userPreferences: this.userPreferences || {},

                lastSaved: new Date().toISOString(),
                user: this.currentUser?.name || 'Unknown',
                userEmail: this.currentUser?.email || 'Unknown'
            };

            console.log('📊 Data being saved:', {
                key: userSpecificKey,
                incomeEntries: Object.keys(profileData.income).length,
                expenseEntries: Object.keys(profileData.expenses).length,
                taskEntries: Object.keys(profileData.tasks).length,
                user: profileData.user,
                userEmail: profileData.userEmail
            });

            // Show detailed expense data for debugging
            if (Object.keys(profileData.expenses).length > 0) {
                console.log('📝 Expense data being saved:', {
                    dates: Object.keys(profileData.expenses),
                    totalDays: Object.keys(profileData.expenses).length,
                    sampleEntries: Object.keys(profileData.expenses).slice(0, 3).map(date => ({
                        date,
                        count: profileData.expenses[date]?.length || 0,
                        firstExpense: profileData.expenses[date]?.[0]?.name || 'N/A'
                    }))
                });
            }

            localStorage.setItem(userSpecificKey, JSON.stringify(profileData));
            console.log(`✅ Profile data saved successfully with key: ${userSpecificKey}`);

            // Verify the save worked
            const verification = localStorage.getItem(userSpecificKey);
            if (verification) {
                console.log('��� Save verification successful');
            } else {
                console.error('❌ Save verification failed - data not found after save');
                return false;
            }

            return true;
        } catch (error) {
            this.showError('Failed to save profile data: ' + error.message);
            console.error('❌ Profile data saving error:', error);
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
            const saveSuccess = this.saveProfileData();
            console.log(`%c💰 INCOME SAVED: ₹${amount} for ${key} (Save success: ${saveSuccess})`, 'color: blue; font-size: 14px; font-weight: bold;');
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

            // Immediately save profile data
            const saveSuccess = this.saveProfileData();
            console.log(`%c💾 EXPENSE SAVED: ${expense.name} - ₹${expense.amount} (Save success: ${saveSuccess})`, 'color: green; font-size: 14px; font-weight: bold;');

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
                    this.hasUnsavedChanges = true;
                    this.debouncedSave(); // Use debounced save
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
                this.hasUnsavedChanges = true;
                this.debouncedSave(); // Use debounced save
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
                            this.hasUnsavedChanges = true;
                            this.debouncedSave(); // Use debounced save
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
    
    async deleteExpense(expenseId) {
        try {
            if (!this.selectedDate) return;

            const shouldDelete = await confirmAsync('Are you sure you want to delete this expense?', {
                title: 'Delete Expense',
                confirmText: 'Delete',
                cancelText: 'Cancel',
                confirmClass: 'btn-danger'
            });

            if (shouldDelete) {
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
            insights.push('<p><span class="warning-icon">��</span> Low savings rate. Try to save at least 10% of your income.</p>');
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
            // Use cached elements for better performance
            if (!this.elementCache) {
                this.elementCache = new Map();
            }

            let element = this.elementCache.get(elementId);
            if (!element) {
                element = document.getElementById(elementId);
                if (element) {
                    this.elementCache.set(elementId, element);
                }
            }

            if (element && element.textContent !== content) {
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

            // Handle section-specific initialization
            switch(sectionName) {
                case 'nutrition':
                    this.initNutritionSection();
                    break;
                case 'tasks':
                    this.refreshTaskManagerDisplay();
                    break;
                case 'analytics':
                    this.updateAnalytics();
                    break;
                case 'reports':
                    // Reports section doesn't need special initialization
                    break;
                default:
                    // Dashboard
                    this.updateDashboard();
                    break;
            }
        } catch (error) {
            console.error('Error switching section:', error);
        }
    }

    // Initialize nutrition section when first loaded
    initNutritionSection() {
        try {
            console.log('Initializing nutrition section...');

            // Update nutrition overview cards
            this.updateNutritionOverview();

            // Render current tab content
            const activeTab = document.querySelector('.nutrition-tab-btn.active');
            const currentTab = activeTab ? activeTab.dataset.nutritionTab : 'inventory';

            // Switch to inventory tab by default and render content
            this.switchNutritionTab(currentTab);

            console.log('Nutrition section initialized successfully');
        } catch (error) {
            console.error('Error initializing nutrition section:', error);
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

                // Bind profile events only once
            if (!this.profileEventsBound) {
                this.bindProfileEvents();
                this.profileEventsBound = true;
            }
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
            if (profilePictureInput) {
                // Remove existing listeners to prevent duplicates
                profilePictureInput.replaceWith(profilePictureInput.cloneNode(true));
                const newInput = document.getElementById('profilePictureInput');
                newInput.addEventListener('change', (e) => this.handleProfilePictureUpload(e));
            }

            // Save profile button
            const saveProfileBtn = document.getElementById('saveProfile');
            if (saveProfileBtn) {
                saveProfileBtn.replaceWith(saveProfileBtn.cloneNode(true));
                const newSaveBtn = document.getElementById('saveProfile');
                newSaveBtn.addEventListener('click', () => this.saveProfileData());
            }

            // Delete profile button
            const deleteProfileBtn = document.getElementById('deleteProfile');
            if (deleteProfileBtn) {
                deleteProfileBtn.replaceWith(deleteProfileBtn.cloneNode(true));
                const newDeleteBtn = document.getElementById('deleteProfile');
                newDeleteBtn.addEventListener('click', () => this.deleteProfile());
            }

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

    async deleteProfile() {
        try {
            const shouldDelete = await confirmAsync('Are you sure you want to delete your account? This action cannot be undone.', {
                title: 'Delete Account',
                confirmText: 'Delete Account',
                cancelText: 'Keep Account',
                confirmClass: 'btn-danger'
            });

            if (shouldDelete) {
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
            }
        } catch (error) {
            console.error('Error deleting profile:', error);
            this.showError('Failed to delete account');
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

    // Delete task with custom confirm
    async deleteTask(taskId) {
        try {
            const shouldDelete = await confirmAsync('Are you sure you want to delete this task?', {
                title: 'Delete Task',
                confirmText: 'Delete',
                cancelText: 'Cancel',
                confirmClass: 'btn-danger'
            });

            if (shouldDelete) {
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

    // ==============================================
    // NUTRITION PLANNER METHODS
    // ==============================================

    // Initialize nutrition planner
    initNutritionPlanner() {
        try {
            console.log('Initializing Nutrition Planner...');

            // Ensure data structures exist
            this.inventory = this.inventory || {};
            this.mealPlans = this.mealPlans || {};
            this.recipes = this.recipes || {};
            this.shoppingList = this.shoppingList || {};
            this.nutritionLog = this.nutritionLog || {};

            // Initialize with some default recipes if none exist
            if (Object.keys(this.recipes).length === 0) {
                this.initializeDefaultRecipes();
            }

            console.log('Nutrition planner initialized successfully');

            // Update the nutrition overview if we're in the nutrition section
            if (document.getElementById('nutritionSection')?.classList.contains('active')) {
                this.updateNutritionOverview();
            }
        } catch (error) {
            console.error('Error initializing nutrition planner:', error);
        }
    }

    // Initialize default recipes
    initializeDefaultRecipes() {
        try {
            this.recipes = {
                'fried_rice': {
                    id: 'fried_rice',
                    name: 'Vegetable Fried Rice',
                    ingredients: {
                        'rice': { quantity: 1, unit: 'cups' },
                        'eggs': { quantity: 2, unit: 'pieces' },
                        'carrot': { quantity: 0.5, unit: 'pieces' },
                        'onion': { quantity: 0.5, unit: 'pieces' },
                        'oil': { quantity: 2, unit: 'ml' }
                    },
                    instructions: ['Cook rice', 'Scramble eggs', 'Stir-fry vegetables', 'Mix everything together'],
                    servings: 2,
                    prepTime: 30,
                    difficulty: 'easy',
                    category: 'main',
                    cuisine: 'asian',
                    dietType: 'veg'
                },
                'chicken_curry': {
                    id: 'chicken_curry',
                    name: 'Chicken Curry',
                    ingredients: {
                        'chicken': { quantity: 300, unit: 'grams' },
                        'onion': { quantity: 1, unit: 'pieces' },
                        'tomato': { quantity: 2, unit: 'pieces' },
                        'oil': { quantity: 3, unit: 'ml' },
                        'turmeric': { quantity: 1, unit: 'grams' }
                    },
                    instructions: ['Marinate chicken', 'Cook onions', 'Add tomatoes and spices', 'Add chicken and simmer'],
                    servings: 3,
                    prepTime: 45,
                    difficulty: 'medium',
                    category: 'main',
                    cuisine: 'indian',
                    dietType: 'non-veg'
                },
                'oats_breakfast': {
                    id: 'oats_breakfast',
                    name: 'Healthy Oats Bowl',
                    ingredients: {
                        'oats': { quantity: 0.5, unit: 'cups' },
                        'milk': { quantity: 200, unit: 'ml' },
                        'banana': { quantity: 1, unit: 'pieces' },
                        'apple': { quantity: 0.5, unit: 'pieces' }
                    },
                    instructions: ['Cook oats with milk', 'Add chopped fruits', 'Mix and serve'],
                    servings: 1,
                    prepTime: 10,
                    difficulty: 'easy',
                    category: 'breakfast',
                    cuisine: 'healthy',
                    dietType: 'veg'
                },
                'paneer_curry': {
                    id: 'paneer_curry',
                    name: 'Paneer Butter Masala',
                    ingredients: {
                        'paneer': { quantity: 200, unit: 'grams' },
                        'tomato': { quantity: 3, unit: 'pieces' },
                        'onion': { quantity: 1, unit: 'pieces' },
                        'butter': { quantity: 2, unit: 'grams' },
                        'milk': { quantity: 50, unit: 'ml' }
                    },
                    instructions: ['Prepare tomato base', 'Add paneer cubes', 'Simmer with cream', 'Garnish and serve'],
                    servings: 2,
                    prepTime: 35,
                    difficulty: 'medium',
                    category: 'main',
                    cuisine: 'indian',
                    dietType: 'veg'
                }
            };

            // Save recipes
            this.hasUnsavedChanges = true;
            this.debouncedSave();
        } catch (error) {
            console.error('Error initializing default recipes:', error);
        }
    }

    // Calculate nutrition for a recipe
    calculateRecipeNutrition(recipe) {
        try {
            let totalNutrition = {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                fiber: 0
            };

            Object.entries(recipe.ingredients).forEach(([foodId, ingredient]) => {
                const foodData = this.foodDatabase[foodId];
                if (foodData) {
                    const quantity = ingredient.quantity;

                    // Convert to per 100g basis for calculation
                    let multiplier = quantity / 100;

                    // Adjust multiplier based on unit
                    if (foodData.unit === 'pieces') {
                        // Estimate average weight for pieces
                        const pieceWeights = {
                            'eggs': 50,
                            'tomato': 150,
                            'onion': 150,
                            'potato': 150,
                            'carrot': 100,
                            'apple': 150,
                            'banana': 120,
                            'orange': 150,
                            'bell_pepper': 150
                        };
                        const weight = pieceWeights[foodId] || 100;
                        multiplier = (quantity * weight) / 100;
                    } else if (foodData.unit === 'cups') {
                        // Convert cups to grams (approximate)
                        const cupWeights = {
                            'rice': 185,
                            'brown_rice': 195,
                            'oats': 80,
                            'quinoa': 185,
                            'spinach': 30,
                            'broccoli': 90,
                            'lentils': 200,
                            'chickpeas': 200
                        };
                        const weight = cupWeights[foodId] || 100;
                        multiplier = (quantity * weight) / 100;
                    } else if (foodData.unit === 'ml') {
                        // Assume 1ml = 1g for liquids
                        multiplier = quantity / 100;
                    }

                    totalNutrition.calories += foodData.calories * multiplier;
                    totalNutrition.protein += foodData.protein * multiplier;
                    totalNutrition.carbs += foodData.carbs * multiplier;
                    totalNutrition.fat += foodData.fat * multiplier;
                    totalNutrition.fiber += foodData.fiber * multiplier;
                }
            });

            // Round to 1 decimal place
            Object.keys(totalNutrition).forEach(key => {
                totalNutrition[key] = Math.round(totalNutrition[key] * 10) / 10;
            });

            return totalNutrition;
        } catch (error) {
            console.error('Error calculating recipe nutrition:', error);
            return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
        }
    }

    // Check which recipes can be made with current inventory
    getAvailableRecipes() {
        try {
            const availableRecipes = [];

            Object.values(this.recipes).forEach(recipe => {
                let canMake = true;
                const missingIngredients = [];

                Object.entries(recipe.ingredients).forEach(([foodId, required]) => {
                    const available = this.inventory[foodId]?.quantity || 0;
                    if (available < required.quantity) {
                        canMake = false;
                        missingIngredients.push({
                            food: foodId,
                            required: required.quantity,
                            available: available,
                            missing: required.quantity - available
                        });
                    }
                });

                availableRecipes.push({
                    recipe: recipe,
                    canMake: canMake,
                    missingIngredients: missingIngredients,
                    nutrition: this.calculateRecipeNutrition(recipe)
                });
            });

            return availableRecipes.sort((a, b) => {
                if (a.canMake && !b.canMake) return -1;
                if (!a.canMake && b.canMake) return 1;
                return a.missingIngredients.length - b.missingIngredients.length;
            });
        } catch (error) {
            console.error('Error getting available recipes:', error);
            return [];
        }
    }

    // Add item to inventory
    addToInventory(foodId, quantity, unit, expiryDate = null) {
        try {
            const foodData = this.foodDatabase[foodId];
            if (!foodData) {
                this.showError('Food item not found in database');
                return false;
            }

            if (!this.inventory[foodId]) {
                this.inventory[foodId] = {
                    foodId: foodId,
                    name: foodData.name,
                    quantity: 0,
                    unit: unit || foodData.unit,
                    category: foodData.category,
                    addedDate: new Date().toISOString(),
                    expiryDate: expiryDate
                };
            }

            this.inventory[foodId].quantity += quantity;
            this.inventory[foodId].lastUpdated = new Date().toISOString();

            this.hasUnsavedChanges = true;
            this.debouncedSave();

            return true;
        } catch (error) {
            console.error('Error adding to inventory:', error);
            return false;
        }
    }

    // Use ingredients from inventory (when cooking a recipe)
    useIngredientsFromInventory(recipe) {
        try {
            Object.entries(recipe.ingredients).forEach(([foodId, required]) => {
                if (this.inventory[foodId]) {
                    this.inventory[foodId].quantity = Math.max(0,
                        this.inventory[foodId].quantity - required.quantity
                    );

                    // Remove from inventory if quantity becomes 0
                    if (this.inventory[foodId].quantity === 0) {
                        delete this.inventory[foodId];
                    }
                }
            });

            this.hasUnsavedChanges = true;
            this.debouncedSave();

            return true;
        } catch (error) {
            console.error('Error using ingredients from inventory:', error);
            return false;
        }
    }

    // Add to shopping list
    addToShoppingList(foodId, quantity, unit) {
        try {
            const foodData = this.foodDatabase[foodId];
            if (!foodData) {
                this.showError('Food item not found in database');
                return false;
            }

            const itemId = Date.now().toString();
            this.shoppingList[itemId] = {
                id: itemId,
                foodId: foodId,
                name: foodData.name,
                quantity: quantity,
                unit: unit || foodData.unit,
                category: foodData.category,
                purchased: false,
                addedDate: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            this.hasUnsavedChanges = true;
            this.debouncedSave();

            return true;
        } catch (error) {
            console.error('Error adding to shopping list:', error);
            return false;
        }
    }

    // Get nutrition log for a specific date
    getNutritionLogForDate(date) {
        try {
            const dateKey = this.getDateKey(date);
            return this.nutritionLog[dateKey] || {
                meals: [],
                totalNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
                waterIntake: 0,
                exerciseMinutes: 0
            };
        } catch (error) {
            console.error('Error getting nutrition log for date:', error);
            return {
                meals: [],
                totalNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
                waterIntake: 0,
                exerciseMinutes: 0
            };
        }
    }

    // Log a meal
    logMeal(date, recipeId, servings = 1, mealType = 'main') {
        try {
            const recipe = this.recipes[recipeId];
            if (!recipe) {
                this.showError('Recipe not found');
                return false;
            }

            const dateKey = this.getDateKey(date);
            if (!this.nutritionLog[dateKey]) {
                this.nutritionLog[dateKey] = {
                    meals: [],
                    totalNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
                    waterIntake: 0,
                    exerciseMinutes: 0
                };
            }

            const recipeNutrition = this.calculateRecipeNutrition(recipe);
            const mealNutrition = {
                calories: recipeNutrition.calories * servings,
                protein: recipeNutrition.protein * servings,
                carbs: recipeNutrition.carbs * servings,
                fat: recipeNutrition.fat * servings,
                fiber: recipeNutrition.fiber * servings
            };

            const meal = {
                id: Date.now().toString(),
                recipeId: recipeId,
                recipeName: recipe.name,
                servings: servings,
                mealType: mealType,
                nutrition: mealNutrition,
                timestamp: new Date().toISOString()
            };

            this.nutritionLog[dateKey].meals.push(meal);

            // Update total nutrition for the day
            Object.keys(mealNutrition).forEach(key => {
                this.nutritionLog[dateKey].totalNutrition[key] += mealNutrition[key];
            });

            this.hasUnsavedChanges = true;
            this.debouncedSave();

            return true;
        } catch (error) {
            console.error('Error logging meal:', error);
            return false;
        }
    }

    // ==============================================
    // NUTRITION PLANNER UI METHODS
    // ==============================================

    // Switch nutrition tabs
    switchNutritionTab(tabName) {
        try {
            // Hide all nutrition tab contents
            document.querySelectorAll('.nutrition-tab-content').forEach(tab => {
                tab.classList.remove('active');
            });

            // Show target tab
            const targetTab = document.getElementById(`${tabName}Tab`);
            if (targetTab) {
                targetTab.classList.add('active');
            }

            // Update tab buttons
            document.querySelectorAll('.nutrition-tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            const activeBtn = document.querySelector(`[data-nutrition-tab="${tabName}"]`);
            if (activeBtn) {
                activeBtn.classList.add('active');
            }

            // Refresh content for specific tabs
            switch(tabName) {
                case 'inventory':
                    this.renderInventory();
                    break;
                case 'recipes':
                    this.renderRecipes();
                    break;
                case 'meal-plan':
                    this.renderMealPlan();
                    break;
                case 'shopping':
                    this.renderShoppingList();
                    break;
                case 'insights':
                    this.renderNutritionInsights();
                    break;
            }
        } catch (error) {
            console.error('Error switching nutrition tab:', error);
        }
    }

    // Show inventory modal
    showInventoryModal(itemId = null) {
        try {
            const modalHtml = `
                <div id="inventoryModal" class="modal active">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>${itemId ? 'Edit' : 'Add'} Inventory Item</h3>
                            <button class="close-btn" onclick="tracker.hideInventoryModal()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label for="foodSelect">Food Item</label>
                                <select id="foodSelect" required>
                                    <option value="">Select food item...</option>
                                    ${Object.entries(this.foodDatabase).map(([id, food]) =>
                                        `<option value="${id}">${food.name}</option>`
                                    ).join('')}
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="itemQuantity">Quantity</label>
                                <input type="number" id="itemQuantity" placeholder="Enter quantity" min="0" step="0.1" required>
                            </div>

                            <div class="form-group">
                                <label for="itemUnit">Unit</label>
                                <input type="text" id="itemUnit" placeholder="e.g., cups, pieces, grams" required>
                            </div>

                            <div class="form-group">
                                <label for="expiryDate">Expiry Date (Optional)</label>
                                <input type="date" id="expiryDate">
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button id="saveInventoryItem" class="btn btn-primary">${itemId ? 'Update' : 'Add'} Item</button>
                            <button class="btn btn-secondary" onclick="tracker.hideInventoryModal()">Cancel</button>
                        </div>
                    </div>
                </div>
                <div id="inventoryOverlay" class="overlay active"></div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHtml);

            // Bind save event
            document.getElementById('saveInventoryItem').addEventListener('click', () => {
                this.saveInventoryItem(itemId);
            });

            // Auto-fill unit when food is selected
            document.getElementById('foodSelect').addEventListener('change', (e) => {
                const foodId = e.target.value;
                if (foodId && this.foodDatabase[foodId]) {
                    document.getElementById('itemUnit').value = this.foodDatabase[foodId].unit;
                }
            });

        } catch (error) {
            console.error('Error showing inventory modal:', error);
        }
    }

    // Hide inventory modal
    hideInventoryModal() {
        try {
            const modal = document.getElementById('inventoryModal');
            const overlay = document.getElementById('inventoryOverlay');
            if (modal) modal.remove();
            if (overlay) overlay.remove();
        } catch (error) {
            console.error('Error hiding inventory modal:', error);
        }
    }

    // Save inventory item
    saveInventoryItem(editingId = null) {
        try {
            const foodId = document.getElementById('foodSelect').value;
            const quantity = parseFloat(document.getElementById('itemQuantity').value);
            const unit = document.getElementById('itemUnit').value;
            const expiryDate = document.getElementById('expiryDate').value || null;

            if (!foodId || !quantity || quantity <= 0) {
                this.showError('Please fill all required fields with valid values');
                return;
            }

            if (this.addToInventory(foodId, quantity, unit, expiryDate)) {
                this.hideInventoryModal();
                this.renderInventory();
                this.updateNutritionOverview();
                this.showSuccess('Inventory item added successfully!');
            }
        } catch (error) {
            this.showError('Failed to save inventory item: ' + error.message);
            console.error('Error saving inventory item:', error);
        }
    }

    // Show recipe modal
    showRecipeModal(recipeId = null) {
        try {
            const modalHtml = `
                <div id="recipeModal" class="modal active">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>${recipeId ? 'Edit' : 'Add'} Recipe</h3>
                            <button class="close-btn" onclick="tracker.hideRecipeModal()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label for="recipeName">Recipe Name</label>
                                <input type="text" id="recipeName" placeholder="Enter recipe name" required>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="recipeServings">Servings</label>
                                    <input type="number" id="recipeServings" placeholder="2" min="1" value="2" required>
                                </div>
                                <div class="form-group">
                                    <label for="recipePrepTime">Prep Time (minutes)</label>
                                    <input type="number" id="recipePrepTime" placeholder="30" min="1" required>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="recipeDietType">Diet Type</label>
                                    <select id="recipeDietType" required>
                                        <option value="veg">Vegetarian</option>
                                        <option value="non-veg">Non-Vegetarian</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="recipeCategory">Category</label>
                                    <select id="recipeCategory" required>
                                        <option value="breakfast">Breakfast</option>
                                        <option value="main">Main Course</option>
                                        <option value="snack">Snacks</option>
                                        <option value="dessert">Dessert</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Ingredients</label>
                                <div id="ingredientsList">
                                    <div class="ingredient-item">
                                        <select class="ingredient-select">
                                            <option value="">Select ingredient...</option>
                                            ${Object.entries(this.foodDatabase).map(([id, food]) =>
                                                `<option value="${id}">${food.name}</option>`
                                            ).join('')}
                                        </select>
                                        <input type="number" class="ingredient-quantity" placeholder="Qty" min="0" step="0.1">
                                        <input type="text" class="ingredient-unit" placeholder="Unit">
                                        <button type="button" class="btn-remove" onclick="this.parentElement.remove()">Remove</button>
                                    </div>
                                </div>
                                <button type="button" id="addIngredient" class="btn btn-secondary">Add Ingredient</button>
                            </div>

                            <div class="form-group">
                                <label for="recipeInstructions">Instructions (one per line)</label>
                                <textarea id="recipeInstructions" rows="4" placeholder="Enter cooking instructions, one step per line"></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button id="saveRecipe" class="btn btn-primary">${recipeId ? 'Update' : 'Add'} Recipe</button>
                            <button class="btn btn-secondary" onclick="tracker.hideRecipeModal()">Cancel</button>
                        </div>
                    </div>
                </div>
                <div id="recipeOverlay" class="overlay active"></div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHtml);

            // Bind events
            document.getElementById('saveRecipe').addEventListener('click', () => {
                this.saveRecipe(recipeId);
            });

            document.getElementById('addIngredient').addEventListener('click', () => {
                this.addIngredientRow();
            });

        } catch (error) {
            console.error('Error showing recipe modal:', error);
        }
    }

    // Hide recipe modal
    hideRecipeModal() {
        try {
            const modal = document.getElementById('recipeModal');
            const overlay = document.getElementById('recipeOverlay');
            if (modal) modal.remove();
            if (overlay) overlay.remove();
        } catch (error) {
            console.error('Error hiding recipe modal:', error);
        }
    }

    // Add ingredient row
    addIngredientRow() {
        try {
            const ingredientsList = document.getElementById('ingredientsList');
            const ingredientHtml = `
                <div class="ingredient-item">
                    <select class="ingredient-select">
                        <option value="">Select ingredient...</option>
                        ${Object.entries(this.foodDatabase).map(([id, food]) =>
                            `<option value="${id}">${food.name}</option>`
                        ).join('')}
                    </select>
                    <input type="number" class="ingredient-quantity" placeholder="Qty" min="0" step="0.1">
                    <input type="text" class="ingredient-unit" placeholder="Unit">
                    <button type="button" class="btn-remove" onclick="this.parentElement.remove()">Remove</button>
                </div>
            `;
            ingredientsList.insertAdjacentHTML('beforeend', ingredientHtml);
        } catch (error) {
            console.error('Error adding ingredient row:', error);
        }
    }

    // Show shopping modal
    showShoppingModal() {
        try {
            const modalHtml = `
                <div id="shoppingModal" class="modal active">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Add Shopping List Item</h3>
                            <button class="close-btn" onclick="tracker.hideShoppingModal()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label for="shoppingFoodSelect">Food Item</label>
                                <select id="shoppingFoodSelect" required>
                                    <option value="">Select food item...</option>
                                    ${Object.entries(this.foodDatabase).map(([id, food]) =>
                                        `<option value="${id}">${food.name}</option>`
                                    ).join('')}
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="shoppingQuantity">Quantity</label>
                                <input type="number" id="shoppingQuantity" placeholder="Enter quantity" min="0" step="0.1" required>
                            </div>

                            <div class="form-group">
                                <label for="shoppingUnit">Unit</label>
                                <input type="text" id="shoppingUnit" placeholder="e.g., cups, pieces, grams" required>
                            </div>

                        </div>
                        <div class="modal-footer">
                            <button id="saveShoppingItem" class="btn btn-primary">Add to List</button>
                            <button class="btn btn-secondary" onclick="tracker.hideShoppingModal()">Cancel</button>
                        </div>
                    </div>
                </div>
                <div id="shoppingOverlay" class="overlay active"></div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHtml);

            // Bind save event
            document.getElementById('saveShoppingItem').addEventListener('click', () => {
                this.saveShoppingItem();
            });

            // Auto-fill unit when food is selected
            document.getElementById('shoppingFoodSelect').addEventListener('change', (e) => {
                const foodId = e.target.value;
                if (foodId && this.foodDatabase[foodId]) {
                    document.getElementById('shoppingUnit').value = this.foodDatabase[foodId].unit;
                }
            });

        } catch (error) {
            console.error('Error showing shopping modal:', error);
        }
    }

    // Hide shopping modal
    hideShoppingModal() {
        try {
            const modal = document.getElementById('shoppingModal');
            const overlay = document.getElementById('shoppingOverlay');
            if (modal) modal.remove();
            if (overlay) overlay.remove();
        } catch (error) {
            console.error('Error hiding shopping modal:', error);
        }
    }

    // Show nutrition goals modal
    showNutritionGoalsModal() {
        try {
            const modalHtml = `
                <div id="nutritionGoalsModal" class="modal active">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Set Nutrition Goals</h3>
                            <button class="close-btn" onclick="tracker.hideNutritionGoalsModal()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label for="calorieTarget">Daily Calorie Goal</label>
                                <input type="number" id="calorieTarget" value="${this.userPreferences.calorieTarget}" min="1000" max="5000" required>
                            </div>

                            <div class="form-group">
                                <label for="proteinTarget">Daily Protein Goal (g)</label>
                                <input type="number" id="proteinTarget" value="${this.userPreferences.proteinTarget}" min="50" max="300" required>
                            </div>

                            <div class="form-group">
                                <label for="carbTarget">Daily Carbs Goal (g)</label>
                                <input type="number" id="carbTarget" value="${this.userPreferences.carbTarget}" min="100" max="500" required>
                            </div>

                            <div class="form-group">
                                <label for="fatTarget">Daily Fat Goal (g)</label>
                                <input type="number" id="fatTarget" value="${this.userPreferences.fatTarget}" min="20" max="150" required>
                            </div>

                            <div class="form-group">
                                <label for="dietTypePreference">Diet Preference</label>
                                <select id="dietTypePreference">
                                    <option value="mixed" ${this.userPreferences.dietType === 'mixed' ? 'selected' : ''}>Mixed</option>
                                    <option value="veg" ${this.userPreferences.dietType === 'veg' ? 'selected' : ''}>Vegetarian</option>
                                    <option value="non-veg" ${this.userPreferences.dietType === 'non-veg' ? 'selected' : ''}>Non-Vegetarian</option>
                                </select>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button id="saveNutritionGoals" class="btn btn-primary">Save Goals</button>
                            <button class="btn btn-secondary" onclick="tracker.hideNutritionGoalsModal()">Cancel</button>
                        </div>
                    </div>
                </div>
                <div id="nutritionGoalsOverlay" class="overlay active"></div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHtml);

            // Bind save event
            document.getElementById('saveNutritionGoals').addEventListener('click', () => {
                this.saveNutritionGoals();
            });

        } catch (error) {
            console.error('Error showing nutrition goals modal:', error);
        }
    }

    // Hide nutrition goals modal
    hideNutritionGoalsModal() {
        try {
            const modal = document.getElementById('nutritionGoalsModal');
            const overlay = document.getElementById('nutritionGoalsOverlay');
            if (modal) modal.remove();
            if (overlay) overlay.remove();
        } catch (error) {
            console.error('Error hiding nutrition goals modal:', error);
        }
    }

    // Save shopping item
    saveShoppingItem() {
        try {
            const foodId = document.getElementById('shoppingFoodSelect').value;
            const quantity = parseFloat(document.getElementById('shoppingQuantity').value);
            const unit = document.getElementById('shoppingUnit').value;

            if (!foodId || !quantity || quantity <= 0) {
                this.showError('Please fill all required fields with valid values');
                return;
            }

            if (this.addToShoppingList(foodId, quantity, unit)) {
                this.hideShoppingModal();
                this.renderShoppingList();
                this.updateNutritionOverview();
                this.showSuccess('Item added to shopping list!');
            }
        } catch (error) {
            this.showError('Failed to save shopping item: ' + error.message);
            console.error('Error saving shopping item:', error);
        }
    }

    // Save nutrition goals
    saveNutritionGoals() {
        try {
            const calorieTarget = parseInt(document.getElementById('calorieTarget').value);
            const proteinTarget = parseInt(document.getElementById('proteinTarget').value);
            const carbTarget = parseInt(document.getElementById('carbTarget').value);
            const fatTarget = parseInt(document.getElementById('fatTarget').value);
            const dietType = document.getElementById('dietTypePreference').value;

            this.userPreferences = {
                ...this.userPreferences,
                calorieTarget,
                proteinTarget,
                carbTarget,
                fatTarget,
                dietType
            };

            this.hasUnsavedChanges = true;
            this.debouncedSave();

            this.hideNutritionGoalsModal();
            this.renderNutritionInsights();
            this.updateNutritionOverview();
            this.showSuccess('Nutrition goals updated successfully!');
        } catch (error) {
            this.showError('Failed to save nutrition goals: ' + error.message);
            console.error('Error saving nutrition goals:', error);
        }
    }

    // Save recipe
    saveRecipe(editingId = null) {
        try {
            const name = document.getElementById('recipeName').value.trim();
            const servings = parseInt(document.getElementById('recipeServings').value);
            const prepTime = parseInt(document.getElementById('recipePrepTime').value);
            const dietType = document.getElementById('recipeDietType').value;
            const category = document.getElementById('recipeCategory').value;
            const instructions = document.getElementById('recipeInstructions').value.split('\n').filter(line => line.trim());

            if (!name || !servings || !prepTime) {
                this.showError('Please fill all required fields');
                return;
            }

            // Get ingredients
            const ingredients = {};
            const ingredientItems = document.querySelectorAll('.ingredient-item');

            for (let item of ingredientItems) {
                const foodId = item.querySelector('.ingredient-select').value;
                const quantity = parseFloat(item.querySelector('.ingredient-quantity').value);
                const unit = item.querySelector('.ingredient-unit').value;

                if (foodId && quantity && unit) {
                    ingredients[foodId] = { quantity, unit };
                }
            }

            if (Object.keys(ingredients).length === 0) {
                this.showError('Please add at least one ingredient');
                return;
            }

            const recipeId = editingId || Date.now().toString();
            this.recipes[recipeId] = {
                id: recipeId,
                name,
                ingredients,
                instructions,
                servings,
                prepTime,
                category,
                dietType,
                createdAt: editingId ? this.recipes[recipeId]?.createdAt : new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            this.hasUnsavedChanges = true;
            this.debouncedSave();

            this.hideRecipeModal();
            this.renderRecipes();
            this.updateNutritionOverview();
            this.showSuccess('Recipe saved successfully!');
        } catch (error) {
            this.showError('Failed to save recipe: ' + error.message);
            console.error('Error saving recipe:', error);
        }
    }

    // Render inventory
    renderInventory() {
        try {
            const inventoryList = document.getElementById('inventoryList');
            if (!inventoryList) return;

            const inventoryItems = Object.values(this.inventory);

            if (inventoryItems.length === 0) {
                inventoryList.innerHTML = `
                    <div class="inventory-placeholder">
                        <div class="icon-bg icon-inventory xlarge"></div>
                        <h4>Your kitchen stock is empty</h4>
                        <p>Start by adding items you have in your kitchen</p>
                        <button class="btn btn-primary" onclick="tracker.showInventoryModal()">
                            <div class="icon-bg icon-add xsmall" style="display: inline-block; margin-right: 6px;"></div>
                            Add First Item
                        </button>
                    </div>
                `;
                return;
            }

            inventoryList.innerHTML = inventoryItems.map(item => {
                const isLowStock = item.quantity < 2; // Arbitrary low stock threshold
                const isExpiring = item.expiryDate && new Date(item.expiryDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Expiring within 7 days

                return `
                    <div class="inventory-item ${isLowStock ? 'low-stock' : ''} ${isExpiring ? 'expiring' : ''}">
                        <div class="item-info">
                            <div class="item-name">${this.escapeHtml(item.name)}</div>
                            <div class="item-category">${item.category}</div>
                        </div>
                        <div class="item-quantity">
                            <span class="quantity">${item.quantity}</span>
                            <span class="unit">${item.unit}</span>
                        </div>
                        <div class="item-status">
                            ${isLowStock ? '<span class="status-badge low-stock">Low Stock</span>' : ''}
                            ${isExpiring ? '<span class="status-badge expiring">Expiring Soon</span>' : ''}
                            ${item.expiryDate ? `<div class="expiry-date">Expires: ${new Date(item.expiryDate).toLocaleDateString()}</div>` : ''}
                        </div>
                        <div class="item-actions">
                            <button class="btn-small" onclick="tracker.showInventoryModal('${item.foodId}')">Edit</button>
                            <button class="btn-small btn-danger" onclick="tracker.removeFromInventory('${item.foodId}')">Remove</button>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Error rendering inventory:', error);
        }
    }

    // Render recipes
    renderRecipes() {
        try {
            const recipesList = document.getElementById('recipesList');
            if (!recipesList) return;

            const availableRecipes = this.getAvailableRecipes();

            if (availableRecipes.length === 0) {
                recipesList.innerHTML = `
                    <div class="recipes-placeholder">
                        <div class="icon-bg icon-recipes xlarge"></div>
                        <h4>No recipes available</h4>
                        <p>Add some recipes to get cooking suggestions</p>
                        <button class="btn btn-primary" onclick="tracker.showRecipeModal()">
                            <div class="icon-bg icon-add xsmall" style="display: inline-block; margin-right: 6px;"></div>
                            Add Recipe
                        </button>
                    </div>
                `;
                return;
            }

            recipesList.innerHTML = availableRecipes.map(({ recipe, canMake, missingIngredients, nutrition }) => {
                return `
                    <div class="recipe-card ${canMake ? 'can-make' : 'missing-ingredients'}">
                        <div class="recipe-header">
                            <h4 class="recipe-name">${this.escapeHtml(recipe.name)}</h4>
                            <div class="recipe-meta">
                                <span class="recipe-time">${recipe.prepTime} min</span>
                                <span class="recipe-servings">${recipe.servings} servings</span>
                                <span class="recipe-diet ${recipe.dietType}">${recipe.dietType}</span>
                            </div>
                        </div>

                        <div class="recipe-nutrition">
                            <div class="nutrition-item">
                                <span class="nutrition-label">Calories:</span>
                                <span class="nutrition-value">${Math.round(nutrition.calories)}</span>
                            </div>
                            <div class="nutrition-item">
                                <span class="nutrition-label">Protein:</span>
                                <span class="nutrition-value">${Math.round(nutrition.protein)}g</span>
                            </div>
                            <div class="nutrition-item">
                                <span class="nutrition-label">Carbs:</span>
                                <span class="nutrition-value">${Math.round(nutrition.carbs)}g</span>
                            </div>
                        </div>

                        ${!canMake ? `
                            <div class="missing-ingredients">
                                <h5>Missing ingredients:</h5>
                                <ul>
                                    ${missingIngredients.map(missing =>
                                        `<li>${this.foodDatabase[missing.food]?.name || missing.food}: need ${missing.missing} more</li>`
                                    ).join('')}
                                </ul>
                            </div>
                        ` : ''}

                        <div class="recipe-actions">
                            ${canMake ? `
                                <button class="btn btn-primary" onclick="tracker.cookRecipe('${recipe.id}')">Cook This Recipe</button>
                            ` : `
                                <button class="btn btn-secondary" onclick="tracker.addMissingToShoppingList('${recipe.id}')">Add Missing to Shopping</button>
                            `}
                            <button class="btn btn-secondary" onclick="tracker.showRecipeModal('${recipe.id}')">Edit</button>
                            <button class="btn btn-danger" onclick="tracker.deleteRecipe('${recipe.id}')">Delete</button>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Error rendering recipes:', error);
        }
    }

    // Update nutrition overview
    updateNutritionOverview() {
        try {
            // Update inventory count
            const inventoryCount = Object.keys(this.inventory).length;
            this.updateElement('inventoryItems', `${inventoryCount} items`);

            // Update available recipes count
            const availableRecipes = this.getAvailableRecipes();
            const canMakeCount = availableRecipes.filter(r => r.canMake).length;
            this.updateElement('availableRecipes', `${canMakeCount} recipes`);

            // Update today's calories
            const today = new Date();
            const todayLog = this.getNutritionLogForDate(today);
            this.updateElement('todaysCalories', `${Math.round(todayLog.totalNutrition.calories)} kcal`);

            // Update shopping list count
            const shoppingCount = Object.keys(this.shoppingList).length;
            this.updateElement('shoppingItems', `${shoppingCount} items`);

        } catch (error) {
            console.error('Error updating nutrition overview:', error);
        }
    }

    // Render meal plan
    renderMealPlan() {
        try {
            const mealPlanGrid = document.getElementById('mealPlanGrid');
            if (!mealPlanGrid) return;

            // Generate 7-day meal plan grid
            const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            const mealTypes = ['breakfast', 'lunch', 'dinner'];

            // Get current week's meal plan or create empty one
            const currentWeek = this.getCurrentWeekKey();
            const weekPlan = this.mealPlans[currentWeek] || {};

            let gridHtml = `
                <div class="meal-plan-header">
                    <div class="week-navigation">
                        <button class="btn btn-secondary" onclick="tracker.previousWeek()">
                            <div class="icon-bg icon-prev xsmall"></div> Previous Week
                        </button>
                        <h4>Week of ${this.formatWeekDate(currentWeek)}</h4>
                        <button class="btn btn-secondary" onclick="tracker.nextWeek()">
                            Next Week <div class="icon-bg icon-next xsmall"></div>
                        </button>
                    </div>
                </div>
                <div class="meal-grid">
                    <div class="meal-grid-header">
                        <div class="day-header">Day</div>
                        <div class="meal-header">Breakfast</div>
                        <div class="meal-header">Lunch</div>
                        <div class="meal-header">Dinner</div>
                    </div>
            `;

            daysOfWeek.forEach(day => {
                gridHtml += `<div class="meal-row">`;
                gridHtml += `<div class="day-cell">${day}</div>`;

                mealTypes.forEach(mealType => {
                    const mealKey = `${day.toLowerCase()}_${mealType}`;
                    const plannedMeal = weekPlan[mealKey];

                    gridHtml += `
                        <div class="meal-cell" onclick="tracker.selectMealSlot('${currentWeek}', '${mealKey}')">
                            ${plannedMeal ? `
                                <div class="planned-meal">
                                    <div class="meal-name">${this.escapeHtml(plannedMeal.recipeName)}</div>
                                    <div class="meal-calories">${Math.round(plannedMeal.calories)} kcal</div>
                                    <button class="remove-meal" onclick="event.stopPropagation(); tracker.removePlannedMeal('${currentWeek}', '${mealKey}')">&times;</button>
                                </div>
                            ` : `
                                <div class="empty-meal">
                                    <div class="icon-bg icon-add small"></div>
                                    <span>Add meal</span>
                                </div>
                            `}
                        </div>
                    `;
                });

                gridHtml += `</div>`;
            });

            gridHtml += `</div>`;

            // Add meal plan summary
            const weekSummary = this.calculateWeekNutrition(weekPlan);
            gridHtml += `
                <div class="meal-plan-summary">
                    <h4>Weekly Summary</h4>
                    <div class="summary-grid">
                        <div class="summary-item">
                            <span>Avg Daily Calories:</span>
                            <span>${Math.round(weekSummary.avgCalories)} kcal</span>
                        </div>
                        <div class="summary-item">
                            <span>Avg Daily Protein:</span>
                            <span>${Math.round(weekSummary.avgProtein)}g</span>
                        </div>
                        <div class="summary-item">
                            <span>Planned Meals:</span>
                            <span>${Object.keys(weekPlan).length}/21</span>
                        </div>
                        <div class="summary-item">
                            <span>Avg Daily Carbs:</span>
                            <span>${Math.round(weekSummary.avgCarbs)}g</span>
                        </div>
                    </div>
                </div>
            `;

            mealPlanGrid.innerHTML = gridHtml;
        } catch (error) {
            console.error('Error rendering meal plan:', error);
        }
    }

    // Render shopping list
    renderShoppingList() {
        try {
            const shoppingList = document.getElementById('shoppingList');
            if (!shoppingList) return;

            const items = Object.values(this.shoppingList);

            if (items.length === 0) {
                shoppingList.innerHTML = `
                    <div class="shopping-placeholder">
                        <div class="icon-bg icon-shopping-list xlarge"></div>
                        <h4>Your shopping list is empty</h4>
                        <p>Add items manually or from missing recipe ingredients</p>
                        <button class="btn btn-primary" onclick="tracker.showShoppingModal()">
                            <div class="icon-bg icon-add xsmall" style="display: inline-block; margin-right: 6px;"></div>
                            Add First Item
                        </button>
                    </div>
                `;
                return;
            }

            // Group items by category
            const groupedItems = {};
            items.forEach(item => {
                if (!groupedItems[item.category]) {
                    groupedItems[item.category] = [];
                }
                groupedItems[item.category].push(item);
            });

            let listHtml = '';
            Object.entries(groupedItems).forEach(([category, categoryItems]) => {
                listHtml += `
                    <div class="shopping-category">
                        <h4 class="category-header">${category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                        <div class="category-items">
                            ${categoryItems.map(item => `
                                <div class="shopping-item ${item.purchased ? 'purchased' : ''}">
                                    <div class="item-checkbox">
                                        <input type="checkbox" ${item.purchased ? 'checked' : ''}
                                               onchange="tracker.toggleShoppingItem('${item.id}')">
                                    </div>
                                    <div class="item-details">
                                        <div class="item-name">${this.escapeHtml(item.name)}</div>
                                        <div class="item-quantity">${item.quantity} ${item.unit}</div>
                                    </div>
                                    <div class="item-actions">
                                        <button class="btn-small" onclick="tracker.editShoppingItem('${item.id}')">Edit</button>
                                        <button class="btn-small btn-danger" onclick="tracker.removeShoppingItem('${item.id}')">Remove</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            });

            shoppingList.innerHTML = listHtml;

            // Update shopping summary
            this.updateShoppingSummary(items);
        } catch (error) {
            console.error('Error rendering shopping list:', error);
        }
    }

    // Render nutrition insights
    renderNutritionInsights() {
        try {
            const insightsContainer = document.getElementById('nutritionInsights');
            if (!insightsContainer) return;

            // Get today's nutrition data
            const today = new Date();
            const todayLog = this.getNutritionLogForDate(today);
            const weeklyData = this.getWeeklyNutritionData();

            // Update progress bars
            this.updateNutritionProgress(todayLog.totalNutrition);

            // Generate insights and recommendations
            const insights = this.generateNutritionInsights(todayLog, weeklyData);

            insightsContainer.innerHTML = `
                <div class="insights-grid">
                    <div class="insight-card">
                        <h4>Today's Analysis</h4>
                        <div class="insight-content">
                            ${insights.today.map(insight => `
                                <div class="insight-item ${insight.type}">
                                    <div class="insight-icon">${this.getInsightIcon(insight.type)}</div>
                                    <div class="insight-text">${insight.message}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="insight-card">
                        <h4>Weekly Trends</h4>
                        <div class="insight-content">
                            ${insights.weekly.map(insight => `
                                <div class="insight-item ${insight.type}">
                                    <div class="insight-icon">${this.getInsightIcon(insight.type)}</div>
                                    <div class="insight-text">${insight.message}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="insight-card">
                        <h4>Recommendations</h4>
                        <div class="insight-content">
                            ${insights.recommendations.map(insight => `
                                <div class="insight-item ${insight.type}">
                                    <div class="insight-icon">${this.getInsightIcon(insight.type)}</div>
                                    <div class="insight-text">${insight.message}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="nutrition-charts">
                    <div class="chart-container">
                        <h4>Weekly Calorie Trend</h4>
                        <canvas id="weeklyCalorieChart" width="400" height="200"></canvas>
                    </div>
                    <div class="chart-container">
                        <h4>Macronutrient Distribution</h4>
                        <canvas id="macroDistributionChart" width="300" height="300"></canvas>
                    </div>
                </div>
            `;

            // Render charts
            this.renderNutritionCharts(weeklyData, todayLog.totalNutrition);
        } catch (error) {
            console.error('Error rendering nutrition insights:', error);
        }
    }

    // Generate weekly meal plan
    generateWeeklyMealPlan() {
        try {
            const availableRecipes = this.getAvailableRecipes().filter(r => r.canMake);

            if (availableRecipes.length === 0) {
                this.showError('No recipes available with current inventory. Please add more ingredients.');
                return;
            }

            const currentWeek = this.getCurrentWeekKey();
            const weekPlan = {};

            const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            const mealTypes = ['breakfast', 'lunch', 'dinner'];

            // Filter recipes by meal category
            const breakfastRecipes = availableRecipes.filter(r => r.recipe.category === 'breakfast');
            const mainRecipes = availableRecipes.filter(r => r.recipe.category === 'main');
            const snackRecipes = availableRecipes.filter(r => r.recipe.category === 'snack');

            // Generate plan for each day
            daysOfWeek.forEach(day => {
                mealTypes.forEach(mealType => {
                    let recipePool = [];

                    switch(mealType) {
                        case 'breakfast':
                            recipePool = breakfastRecipes.length > 0 ? breakfastRecipes : availableRecipes;
                            break;
                        case 'lunch':
                        case 'dinner':
                            recipePool = mainRecipes.length > 0 ? mainRecipes : availableRecipes;
                            break;
                    }

                    if (recipePool.length > 0) {
                        const randomRecipe = recipePool[Math.floor(Math.random() * recipePool.length)];
                        const nutrition = this.calculateRecipeNutrition(randomRecipe.recipe);

                        weekPlan[`${day}_${mealType}`] = {
                            recipeId: randomRecipe.recipe.id,
                            recipeName: randomRecipe.recipe.name,
                            servings: 1,
                            calories: nutrition.calories,
                            protein: nutrition.protein,
                            carbs: nutrition.carbs,
                            fat: nutrition.fat
                        };
                    }
                });
            });

            // Save meal plan
            this.mealPlans[currentWeek] = weekPlan;
            this.hasUnsavedChanges = true;
            this.debouncedSave();

            // Re-render meal plan
            this.renderMealPlan();

            this.showSuccess('Weekly meal plan generated successfully!');
        } catch (error) {
            this.showError('Failed to generate meal plan: ' + error.message);
            console.error('Error generating weekly meal plan:', error);
        }
    }

    // Export shopping list
    exportShoppingList() {
        try {
            const items = Object.values(this.shoppingList);

            if (items.length === 0) {
                this.showError('Shopping list is empty. Add some items first.');
                return;
            }

            // Generate CSV content
            const csvHeaders = ['Item Name', 'Quantity', 'Unit', 'Category', 'Status'];
            const csvRows = [csvHeaders.join(',')];

            items.forEach(item => {
                const row = [
                    `"${item.name}"`,
                    item.quantity,
                    `"${item.unit}"`,
                    `"${item.category}"`,
                    item.purchased ? 'Purchased' : 'Pending'
                ];
                csvRows.push(row.join(','));
            });

            // Add summary
            csvRows.push('');
            csvRows.push('Summary');
            csvRows.push(`Total Items,${items.length}`);
            csvRows.push(`Purchased,${items.filter(item => item.purchased).length}`);
            csvRows.push(`Pending,${items.filter(item => !item.purchased).length}`);

            const csvContent = csvRows.join('\n');

            // Download CSV
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `shopping-list-${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            URL.revokeObjectURL(url);

            this.showSuccess('Shopping list exported successfully!');
        } catch (error) {
            this.showError('Failed to export shopping list: ' + error.message);
            console.error('Error exporting shopping list:', error);
        }
    }

    // Filter inventory
    filterInventory() {
        try {
            const categoryFilter = document.getElementById('inventoryCategory')?.value || 'all';
            const lowStockOnly = document.getElementById('lowStockFilter')?.classList.contains('active') || false;
            const expiringOnly = document.getElementById('expiringFilter')?.classList.contains('active') || false;

            let filteredItems = Object.values(this.inventory);

            // Apply category filter
            if (categoryFilter !== 'all') {
                filteredItems = filteredItems.filter(item => item.category === categoryFilter);
            }

            // Apply low stock filter
            if (lowStockOnly) {
                filteredItems = filteredItems.filter(item => item.quantity < 2);
            }

            // Apply expiring filter
            if (expiringOnly) {
                const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                filteredItems = filteredItems.filter(item => {
                    return item.expiryDate && new Date(item.expiryDate) <= oneWeekFromNow;
                });
            }

            this.renderFilteredInventory(filteredItems);
        } catch (error) {
            console.error('Error filtering inventory:', error);
        }
    }

    // Toggle low stock filter
    toggleLowStockFilter() {
        try {
            const filterBtn = document.getElementById('lowStockFilter');
            if (filterBtn) {
                filterBtn.classList.toggle('active');
                this.filterInventory();
            }
        } catch (error) {
            console.error('Error toggling low stock filter:', error);
        }
    }

    // Toggle expiring filter
    toggleExpiringFilter() {
        try {
            const filterBtn = document.getElementById('expiringFilter');
            if (filterBtn) {
                filterBtn.classList.toggle('active');
                this.filterInventory();
            }
        } catch (error) {
            console.error('Error toggling expiring filter:', error);
        }
    }

    // Filter recipes
    filterRecipes() {
        try {
            const dietFilter = document.getElementById('recipeDiet')?.value || 'all';
            const categoryFilter = document.getElementById('recipeCategory')?.value || 'all';
            const availableOnly = document.getElementById('availableOnlyFilter')?.classList.contains('active') || false;

            let availableRecipes = this.getAvailableRecipes();

            // Apply diet filter
            if (dietFilter !== 'all') {
                availableRecipes = availableRecipes.filter(item => item.recipe.dietType === dietFilter);
            }

            // Apply category filter
            if (categoryFilter !== 'all') {
                availableRecipes = availableRecipes.filter(item => item.recipe.category === categoryFilter);
            }

            // Apply available only filter
            if (availableOnly) {
                availableRecipes = availableRecipes.filter(item => item.canMake);
            }

            this.renderFilteredRecipes(availableRecipes);
        } catch (error) {
            console.error('Error filtering recipes:', error);
        }
    }

    // Toggle available recipes filter
    toggleAvailableRecipesFilter() {
        try {
            const filterBtn = document.getElementById('availableOnlyFilter');
            if (filterBtn) {
                filterBtn.classList.toggle('active');
                this.filterRecipes();
            }
        } catch (error) {
            console.error('Error toggling available recipes filter:', error);
        }
    }

    // Remove from inventory
    async removeFromInventory(foodId) {
        try {
            const item = this.inventory[foodId];
            if (!item) return;

            const shouldRemove = await confirmAsync(`Remove ${item.name} from inventory?`, {
                title: 'Remove Item',
                confirmText: 'Remove',
                cancelText: 'Cancel',
                confirmClass: 'btn-danger'
            });

            if (shouldRemove) {
                delete this.inventory[foodId];
                this.hasUnsavedChanges = true;
                this.debouncedSave();

                this.renderInventory();
                this.updateNutritionOverview();
                this.showSuccess('Item removed from inventory');
            }
        } catch (error) {
            this.showError('Failed to remove item: ' + error.message);
            console.error('Error removing from inventory:', error);
        }
    }

    // Cook recipe
    async cookRecipe(recipeId) {
        try {
            const recipe = this.recipes[recipeId];
            if (!recipe) {
                this.showError('Recipe not found');
                return;
            }

            // Check if we have all ingredients
            const availableRecipes = this.getAvailableRecipes();
            const recipeData = availableRecipes.find(r => r.recipe.id === recipeId);

            if (!recipeData || !recipeData.canMake) {
                this.showError('Cannot cook this recipe. Missing ingredients.');
                return;
            }

            const shouldCook = await confirmAsync(`Cook ${recipe.name}? This will use ingredients from your inventory.`, {
                title: 'Cook Recipe',
                confirmText: 'Cook',
                cancelText: 'Cancel',
                confirmClass: 'btn-primary'
            });

            if (shouldCook) {
                // Use ingredients from inventory
                this.useIngredientsFromInventory(recipe);

                // Log the meal
                const today = new Date();
                this.logMeal(today, recipeId, 1, 'main');

                // Re-render everything
                this.renderInventory();
                this.renderRecipes();
                this.updateNutritionOverview();
                this.renderNutritionInsights();

                this.showSuccess(`${recipe.name} cooked successfully! Nutrition logged for today.`);
            }
        } catch (error) {
            this.showError('Failed to cook recipe: ' + error.message);
            console.error('Error cooking recipe:', error);
        }
    }

    // Add missing ingredients to shopping list
    addMissingToShoppingList(recipeId) {
        try {
            const availableRecipes = this.getAvailableRecipes();
            const recipeData = availableRecipes.find(r => r.recipe.id === recipeId);

            if (!recipeData) {
                this.showError('Recipe not found');
                return;
            }

            if (recipeData.canMake) {
                this.showInfo('This recipe can already be made with current inventory');
                return;
            }

            let addedCount = 0;
            recipeData.missingIngredients.forEach(missing => {
                const foodData = this.foodDatabase[missing.food];
                if (foodData) {
                    if (this.addToShoppingList(missing.food, missing.missing, foodData.unit)) {
                        addedCount++;
                    }
                }
            });

            if (addedCount > 0) {
                this.renderShoppingList();
                this.updateNutritionOverview();
                this.showSuccess(`Added ${addedCount} missing ingredients to shopping list`);
            } else {
                this.showError('Failed to add ingredients to shopping list');
            }
        } catch (error) {
            this.showError('Failed to add missing ingredients: ' + error.message);
            console.error('Error adding missing ingredients to shopping list:', error);
        }
    }

    // Delete recipe
    async deleteRecipe(recipeId) {
        try {
            const recipe = this.recipes[recipeId];
            if (!recipe) return;

            const shouldDelete = await confirmAsync(`Delete recipe "${recipe.name}"?`, {
                title: 'Delete Recipe',
                confirmText: 'Delete',
                cancelText: 'Cancel',
                confirmClass: 'btn-danger'
            });

            if (shouldDelete) {
                delete this.recipes[recipeId];
                this.hasUnsavedChanges = true;
                this.debouncedSave();

                this.renderRecipes();
                this.updateNutritionOverview();
                this.showSuccess('Recipe deleted successfully');
            }
        } catch (error) {
            this.showError('Failed to delete recipe: ' + error.message);
            console.error('Error deleting recipe:', error);
        }
    }

    // ==============================================
    // NUTRITION PLANNER HELPER METHODS
    // ==============================================

    // Render filtered inventory
    renderFilteredInventory(filteredItems) {
        try {
            const inventoryList = document.getElementById('inventoryList');
            if (!inventoryList) return;

            if (filteredItems.length === 0) {
                inventoryList.innerHTML = `
                    <div class="inventory-placeholder">
                        <div class="icon-bg icon-inventory xlarge"></div>
                        <h4>No items match your filters</h4>
                        <p>Try adjusting your filters or add more items</p>
                        <button class="btn btn-primary" onclick="tracker.showInventoryModal()">
                            <div class="icon-bg icon-add xsmall" style="display: inline-block; margin-right: 6px;"></div>
                            Add Item
                        </button>
                    </div>
                `;
                return;
            }

            inventoryList.innerHTML = filteredItems.map(item => {
                const isLowStock = item.quantity < 2;
                const isExpiring = item.expiryDate && new Date(item.expiryDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

                return `
                    <div class="inventory-item ${isLowStock ? 'low-stock' : ''} ${isExpiring ? 'expiring' : ''}">
                        <div class="item-info">
                            <div class="item-name">${this.escapeHtml(item.name)}</div>
                            <div class="item-category">${item.category}</div>
                        </div>
                        <div class="item-quantity">
                            <span class="quantity">${item.quantity}</span>
                            <span class="unit">${item.unit}</span>
                        </div>
                        <div class="item-status">
                            ${isLowStock ? '<span class="status-badge low-stock">Low Stock</span>' : ''}
                            ${isExpiring ? '<span class="status-badge expiring">Expiring Soon</span>' : ''}
                            ${item.expiryDate ? `<div class="expiry-date">Expires: ${new Date(item.expiryDate).toLocaleDateString()}</div>` : ''}
                        </div>
                        <div class="item-actions">
                            <button class="btn-small" onclick="tracker.showInventoryModal('${item.foodId}')">Edit</button>
                            <button class="btn-small btn-danger" onclick="tracker.removeFromInventory('${item.foodId}')">Remove</button>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Error rendering filtered inventory:', error);
        }
    }

    // Render filtered recipes
    renderFilteredRecipes(filteredRecipes) {
        try {
            const recipesList = document.getElementById('recipesList');
            if (!recipesList) return;

            if (filteredRecipes.length === 0) {
                recipesList.innerHTML = `
                    <div class="recipes-placeholder">
                        <div class="icon-bg icon-recipes xlarge"></div>
                        <h4>No recipes match your filters</h4>
                        <p>Try adjusting your filters or add more recipes</p>
                        <button class="btn btn-primary" onclick="tracker.showRecipeModal()">
                            <div class="icon-bg icon-add xsmall" style="display: inline-block; margin-right: 6px;"></div>
                            Add Recipe
                        </button>
                    </div>
                `;
                return;
            }

            recipesList.innerHTML = filteredRecipes.map(({ recipe, canMake, missingIngredients, nutrition }) => {
                return `
                    <div class="recipe-card ${canMake ? 'can-make' : 'missing-ingredients'}">
                        <div class="recipe-header">
                            <h4 class="recipe-name">${this.escapeHtml(recipe.name)}</h4>
                            <div class="recipe-meta">
                                <span class="recipe-time">${recipe.prepTime} min</span>
                                <span class="recipe-servings">${recipe.servings} servings</span>
                                <span class="recipe-diet ${recipe.dietType}">${recipe.dietType}</span>
                            </div>
                        </div>

                        <div class="recipe-nutrition">
                            <div class="nutrition-item">
                                <span class="nutrition-label">Calories:</span>
                                <span class="nutrition-value">${Math.round(nutrition.calories)}</span>
                            </div>
                            <div class="nutrition-item">
                                <span class="nutrition-label">Protein:</span>
                                <span class="nutrition-value">${Math.round(nutrition.protein)}g</span>
                            </div>
                            <div class="nutrition-item">
                                <span class="nutrition-label">Carbs:</span>
                                <span class="nutrition-value">${Math.round(nutrition.carbs)}g</span>
                            </div>
                        </div>

                        ${!canMake ? `
                            <div class="missing-ingredients">
                                <h5>Missing ingredients:</h5>
                                <ul>
                                    ${missingIngredients.map(missing =>
                                        `<li>${this.foodDatabase[missing.food]?.name || missing.food}: need ${missing.missing} more</li>`
                                    ).join('')}
                                </ul>
                            </div>
                        ` : ''}

                        <div class="recipe-actions">
                            ${canMake ? `
                                <button class="btn btn-primary" onclick="tracker.cookRecipe('${recipe.id}')">Cook This Recipe</button>
                            ` : `
                                <button class="btn btn-secondary" onclick="tracker.addMissingToShoppingList('${recipe.id}')">Add Missing to Shopping</button>
                            `}
                            <button class="btn btn-secondary" onclick="tracker.showRecipeModal('${recipe.id}')">Edit</button>
                            <button class="btn btn-danger" onclick="tracker.deleteRecipe('${recipe.id}')">Delete</button>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Error rendering filtered recipes:', error);
        }
    }

    // Get current week key
    getCurrentWeekKey() {
        const today = new Date();
        const monday = new Date(today);
        monday.setDate(today.getDate() - today.getDay() + 1);
        return monday.toISOString().split('T')[0];
    }

    // Format week date
    formatWeekDate(weekKey) {
        const date = new Date(weekKey);
        const sunday = new Date(date);
        sunday.setDate(date.getDate() + 6);
        return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }

    // Calculate week nutrition
    calculateWeekNutrition(weekPlan) {
        const totalNutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        const mealCount = Object.keys(weekPlan).length;

        Object.values(weekPlan).forEach(meal => {
            totalNutrition.calories += meal.calories || 0;
            totalNutrition.protein += meal.protein || 0;
            totalNutrition.carbs += meal.carbs || 0;
            totalNutrition.fat += meal.fat || 0;
        });

        return {
            avgCalories: mealCount > 0 ? totalNutrition.calories / 7 : 0,
            avgProtein: mealCount > 0 ? totalNutrition.protein / 7 : 0,
            avgCarbs: mealCount > 0 ? totalNutrition.carbs / 7 : 0,
            avgFat: mealCount > 0 ? totalNutrition.fat / 7 : 0
        };
    }

    // Update shopping summary
    updateShoppingSummary(items) {
        try {
            const totalItems = items.length;
            const purchasedItems = items.filter(item => item.purchased).length;
            const pendingItems = totalItems - purchasedItems;

            this.updateElement('totalShoppingItems', totalItems.toString());
            this.updateElement('purchasedItems', purchasedItems.toString());
            this.updateElement('pendingShoppingItems', pendingItems.toString());
        } catch (error) {
            console.error('Error updating shopping summary:', error);
        }
    }

    // Update nutrition progress bars
    updateNutritionProgress(totalNutrition) {
        try {
            const targets = this.userPreferences;

            // Update progress bars
            const calorieProgress = Math.min((totalNutrition.calories / targets.calorieTarget) * 100, 100);
            const proteinProgress = Math.min((totalNutrition.protein / targets.proteinTarget) * 100, 100);
            const carbsProgress = Math.min((totalNutrition.carbs / targets.carbTarget) * 100, 100);
            const fatProgress = Math.min((totalNutrition.fat / targets.fatTarget) * 100, 100);

            this.updateElement('calorieProgress', null);
            this.updateElement('proteinProgress', null);
            this.updateElement('carbsProgress', null);
            this.updateElement('fatProgress', null);

            // Update progress bar widths
            const calorieBar = document.getElementById('calorieProgress');
            const proteinBar = document.getElementById('proteinProgress');
            const carbsBar = document.getElementById('carbsProgress');
            const fatBar = document.getElementById('fatProgress');

            if (calorieBar) calorieBar.style.width = `${calorieProgress}%`;
            if (proteinBar) proteinBar.style.width = `${proteinProgress}%`;
            if (carbsBar) carbsBar.style.width = `${carbsProgress}%`;
            if (fatBar) fatBar.style.width = `${fatProgress}%`;

            // Update current values
            this.updateElement('currentCalories', Math.round(totalNutrition.calories).toString());
            this.updateElement('currentProtein', Math.round(totalNutrition.protein).toString());
            this.updateElement('currentCarbs', Math.round(totalNutrition.carbs).toString());
            this.updateElement('currentFat', Math.round(totalNutrition.fat).toString());

            // Update targets
            this.updateElement('targetCalories', targets.calorieTarget.toString());
            this.updateElement('targetProtein', targets.proteinTarget.toString());
            this.updateElement('targetCarbs', targets.carbTarget.toString());
            this.updateElement('targetFat', targets.fatTarget.toString());
        } catch (error) {
            console.error('Error updating nutrition progress:', error);
        }
    }

    // Get weekly nutrition data
    getWeeklyNutritionData() {
        try {
            const weekData = [];
            const today = new Date();

            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                const dayLog = this.getNutritionLogForDate(date);

                weekData.push({
                    date: date.toISOString().split('T')[0],
                    dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    nutrition: dayLog.totalNutrition
                });
            }

            return weekData;
        } catch (error) {
            console.error('Error getting weekly nutrition data:', error);
            return [];
        }
    }

    // Generate nutrition insights
    generateNutritionInsights(todayLog, weeklyData) {
        const insights = {
            today: [],
            weekly: [],
            recommendations: []
        };

        try {
            const today = todayLog.totalNutrition;
            const targets = this.userPreferences;

            // Today's insights
            if (today.calories === 0) {
                insights.today.push({ type: 'warning', message: 'No meals logged today. Start tracking your nutrition!' });
            } else if (today.calories < targets.calorieTarget * 0.8) {
                insights.today.push({ type: 'warning', message: 'Calorie intake is below target. Consider adding a healthy snack.' });
            } else if (today.calories > targets.calorieTarget * 1.2) {
                insights.today.push({ type: 'caution', message: 'Calorie intake is above target. Consider lighter meals.' });
            } else {
                insights.today.push({ type: 'success', message: 'Great job! Your calorie intake is on target.' });
            }

            if (today.protein < targets.proteinTarget * 0.8) {
                insights.today.push({ type: 'info', message: 'Protein intake is low. Add eggs, chicken, or legumes to your meals.' });
            }

            // Weekly insights
            const weekAvg = {
                calories: weeklyData.reduce((sum, day) => sum + day.nutrition.calories, 0) / 7,
                protein: weeklyData.reduce((sum, day) => sum + day.nutrition.protein, 0) / 7
            };

            if (weekAvg.calories > 0) {
                insights.weekly.push({
                    type: 'info',
                    message: `Average daily calories this week: ${Math.round(weekAvg.calories)} kcal`
                });

                if (weekAvg.protein < targets.proteinTarget * 0.8) {
                    insights.weekly.push({
                        type: 'warning',
                        message: 'Weekly protein average is below target. Focus on protein-rich foods.'
                    });
                }
            }

            // Recommendations
            const availableRecipes = this.getAvailableRecipes().filter(r => r.canMake);
            if (availableRecipes.length === 0) {
                insights.recommendations.push({
                    type: 'action',
                    message: 'Stock up on ingredients to unlock more recipe options.'
                });
            } else {
                const highProteinRecipes = availableRecipes.filter(r => r.nutrition.protein > 20);
                if (highProteinRecipes.length > 0 && today.protein < targets.proteinTarget * 0.8) {
                    insights.recommendations.push({
                        type: 'success',
                        message: `Try "${highProteinRecipes[0].recipe.name}" for a protein boost!`
                    });
                }
            }

            insights.recommendations.push({
                type: 'info',
                message: 'Plan your meals in advance using the Meal Plan tab for better nutrition balance.'
            });

        } catch (error) {
            console.error('Error generating nutrition insights:', error);
        }

        return insights;
    }

    // Get insight icon
    getInsightIcon(type) {
        const icons = {
            success: '✓',
            warning: '⚠',
            caution: '🚨',
            info: '📊',
            action: '🎯'
        };
        return icons[type] || '📊';
    }


    // Toggle shopping item purchased status
    toggleShoppingItem(itemId) {
        try {
            if (this.shoppingList[itemId]) {
                this.shoppingList[itemId].purchased = !this.shoppingList[itemId].purchased;
                this.shoppingList[itemId].updatedAt = new Date().toISOString();

                this.hasUnsavedChanges = true;
                this.debouncedSave();

                this.renderShoppingList();
                this.updateNutritionOverview();
            }
        } catch (error) {
            console.error('Error toggling shopping item:', error);
        }
    }

    // Remove shopping item
    async removeShoppingItem(itemId) {
        try {
            const item = this.shoppingList[itemId];
            if (!item) return;

            const shouldRemove = await confirmAsync(`Remove ${item.name} from shopping list?`, {
                title: 'Remove Item',
                confirmText: 'Remove',
                cancelText: 'Cancel',
                confirmClass: 'btn-danger'
            });

            if (shouldRemove) {
                delete this.shoppingList[itemId];
                this.hasUnsavedChanges = true;
                this.debouncedSave();

                this.renderShoppingList();
                this.updateNutritionOverview();
                this.showSuccess('Item removed from shopping list');
            }
        } catch (error) {
            this.showError('Failed to remove shopping item: ' + error.message);
            console.error('Error removing shopping item:', error);
        }
    }

    // Placeholder methods for less critical features
    selectMealSlot(weekKey, mealKey) {
        console.log('Meal slot selection - to be implemented:', weekKey, mealKey);
    }

    removePlannedMeal(weekKey, mealKey) {
        console.log('Remove planned meal - to be implemented:', weekKey, mealKey);
    }

    previousWeek() {
        console.log('Previous week navigation - to be implemented');
    }

    nextWeek() {
        console.log('Next week navigation - to be implemented');
    }

    editShoppingItem(itemId) {
        try {
            const item = this.shoppingList[itemId];
            if (!item) {
                this.showError('Shopping item not found');
                return;
            }

            // Pre-fill the shopping modal with existing item data
            this.showShoppingModal();

            // Wait for modal to render, then populate fields
            setTimeout(() => {
                const foodSelect = document.getElementById('shoppingFoodSelect');
                const quantityInput = document.getElementById('shoppingQuantity');
                const unitInput = document.getElementById('shoppingUnit');

                if (foodSelect) foodSelect.value = item.foodId;
                if (quantityInput) quantityInput.value = item.quantity;
                if (unitInput) unitInput.value = item.unit;

                // Change the save button to update mode
                const saveBtn = document.getElementById('saveShoppingItem');
                if (saveBtn) {
                    saveBtn.textContent = 'Update Item';
                    saveBtn.onclick = () => this.updateShoppingItem(itemId);
                }
            }, 100);

        } catch (error) {
            this.showError('Failed to edit shopping item: ' + error.message);
            console.error('Error editing shopping item:', error);
        }
    }

    // Update shopping item
    updateShoppingItem(itemId) {
        try {
            const foodId = document.getElementById('shoppingFoodSelect').value;
            const quantity = parseFloat(document.getElementById('shoppingQuantity').value);
            const unit = document.getElementById('shoppingUnit').value;

            if (!foodId || !quantity || quantity <= 0) {
                this.showError('Please fill all required fields with valid values');
                return;
            }

            const foodData = this.foodDatabase[foodId];
            if (!foodData) {
                this.showError('Food item not found in database');
                return;
            }

            // Update the shopping list item
            this.shoppingList[itemId] = {
                ...this.shoppingList[itemId],
                foodId: foodId,
                name: foodData.name,
                quantity: quantity,
                unit: unit,
                category: foodData.category,
                updatedAt: new Date().toISOString()
            };

            this.hasUnsavedChanges = true;
            this.debouncedSave();

            this.hideShoppingModal();
            this.renderShoppingList();
            this.updateNutritionOverview();
            this.showSuccess('Shopping item updated successfully!');

        } catch (error) {
            this.showError('Failed to update shopping item: ' + error.message);
            console.error('Error updating shopping item:', error);
        }
    }

    renderNutritionCharts(weeklyData, todayNutrition) {
        console.log('Nutrition charts rendering - to be implemented');
    }

    // ==============================================
    // EXPENSE INTEGRATION METHODS
    // ==============================================

    // Mark shopping list items as purchased and add to inventory
    async purchaseShoppingItems() {
        try {
            const items = Object.values(this.shoppingList).filter(item => !item.purchased);

            if (items.length === 0) {
                this.showInfo('No pending items in shopping list to purchase');
                return;
            }

            const shouldPurchase = await confirmAsync(
                `Mark ${items.length} shopping list items as purchased and add them to your kitchen inventory?`,
                {
                    title: 'Mark Items as Purchased',
                    confirmText: 'Mark as Purchased',
                    cancelText: 'Cancel',
                    confirmClass: 'btn-primary'
                }
            );

            if (shouldPurchase) {
                const today = new Date();
                let addedToInventory = 0;

                // Mark items as purchased and add to inventory
                items.forEach(item => {
                    this.shoppingList[item.id].purchased = true;
                    this.shoppingList[item.id].purchaseDate = today.toISOString();

                    // Add to inventory
                    if (this.addToInventory(item.foodId, item.quantity, item.unit)) {
                        addedToInventory++;
                    }
                });

                // Create a task reminder to track the grocery expense
                const taskId = Date.now().toString();
                const groceryCategories = [...new Set(items.map(item => item.category))];
                const taskDescription = `Purchased groceries: ${groceryCategories.join(', ')}. ${items.length} items added to kitchen inventory.`;

                this.tasks[taskId] = {
                    id: taskId,
                    title: 'Track Grocery Expense',
                    description: taskDescription,
                    priority: 'medium',
                    category: 'shopping',
                    status: 'pending',
                    dueDate: today.toISOString().split('T')[0],
                    createdDate: today.toISOString(),
                    hasBudget: true,
                    expenseCategory: 'Food',
                    groceryItems: items.map(item => ({
                        name: item.name,
                        quantity: item.quantity,
                        unit: item.unit
                    }))
                };

                this.hasUnsavedChanges = true;
                this.debouncedSave();

                // Update all displays
                this.renderShoppingList();
                this.renderInventory();
                this.updateNutritionOverview();
                this.updateDashboard();

                this.showSuccess(
                    `${addedToInventory} items marked as purchased and added to inventory! ` +
                    `A task has been created to remind you to track the grocery expense.`
                );
            }
        } catch (error) {
            this.showError('Failed to process shopping items: ' + error.message);
            console.error('Error purchasing shopping items:', error);
        }
    }



    // Get nutrition-related expenses for a date range
    getNutritionExpenses(startDate, endDate) {
        try {
            const nutritionExpenses = [];

            // Iterate through all expense dates
            Object.entries(this.expenses).forEach(([dateKey, dailyExpenses]) => {
                const expenseDate = new Date(dateKey);

                if (expenseDate >= startDate && expenseDate <= endDate) {
                    dailyExpenses.forEach(expense => {
                        if (expense.nutritionRelated || expense.category === 'Food') {
                            nutritionExpenses.push({
                                ...expense,
                                date: dateKey
                            });
                        }
                    });
                }
            });

            return nutritionExpenses;
        } catch (error) {
            console.error('Error getting nutrition expenses:', error);
            return [];
        }
    }

    // Get monthly nutrition expense summary
    getMonthlyNutritionSummary(month = this.currentMonth, year = this.currentYear) {
        try {
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0);

            const nutritionExpenses = this.getNutritionExpenses(startDate, endDate);
            const totalNutritionExpenses = nutritionExpenses.reduce((sum, expense) => sum + expense.amount, 0);
            const totalMonthlyExpenses = this.getTotalMonthlyExpenses(month, year);

            return {
                nutritionExpenses: totalNutritionExpenses,
                totalExpenses: totalMonthlyExpenses,
                nutritionPercentage: totalMonthlyExpenses > 0 ? (totalNutritionExpenses / totalMonthlyExpenses) * 100 : 0,
                expenseCount: nutritionExpenses.length,
                avgExpenseAmount: nutritionExpenses.length > 0 ? totalNutritionExpenses / nutritionExpenses.length : 0
            };
        } catch (error) {
            console.error('Error getting monthly nutrition summary:', error);
            return {
                nutritionExpenses: 0,
                totalExpenses: 0,
                nutritionPercentage: 0,
                expenseCount: 0,
                avgExpenseAmount: 0
            };
        }
    }

    // Update expense tracker to show nutrition integration
    updateExpenseIntegration() {
        try {
            // This method enhances the existing task-expense integration
            // to also show nutrition-related expenses

            const existingContainer = document.getElementById('taskExpenseSummary');
            if (!existingContainer) return;

            // Get nutrition expense summary
            const nutritionSummary = this.getMonthlyNutritionSummary();

            // Add nutrition integration card to the existing summary
            const nutritionIntegrationHtml = `
                <div class="summary-card nutrition-integration">
                    <div class="summary-header">
                        <div class="icon-bg icon-nutrition small"></div>
                        <h4>Nutrition Expenses</h4>
                    </div>
                    <div class="summary-content">
                        <div class="summary-stat">
                            <span class="stat-value">${nutritionSummary.expenseCount}</span>
                            <span class="stat-label">Food Expense Entries</span>
                        </div>
                        <div class="summary-details">
                            <span>Food % of Total: ${nutritionSummary.nutritionPercentage.toFixed(1)}%</span>
                            <span>Shopping Items: ${Object.keys(this.shoppingList || {}).length}</span>
                            <span>Recipes Available: ${Object.keys(this.recipes || {}).length}</span>
                        </div>
                    </div>
                    <div class="integration-actions">
                        <button class="btn btn-small" onclick="tracker.showShoppingModal()">
                            <div class="icon-bg icon-add xsmall" style="display: inline-block; margin-right: 4px;"></div>
                            Add to Shopping List
                        </button>
                        <button class="btn btn-small" onclick="tracker.purchaseShoppingItems()">
                            <div class="icon-bg icon-shopping-list xsmall" style="display: inline-block; margin-right: 4px;"></div>
                            Mark Items Purchased
                        </button>
                    </div>
                </div>
            `;

            // Check if nutrition integration already exists
            const existingNutritionCard = existingContainer.querySelector('.nutrition-integration');
            if (existingNutritionCard) {
                existingNutritionCard.outerHTML = nutritionIntegrationHtml;
            } else {
                // Add to existing summary grid
                const summaryGrid = existingContainer.querySelector('.summary-grid');
                if (summaryGrid) {
                    summaryGrid.insertAdjacentHTML('beforeend', nutritionIntegrationHtml);
                }
            }
        } catch (error) {
            console.error('Error updating expense integration:', error);
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
