/**
 * Smart Expense Tracker Authentication System
 * Advanced security with signup, login, PIN recovery, and profile management
 */

class AuthenticationSystem {
    constructor() {
        this.currentScreen = 'welcome';
        this.userData = null;
        this.isRecovering = false;
        
        // Storage keys
        this.STORAGE_KEYS = {
            USER_DATA: 'user_account_data',
            ALL_USERS: 'all_family_users', // Store list of all family members
            CURRENT_USER: 'current_user_id',
            APP_SESSION: 'app_session_token',
            SECURITY_HASH: 'security_pin_hash',
            PROFILES: 'user_profiles',
            LAST_LOGIN: 'last_login_time'
        };
        
        // Security settings
        this.PIN_MIN_LENGTH = 4;
        this.PIN_MAX_LENGTH = 10;
        this.MAX_LOGIN_ATTEMPTS = 5;
        this.LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
        
        this.init();
    }
    
    // Initialize the authentication system
    init() {
        try {
            console.log('Initializing Authentication System...');
            
            this.hideLoadingScreen();
            this.bindEvents();
            this.checkExistingUser();
            
        } catch (error) {
            this.showError('Failed to initialize authentication system: ' + error.message);
            console.error('Initialization error:', error);
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
                    }, 300);
                }, 1500);
            }
        } catch (error) {
            console.error('Error hiding loading screen:', error);
        }
    }
    
    // Check if user already exists
    checkExistingUser() {
        try {
            const allUsers = this.getAllUsers();

            // Always show welcome screen for clear navigation
            // Users can choose to create new account or login to existing ones
            this.switchScreen('welcome');

        } catch (error) {
            console.error('Error checking existing user:', error);
            this.switchScreen('welcome');
        }
    }
    
    // Bind all event listeners
    bindEvents() {
        try {
            // Welcome screen events
            this.safeAddEventListener('getStartedBtn', 'click', () => this.switchScreen('signup'));
            this.safeAddEventListener('existingUserBtn', 'click', () => this.showUserSelection());
            this.safeAddEventListener('addFamilyMemberBtn', 'click', () => this.switchScreen('signup'));
            
            // Signup form events
            this.safeAddEventListener('signupForm', 'submit', (e) => this.handleSignup(e));
            this.safeAddEventListener('backToWelcomeBtn', 'click', () => this.switchScreen('welcome'));
            this.bindSignupValidation();
            
            // Login form events
            this.safeAddEventListener('loginForm', 'submit', (e) => this.handleLogin(e));
            this.safeAddEventListener('forgotPinBtn', 'click', () => this.switchScreen('forgotPin'));
            this.safeAddEventListener('switchUserBtn', 'click', () => this.showUserSelection());
            this.safeAddEventListener('loginPin', 'input', () => this.validateLoginForm());
            
            // Recovery form events
            this.safeAddEventListener('recoveryForm', 'submit', (e) => this.handleRecovery(e));
            this.safeAddEventListener('backToLoginBtn', 'click', () => this.switchScreen('login'));
            this.safeAddEventListener('verifyAnswerBtn', 'click', () => this.verifySecurityAnswer());
            this.safeAddEventListener('resetPinBtn', 'click', () => this.resetPin());
            this.safeAddEventListener('completeResetBtn', 'click', () => this.completeReset());
            this.bindRecoveryValidation();
            
            // Success screen events
            this.safeAddEventListener('proceedBtn', 'click', () => this.proceedToApp());
            
            // Keyboard events
            document.addEventListener('keydown', (e) => this.handleKeyboardEvents(e));
            
            console.log('Event listeners bound successfully');
        } catch (error) {
            this.showError('Failed to bind events: ' + error.message);
            console.error('Event binding error:', error);
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
    
    // Handle keyboard events
    handleKeyboardEvents(e) {
        if (e.key === 'Enter') {
            const activeScreen = document.querySelector('.auth-screen.active');
            if (activeScreen) {
                const submitBtn = activeScreen.querySelector('button[type="submit"], .auth-btn.primary');
                if (submitBtn && !submitBtn.disabled) {
                    submitBtn.click();
                }
            }
        }
    }
    
    // Switch between authentication screens
    switchScreen(screenName) {
        try {
            // Hide all screens
            document.querySelectorAll('.auth-screen').forEach(screen => {
                screen.classList.remove('active');
            });

            // Show target screen
            const targetScreen = document.getElementById(`${screenName}Screen`);
            if (targetScreen) {
                targetScreen.classList.add('active');
                this.currentScreen = screenName;

                // Setup signup screen
                if (screenName === 'signup') {
                    setTimeout(() => {
                        // Clear form and reset button state
                        const submitBtn = document.getElementById('createAccountBtn');
                        if (submitBtn) {
                            submitBtn.disabled = false; // Start enabled
                        }

                        // Clear any previous form data to ensure clean state
                        const form = document.getElementById('signupForm');
                        if (form) {
                            form.reset();
                        }

                        // Run validation
                        this.validateSignupForm();
                    }, 100);
                }

                // Focus first input
                setTimeout(() => {
                    const firstInput = targetScreen.querySelector('input, select');
                    if (firstInput) {
                        firstInput.focus();
                    }
                }, 100);
            }

            console.log(`Switched to ${screenName} screen`);
        } catch (error) {
            console.error(`Error switching to ${screenName} screen:`, error);
        }
    }
    
    // Bind signup form validation
    bindSignupValidation() {
        try {
            // Real-time validation
            this.safeAddEventListener('signupEmail', 'input', () => this.validateSignupForm());
            this.safeAddEventListener('signupName', 'input', () => this.validateSignupForm());
            this.safeAddEventListener('signupPin', 'input', () => {
                this.validatePinStrength('signupPin', 'pinStrength');
                this.validateSignupForm();
            });
            this.safeAddEventListener('confirmPin', 'input', () => {
                this.validatePinMatch('signupPin', 'confirmPin', 'pinMatch');
                this.validateSignupForm();
            });
            this.safeAddEventListener('securityQuestion', 'change', () => this.validateSignupForm());
            this.safeAddEventListener('securityAnswer', 'input', () => this.validateSignupForm());
            this.safeAddEventListener('agreeTerms', 'change', () => this.validateSignupForm());
        } catch (error) {
            console.error('Error binding signup validation:', error);
        }
    }
    
    // Bind recovery form validation
    bindRecoveryValidation() {
        try {
            this.safeAddEventListener('newPin', 'input', () => {
                this.validatePinStrength('newPin', 'newPinStrength');
                this.validateNewPinForm();
            });
            this.safeAddEventListener('confirmNewPin', 'input', () => {
                this.validatePinMatch('newPin', 'confirmNewPin', 'newPinMatch');
                this.validateNewPinForm();
            });
        } catch (error) {
            console.error('Error binding recovery validation:', error);
        }
    }
    
    // Validate PIN strength
    validatePinStrength(pinInputId, strengthDisplayId) {
        try {
            const pinInput = document.getElementById(pinInputId);
            const strengthDisplay = document.getElementById(strengthDisplayId);
            
            if (!pinInput || !strengthDisplay) return;
            
            const pin = pinInput.value;
            let strength = '';
            let strengthClass = '';
            
            if (pin.length === 0) {
                strength = '';
            } else if (pin.length < this.PIN_MIN_LENGTH) {
                strength = 'Too short (minimum 4 digits)';
                strengthClass = 'weak';
            } else if (pin.length < 6) {
                strength = 'Weak (consider using 6+ digits)';
                strengthClass = 'weak';
            } else if (pin.length < 8) {
                strength = 'Medium (good length)';
                strengthClass = 'medium';
            } else {
                strength = 'Strong (excellent length)';
                strengthClass = 'strong';
            }
            
            // Check for repeated digits
            if (pin.length >= 4 && /(\d)\1{3,}/.test(pin)) {
                strength = 'Weak (avoid repeated digits)';
                strengthClass = 'weak';
            }
            
            // Check for sequential digits
            if (pin.length >= 4 && this.hasSequentialDigits(pin)) {
                strength = 'Weak (avoid sequential digits)';
                strengthClass = 'weak';
            }
            
            strengthDisplay.textContent = strength;
            strengthDisplay.className = `pin-strength ${strengthClass}`;
            
        } catch (error) {
            console.error('Error validating PIN strength:', error);
        }
    }
    
    // Check for sequential digits
    hasSequentialDigits(pin) {
        for (let i = 0; i < pin.length - 2; i++) {
            const num1 = parseInt(pin[i]);
            const num2 = parseInt(pin[i + 1]);
            const num3 = parseInt(pin[i + 2]);
            
            if ((num2 === num1 + 1 && num3 === num2 + 1) || 
                (num2 === num1 - 1 && num3 === num2 - 1)) {
                return true;
            }
        }
        return false;
    }
    
    // Validate PIN match
    validatePinMatch(pinInputId, confirmInputId, matchDisplayId) {
        try {
            const pinInput = document.getElementById(pinInputId);
            const confirmInput = document.getElementById(confirmInputId);
            const matchDisplay = document.getElementById(matchDisplayId);
            
            if (!pinInput || !confirmInput || !matchDisplay) return;
            
            const pin = pinInput.value;
            const confirmPin = confirmInput.value;
            
            if (confirmPin.length === 0) {
                matchDisplay.textContent = '';
                matchDisplay.className = 'pin-match';
            } else if (pin === confirmPin) {
                matchDisplay.textContent = '✓ PINs match';
                matchDisplay.className = 'pin-match match';
            } else {
                matchDisplay.textContent = '✗ PINs do not match';
                matchDisplay.className = 'pin-match no-match';
            }
        } catch (error) {
            console.error('Error validating PIN match:', error);
        }
    }
    
    // Validate signup form
    validateSignupForm() {
        try {
            const email = document.getElementById('signupEmail')?.value || '';
            const name = document.getElementById('signupName')?.value || '';
            const pin = document.getElementById('signupPin')?.value || '';
            const confirmPin = document.getElementById('confirmPin')?.value || '';
            const question = document.getElementById('securityQuestion')?.value || '';
            const answer = document.getElementById('securityAnswer')?.value || '';
            const agreedTerms = document.getElementById('agreeTerms')?.checked || false;

            const submitBtn = document.getElementById('createAccountBtn');
            if (!submitBtn) return;

            // Debug validation
            const emailValid = this.isValidEmail(email);
            const nameValid = name.trim().length >= 2;
            const pinLengthValid = pin.length >= this.PIN_MIN_LENGTH && pin.length <= this.PIN_MAX_LENGTH;
            const pinMatchValid = pin === confirmPin;
            const questionValid = question !== '';
            const answerValid = answer.trim().length >= 3;
            const termsValid = agreedTerms;
            const pinDigitsValid = /^\d+$/.test(pin);

            console.log('Signup form validation:', {
                email: email, emailValid,
                name: name, nameValid,
                pin: pin, pinLengthValid, pinMatchValid, pinDigitsValid,
                question: question, questionValid,
                answer: answer, answerValid,
                termsValid
            });

            const isValid = emailValid && nameValid && pinLengthValid && pinMatchValid &&
                           questionValid && answerValid && termsValid && pinDigitsValid;

            console.log('Form is valid:', isValid);
            submitBtn.disabled = !isValid;
        } catch (error) {
            console.error('Error validating signup form:', error);
        }
    }
    
    // Validate login form
    validateLoginForm() {
        try {
            const pin = document.getElementById('loginPin')?.value || '';
            const submitBtn = document.getElementById('loginBtn');
            
            if (submitBtn) {
                submitBtn.disabled = pin.length < this.PIN_MIN_LENGTH;
            }
        } catch (error) {
            console.error('Error validating login form:', error);
        }
    }
    
    // Validate new PIN form in recovery
    validateNewPinForm() {
        try {
            const newPin = document.getElementById('newPin')?.value || '';
            const confirmNewPin = document.getElementById('confirmNewPin')?.value || '';
            const resetBtn = document.getElementById('resetPinBtn');
            
            if (resetBtn) {
                const isValid = newPin.length >= this.PIN_MIN_LENGTH &&
                               newPin.length <= this.PIN_MAX_LENGTH &&
                               newPin === confirmNewPin &&
                               /^\d+$/.test(newPin);
                
                resetBtn.disabled = !isValid;
            }
        } catch (error) {
            console.error('Error validating new PIN form:', error);
        }
    }
    
    // Email validation
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Handle signup form submission
    async handleSignup(e) {
        e.preventDefault();
        
        try {
            const formData = {
                email: document.getElementById('signupEmail').value.trim(),
                name: document.getElementById('signupName').value.trim(),
                pin: document.getElementById('signupPin').value,
                securityQuestion: document.getElementById('securityQuestion').value,
                securityAnswer: document.getElementById('securityAnswer').value.trim()
            };
            
            // Validate form data
            if (!this.validateSignupData(formData)) {
                return;
            }
            
            // Check if user with this email already exists
            const allUsers = this.getAllUsers();
            if (Object.values(allUsers).some(user => user.email === formData.email)) {
                this.showError('An account with this email already exists. Please use a different email or login.');
                return;
            }
            
            // Create user account
            await this.createUserAccount(formData);
            
        } catch (error) {
            this.showError('Failed to create account: ' + error.message);
            console.error('Signup error:', error);
        }
    }
    
    // Validate signup data
    validateSignupData(data) {
        if (!this.isValidEmail(data.email)) {
            this.showError('Please enter a valid email address');
            return false;
        }
        
        if (data.name.length < 2 || data.name.length > 50) {
            this.showError('Name must be between 2 and 50 characters');
            return false;
        }
        
        if (data.pin.length < this.PIN_MIN_LENGTH || data.pin.length > this.PIN_MAX_LENGTH) {
            this.showError(`PIN must be between ${this.PIN_MIN_LENGTH} and ${this.PIN_MAX_LENGTH} digits`);
            return false;
        }
        
        if (!/^\d+$/.test(data.pin)) {
            this.showError('PIN must contain only numbers');
            return false;
        }
        
        if (data.securityAnswer.length < 3) {
            this.showError('Security answer must be at least 3 characters');
            return false;
        }
        
        return true;
    }
    
    // Create user account
    async createUserAccount(formData) {
        try {
            // Hash PIN and security answer
            const pinHash = await this.hashData(formData.pin);
            const answerHash = await this.hashData(formData.securityAnswer.toLowerCase());
            
            // Create user data object
            const userData = {
                email: formData.email,
                name: formData.name,
                pinHash: pinHash,
                securityQuestion: formData.securityQuestion,
                securityAnswerHash: answerHash,
                createdAt: new Date().toISOString(),
                lastLogin: null,
                loginAttempts: 0,
                lockedUntil: null
            };
            
            // Save user data to family users list
            const userId = this.generateUserId(userData.email);
            userData.userId = userId;
            this.addUserToFamily(userId, userData);
            this.setCurrentUser(userId);
            this.userData = userData;
            
            // Create session for new user
            this.createSession();

            // Show success message
            document.getElementById('successMessage').textContent =
                'Your account has been created successfully! Redirecting to your expense tracker...';

            this.switchScreen('success');
            this.showSuccess('Account created successfully!');

            // Auto-proceed to app after 2 seconds
            setTimeout(() => {
                this.proceedToApp();
            }, 2000);
            
        } catch (error) {
            throw new Error('Failed to create account: ' + error.message);
        }
    }
    
    // Handle login form submission
    async handleLogin(e) {
        e.preventDefault();
        
        try {
            const pin = document.getElementById('loginPin').value;
            
            if (!this.userData) {
                this.showError('No user account found. Please create an account first.');
                this.switchScreen('welcome');
                return;
            }
            
            // Check if account is locked
            if (this.isAccountLocked()) {
                const unlockTime = new Date(this.userData.lockedUntil);
                const timeLeft = Math.ceil((unlockTime - new Date()) / 60000);
                this.showError(`Account is locked. Try again in ${timeLeft} minutes.`);
                return;
            }
            
            // Verify PIN
            const isValidPin = await this.verifyPin(pin);
            
            if (isValidPin) {
                // Successful login
                this.userData.lastLogin = new Date().toISOString();
                this.userData.loginAttempts = 0;
                this.userData.lockedUntil = null;
                this.updateUserInFamily(this.userData.userId, this.userData);
                this.saveUserData(this.userData); // Keep for compatibility
                
                // Create session
                this.createSession();
                
                // Show success and proceed
                document.getElementById('successMessage').textContent = 
                    `Welcome back, ${this.userData.name}! Redirecting to your expense tracker...`;
                
                this.switchScreen('success');
                this.showSuccess('Login successful!');
                
                // Auto-proceed after 2 seconds
                setTimeout(() => {
                    this.proceedToApp();
                }, 2000);
                
            } else {
                // Failed login
                this.userData.loginAttempts = (this.userData.loginAttempts || 0) + 1;
                
                if (this.userData.loginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
                    // Lock account
                    this.userData.lockedUntil = new Date(Date.now() + this.LOCKOUT_DURATION).toISOString();
                    this.updateUserInFamily(this.userData.userId, this.userData);
                    this.saveUserData(this.userData); // Keep for compatibility
                    this.showError(`Too many failed attempts. Account locked for 15 minutes.`);
                } else {
                    const attemptsLeft = this.MAX_LOGIN_ATTEMPTS - this.userData.loginAttempts;
                    this.showError(`Incorrect PIN. ${attemptsLeft} attempts remaining.`);
                    this.updateUserInFamily(this.userData.userId, this.userData);
                    this.saveUserData(this.userData); // Keep for compatibility
                }
                
                // Clear PIN input
                document.getElementById('loginPin').value = '';
                this.updatePinFeedback('Incorrect PIN. Please try again.', 'error');
            }
            
        } catch (error) {
            this.showError('Login failed: ' + error.message);
            console.error('Login error:', error);
        }
    }
    
    // Update PIN feedback
    updatePinFeedback(message, type = '') {
        try {
            const feedback = document.getElementById('pinFeedback');
            if (feedback) {
                feedback.textContent = message;
                feedback.className = `pin-feedback ${type}`;
            }
        } catch (error) {
            console.error('Error updating PIN feedback:', error);
        }
    }
    
    // Check if account is locked
    isAccountLocked() {
        if (!this.userData || !this.userData.lockedUntil) {
            return false;
        }
        
        const lockExpiry = new Date(this.userData.lockedUntil);
        const now = new Date();
        
        if (now >= lockExpiry) {
            // Lock has expired
            this.userData.lockedUntil = null;
            this.userData.loginAttempts = 0;
            this.saveUserData(this.userData);
            return false;
        }
        
        return true;
    }
    
    // Handle recovery form submission
    async handleRecovery(e) {
        e.preventDefault();
        
        if (!this.isRecovering) {
            this.verifySecurityAnswer();
        } else {
            this.resetPin();
        }
    }
    
    // Verify security answer
    async verifySecurityAnswer() {
        try {
            const answer = document.getElementById('recoveryAnswer').value.trim();
            
            if (!answer) {
                this.showError('Please enter your security answer');
                return;
            }
            
            if (!this.userData) {
                this.showError('No user account found');
                return;
            }
            
            // Hash the provided answer and compare
            const answerHash = await this.hashData(answer.toLowerCase());
            
            if (answerHash === this.userData.securityAnswerHash) {
                // Correct answer - show PIN reset section
                this.isRecovering = true;
                document.getElementById('newPinSection').style.display = 'block';
                document.getElementById('verifyAnswerBtn').style.display = 'none';
                document.getElementById('resetPinBtn').style.display = 'block';
                
                this.showSuccess('Security answer verified! You can now create a new PIN.');
                
                // Focus on new PIN input
                setTimeout(() => {
                    document.getElementById('newPin').focus();
                }, 100);
                
            } else {
                this.showError('Incorrect security answer. Please try again.');
                document.getElementById('recoveryAnswer').value = '';
            }
            
        } catch (error) {
            this.showError('Recovery verification failed: ' + error.message);
            console.error('Recovery error:', error);
        }
    }
    
    // Reset PIN
    async resetPin() {
        try {
            const newPin = document.getElementById('newPin').value;
            const confirmNewPin = document.getElementById('confirmNewPin').value;
            
            if (newPin !== confirmNewPin) {
                this.showError('New PINs do not match');
                return;
            }
            
            if (newPin.length < this.PIN_MIN_LENGTH || newPin.length > this.PIN_MAX_LENGTH) {
                this.showError(`PIN must be between ${this.PIN_MIN_LENGTH} and ${this.PIN_MAX_LENGTH} digits`);
                return;
            }
            
            if (!/^\d+$/.test(newPin)) {
                this.showError('PIN must contain only numbers');
                return;
            }
            
            // Hash new PIN
            const newPinHash = await this.hashData(newPin);
            
            // Update user data
            this.userData.pinHash = newPinHash;
            this.userData.loginAttempts = 0;
            this.userData.lockedUntil = null;
            this.updateUserInFamily(this.userData.userId, this.userData);
            this.saveUserData(this.userData); // Keep for compatibility
            
            // Show success
            document.getElementById('successMessage').textContent = 
                'Your PIN has been reset successfully! You can now login with your new PIN.';
            
            this.switchScreen('success');
            this.showSuccess('PIN reset successfully!');
            
        } catch (error) {
            this.showError('Failed to reset PIN: ' + error.message);
            console.error('PIN reset error:', error);
        }
    }
    
    // Complete account reset
    completeReset() {
        if (confirm('This will permanently delete your account and all data. This action cannot be undone. Are you sure?')) {
            try {
                // Clear all user data
                Object.values(this.STORAGE_KEYS).forEach(key => {
                    localStorage.removeItem(key);
                });
                
                // Clear any profile data
                const profiles = JSON.parse(localStorage.getItem('user_profiles') || '{}');
                Object.keys(profiles).forEach(profileId => {
                    localStorage.removeItem('profile_data_' + profileId);
                });
                
                // Reset state
                this.userData = null;
                this.isRecovering = false;
                
                this.showSuccess('Account reset successfully. You can now create a new account.');
                
                // Redirect to welcome screen
                setTimeout(() => {
                    this.switchScreen('welcome');
                }, 2000);
                
            } catch (error) {
                this.showError('Failed to reset account: ' + error.message);
                console.error('Reset error:', error);
            }
        }
    }
    
    // Show user selection screen
    showUserSelection() {
        try {
            const allUsers = this.getAllUsers();

            if (Object.keys(allUsers).length === 0) {
                this.showInfo('No family accounts found. Please create an account first.');
                this.switchScreen('welcome');
                return;
            }

            this.switchScreen('userSelection');
            this.renderUserList();

        } catch (error) {
            this.showError('Failed to show user selection: ' + error.message);
            console.error('User selection error:', error);
        }
    }

    // Render user list for selection
    renderUserList() {
        try {
            const allUsers = this.getAllUsers();
            const userListContainer = document.getElementById('userList');

            if (!userListContainer) {
                console.warn('User list container not found');
                return;
            }

            userListContainer.innerHTML = Object.values(allUsers).map(user => `
                <div class="user-item" data-user-id="${user.userId}" onclick="authSystem.selectUser('${user.userId}')">
                    <div class="user-avatar">
                        <span class="user-initial">${user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div class="user-info">
                        <div class="user-name">${this.escapeHtml(user.name)}</div>
                        <div class="user-last-login">
                            Last login: ${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                        </div>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Error rendering user list:', error);
        }
    }

    // Select a user from the list
    selectUser(userId) {
        try {
            const allUsers = this.getAllUsers();
            const user = allUsers[userId];

            if (!user) {
                this.showError('User not found');
                return;
            }

            this.userData = user;
            this.setCurrentUser(userId);
            this.displayUserInfo();
            this.switchScreen('login');

        } catch (error) {
            this.showError('Failed to select user: ' + error.message);
            console.error('User selection error:', error);
        }
    }
    
    // Display user info on login screen
    displayUserInfo() {
        try {
            if (!this.userData) return;
            
            const userName = document.getElementById('userName');
            const userEmail = document.getElementById('userEmail');
            
            if (userName) userName.textContent = this.userData.name;
            if (userEmail) userEmail.textContent = this.userData.email;
            
            // Display security question for recovery
            const recoveryQuestion = document.getElementById('recoveryQuestion');
            if (recoveryQuestion) {
                const questions = {
                    'childhood_pet': 'What was the name of your first pet?',
                    'birth_city': 'What city were you born in?',
                    'school_name': 'What was the name of your elementary school?',
                    'mother_maiden': 'What is your mother\'s maiden name?',
                    'first_car': 'What was your first car model?',
                    'favorite_book': 'What is your favorite book?'
                };
                
                recoveryQuestion.textContent = questions[this.userData.securityQuestion] || 'Unknown question';
            }
            
        } catch (error) {
            console.error('Error displaying user info:', error);
        }
    }
    
    // Create session token
    createSession() {
        try {
            const sessionData = {
                userId: this.userData.userId, // Use the actual userId, not email
                userEmail: this.userData.email, // Keep email for reference
                userName: this.userData.name, // Keep name for reference
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
            };

            localStorage.setItem(this.STORAGE_KEYS.APP_SESSION, JSON.stringify(sessionData));
            localStorage.setItem(this.STORAGE_KEYS.LAST_LOGIN, new Date().toISOString());

            console.log(`Session created for user: ${this.userData.name} (${this.userData.userId})`);

        } catch (error) {
            console.error('Error creating session:', error);
        }
    }
    
    // Proceed to main application
    proceedToApp() {
        try {
            // Redirect to main application
            window.location.href = 'index.html';
        } catch (error) {
            this.showError('Failed to proceed to application: ' + error.message);
            console.error('Proceed error:', error);
        }
    }
    
    // Hash data using Web Crypto API
    async hashData(data) {
        try {
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(data + 'expense_tracker_salt_2024');
            const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (error) {
            console.error('Error hashing data:', error);
            throw new Error('Failed to hash data');
        }
    }
    
    // Verify PIN
    async verifyPin(pin) {
        try {
            const pinHash = await this.hashData(pin);
            return pinHash === this.userData.pinHash;
        } catch (error) {
            console.error('Error verifying PIN:', error);
            return false;
        }
    }
    
    // Get user data from storage (legacy - kept for compatibility)
    getUserData() {
        try {
            const userData = localStorage.getItem(this.STORAGE_KEYS.USER_DATA);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    }

    // Save user data to storage (legacy - kept for compatibility)
    saveUserData(userData) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
            return true;
        } catch (error) {
            console.error('Error saving user data:', error);
            return false;
        }
    }

    // Get all family users
    getAllUsers() {
        try {
            const allUsers = localStorage.getItem(this.STORAGE_KEYS.ALL_USERS);
            return allUsers ? JSON.parse(allUsers) : {};
        } catch (error) {
            console.error('Error getting all users:', error);
            return {};
        }
    }

    // Save all family users
    saveAllUsers(users) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.ALL_USERS, JSON.stringify(users));
            return true;
        } catch (error) {
            console.error('Error saving all users:', error);
            return false;
        }
    }

    // Add user to family
    addUserToFamily(userId, userData) {
        try {
            const allUsers = this.getAllUsers();
            allUsers[userId] = userData;
            this.saveAllUsers(allUsers);
            return true;
        } catch (error) {
            console.error('Error adding user to family:', error);
            return false;
        }
    }

    // Set current active user
    setCurrentUser(userId) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.CURRENT_USER, userId);
            return true;
        } catch (error) {
            console.error('Error setting current user:', error);
            return false;
        }
    }

    // Generate unique user ID
    generateUserId(email) {
        return 'user_' + email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() + '_' + Date.now();
    }

    // Update user data in family list
    updateUserInFamily(userId, userData) {
        try {
            const allUsers = this.getAllUsers();
            if (allUsers[userId]) {
                allUsers[userId] = { ...allUsers[userId], ...userData };
                this.saveAllUsers(allUsers);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating user in family:', error);
            return false;
        }
    }
    
    // Utility function to escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
    
    showWarning(message) {
        this.showNotification(message, 'warning');
    }
    
    showNotification(message, type = 'info') {
        try {
            // Remove existing notifications of same type
            const existingNotifications = document.querySelectorAll(`.notification.${type}`);
            existingNotifications.forEach(notification => {
                notification.remove();
            });
            
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                    <span class="notification-message">${this.escapeHtml(message)}</span>
                    <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
            `;
            
            // Add to container
            const container = document.getElementById('notificationContainer');
            if (container) {
                container.appendChild(notification);
            } else {
                document.body.appendChild(notification);
            }
            
            // Auto-remove after delay
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, type === 'error' ? 7000 : 4000);
            
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
            success: '✓',
            error: '✗',
            warning: '!',
            info: 'i'
        };
        return icons[type] || icons.info;
    }
}

// Initialize authentication system when DOM is loaded
let authSystem;
document.addEventListener('DOMContentLoaded', () => {
    authSystem = new AuthenticationSystem();
});

// Make auth system globally available
window.authSystem = authSystem;

// Auto-logout functionality when window is closed (only on tab close, not navigation)
let isNavigating = false;

// Mark when we're navigating to prevent auto-logout
window.addEventListener('beforeunload', (e) => {
    // Only logout if user is actually closing the tab/window
    // Check if this is a page refresh or navigation vs actual tab close
    if (e.returnValue === undefined && !isNavigating) {
        // This is likely a tab close, not navigation
        localStorage.removeItem('app_session_token');
        localStorage.removeItem('current_user_id');
    }
});

// Track internal navigation to prevent false auto-logout
const originalProceedToApp = AuthenticationSystem.prototype.proceedToApp;
if (originalProceedToApp) {
    AuthenticationSystem.prototype.proceedToApp = function() {
        isNavigating = true;
        return originalProceedToApp.call(this);
    };
}
