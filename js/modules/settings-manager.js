/**
 * Settings Manager Module
 * Handles application settings, themes, and user preferences
 */

class SettingsManager {
    constructor() {
        this.currentSettings = null;
        this.themes = {
            'light': {
                name: 'Light Theme',
                icon: '☀️',
                primary: '#3B82F6',
                background: '#FFFFFF',
                surface: '#F8FAFC',
                text: '#1E293B'
            },
            'dark': {
                name: 'Dark Theme',
                icon: '🌙',
                primary: '#60A5FA',
                background: '#0F172A',
                surface: '#1E293B',
                text: '#F1F5F9'
            },
            'blue': {
                name: 'Ocean Blue',
                icon: '🌊',
                primary: '#0EA5E9',
                background: '#F0F9FF',
                surface: '#E0F2FE',
                text: '#0C4A6E'
            },
            'green': {
                name: 'Nature Green',
                icon: '🌿',
                primary: '#10B981',
                background: '#F0FDF4',
                surface: '#DCFCE7',
                text: '#064E3B'
            },
            'purple': {
                name: 'Royal Purple',
                icon: '💜',
                primary: '#8B5CF6',
                background: '#FAFAF9',
                surface: '#F3F4F6',
                text: '#581C87'
            }
        };
        
        this.currencies = {
            'INR': { symbol: '₹', name: 'Indian Rupee' },
            'USD': { symbol: '$', name: 'US Dollar' },
            'EUR': { symbol: '€', name: 'Euro' },
            'GBP': { symbol: '£', name: 'British Pound' },
            'JPY': { symbol: '¥', name: 'Japanese Yen' },
            'CAD': { symbol: 'C$', name: 'Canadian Dollar' },
            'AUD': { symbol: 'A$', name: 'Australian Dollar' }
        };
        
        this.languages = {
            'en': { name: 'English', flag: '🇺🇸' },
            'hi': { name: 'हिंदी', flag: '🇮🇳' },
            'es': { name: 'Español', flag: '🇪🇸' },
            'fr': { name: 'Français', flag: '🇫🇷' },
            'de': { name: 'Deutsch', flag: '🇩🇪' },
            'ja': { name: '日本語', flag: '🇯🇵' },
            'zh': { name: '中文', flag: '🇨🇳' }
        };
    }
    
    async loadSettings() {
        this.currentSettings = this.getSettings();
        this.applyTheme(this.currentSettings.theme);
        return this.currentSettings;
    }
    
    showSettingsModal() {
        const modal = document.getElementById('settingsModal');
        if (!modal) {
            this.createSettingsModal();
        }
        
        this.loadSettingsData();
        document.getElementById('settingsModal').classList.add('active');
        document.getElementById('overlay').classList.add('active');
    }
    
    createSettingsModal() {
        const modalHTML = `
            <div id="settingsModal" class="modal settings-modal">
                <div class="modal-content settings-modal-content">
                    <div class="modal-header">
                        <h3>⚙️ Settings & Preferences</h3>
                        <button id="closeSettingsModal" class="close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="settings-tabs">
                            <button class="tab-btn active" data-tab="appearance">🎨 Appearance</button>
                            <button class="tab-btn" data-tab="general">⚙️ General</button>
                            <button class="tab-btn" data-tab="notifications">🔔 Notifications</button>
                            <button class="tab-btn" data-tab="data">💾 Data</button>
                            <button class="tab-btn" data-tab="about">ℹ️ About</button>
                        </div>
                        
                        <div class="tab-content active" id="appearanceTab">
                            <div class="settings-section">
                                <h4>Theme Selection</h4>
                                <div class="theme-grid" id="themeGrid">
                                    ${this.generateThemeOptions()}
                                </div>
                                
                                <h4>Display Options</h4>
                                <div class="display-options">
                                    <div class="setting-item">
                                        <label class="setting-label">
                                            <span>Enable animations</span>
                                            <input type="checkbox" id="enableAnimations" class="setting-toggle">
                                        </label>
                                    </div>
                                    <div class="setting-item">
                                        <label class="setting-label">
                                            <span>Compact mode</span>
                                            <input type="checkbox" id="compactMode" class="setting-toggle">
                                        </label>
                                    </div>
                                    <div class="setting-item">
                                        <label class="setting-label">
                                            <span>Show tooltips</span>
                                            <input type="checkbox" id="showTooltips" class="setting-toggle">
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tab-content" id="generalTab">
                            <div class="settings-section">
                                <h4>Localization</h4>
                                <div class="setting-item">
                                    <label class="setting-label">
                                        <span>Language</span>
                                        <select id="languageSelect" class="setting-select">
                                            ${this.generateLanguageOptions()}
                                        </select>
                                    </label>
                                </div>
                                <div class="setting-item">
                                    <label class="setting-label">
                                        <span>Currency</span>
                                        <select id="currencySelect" class="setting-select">
                                            ${this.generateCurrencyOptions()}
                                        </select>
                                    </label>
                                </div>
                                <div class="setting-item">
                                    <label class="setting-label">
                                        <span>Date Format</span>
                                        <select id="dateFormatSelect" class="setting-select">
                                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                            <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                                        </select>
                                    </label>
                                </div>
                                
                                <h4>Behavior</h4>
                                <div class="setting-item">
                                    <label class="setting-label">
                                        <span>Auto-save frequency</span>
                                        <select id="autoSaveFrequency" class="setting-select">
                                            <option value="immediate">Immediate</option>
                                            <option value="5">Every 5 seconds</option>
                                            <option value="30">Every 30 seconds</option>
                                            <option value="60">Every minute</option>
                                        </select>
                                    </label>
                                </div>
                                <div class="setting-item">
                                    <label class="setting-label">
                                        <span>Default expense category</span>
                                        <select id="defaultCategory" class="setting-select">
                                            <option value="">None</option>
                                            <option value="Food">🍔 Food</option>
                                            <option value="Transportation">🚗 Transportation</option>
                                            <option value="Entertainment">🎬 Entertainment</option>
                                            <option value="Shopping">🛒 Shopping</option>
                                            <option value="Bills">🧾 Bills</option>
                                            <option value="Health">🏥 Health</option>
                                            <option value="Education">📚 Education</option>
                                            <option value="Other">📦 Other</option>
                                        </select>
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tab-content" id="notificationsTab">
                            <div class="settings-section">
                                <h4>Notification Preferences</h4>
                                <div class="setting-item">
                                    <label class="setting-label">
                                        <span>Enable notifications</span>
                                        <input type="checkbox" id="enableNotifications" class="setting-toggle">
                                    </label>
                                </div>
                                <div class="setting-item">
                                    <label class="setting-label">
                                        <span>Budget alerts</span>
                                        <input type="checkbox" id="budgetAlerts" class="setting-toggle">
                                    </label>
                                </div>
                                <div class="setting-item">
                                    <label class="setting-label">
                                        <span>Goal reminders</span>
                                        <input type="checkbox" id="goalReminders" class="setting-toggle">
                                    </label>
                                </div>
                                <div class="setting-item">
                                    <label class="setting-label">
                                        <span>Recurring expense alerts</span>
                                        <input type="checkbox" id="recurringAlerts" class="setting-toggle">
                                    </label>
                                </div>
                                <div class="setting-item">
                                    <label class="setting-label">
                                        <span>Weekly summary</span>
                                        <input type="checkbox" id="weeklySummary" class="setting-toggle">
                                    </label>
                                </div>
                                <div class="setting-item">
                                    <label class="setting-label">
                                        <span>Monthly report</span>
                                        <input type="checkbox" id="monthlyReport" class="setting-toggle">
                                    </label>
                                </div>
                                
                                <h4>Sound & Vibration</h4>
                                <div class="setting-item">
                                    <label class="setting-label">
                                        <span>Sound effects</span>
                                        <input type="checkbox" id="soundEffects" class="setting-toggle">
                                    </label>
                                </div>
                                <div class="setting-item">
                                    <label class="setting-label">
                                        <span>Notification sound</span>
                                        <select id="notificationSound" class="setting-select">
                                            <option value="default">Default</option>
                                            <option value="chime">Chime</option>
                                            <option value="bell">Bell</option>
                                            <option value="pop">Pop</option>
                                            <option value="none">None</option>
                                        </select>
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tab-content" id="dataTab">
                            <div class="settings-section">
                                <h4>Data Management</h4>
                                <div class="setting-item">
                                    <label class="setting-label">
                                        <span>Auto-backup</span>
                                        <input type="checkbox" id="autoBackup" class="setting-toggle">
                                    </label>
                                </div>
                                <div class="setting-item">
                                    <label class="setting-label">
                                        <span>Backup frequency</span>
                                        <select id="backupFrequency" class="setting-select">
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    </label>
                                </div>
                                
                                <h4>Privacy & Security</h4>
                                <div class="setting-item">
                                    <label class="setting-label">
                                        <span>Remember user preferences</span>
                                        <input type="checkbox" id="rememberPreferences" class="setting-toggle">
                                    </label>
                                </div>
                                <div class="setting-item">
                                    <label class="setting-label">
                                        <span>Clear data on exit</span>
                                        <input type="checkbox" id="clearDataOnExit" class="setting-toggle">
                                    </label>
                                </div>
                                
                                <h4>Data Actions</h4>
                                <div class="data-actions">
                                    <button class="btn btn-secondary" id="exportAllData">Export All Data</button>
                                    <button class="btn btn-secondary" id="importData">Import Data</button>
                                    <button class="btn btn-warning" id="resetSettings">Reset Settings</button>
                                    <button class="btn btn-danger" id="clearAllData">Clear All Data</button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tab-content" id="aboutTab">
                            <div class="settings-section">
                                <div class="app-info">
                                    <div class="app-logo">💰</div>
                                    <h4>Smart Expense Tracker</h4>
                                    <p class="app-version">Version 2.0.0</p>
                                    <p class="app-description">
                                        A comprehensive financial management application built with modern web technologies.
                                    </p>
                                </div>
                                
                                <div class="app-features">
                                    <h5>Features</h5>
                                    <ul class="features-list">
                                        <li>✅ Expense Tracking & Categorization</li>
                                        <li>✅ Budget Management & Alerts</li>
                                        <li>✅ Recurring Expenses</li>
                                        <li>✅ Financial Goals & Targets</li>
                                        <li>✅ Advanced Analytics & Insights</li>
                                        <li>✅ Data Export & Import</li>
                                        <li>✅ Search & Filter</li>
                                        <li>✅ Multiple Themes</li>
                                        <li>✅ Responsive Design</li>
                                        <li>✅ Offline Support</li>
                                    </ul>
                                </div>
                                
                                <div class="app-stats" id="appStats">
                                    <h5>Your Statistics</h5>
                                    <div class="stats-grid">
                                        <div class="stat-item">
                                            <span class="stat-label">Days using app:</span>
                                            <span class="stat-value" id="daysUsing">0</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-label">Total expenses recorded:</span>
                                            <span class="stat-value" id="totalExpenses">0</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-label">Data size:</span>
                                            <span class="stat-value" id="dataSize">0 KB</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-label">Last backup:</span>
                                            <span class="stat-value" id="lastBackup">Never</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="app-links">
                                    <h5>Support & Information</h5>
                                    <div class="links-grid">
                                        <button class="link-btn" onclick="window.open('#', '_blank')">📖 User Guide</button>
                                        <button class="link-btn" onclick="window.open('#', '_blank')">🐛 Report Bug</button>
                                        <button class="link-btn" onclick="window.open('#', '_blank')">💡 Feature Request</button>
                                        <button class="link-btn" onclick="window.open('#', '_blank')">🎯 Roadmap</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="saveSettings" class="btn btn-primary">Save Settings</button>
                        <button id="closeSettingsModal" class="btn btn-secondary">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.bindSettingsEvents();
    }
    
    generateThemeOptions() {
        return Object.entries(this.themes).map(([key, theme]) => `
            <div class="theme-option ${key === this.currentSettings?.theme ? 'active' : ''}" data-theme="${key}">
                <div class="theme-preview" style="
                    background: ${theme.background}; 
                    color: ${theme.text};
                    border: 2px solid ${theme.primary};
                ">
                    <div class="theme-header" style="background: ${theme.primary};">
                        <div class="theme-dot"></div>
                        <div class="theme-dot"></div>
                        <div class="theme-dot"></div>
                    </div>
                    <div class="theme-content" style="background: ${theme.surface};">
                        <div class="theme-text" style="background: ${theme.primary}; opacity: 0.8;"></div>
                        <div class="theme-text" style="background: ${theme.text}; opacity: 0.3;"></div>
                        <div class="theme-text" style="background: ${theme.text}; opacity: 0.2;"></div>
                    </div>
                </div>
                <div class="theme-info">
                    <span class="theme-icon">${theme.icon}</span>
                    <span class="theme-name">${theme.name}</span>
                </div>
            </div>
        `).join('');
    }
    
    generateLanguageOptions() {
        return Object.entries(this.languages).map(([key, lang]) => 
            `<option value="${key}">${lang.flag} ${lang.name}</option>`
        ).join('');
    }
    
    generateCurrencyOptions() {
        return Object.entries(this.currencies).map(([key, currency]) => 
            `<option value="${key}">${currency.symbol} ${currency.name}</option>`
        ).join('');
    }
    
    bindSettingsEvents() {
        // Close modal
        document.querySelectorAll('#closeSettingsModal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('settingsModal').classList.remove('active');
                document.getElementById('overlay').classList.remove('active');
            });
        });
        
        // Tab switching
        document.querySelectorAll('.settings-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchSettingsTab(tabName);
            });
        });
        
        // Theme selection
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const theme = e.currentTarget.dataset.theme;
                this.selectTheme(theme);
            });
        });
        
        // Save settings
        document.getElementById('saveSettings')?.addEventListener('click', () => this.saveSettings());
        
        // Data actions
        document.getElementById('exportAllData')?.addEventListener('click', () => this.exportAllData());
        document.getElementById('importData')?.addEventListener('click', () => this.importData());
        document.getElementById('resetSettings')?.addEventListener('click', () => this.resetSettings());
        document.getElementById('clearAllData')?.addEventListener('click', () => this.clearAllData());
        
        // Live theme preview
        document.querySelectorAll('.setting-toggle, .setting-select').forEach(input => {
            input.addEventListener('change', () => this.previewSettings());
        });
    }
    
    switchSettingsTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.settings-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.settings-modal .tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');
        
        // Load specific tab data
        if (tabName === 'about') {
            this.updateAppStats();
        }
    }
    
    loadSettingsData() {
        if (!this.currentSettings) {
            this.currentSettings = this.getSettings();
        }
        
        // Load appearance settings
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[data-theme="${this.currentSettings.theme}"]`)?.classList.add('active');
        
        document.getElementById('enableAnimations').checked = this.currentSettings.enableAnimations !== false;
        document.getElementById('compactMode').checked = this.currentSettings.compactMode === true;
        document.getElementById('showTooltips').checked = this.currentSettings.showTooltips !== false;
        
        // Load general settings
        document.getElementById('languageSelect').value = this.currentSettings.language;
        document.getElementById('currencySelect').value = this.currentSettings.currency.replace('₹', 'INR').replace('$', 'USD').replace('€', 'EUR').replace('£', 'GBP').replace('¥', 'JPY');
        document.getElementById('dateFormatSelect').value = this.currentSettings.dateFormat;
        document.getElementById('autoSaveFrequency').value = this.currentSettings.autoSaveFrequency || 'immediate';
        document.getElementById('defaultCategory').value = this.currentSettings.defaultCategory || '';
        
        // Load notification settings
        document.getElementById('enableNotifications').checked = this.currentSettings.notifications;
        document.getElementById('budgetAlerts').checked = this.currentSettings.budgetAlerts;
        document.getElementById('goalReminders').checked = this.currentSettings.goalReminders;
        document.getElementById('recurringAlerts').checked = this.currentSettings.recurringAlerts !== false;
        document.getElementById('weeklySummary').checked = this.currentSettings.weeklySummary === true;
        document.getElementById('monthlyReport').checked = this.currentSettings.monthlyReport === true;
        document.getElementById('soundEffects').checked = this.currentSettings.soundEffects !== false;
        document.getElementById('notificationSound').value = this.currentSettings.notificationSound || 'default';
        
        // Load data settings
        document.getElementById('autoBackup').checked = this.currentSettings.autoBackup === true;
        document.getElementById('backupFrequency').value = this.currentSettings.backupFrequency || 'weekly';
        document.getElementById('rememberPreferences').checked = this.currentSettings.rememberPreferences !== false;
        document.getElementById('clearDataOnExit').checked = this.currentSettings.clearDataOnExit === true;
    }
    
    selectTheme(themeKey) {
        // Update active theme visually
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[data-theme="${themeKey}"]`).classList.add('active');
        
        // Apply theme immediately for preview
        this.applyTheme(themeKey);
        
        // Update settings
        this.currentSettings.theme = themeKey;
    }
    
    applyTheme(themeKey) {
        const theme = this.themes[themeKey];
        if (!theme) return;
        
        // Remove existing theme classes
        document.body.classList.remove(...Object.keys(this.themes).map(t => `theme-${t}`));
        
        // Add new theme class
        document.body.classList.add(`theme-${themeKey}`);
        
        // Apply CSS custom properties
        document.documentElement.style.setProperty('--theme-primary', theme.primary);
        document.documentElement.style.setProperty('--theme-background', theme.background);
        document.documentElement.style.setProperty('--theme-surface', theme.surface);
        document.documentElement.style.setProperty('--theme-text', theme.text);
        
        // Update meta theme color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme.primary);
        } else {
            const meta = document.createElement('meta');
            meta.name = 'theme-color';
            meta.content = theme.primary;
            document.head.appendChild(meta);
        }
    }
    
    previewSettings() {
        // Preview theme and other visual changes
        const enableAnimations = document.getElementById('enableAnimations').checked;
        const compactMode = document.getElementById('compactMode').checked;
        
        document.body.classList.toggle('no-animations', !enableAnimations);
        document.body.classList.toggle('compact-mode', compactMode);
    }
    
    saveSettings() {
        const newSettings = {
            // Appearance
            theme: this.currentSettings.theme,
            enableAnimations: document.getElementById('enableAnimations').checked,
            compactMode: document.getElementById('compactMode').checked,
            showTooltips: document.getElementById('showTooltips').checked,
            
            // General
            language: document.getElementById('languageSelect').value,
            currency: this.currencies[document.getElementById('currencySelect').value]?.symbol || '₹',
            dateFormat: document.getElementById('dateFormatSelect').value,
            autoSaveFrequency: document.getElementById('autoSaveFrequency').value,
            defaultCategory: document.getElementById('defaultCategory').value,
            
            // Notifications
            notifications: document.getElementById('enableNotifications').checked,
            budgetAlerts: document.getElementById('budgetAlerts').checked,
            goalReminders: document.getElementById('goalReminders').checked,
            recurringAlerts: document.getElementById('recurringAlerts').checked,
            weeklySummary: document.getElementById('weeklySummary').checked,
            monthlyReport: document.getElementById('monthlyReport').checked,
            soundEffects: document.getElementById('soundEffects').checked,
            notificationSound: document.getElementById('notificationSound').value,
            
            // Data
            autoBackup: document.getElementById('autoBackup').checked,
            backupFrequency: document.getElementById('backupFrequency').value,
            rememberPreferences: document.getElementById('rememberPreferences').checked,
            clearDataOnExit: document.getElementById('clearDataOnExit').checked,
            
            // Categories (preserve existing or use defaults)
            categories: this.currentSettings.categories || [
                'Food', 'Transportation', 'Entertainment', 'Shopping', 
                'Bills', 'Health', 'Education', 'Other'
            ],
            
            // Metadata
            lastModified: new Date().toISOString()
        };
        
        // Save to localStorage
        localStorage.setItem('appSettings', JSON.stringify(newSettings));
        this.currentSettings = newSettings;
        
        // Apply settings
        this.applyTheme(newSettings.theme);
        this.applyGeneralSettings(newSettings);
        
        if (window.expenseTracker?.notificationManager) {
            window.expenseTracker.notificationManager.showSuccess('Settings saved successfully');
        }
        
        // Close modal
        document.getElementById('settingsModal').classList.remove('active');
        document.getElementById('overlay').classList.remove('active');
    }
    
    applyGeneralSettings(settings) {
        // Apply animations setting
        document.body.classList.toggle('no-animations', !settings.enableAnimations);
        
        // Apply compact mode
        document.body.classList.toggle('compact-mode', settings.compactMode);
        
        // Apply tooltips setting
        document.body.classList.toggle('no-tooltips', !settings.showTooltips);
        
        // Update currency symbol throughout the app
        this.updateCurrencyDisplay(settings.currency);
        
        // Apply date format
        this.updateDateFormat(settings.dateFormat);
    }
    
    updateCurrencyDisplay(currency) {
        // Update all currency displays in the app
        document.querySelectorAll('.currency-symbol').forEach(element => {
            element.textContent = currency;
        });
        
        // Store currency for use in other modules
        if (window.expenseTracker) {
            window.expenseTracker.currency = currency;
        }
    }
    
    updateDateFormat(format) {
        // Store date format for use in other modules
        if (window.expenseTracker) {
            window.expenseTracker.dateFormat = format;
        }
    }
    
    getSettings() {
        const defaultSettings = {
            theme: 'light',
            currency: '₹',
            dateFormat: 'DD/MM/YYYY',
            notifications: true,
            budgetAlerts: true,
            goalReminders: true,
            recurringAlerts: true,
            autoBackup: false,
            categories: [
                'Food', 'Transportation', 'Entertainment', 'Shopping', 
                'Bills', 'Health', 'Education', 'Other'
            ],
            language: 'en',
            enableAnimations: true,
            compactMode: false,
            showTooltips: true,
            soundEffects: true,
            notificationSound: 'default',
            autoSaveFrequency: 'immediate',
            backupFrequency: 'weekly',
            rememberPreferences: true,
            clearDataOnExit: false,
            weeklySummary: false,
            monthlyReport: false,
            defaultCategory: ''
        };
        
        const saved = localStorage.getItem('appSettings');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return { ...defaultSettings, ...parsed };
            } catch (error) {
                console.error('Error parsing settings:', error);
                return defaultSettings;
            }
        }
        
        return defaultSettings;
    }
    
    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
            localStorage.removeItem('appSettings');
            this.currentSettings = this.getSettings();
            
            // Reload settings in modal
            this.loadSettingsData();
            
            // Apply default theme
            this.applyTheme(this.currentSettings.theme);
            this.applyGeneralSettings(this.currentSettings);
            
            if (window.expenseTracker?.notificationManager) {
                window.expenseTracker.notificationManager.showSuccess('Settings reset to defaults');
            }
        }
    }
    
    exportAllData() {
        if (window.expenseTracker?.dataExportImport) {
            window.expenseTracker.dataExportImport.exportToJSON();
        } else {
            // Fallback export
            const dataManager = window.expenseTracker?.dataManager;
            if (dataManager) {
                const data = dataManager.exportData();
                const jsonString = JSON.stringify(data, null, 2);
                
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = `expense-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
                a.style.display = 'none';
                
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                window.URL.revokeObjectURL(url);
            }
        }
    }
    
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.csv';
        input.style.display = 'none';
        
        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            if (window.expenseTracker?.dataExportImport) {
                if (file.name.endsWith('.json')) {
                    await window.expenseTracker.dataExportImport.importFromJSON(file);
                } else if (file.name.endsWith('.csv')) {
                    await window.expenseTracker.dataExportImport.importFromCSV(file);
                }
            }
        });
        
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    }
    
    clearAllData() {
        if (confirm('⚠️ WARNING: This will permanently delete ALL your data including expenses, income, budgets, goals, and settings. This action cannot be undone.\n\nType "DELETE" to confirm:')) {
            const confirmation = prompt('Please type "DELETE" to confirm:');
            if (confirmation === 'DELETE') {
                // Clear all localStorage data
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('monthlyIncome') || 
                        key.startsWith('expenses') || 
                        key.startsWith('budgets') || 
                        key.startsWith('goals') || 
                        key.startsWith('recurring') || 
                        key.startsWith('appSettings') ||
                        key.startsWith('searchHistory') ||
                        key.startsWith('savedSearches') ||
                        key.startsWith('dataBackup')) {
                        localStorage.removeItem(key);
                    }
                });
                
                if (window.expenseTracker?.notificationManager) {
                    window.expenseTracker.notificationManager.showSuccess('All data cleared successfully');
                }
                
                // Reload the page to reinitialize the app
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        }
    }
    
    updateAppStats() {
        // Calculate app usage statistics
        const allData = {};
        Object.keys(localStorage).forEach(key => {
            try {
                allData[key] = JSON.parse(localStorage.getItem(key));
            } catch (e) {
                allData[key] = localStorage.getItem(key);
            }
        });
        
        // Calculate days using app (from first expense date)
        let firstExpenseDate = new Date();
        const expenses = JSON.parse(localStorage.getItem('expenses') || '{}');
        Object.keys(expenses).forEach(dateKey => {
            const date = new Date(dateKey);
            if (date < firstExpenseDate) {
                firstExpenseDate = date;
            }
        });
        
        const daysUsing = Math.ceil((new Date() - firstExpenseDate) / (1000 * 60 * 60 * 24));
        
        // Count total expenses
        let totalExpenseCount = 0;
        Object.values(expenses).forEach(dayExpenses => {
            totalExpenseCount += dayExpenses.length;
        });
        
        // Calculate data size
        const dataString = JSON.stringify(allData);
        const dataSize = new Blob([dataString]).size;
        const dataSizeKB = (dataSize / 1024).toFixed(1);
        
        // Get last backup date
        const lastBackup = localStorage.getItem('dataBackup');
        const lastBackupDate = lastBackup ? 
            new Date(JSON.parse(lastBackup).timestamp).toLocaleDateString() : 'Never';
        
        // Update stats display
        document.getElementById('daysUsing').textContent = isFinite(daysUsing) ? daysUsing : 0;
        document.getElementById('totalExpenses').textContent = totalExpenseCount;
        document.getElementById('dataSize').textContent = `${dataSizeKB} KB`;
        document.getElementById('lastBackup').textContent = lastBackupDate;
    }
    
    // Utility methods for other modules
    getCurrency() {
        return this.currentSettings?.currency || '₹';
    }
    
    getDateFormat() {
        return this.currentSettings?.dateFormat || 'DD/MM/YYYY';
    }
    
    getTheme() {
        return this.currentSettings?.theme || 'light';
    }
    
    isNotificationsEnabled() {
        return this.currentSettings?.notifications !== false;
    }
    
    isBudgetAlertsEnabled() {
        return this.currentSettings?.budgetAlerts !== false;
    }
    
    isGoalRemindersEnabled() {
        return this.currentSettings?.goalReminders !== false;
    }
    
    formatDate(date, format = null) {
        const fmt = format || this.getDateFormat();
        const d = new Date(date);
        
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        
        switch (fmt) {
            case 'MM/DD/YYYY':
                return `${month}/${day}/${year}`;
            case 'YYYY-MM-DD':
                return `${year}-${month}-${day}`;
            case 'DD-MM-YYYY':
                return `${day}-${month}-${year}`;
            default: // DD/MM/YYYY
                return `${day}/${month}/${year}`;
        }
    }
    
    formatCurrency(amount) {
        const currency = this.getCurrency();
        const num = parseFloat(amount) || 0;
        return `${currency}${num.toLocaleString()}`;
    }
}

// Make SettingsManager globally available
window.SettingsManager = SettingsManager;
