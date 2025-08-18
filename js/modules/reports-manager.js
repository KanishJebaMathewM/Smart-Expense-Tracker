/**
 * Reports Manager Module
 * Handles comprehensive report generation and management
 */

class ReportsManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.reportTypes = {
            'monthly': { name: 'Monthly Report', icon: '📅' },
            'quarterly': { name: 'Quarterly Report', icon: '📊' },
            'yearly': { name: 'Annual Report', icon: '📈' },
            'category': { name: 'Category Analysis', icon: '🏷️' },
            'budget': { name: 'Budget Performance', icon: '🎯' },
            'goals': { name: 'Goals Progress', icon: '🏆' },
            'trends': { name: 'Trends Analysis', icon: '📉' },
            'custom': { name: 'Custom Report', icon: '⚙️' }
        };
    }
    
    showReportsModal() {
        const modal = document.getElementById('reportsModal');
        if (!modal) {
            this.createReportsModal();
        }
        
        this.loadReportsData();
        document.getElementById('reportsModal').classList.add('active');
        document.getElementById('overlay').classList.add('active');
    }
    
    createReportsModal() {
        const modalHTML = `
            <div id="reportsModal" class="modal reports-modal">
                <div class="modal-content reports-modal-content">
                    <div class="modal-header">
                        <h3>📊 Reports & Analytics</h3>
                        <button id="closeReportsModal" class="close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="reports-tabs">
                            <button class="tab-btn active" data-tab="generate">Generate Report</button>
                            <button class="tab-btn" data-tab="templates">Templates</button>
                            <button class="tab-btn" data-tab="history">Report History</button>
                            <button class="tab-btn" data-tab="schedule">Scheduled Reports</button>
                        </div>
                        
                        <div class="tab-content active" id="generateTab">
                            <div class="report-generator">
                                <div class="report-type-selection">
                                    <h4>Select Report Type</h4>
                                    <div class="report-types-grid">
                                        ${this.generateReportTypeOptions()}
                                    </div>
                                </div>
                                
                                <div class="report-options" id="reportOptions">
                                    <div class="options-grid">
                                        <div class="option-group">
                                            <label>Time Period</label>
                                            <select id="reportPeriod">
                                                <option value="current-month">Current Month</option>
                                                <option value="last-month">Last Month</option>
                                                <option value="last-3-months">Last 3 Months</option>
                                                <option value="last-6-months">Last 6 Months</option>
                                                <option value="current-year">Current Year</option>
                                                <option value="last-year">Last Year</option>
                                                <option value="custom">Custom Range</option>
                                            </select>
                                        </div>
                                        
                                        <div class="option-group custom-range" style="display: none;">
                                            <label>Custom Date Range</label>
                                            <div class="date-range">
                                                <input type="date" id="reportStartDate">
                                                <input type="date" id="reportEndDate">
                                            </div>
                                        </div>
                                        
                                        <div class="option-group">
                                            <label>Categories</label>
                                            <select id="reportCategories" multiple>
                                                <option value="all" selected>All Categories</option>
                                                <option value="Food">🍔 Food</option>
                                                <option value="Transportation">🚗 Transportation</option>
                                                <option value="Entertainment">🎬 Entertainment</option>
                                                <option value="Shopping">🛒 Shopping</option>
                                                <option value="Bills">🧾 Bills</option>
                                                <option value="Health">🏥 Health</option>
                                                <option value="Education">📚 Education</option>
                                                <option value="Other">📦 Other</option>
                                            </select>
                                        </div>
                                        
                                        <div class="option-group">
                                            <label>Output Format</label>
                                            <select id="reportFormat">
                                                <option value="view">View in App</option>
                                                <option value="pdf">PDF Document</option>
                                                <option value="csv">CSV Spreadsheet</option>
                                                <option value="json">JSON Data</option>
                                            </select>
                                        </div>
                                        
                                        <div class="option-group">
                                            <label>Include Sections</label>
                                            <div class="checkbox-group">
                                                <label class="checkbox-option">
                                                    <input type="checkbox" id="includeSummary" checked>
                                                    <span>Executive Summary</span>
                                                </label>
                                                <label class="checkbox-option">
                                                    <input type="checkbox" id="includeCharts" checked>
                                                    <span>Charts & Visualizations</span>
                                                </label>
                                                <label class="checkbox-option">
                                                    <input type="checkbox" id="includeDetails" checked>
                                                    <span>Detailed Transactions</span>
                                                </label>
                                                <label class="checkbox-option">
                                                    <input type="checkbox" id="includeComparisons">
                                                    <span>Period Comparisons</span>
                                                </label>
                                                <label class="checkbox-option">
                                                    <input type="checkbox" id="includeBudgets">
                                                    <span>Budget Analysis</span>
                                                </label>
                                                <label class="checkbox-option">
                                                    <input type="checkbox" id="includeGoals">
                                                    <span>Goals Progress</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="report-preview" id="reportPreview">
                                    <h4>Report Preview</h4>
                                    <div class="preview-content" id="previewContent">
                                        <p>Select options above to see a preview of your report</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tab-content" id="templatesTab">
                            <div class="report-templates">
                                <h4>Report Templates</h4>
                                <div class="templates-grid" id="templatesGrid">
                                    ${this.generateReportTemplates()}
                                </div>
                                <div class="template-actions">
                                    <button class="btn btn-secondary" id="createTemplate">Create Template</button>
                                    <button class="btn btn-secondary" id="importTemplate">Import Template</button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tab-content" id="historyTab">
                            <div class="report-history">
                                <div class="history-filters">
                                    <select id="historyFilter">
                                        <option value="all">All Reports</option>
                                        <option value="monthly">Monthly Reports</option>
                                        <option value="quarterly">Quarterly Reports</option>
                                        <option value="custom">Custom Reports</option>
                                    </select>
                                    <button class="btn btn-secondary" id="clearHistory">Clear History</button>
                                </div>
                                <div class="history-list" id="historyList">
                                    <div class="loading">Loading report history...</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tab-content" id="scheduleTab">
                            <div class="scheduled-reports">
                                <h4>Scheduled Reports</h4>
                                <div class="schedule-form">
                                    <div class="form-grid">
                                        <div class="form-group">
                                            <label>Report Name</label>
                                            <input type="text" id="scheduleName" placeholder="e.g., Monthly Summary">
                                        </div>
                                        <div class="form-group">
                                            <label>Report Type</label>
                                            <select id="scheduleType">
                                                <option value="monthly">Monthly Report</option>
                                                <option value="quarterly">Quarterly Report</option>
                                                <option value="yearly">Annual Report</option>
                                            </select>
                                        </div>
                                        <div class="form-group">
                                            <label>Frequency</label>
                                            <select id="scheduleFrequency">
                                                <option value="monthly">Monthly</option>
                                                <option value="quarterly">Quarterly</option>
                                                <option value="yearly">Yearly</option>
                                            </select>
                                        </div>
                                        <div class="form-group">
                                            <label>Next Run Date</label>
                                            <input type="date" id="scheduleDate">
                                        </div>
                                    </div>
                                    <button class="btn btn-primary" id="scheduleReport">Schedule Report</button>
                                </div>
                                <div class="scheduled-list" id="scheduledList">
                                    <div class="empty-schedule">No scheduled reports</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="generateReport" class="btn btn-primary">Generate Report</button>
                        <button id="closeReportsModal" class="btn btn-secondary">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.bindReportsEvents();
    }
    
    generateReportTypeOptions() {
        return Object.entries(this.reportTypes).map(([key, type]) => `
            <div class="report-type-option" data-type="${key}">
                <div class="type-icon">${type.icon}</div>
                <div class="type-name">${type.name}</div>
            </div>
        `).join('');
    }
    
    generateReportTemplates() {
        const templates = [
            {
                name: 'Monthly Financial Summary',
                description: 'Complete overview of monthly income, expenses, and savings',
                type: 'monthly',
                icon: '📋'
            },
            {
                name: 'Category Spending Analysis',
                description: 'Detailed breakdown of spending by category',
                type: 'category',
                icon: '📊'
            },
            {
                name: 'Budget vs Actual Report',
                description: 'Compare budgeted amounts with actual spending',
                type: 'budget',
                icon: '🎯'
            },
            {
                name: 'Goals Progress Report',
                description: 'Track progress towards financial goals',
                type: 'goals',
                icon: '🏆'
            },
            {
                name: 'Quarterly Business Review',
                description: 'Comprehensive quarterly financial review',
                type: 'quarterly',
                icon: '📈'
            }
        ];
        
        return templates.map(template => `
            <div class="template-card" data-template="${template.type}">
                <div class="template-header">
                    <span class="template-icon">${template.icon}</span>
                    <span class="template-name">${template.name}</span>
                </div>
                <div class="template-description">${template.description}</div>
                <div class="template-actions">
                    <button class="btn btn-sm btn-primary" onclick="reportsManager.useTemplate('${template.type}')">
                        Use Template
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="reportsManager.previewTemplate('${template.type}')">
                        Preview
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    bindReportsEvents() {
        // Close modal
        document.querySelectorAll('#closeReportsModal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('reportsModal').classList.remove('active');
                document.getElementById('overlay').classList.remove('active');
            });
        });
        
        // Tab switching
        document.querySelectorAll('.reports-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchReportsTab(tabName);
            });
        });
        
        // Report type selection
        document.querySelectorAll('.report-type-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                this.selectReportType(type);
            });
        });
        
        // Generate report
        document.getElementById('generateReport')?.addEventListener('click', () => this.generateReport());
        
        // Period change
        document.getElementById('reportPeriod')?.addEventListener('change', (e) => {
            const customRange = document.querySelector('.custom-range');
            if (e.target.value === 'custom') {
                customRange.style.display = 'block';
            } else {
                customRange.style.display = 'none';
            }
            this.updateReportPreview();
        });
        
        // Live preview updates
        ['reportPeriod', 'reportCategories', 'reportFormat'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', () => this.updateReportPreview());
        });
        
        ['includeSummary', 'includeCharts', 'includeDetails', 'includeComparisons', 'includeBudgets', 'includeGoals'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', () => this.updateReportPreview());
        });
        
        // Template actions
        document.getElementById('createTemplate')?.addEventListener('click', () => this.createTemplate());
        document.getElementById('importTemplate')?.addEventListener('click', () => this.importTemplate());
        
        // Schedule actions
        document.getElementById('scheduleReport')?.addEventListener('click', () => this.scheduleReport());
        document.getElementById('clearHistory')?.addEventListener('click', () => this.clearReportHistory());
        
        // Set default dates
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        document.getElementById('reportStartDate').value = firstDay.toISOString().split('T')[0];
        document.getElementById('reportEndDate').value = today.toISOString().split('T')[0];
    }
    
    switchReportsTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.reports-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.reports-modal .tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');
        
        // Hide/show generate button
        const generateBtn = document.getElementById('generateReport');
        if (tabName === 'generate') {
            generateBtn.style.display = 'block';
        } else {
            generateBtn.style.display = 'none';
        }
        
        // Load specific tab data
        switch (tabName) {
            case 'history':
                this.loadReportHistory();
                break;
            case 'schedule':
                this.loadScheduledReports();
                break;
        }
    }
    
    loadReportsData() {
        this.updateReportPreview();
    }
    
    selectReportType(type) {
        // Update visual selection
        document.querySelectorAll('.report-type-option').forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelector(`[data-type="${type}"]`).classList.add('selected');
        
        this.selectedReportType = type;
        this.updateReportPreview();
    }
    
    updateReportPreview() {
        const previewContent = document.getElementById('previewContent');
        if (!previewContent) return;
        
        const reportType = this.selectedReportType || 'monthly';
        const period = document.getElementById('reportPeriod')?.value || 'current-month';
        const format = document.getElementById('reportFormat')?.value || 'view';
        
        const sections = [];
        if (document.getElementById('includeSummary')?.checked) sections.push('Executive Summary');
        if (document.getElementById('includeCharts')?.checked) sections.push('Charts & Visualizations');
        if (document.getElementById('includeDetails')?.checked) sections.push('Detailed Transactions');
        if (document.getElementById('includeComparisons')?.checked) sections.push('Period Comparisons');
        if (document.getElementById('includeBudgets')?.checked) sections.push('Budget Analysis');
        if (document.getElementById('includeGoals')?.checked) sections.push('Goals Progress');
        
        const typeInfo = this.reportTypes[reportType] || this.reportTypes.monthly;
        
        previewContent.innerHTML = `
            <div class="report-preview-card">
                <div class="preview-header">
                    <span class="preview-icon">${typeInfo.icon}</span>
                    <span class="preview-title">${typeInfo.name}</span>
                </div>
                <div class="preview-details">
                    <div class="preview-item">
                        <strong>Period:</strong> ${this.formatPeriodDisplay(period)}
                    </div>
                    <div class="preview-item">
                        <strong>Format:</strong> ${format.toUpperCase()}
                    </div>
                    <div class="preview-item">
                        <strong>Sections:</strong> ${sections.join(', ') || 'None selected'}
                    </div>
                </div>
                <div class="preview-stats">
                    ${this.generatePreviewStats(reportType, period)}
                </div>
            </div>
        `;
    }
    
    formatPeriodDisplay(period) {
        const displays = {
            'current-month': 'Current Month',
            'last-month': 'Last Month',
            'last-3-months': 'Last 3 Months',
            'last-6-months': 'Last 6 Months',
            'current-year': 'Current Year',
            'last-year': 'Last Year',
            'custom': 'Custom Range'
        };
        return displays[period] || 'Current Month';
    }
    
    generatePreviewStats(reportType, period) {
        // Get sample data for preview
        const stats = this.getReportStats(reportType, period);
        
        return `
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-label">Total Income:</span>
                    <span class="stat-value">₹${stats.totalIncome.toLocaleString()}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Total Expenses:</span>
                    <span class="stat-value">₹${stats.totalExpenses.toLocaleString()}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Net Savings:</span>
                    <span class="stat-value ${stats.netSavings >= 0 ? 'positive' : 'negative'}">
                        ₹${stats.netSavings.toLocaleString()}
                    </span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Savings Rate:</span>
                    <span class="stat-value">${stats.savingsRate.toFixed(1)}%</span>
                </div>
            </div>
        `;
    }
    
    getReportStats(reportType, period) {
        const currentDate = new Date();
        let totalIncome = 0;
        let totalExpenses = 0;
        
        // Calculate based on period
        switch (period) {
            case 'current-month':
                totalIncome = this.dataManager.getIncome(currentDate.getMonth(), currentDate.getFullYear());
                totalExpenses = this.dataManager.getTotalMonthlyExpenses(currentDate.getMonth(), currentDate.getFullYear());
                break;
            case 'last-month':
                const lastMonth = currentDate.getMonth() - 1;
                const lastMonthYear = lastMonth < 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();
                const adjustedMonth = lastMonth < 0 ? 11 : lastMonth;
                totalIncome = this.dataManager.getIncome(adjustedMonth, lastMonthYear);
                totalExpenses = this.dataManager.getTotalMonthlyExpenses(adjustedMonth, lastMonthYear);
                break;
            case 'current-year':
            case 'last-year':
                // Sum for the year
                const year = period === 'current-year' ? currentDate.getFullYear() : currentDate.getFullYear() - 1;
                for (let month = 0; month < 12; month++) {
                    totalIncome += this.dataManager.getIncome(month, year);
                    totalExpenses += this.dataManager.getTotalMonthlyExpenses(month, year);
                }
                break;
            default:
                // Default to current month
                totalIncome = this.dataManager.getIncome(currentDate.getMonth(), currentDate.getFullYear());
                totalExpenses = this.dataManager.getTotalMonthlyExpenses(currentDate.getMonth(), currentDate.getFullYear());
        }
        
        const netSavings = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
        
        return {
            totalIncome,
            totalExpenses,
            netSavings,
            savingsRate
        };
    }
    
    generateReport() {
        const reportType = this.selectedReportType || 'monthly';
        const period = document.getElementById('reportPeriod')?.value || 'current-month';
        const format = document.getElementById('reportFormat')?.value || 'view';
        const categories = Array.from(document.getElementById('reportCategories')?.selectedOptions || [])
            .map(option => option.value)
            .filter(val => val !== 'all');
        
        const includeSections = {
            summary: document.getElementById('includeSummary')?.checked || false,
            charts: document.getElementById('includeCharts')?.checked || false,
            details: document.getElementById('includeDetails')?.checked || false,
            comparisons: document.getElementById('includeComparisons')?.checked || false,
            budgets: document.getElementById('includeBudgets')?.checked || false,
            goals: document.getElementById('includeGoals')?.checked || false
        };
        
        const reportConfig = {
            type: reportType,
            period,
            format,
            categories: categories.length > 0 ? categories : null,
            sections: includeSections,
            dateRange: period === 'custom' ? {
                start: document.getElementById('reportStartDate')?.value,
                end: document.getElementById('reportEndDate')?.value
            } : null
        };
        
        // Generate report based on format
        switch (format) {
            case 'view':
                this.showReportViewer(reportConfig);
                break;
            case 'pdf':
                this.generatePDFReport(reportConfig);
                break;
            case 'csv':
                this.generateCSVReport(reportConfig);
                break;
            case 'json':
                this.generateJSONReport(reportConfig);
                break;
        }
        
        // Save to history
        this.saveToHistory(reportConfig);
        
        if (window.expenseTracker?.notificationManager) {
            window.expenseTracker.notificationManager.showSuccess('Report generated successfully');
        }
    }
    
    showReportViewer(config) {
        const reportData = this.compileReportData(config);
        const reportHTML = this.generateReportHTML(reportData, config);
        
        // Create report viewer modal
        const viewerHTML = `
            <div class="report-viewer-modal">
                <div class="report-viewer-content">
                    <div class="viewer-header">
                        <h3>${this.reportTypes[config.type]?.name || 'Report'}</h3>
                        <div class="viewer-actions">
                            <button class="btn btn-secondary" onclick="reportsManager.printReport()">🖨️ Print</button>
                            <button class="btn btn-secondary" onclick="reportsManager.exportReportPDF()">📄 Export PDF</button>
                            <button class="btn btn-secondary" onclick="this.closest('.report-viewer-modal').remove()">✕ Close</button>
                        </div>
                    </div>
                    <div class="viewer-body">
                        ${reportHTML}
                    </div>
                </div>
            </div>
        `;
        
        const overlay = document.createElement('div');
        overlay.className = 'report-viewer-overlay';
        overlay.innerHTML = viewerHTML;
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
        
        document.body.appendChild(overlay);
    }
    
    compileReportData(config) {
        const data = {
            metadata: {
                title: this.reportTypes[config.type]?.name || 'Financial Report',
                period: config.period,
                generatedAt: new Date().toISOString(),
                dateRange: this.getDateRange(config.period, config.dateRange)
            },
            summary: {},
            categories: {},
            transactions: [],
            budgets: {},
            goals: {},
            comparisons: {}
        };
        
        // Compile summary data
        if (config.sections.summary) {
            data.summary = this.compileSummaryData(config);
        }
        
        // Compile category data
        data.categories = this.compileCategoryData(config);
        
        // Compile transaction details
        if (config.sections.details) {
            data.transactions = this.compileTransactionData(config);
        }
        
        // Compile budget data
        if (config.sections.budgets) {
            data.budgets = this.compileBudgetData(config);
        }
        
        // Compile goals data
        if (config.sections.goals) {
            data.goals = this.compileGoalsData(config);
        }
        
        // Compile comparison data
        if (config.sections.comparisons) {
            data.comparisons = this.compileComparisonData(config);
        }
        
        return data;
    }
    
    compileSummaryData(config) {
        const stats = this.getReportStats(config.type, config.period);
        
        return {
            totalIncome: stats.totalIncome,
            totalExpenses: stats.totalExpenses,
            netSavings: stats.netSavings,
            savingsRate: stats.savingsRate,
            expenseCount: this.getExpenseCount(config),
            averageDailySpending: stats.totalExpenses / 30,
            topCategory: this.getTopCategory(config),
            insights: this.generateInsights(config)
        };
    }
    
    compileCategoryData(config) {
        const currentDate = new Date();
        const categoryTotals = this.dataManager.getCategoryTotals(currentDate.getMonth(), currentDate.getFullYear());
        
        const categories = {};
        Object.entries(categoryTotals).forEach(([category, amount]) => {
            if (!config.categories || config.categories.includes(category)) {
                categories[category] = {
                    amount,
                    percentage: (amount / Object.values(categoryTotals).reduce((sum, val) => sum + val, 0)) * 100,
                    transactionCount: this.getCategoryTransactionCount(category, config)
                };
            }
        });
        
        return categories;
    }
    
    compileTransactionData(config) {
        const dateRange = this.getDateRange(config.period, config.dateRange);
        const transactions = [];
        
        Object.entries(this.dataManager.getExpenses()).forEach(([dateKey, dayExpenses]) => {
            const date = new Date(dateKey);
            if (date >= dateRange.start && date <= dateRange.end) {
                dayExpenses.forEach(expense => {
                    if (!config.categories || config.categories.includes(expense.category)) {
                        transactions.push({
                            ...expense,
                            date: dateKey,
                            dateObj: date
                        });
                    }
                });
            }
        });
        
        return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    compileBudgetData(config) {
        // This would integrate with budget manager
        return {};
    }
    
    compileGoalsData(config) {
        // This would integrate with goals manager
        return {};
    }
    
    compileComparisonData(config) {
        // Generate comparison data with previous period
        return {};
    }
    
    generateReportHTML(data, config) {
        let html = `
            <div class="report-document">
                <div class="report-header">
                    <h1>${data.metadata.title}</h1>
                    <div class="report-meta">
                        <p>Period: ${this.formatPeriodDisplay(config.period)}</p>
                        <p>Generated: ${new Date(data.metadata.generatedAt).toLocaleDateString()}</p>
                    </div>
                </div>
        `;
        
        // Executive Summary
        if (config.sections.summary && data.summary) {
            html += this.generateSummarySection(data.summary);
        }
        
        // Category Analysis
        if (Object.keys(data.categories).length > 0) {
            html += this.generateCategorySection(data.categories);
        }
        
        // Transaction Details
        if (config.sections.details && data.transactions.length > 0) {
            html += this.generateTransactionSection(data.transactions);
        }
        
        // Budget Analysis
        if (config.sections.budgets && Object.keys(data.budgets).length > 0) {
            html += this.generateBudgetSection(data.budgets);
        }
        
        // Goals Progress
        if (config.sections.goals && Object.keys(data.goals).length > 0) {
            html += this.generateGoalsSection(data.goals);
        }
        
        html += '</div>';
        return html;
    }
    
    generateSummarySection(summary) {
        return `
            <div class="report-section">
                <h2>📊 Executive Summary</h2>
                <div class="summary-grid">
                    <div class="summary-card">
                        <h3>Total Income</h3>
                        <div class="summary-value positive">₹${summary.totalIncome.toLocaleString()}</div>
                    </div>
                    <div class="summary-card">
                        <h3>Total Expenses</h3>
                        <div class="summary-value negative">₹${summary.totalExpenses.toLocaleString()}</div>
                    </div>
                    <div class="summary-card">
                        <h3>Net Savings</h3>
                        <div class="summary-value ${summary.netSavings >= 0 ? 'positive' : 'negative'}">
                            ₹${summary.netSavings.toLocaleString()}
                        </div>
                    </div>
                    <div class="summary-card">
                        <h3>Savings Rate</h3>
                        <div class="summary-value">${summary.savingsRate.toFixed(1)}%</div>
                    </div>
                </div>
                
                <div class="key-insights">
                    <h3>Key Insights</h3>
                    <ul>
                        <li>Average daily spending: ₹${summary.averageDailySpending.toFixed(0)}</li>
                        <li>Top spending category: ${summary.topCategory}</li>
                        <li>Total transactions: ${summary.expenseCount}</li>
                        ${summary.insights.map(insight => `<li>${insight}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }
    
    generateCategorySection(categories) {
        const sortedCategories = Object.entries(categories)
            .sort(([,a], [,b]) => b.amount - a.amount);
        
        return `
            <div class="report-section">
                <h2>🏷️ Category Analysis</h2>
                <div class="category-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>Percentage</th>
                                <th>Transactions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sortedCategories.map(([category, data]) => `
                                <tr>
                                    <td>${category}</td>
                                    <td>₹${data.amount.toLocaleString()}</td>
                                    <td>${data.percentage.toFixed(1)}%</td>
                                    <td>${data.transactionCount}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    generateTransactionSection(transactions) {
        const recentTransactions = transactions.slice(0, 50); // Show latest 50
        
        return `
            <div class="report-section">
                <h2>💳 Transaction Details</h2>
                <p>Showing ${recentTransactions.length} most recent transactions (out of ${transactions.length} total)</p>
                <div class="transaction-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${recentTransactions.map(transaction => `
                                <tr>
                                    <td>${transaction.dateObj.toLocaleDateString()}</td>
                                    <td>${transaction.name}</td>
                                    <td>${transaction.category}</td>
                                    <td>₹${transaction.amount.toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    generateBudgetSection(budgets) {
        return `
            <div class="report-section">
                <h2>🎯 Budget Analysis</h2>
                <p>Budget performance will be shown here when budget data is available.</p>
            </div>
        `;
    }
    
    generateGoalsSection(goals) {
        return `
            <div class="report-section">
                <h2>🏆 Goals Progress</h2>
                <p>Goals progress will be shown here when goals data is available.</p>
            </div>
        `;
    }
    
    // Utility methods
    getDateRange(period, customRange) {
        const now = new Date();
        let start, end;
        
        switch (period) {
            case 'current-month':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case 'last-month':
                start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                end = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            case 'current-year':
                start = new Date(now.getFullYear(), 0, 1);
                end = new Date(now.getFullYear(), 11, 31);
                break;
            case 'custom':
                start = new Date(customRange.start);
                end = new Date(customRange.end);
                break;
            default:
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = now;
        }
        
        return { start, end };
    }
    
    getExpenseCount(config) {
        const dateRange = this.getDateRange(config.period, config.dateRange);
        let count = 0;
        
        Object.entries(this.dataManager.getExpenses()).forEach(([dateKey, dayExpenses]) => {
            const date = new Date(dateKey);
            if (date >= dateRange.start && date <= dateRange.end) {
                count += dayExpenses.length;
            }
        });
        
        return count;
    }
    
    getTopCategory(config) {
        const currentDate = new Date();
        const categoryTotals = this.dataManager.getCategoryTotals(currentDate.getMonth(), currentDate.getFullYear());
        
        let topCategory = 'None';
        let maxAmount = 0;
        
        Object.entries(categoryTotals).forEach(([category, amount]) => {
            if (amount > maxAmount) {
                maxAmount = amount;
                topCategory = category;
            }
        });
        
        return topCategory;
    }
    
    getCategoryTransactionCount(category, config) {
        const dateRange = this.getDateRange(config.period, config.dateRange);
        let count = 0;
        
        Object.entries(this.dataManager.getExpenses()).forEach(([dateKey, dayExpenses]) => {
            const date = new Date(dateKey);
            if (date >= dateRange.start && date <= dateRange.end) {
                count += dayExpenses.filter(exp => exp.category === category).length;
            }
        });
        
        return count;
    }
    
    generateInsights(config) {
        const insights = [];
        const stats = this.getReportStats(config.type, config.period);
        
        if (stats.savingsRate > 20) {
            insights.push('Excellent savings rate - you\'re on track for financial success');
        } else if (stats.savingsRate < 5) {
            insights.push('Consider reducing expenses to improve your savings rate');
        }
        
        if (stats.totalExpenses > stats.totalIncome) {
            insights.push('Spending exceeds income - review and adjust your budget');
        }
        
        return insights;
    }
    
    // Export methods
    generatePDFReport(config) {
        // This would generate a PDF using a library like jsPDF
        if (window.expenseTracker?.notificationManager) {
            window.expenseTracker.notificationManager.showInfo('PDF generation would be implemented with a PDF library');
        }
    }
    
    generateCSVReport(config) {
        const data = this.compileReportData(config);
        let csvContent = 'Date,Description,Category,Amount\n';
        
        data.transactions.forEach(transaction => {
            csvContent += `${transaction.dateObj.toLocaleDateString()},"${transaction.name}","${transaction.category}",${transaction.amount}\n`;
        });
        
        this.downloadFile(csvContent, `financial-report-${Date.now()}.csv`, 'text/csv');
    }
    
    generateJSONReport(config) {
        const data = this.compileReportData(config);
        const jsonString = JSON.stringify(data, null, 2);
        
        this.downloadFile(jsonString, `financial-report-${Date.now()}.json`, 'application/json');
    }
    
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        window.URL.revokeObjectURL(url);
    }
    
    // Template management
    useTemplate(templateType) {
        this.switchReportsTab('generate');
        this.selectReportType(templateType);
        
        // Set template-specific defaults
        switch (templateType) {
            case 'monthly':
                document.getElementById('reportPeriod').value = 'current-month';
                document.getElementById('includeSummary').checked = true;
                document.getElementById('includeCharts').checked = true;
                break;
            case 'budget':
                document.getElementById('includeBudgets').checked = true;
                document.getElementById('includeComparisons').checked = true;
                break;
            case 'goals':
                document.getElementById('includeGoals').checked = true;
                break;
        }
        
        this.updateReportPreview();
    }
    
    previewTemplate(templateType) {
        // Show template preview
        if (window.expenseTracker?.notificationManager) {
            window.expenseTracker.notificationManager.showInfo(`Preview for ${templateType} template`);
        }
    }
    
    createTemplate() {
        // Create custom template
        if (window.expenseTracker?.notificationManager) {
            window.expenseTracker.notificationManager.showInfo('Template creation feature would be implemented');
        }
    }
    
    importTemplate() {
        // Import template from file
        if (window.expenseTracker?.notificationManager) {
            window.expenseTracker.notificationManager.showInfo('Template import feature would be implemented');
        }
    }
    
    // History management
    saveToHistory(config) {
        const history = JSON.parse(localStorage.getItem('reportHistory') || '[]');
        
        const historyItem = {
            id: Date.now(),
            config,
            generatedAt: new Date().toISOString(),
            title: `${this.reportTypes[config.type]?.name || 'Report'} - ${this.formatPeriodDisplay(config.period)}`
        };
        
        history.unshift(historyItem);
        
        // Keep only last 50 reports
        const trimmedHistory = history.slice(0, 50);
        localStorage.setItem('reportHistory', JSON.stringify(trimmedHistory));
    }
    
    loadReportHistory() {
        const container = document.getElementById('historyList');
        if (!container) return;
        
        const history = JSON.parse(localStorage.getItem('reportHistory') || '[]');
        
        if (history.length === 0) {
            container.innerHTML = '<div class="empty-history">No reports generated yet</div>';
            return;
        }
        
        container.innerHTML = history.map(item => `
            <div class="history-item">
                <div class="history-info">
                    <div class="history-title">${item.title}</div>
                    <div class="history-date">${new Date(item.generatedAt).toLocaleDateString()}</div>
                </div>
                <div class="history-actions">
                    <button class="btn btn-sm btn-secondary" onclick="reportsManager.regenerateReport('${item.id}')">
                        Regenerate
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="reportsManager.deleteFromHistory('${item.id}')">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    regenerateReport(historyId) {
        const history = JSON.parse(localStorage.getItem('reportHistory') || '[]');
        const item = history.find(h => h.id.toString() === historyId);
        
        if (item) {
            // Apply the saved configuration and regenerate
            this.switchReportsTab('generate');
            // Set form values based on saved config
            // Then generate report
            this.generateReport();
        }
    }
    
    deleteFromHistory(historyId) {
        if (confirm('Delete this report from history?')) {
            const history = JSON.parse(localStorage.getItem('reportHistory') || '[]');
            const filtered = history.filter(h => h.id.toString() !== historyId);
            localStorage.setItem('reportHistory', JSON.stringify(filtered));
            this.loadReportHistory();
        }
    }
    
    clearReportHistory() {
        if (confirm('Clear all report history?')) {
            localStorage.removeItem('reportHistory');
            this.loadReportHistory();
        }
    }
    
    // Scheduled reports
    scheduleReport() {
        if (window.expenseTracker?.notificationManager) {
            window.expenseTracker.notificationManager.showInfo('Scheduled reports feature would be implemented');
        }
    }
    
    loadScheduledReports() {
        const container = document.getElementById('scheduledList');
        if (container) {
            container.innerHTML = '<div class="empty-schedule">No scheduled reports</div>';
        }
    }
    
    // Print functionality
    printReport() {
        window.print();
    }
    
    exportReportPDF() {
        this.generatePDFReport(this.lastGeneratedConfig || {});
    }
}

// Make ReportsManager globally available
window.ReportsManager = ReportsManager;
