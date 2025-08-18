/**
 * Analytics Manager Module
 * Provides advanced analytics, trends, and financial insights
 */

class AnalyticsManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.analyticsCache = new Map();
    }
    
    showAnalyticsModal() {
        const modal = document.getElementById('analyticsModal');
        if (!modal) {
            this.createAnalyticsModal();
        }
        
        this.loadAnalyticsData();
        document.getElementById('analyticsModal').classList.add('active');
        document.getElementById('overlay').classList.add('active');
    }
    
    createAnalyticsModal() {
        const modalHTML = `
            <div id="analyticsModal" class="modal analytics-modal">
                <div class="modal-content analytics-modal-content">
                    <div class="modal-header">
                        <h3>Financial Analytics & Insights</h3>
                        <button id="closeAnalyticsModal" class="close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="analytics-tabs">
                            <button class="tab-btn active" data-tab="overview">Overview</button>
                            <button class="tab-btn" data-tab="trends">Trends</button>
                            <button class="tab-btn" data-tab="insights">Insights</button>
                            <button class="tab-btn" data-tab="forecasts">Forecasts</button>
                        </div>
                        
                        <div class="tab-content active" id="overviewTab">
                            <div class="analytics-overview">
                                <div class="analytics-cards">
                                    <div class="analytics-card">
                                        <h4>Financial Health Score</h4>
                                        <div class="health-score" id="healthScore">
                                            <div class="score-circle">
                                                <span class="score-value">0</span>
                                                <span class="score-label">/100</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="analytics-card">
                                        <h4>Spending Velocity</h4>
                                        <div id="spendingVelocity" class="velocity-chart"></div>
                                    </div>
                                    <div class="analytics-card">
                                        <h4>Category Distribution</h4>
                                        <div id="categoryDistribution" class="distribution-chart"></div>
                                    </div>
                                </div>
                                <div class="key-metrics">
                                    <h4>Key Metrics</h4>
                                    <div class="metrics-grid" id="keyMetrics"></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tab-content" id="trendsTab">
                            <div class="trends-controls">
                                <select id="trendsTimeframe">
                                    <option value="6">Last 6 months</option>
                                    <option value="12" selected>Last 12 months</option>
                                    <option value="24">Last 24 months</option>
                                </select>
                                <select id="trendsType">
                                    <option value="all">All Metrics</option>
                                    <option value="income">Income Only</option>
                                    <option value="expenses">Expenses Only</option>
                                    <option value="savings">Savings Only</option>
                                </select>
                            </div>
                            <div class="trends-charts">
                                <canvas id="trendsChart" width="600" height="400"></canvas>
                            </div>
                            <div class="trend-analysis" id="trendAnalysis"></div>
                        </div>
                        
                        <div class="tab-content" id="insightsTab">
                            <div class="insights-container">
                                <div class="insights-section">
                                    <h4>🎯 Spending Patterns</h4>
                                    <div id="spendingPatterns" class="insights-list"></div>
                                </div>
                                <div class="insights-section">
                                    <h4>💡 Optimization Suggestions</h4>
                                    <div id="optimizationSuggestions" class="insights-list"></div>
                                </div>
                                <div class="insights-section">
                                    <h4>⚠️ Financial Alerts</h4>
                                    <div id="financialAlerts" class="insights-list"></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tab-content" id="forecastsTab">
                            <div class="forecast-controls">
                                <select id="forecastPeriod">
                                    <option value="3">Next 3 months</option>
                                    <option value="6" selected>Next 6 months</option>
                                    <option value="12">Next 12 months</option>
                                </select>
                                <button id="generateForecast" class="btn btn-primary">Generate Forecast</button>
                            </div>
                            <div class="forecast-results">
                                <canvas id="forecastChart" width="600" height="400"></canvas>
                                <div class="forecast-summary" id="forecastSummary"></div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="exportAnalytics" class="btn btn-secondary">Export Report</button>
                        <button id="closeAnalyticsModal" class="btn btn-secondary">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.bindAnalyticsEvents();
    }
    
    bindAnalyticsEvents() {
        // Close modal
        document.querySelectorAll('#closeAnalyticsModal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('analyticsModal').classList.remove('active');
                document.getElementById('overlay').classList.remove('active');
            });
        });
        
        // Tab switching
        document.querySelectorAll('.analytics-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchAnalyticsTab(tabName);
            });
        });
        
        // Trends controls
        document.getElementById('trendsTimeframe')?.addEventListener('change', () => this.updateTrendsChart());
        document.getElementById('trendsType')?.addEventListener('change', () => this.updateTrendsChart());
        
        // Forecast generation
        document.getElementById('generateForecast')?.addEventListener('click', () => this.generateForecast());
        
        // Export analytics
        document.getElementById('exportAnalytics')?.addEventListener('click', () => this.exportAnalyticsReport());
    }
    
    switchAnalyticsTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.analytics-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');
        
        // Load specific tab data
        switch (tabName) {
            case 'overview':
                this.loadOverviewData();
                break;
            case 'trends':
                this.updateTrendsChart();
                break;
            case 'insights':
                this.generateInsights();
                break;
            case 'forecasts':
                this.loadForecastData();
                break;
        }
    }
    
    loadAnalyticsData() {
        this.loadOverviewData();
    }
    
    loadOverviewData() {
        const healthScore = this.calculateHealthScore();
        const keyMetrics = this.calculateKeyMetrics();
        
        // Update health score
        this.updateHealthScore(healthScore);
        
        // Update key metrics
        this.updateKeyMetrics(keyMetrics);
        
        // Update charts
        this.updateSpendingVelocityChart();
        this.updateCategoryDistributionChart();
    }
    
    calculateHealthScore() {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        const income = this.dataManager.getIncome(currentMonth, currentYear);
        const expenses = this.dataManager.getTotalMonthlyExpenses(currentMonth, currentYear);
        const savings = income - expenses;
        
        let score = 0;
        
        // Income stability (0-25 points)
        const incomeHistory = this.getIncomeHistory(6);
        const incomeStability = this.calculateStability(incomeHistory);
        score += incomeStability * 25;
        
        // Savings rate (0-30 points)
        if (income > 0) {
            const savingsRate = Math.max(0, savings / income);
            score += Math.min(savingsRate * 1.5, 1) * 30;
        }
        
        // Budget adherence (0-25 points)
        const budgetAdherence = this.calculateBudgetAdherence();
        score += budgetAdherence * 25;
        
        // Emergency fund (0-20 points)
        const emergencyFund = this.calculateEmergencyFundScore();
        score += emergencyFund * 20;
        
        return Math.round(Math.min(score, 100));
    }
    
    calculateStability(values) {
        if (values.length < 2) return 0.5;
        
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const coefficient = mean > 0 ? Math.sqrt(variance) / mean : 1;
        
        return Math.max(0, 1 - coefficient);
    }
    
    calculateBudgetAdherence() {
        const currentDate = new Date();
        const categoryTotals = this.dataManager.getCategoryTotals(currentDate.getMonth(), currentDate.getFullYear());
        const categories = ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Education', 'Other'];
        
        let totalBudget = 0;
        let totalAdherence = 0;
        let budgetedCategories = 0;
        
        categories.forEach(category => {
            const budget = this.dataManager.getBudgetForCategory(category, currentDate.getMonth(), currentDate.getFullYear());
            const spent = categoryTotals[category] || 0;
            
            if (budget > 0) {
                totalBudget += budget;
                budgetedCategories++;
                const adherence = Math.min(1, budget / Math.max(spent, 1));
                totalAdherence += adherence;
            }
        });
        
        return budgetedCategories > 0 ? totalAdherence / budgetedCategories : 0.5;
    }
    
    calculateEmergencyFundScore() {
        const allTimeSavings = this.dataManager.getAllTimeIncome() - this.dataManager.getAllTimeExpenses();
        const averageMonthlyExpenses = this.getAverageMonthlyExpenses(6);
        
        if (averageMonthlyExpenses === 0) return 1;
        
        const monthsOfExpenses = allTimeSavings / averageMonthlyExpenses;
        return Math.min(monthsOfExpenses / 6, 1); // 6 months = perfect score
    }
    
    getIncomeHistory(months) {
        const history = [];
        const currentDate = new Date();
        
        for (let i = 0; i < months; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const income = this.dataManager.getIncome(date.getMonth(), date.getFullYear());
            history.unshift(income);
        }
        
        return history;
    }
    
    getExpenseHistory(months) {
        const history = [];
        const currentDate = new Date();
        
        for (let i = 0; i < months; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const expenses = this.dataManager.getTotalMonthlyExpenses(date.getMonth(), date.getFullYear());
            history.unshift(expenses);
        }
        
        return history;
    }
    
    getAverageMonthlyExpenses(months) {
        const history = this.getExpenseHistory(months);
        const nonZeroHistory = history.filter(val => val > 0);
        
        if (nonZeroHistory.length === 0) return 0;
        
        return nonZeroHistory.reduce((sum, val) => sum + val, 0) / nonZeroHistory.length;
    }
    
    calculateKeyMetrics() {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        const income = this.dataManager.getIncome(currentMonth, currentYear);
        const expenses = this.dataManager.getTotalMonthlyExpenses(currentMonth, currentYear);
        const savings = income - expenses;
        
        const incomeHistory = this.getIncomeHistory(12);
        const expenseHistory = this.getExpenseHistory(12);
        
        const avgIncome = incomeHistory.reduce((sum, val) => sum + val, 0) / incomeHistory.length;
        const avgExpenses = expenseHistory.reduce((sum, val) => sum + val, 0) / expenseHistory.length;
        
        const incomeGrowth = incomeHistory.length >= 2 ? 
            ((incomeHistory[incomeHistory.length - 1] - incomeHistory[0]) / Math.max(incomeHistory[0], 1)) * 100 : 0;
        
        const expenseGrowth = expenseHistory.length >= 2 ? 
            ((expenseHistory[expenseHistory.length - 1] - expenseHistory[0]) / Math.max(expenseHistory[0], 1)) * 100 : 0;
        
        return {
            savingsRate: income > 0 ? (savings / income) * 100 : 0,
            incomeGrowth,
            expenseGrowth,
            avgIncome,
            avgExpenses,
            expenseVariability: this.calculateStability(expenseHistory) * 100,
            topCategory: this.getTopSpendingCategory(),
            daysToGoal: this.calculateDaysToFinancialGoal()
        };
    }
    
    getTopSpendingCategory() {
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
    
    calculateDaysToFinancialGoal() {
        // This would integrate with goals manager if available
        // For now, return a placeholder calculation
        const currentSavings = this.dataManager.getAllTimeIncome() - this.dataManager.getAllTimeExpenses();
        const monthlySavings = this.getAverageMonthlyExpenses(3);
        
        if (monthlySavings <= 0) return 'N/A';
        
        const goalAmount = 100000; // Default goal
        const remaining = goalAmount - currentSavings;
        
        if (remaining <= 0) return 'Goal Achieved!';
        
        const daysToGoal = (remaining / monthlySavings) * 30;
        return Math.ceil(daysToGoal);
    }
    
    updateHealthScore(score) {
        const scoreElement = document.querySelector('#healthScore .score-value');
        if (scoreElement) {
            // Animate score
            let current = 0;
            const increment = score / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= score) {
                    current = score;
                    clearInterval(timer);
                }
                scoreElement.textContent = Math.round(current);
                
                // Update color based on score
                const circle = scoreElement.parentElement;
                circle.className = 'score-circle';
                if (score >= 80) circle.classList.add('excellent');
                else if (score >= 60) circle.classList.add('good');
                else if (score >= 40) circle.classList.add('average');
                else circle.classList.add('poor');
            }, 50);
        }
    }
    
    updateKeyMetrics(metrics) {
        const container = document.getElementById('keyMetrics');
        if (!container) return;
        
        container.innerHTML = `
            <div class="metric">
                <span class="metric-label">Savings Rate</span>
                <span class="metric-value ${metrics.savingsRate >= 20 ? 'positive' : 'negative'}">
                    ${metrics.savingsRate.toFixed(1)}%
                </span>
            </div>
            <div class="metric">
                <span class="metric-label">Income Growth</span>
                <span class="metric-value ${metrics.incomeGrowth >= 0 ? 'positive' : 'negative'}">
                    ${metrics.incomeGrowth >= 0 ? '+' : ''}${metrics.incomeGrowth.toFixed(1)}%
                </span>
            </div>
            <div class="metric">
                <span class="metric-label">Expense Stability</span>
                <span class="metric-value ${metrics.expenseVariability >= 70 ? 'positive' : 'negative'}">
                    ${metrics.expenseVariability.toFixed(1)}%
                </span>
            </div>
            <div class="metric">
                <span class="metric-label">Top Category</span>
                <span class="metric-value">${metrics.topCategory}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Avg Monthly Income</span>
                <span class="metric-value">₹${metrics.avgIncome.toLocaleString()}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Avg Monthly Expenses</span>
                <span class="metric-value">₹${metrics.avgExpenses.toLocaleString()}</span>
            </div>
        `;
    }
    
    updateSpendingVelocityChart() {
        const container = document.getElementById('spendingVelocity');
        if (!container) return;
        
        const last7Days = this.getSpendingVelocity(7);
        const maxAmount = Math.max(...last7Days, 1);
        
        container.innerHTML = last7Days.map((amount, index) => {
            const height = (amount / maxAmount) * 100;
            const date = new Date();
            date.setDate(date.getDate() - (6 - index));
            
            return `
                <div class="velocity-bar" style="height: ${height}%" title="${date.toLocaleDateString()}: ₹${amount}">
                    <span class="bar-label">${date.getDate()}</span>
                </div>
            `;
        }).join('');
    }
    
    getSpendingVelocity(days) {
        const velocity = [];
        const currentDate = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(currentDate);
            date.setDate(date.getDate() - i);
            const amount = this.dataManager.getTotalExpensesForDate(date);
            velocity.push(amount);
        }
        
        return velocity;
    }
    
    updateCategoryDistributionChart() {
        const container = document.getElementById('categoryDistribution');
        if (!container) return;
        
        const currentDate = new Date();
        const categoryTotals = this.dataManager.getCategoryTotals(currentDate.getMonth(), currentDate.getFullYear());
        const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
        
        if (total === 0) {
            container.innerHTML = '<p class="no-data">No expense data available</p>';
            return;
        }
        
        const categoryColors = {
            'Food': '#EF4444',
            'Transportation': '#F97316',
            'Entertainment': '#8B5CF6',
            'Shopping': '#EC4899',
            'Bills': '#3B82F6',
            'Health': '#10B981',
            'Education': '#F59E0B',
            'Other': '#64748B'
        };
        
        container.innerHTML = Object.entries(categoryTotals)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5) // Top 5 categories
            .map(([category, amount]) => {
                const percentage = (amount / total) * 100;
                return `
                    <div class="distribution-item">
                        <div class="category-color" style="background-color: ${categoryColors[category]}"></div>
                        <span class="category-name">${category}</span>
                        <span class="category-percentage">${percentage.toFixed(1)}%</span>
                    </div>
                `;
            }).join('');
    }
    
    updateTrendsChart() {
        const canvas = document.getElementById('trendsChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const timeframe = parseInt(document.getElementById('trendsTimeframe').value);
        const type = document.getElementById('trendsType').value;
        
        const trendsData = this.dataManager.getTrendsData(timeframe);
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        this.drawTrendsChart(ctx, canvas, trendsData, type);
        this.updateTrendAnalysis(trendsData);
    }
    
    drawTrendsChart(ctx, canvas, data, type) {
        const padding = 60;
        const chartWidth = canvas.width - 2 * padding;
        const chartHeight = canvas.height - 2 * padding;
        
        // Find max values
        const maxIncome = Math.max(...data.map(d => d.income));
        const maxExpenses = Math.max(...data.map(d => d.expenses));
        const maxValue = Math.max(maxIncome, maxExpenses);
        
        if (maxValue === 0) {
            ctx.fillStyle = '#666';
            ctx.font = '16px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        // Draw axes
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();
        
        // Draw grid lines
        const gridLines = 5;
        for (let i = 0; i <= gridLines; i++) {
            const y = padding + (chartHeight / gridLines) * i;
            ctx.strokeStyle = '#f0f0f0';
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            ctx.stroke();
            
            // Y-axis labels
            const value = maxValue - (maxValue / gridLines) * i;
            ctx.fillStyle = '#666';
            ctx.font = '12px Inter';
            ctx.textAlign = 'right';
            ctx.fillText(`₹${(value / 1000).toFixed(0)}K`, padding - 10, y + 4);
        }
        
        // Draw data lines
        if (type === 'all' || type === 'income') {
            this.drawLine(ctx, data, 'income', '#10B981', padding, chartHeight, maxValue);
        }
        if (type === 'all' || type === 'expenses') {
            this.drawLine(ctx, data, 'expenses', '#EF4444', padding, chartHeight, maxValue);
        }
        if (type === 'all' || type === 'savings') {
            this.drawLine(ctx, data, 'savings', '#3B82F6', padding, chartHeight, maxValue);
        }
        
        // Draw legend
        this.drawTrendsLegend(ctx, canvas, type);
    }
    
    drawLine(ctx, data, property, color, padding, chartHeight, maxValue) {
        const chartWidth = ctx.canvas.width - 2 * padding;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        data.forEach((point, index) => {
            const x = padding + (chartWidth / (data.length - 1)) * index;
            const y = padding + chartHeight - (point[property] / maxValue) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw points
        ctx.fillStyle = color;
        data.forEach((point, index) => {
            const x = padding + (chartWidth / (data.length - 1)) * index;
            const y = padding + chartHeight - (point[property] / maxValue) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });
    }
    
    drawTrendsLegend(ctx, canvas, type) {
        const legends = [];
        if (type === 'all' || type === 'income') legends.push({ label: 'Income', color: '#10B981' });
        if (type === 'all' || type === 'expenses') legends.push({ label: 'Expenses', color: '#EF4444' });
        if (type === 'all' || type === 'savings') legends.push({ label: 'Savings', color: '#3B82F6' });
        
        const legendY = canvas.height - 30;
        let legendX = 60;
        
        legends.forEach(legend => {
            ctx.fillStyle = legend.color;
            ctx.fillRect(legendX, legendY, 15, 15);
            
            ctx.fillStyle = '#333';
            ctx.font = '12px Inter';
            ctx.textAlign = 'left';
            ctx.fillText(legend.label, legendX + 20, legendY + 12);
            
            legendX += 80;
        });
    }
    
    updateTrendAnalysis(data) {
        const container = document.getElementById('trendAnalysis');
        if (!container) return;
        
        const analysis = this.analyzeTrends(data);
        
        container.innerHTML = `
            <div class="trend-insights">
                <h4>Trend Analysis</h4>
                <div class="insight-items">
                    ${analysis.map(insight => `
                        <div class="insight-item ${insight.type}">
                            <span class="insight-icon">${insight.icon}</span>
                            <span class="insight-text">${insight.text}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    analyzeTrends(data) {
        const insights = [];
        
        if (data.length < 2) {
            insights.push({
                type: 'info',
                icon: 'ℹ️',
                text: 'Not enough data for trend analysis'
            });
            return insights;
        }
        
        // Income trend
        const incomeStart = data[0].income;
        const incomeEnd = data[data.length - 1].income;
        const incomeChange = incomeEnd - incomeStart;
        const incomePercentChange = incomeStart > 0 ? (incomeChange / incomeStart) * 100 : 0;
        
        if (incomePercentChange > 10) {
            insights.push({
                type: 'positive',
                icon: '📈',
                text: `Income increased by ${incomePercentChange.toFixed(1)}% over the period`
            });
        } else if (incomePercentChange < -10) {
            insights.push({
                type: 'negative',
                icon: '📉',
                text: `Income decreased by ${Math.abs(incomePercentChange).toFixed(1)}% over the period`
            });
        }
        
        // Expense trend
        const expenseStart = data[0].expenses;
        const expenseEnd = data[data.length - 1].expenses;
        const expenseChange = expenseEnd - expenseStart;
        const expensePercentChange = expenseStart > 0 ? (expenseChange / expenseStart) * 100 : 0;
        
        if (expensePercentChange > 15) {
            insights.push({
                type: 'warning',
                icon: '⚠️',
                text: `Expenses increased by ${expensePercentChange.toFixed(1)}% - consider budget review`
            });
        } else if (expensePercentChange < -10) {
            insights.push({
                type: 'positive',
                icon: '👍',
                text: `Great job! Expenses decreased by ${Math.abs(expensePercentChange).toFixed(1)}%`
            });
        }
        
        // Savings trend
        const avgSavings = data.reduce((sum, d) => sum + d.savings, 0) / data.length;
        if (avgSavings < 0) {
            insights.push({
                type: 'negative',
                icon: '🚨',
                text: 'Average monthly savings is negative - spending more than earning'
            });
        } else if (avgSavings > 10000) {
            insights.push({
                type: 'positive',
                icon: '💰',
                text: `Strong savings pattern with average ₹${avgSavings.toLocaleString()} per month`
            });
        }
        
        return insights;
    }
    
    generateInsights() {
        const spendingPatterns = this.analyzeSpendingPatterns();
        const optimizationSuggestions = this.generateOptimizationSuggestions();
        const financialAlerts = this.generateFinancialAlerts();
        
        this.updateInsightsSection('spendingPatterns', spendingPatterns);
        this.updateInsightsSection('optimizationSuggestions', optimizationSuggestions);
        this.updateInsightsSection('financialAlerts', financialAlerts);
    }
    
    analyzeSpendingPatterns() {
        const patterns = [];
        const currentDate = new Date();
        const categoryTotals = this.dataManager.getCategoryTotals(currentDate.getMonth(), currentDate.getFullYear());
        const totalSpending = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
        
        // Identify dominant spending categories
        Object.entries(categoryTotals).forEach(([category, amount]) => {
            const percentage = (amount / totalSpending) * 100;
            if (percentage > 30) {
                patterns.push({
                    icon: '🎯',
                    text: `${category} represents ${percentage.toFixed(1)}% of your spending`,
                    type: 'info'
                });
            }
        });
        
        // Analyze spending frequency
        const dailySpending = this.getSpendingFrequency();
        if (dailySpending.weekends > dailySpending.weekdays * 1.5) {
            patterns.push({
                icon: '🎉',
                text: 'You tend to spend more on weekends',
                type: 'info'
            });
        }
        
        return patterns;
    }
    
    generateOptimizationSuggestions() {
        const suggestions = [];
        const currentDate = new Date();
        const categoryTotals = this.dataManager.getCategoryTotals(currentDate.getMonth(), currentDate.getFullYear());
        const income = this.dataManager.getIncome(currentDate.getMonth(), currentDate.getFullYear());
        
        // Budget suggestions
        Object.entries(categoryTotals).forEach(([category, amount]) => {
            const budget = this.dataManager.getBudgetForCategory(category, currentDate.getMonth(), currentDate.getFullYear());
            if (budget === 0 && amount > income * 0.1) {
                suggestions.push({
                    icon: '🎯',
                    text: `Consider setting a budget for ${category} (currently ₹${amount.toLocaleString()})`,
                    type: 'suggestion'
                });
            }
        });
        
        // Savings suggestions
        const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
        const savingsRate = income > 0 ? ((income - totalExpenses) / income) * 100 : 0;
        
        if (savingsRate < 20) {
            suggestions.push({
                icon: '💡',
                text: 'Try to save at least 20% of your income for better financial health',
                type: 'suggestion'
            });
        }
        
        return suggestions;
    }
    
    generateFinancialAlerts() {
        const alerts = [];
        const currentDate = new Date();
        const categoryTotals = this.dataManager.getCategoryTotals(currentDate.getMonth(), currentDate.getFullYear());
        
        // Budget overage alerts
        Object.entries(categoryTotals).forEach(([category, amount]) => {
            const budget = this.dataManager.getBudgetForCategory(category, currentDate.getMonth(), currentDate.getFullYear());
            if (budget > 0 && amount > budget) {
                alerts.push({
                    icon: '⚠️',
                    text: `${category} is ₹${(amount - budget).toLocaleString()} over budget`,
                    type: 'warning'
                });
            }
        });
        
        // Low savings alert
        const income = this.dataManager.getIncome(currentDate.getMonth(), currentDate.getFullYear());
        const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
        const savings = income - totalExpenses;
        
        if (savings < 0) {
            alerts.push({
                icon: '🚨',
                text: `You're spending ₹${Math.abs(savings).toLocaleString()} more than your income this month`,
                type: 'danger'
            });
        }
        
        return alerts;
    }
    
    updateInsightsSection(sectionId, insights) {
        const container = document.getElementById(sectionId);
        if (!container) return;
        
        if (insights.length === 0) {
            container.innerHTML = '<p class="no-insights">No insights available</p>';
            return;
        }
        
        container.innerHTML = insights.map(insight => `
            <div class="insight-item ${insight.type}">
                <span class="insight-icon">${insight.icon}</span>
                <span class="insight-text">${insight.text}</span>
            </div>
        `).join('');
    }
    
    getSpendingFrequency() {
        const currentDate = new Date();
        const expenses = this.dataManager.getExpenses();
        let weekdaySpending = 0;
        let weekendSpending = 0;
        let weekdayCount = 0;
        let weekendCount = 0;
        
        Object.entries(expenses).forEach(([dateKey, dayExpenses]) => {
            const [year, month] = dateKey.split('-');
            if (parseInt(year) === currentDate.getFullYear() && parseInt(month) === currentDate.getMonth() + 1) {
                const date = new Date(dateKey);
                const dayOfWeek = date.getDay();
                const totalForDay = dayExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
                
                if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
                    weekendSpending += totalForDay;
                    weekendCount++;
                } else { // Weekday
                    weekdaySpending += totalForDay;
                    weekdayCount++;
                }
            }
        });
        
        return {
            weekdays: weekdayCount > 0 ? weekdaySpending / weekdayCount : 0,
            weekends: weekendCount > 0 ? weekendSpending / weekendCount : 0
        };
    }
    
    loadForecastData() {
        // Initialize forecast chart area
        const canvas = document.getElementById('forecastChart');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#666';
            ctx.font = '16px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('Click "Generate Forecast" to see predictions', canvas.width / 2, canvas.height / 2);
        }
    }
    
    generateForecast() {
        const period = parseInt(document.getElementById('forecastPeriod').value);
        const historicalData = this.dataManager.getTrendsData(12);
        
        if (historicalData.length < 3) {
            if (window.expenseTracker?.notificationManager) {
                window.expenseTracker.notificationManager.showWarning('Need at least 3 months of data for forecasting');
            }
            return;
        }
        
        const forecast = this.calculateForecast(historicalData, period);
        this.renderForecastChart(forecast);
        this.updateForecastSummary(forecast);
    }
    
    calculateForecast(historicalData, months) {
        // Simple linear regression for forecasting
        const forecast = [];
        
        // Calculate trends for income and expenses
        const incomeTrend = this.calculateLinearTrend(historicalData.map(d => d.income));
        const expenseTrend = this.calculateLinearTrend(historicalData.map(d => d.expenses));
        
        const lastMonth = historicalData[historicalData.length - 1];
        
        for (let i = 1; i <= months; i++) {
            const predictedIncome = Math.max(0, lastMonth.income + (incomeTrend * i));
            const predictedExpenses = Math.max(0, lastMonth.expenses + (expenseTrend * i));
            
            forecast.push({
                month: new Date(lastMonth.date.getFullYear(), lastMonth.date.getMonth() + i, 1),
                income: predictedIncome,
                expenses: predictedExpenses,
                savings: predictedIncome - predictedExpenses
            });
        }
        
        return { historical: historicalData, forecast };
    }
    
    calculateLinearTrend(values) {
        const n = values.length;
        if (n < 2) return 0;
        
        const xSum = (n * (n - 1)) / 2;
        const ySum = values.reduce((sum, val) => sum + val, 0);
        const xySum = values.reduce((sum, val, index) => sum + (val * index), 0);
        const xSquaredSum = (n * (n - 1) * (2 * n - 1)) / 6;
        
        const slope = (n * xySum - xSum * ySum) / (n * xSquaredSum - xSum * xSum);
        return slope;
    }
    
    renderForecastChart(data) {
        const canvas = document.getElementById('forecastChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const allData = [...data.historical, ...data.forecast];
        const maxValue = Math.max(...allData.map(d => Math.max(d.income, d.expenses)));
        
        this.drawForecastChart(ctx, canvas, data, maxValue);
    }
    
    drawForecastChart(ctx, canvas, data, maxValue) {
        const padding = 60;
        const chartWidth = canvas.width - 2 * padding;
        const chartHeight = canvas.height - 2 * padding;
        const allData = [...data.historical, ...data.forecast];
        
        // Draw axes and grid
        this.drawChartGrid(ctx, canvas, padding, chartHeight, maxValue);
        
        // Draw historical data (solid lines)
        this.drawForecastLine(ctx, data.historical, 'income', '#10B981', padding, chartHeight, maxValue, false);
        this.drawForecastLine(ctx, data.historical, 'expenses', '#EF4444', padding, chartHeight, maxValue, false);
        
        // Draw forecast data (dashed lines)
        this.drawForecastLine(ctx, data.forecast, 'income', '#10B981', padding, chartHeight, maxValue, true, data.historical.length - 1);
        this.drawForecastLine(ctx, data.forecast, 'expenses', '#EF4444', padding, chartHeight, maxValue, true, data.historical.length - 1);
        
        // Draw forecast area
        this.drawForecastArea(ctx, allData, padding, chartHeight, maxValue, data.historical.length);
        
        // Draw legend
        this.drawForecastLegend(ctx, canvas);
    }
    
    drawChartGrid(ctx, canvas, padding, chartHeight, maxValue) {
        // Axes
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();
        
        // Grid lines
        const gridLines = 5;
        for (let i = 0; i <= gridLines; i++) {
            const y = padding + (chartHeight / gridLines) * i;
            ctx.strokeStyle = '#f0f0f0';
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            ctx.stroke();
            
            // Y-axis labels
            const value = maxValue - (maxValue / gridLines) * i;
            ctx.fillStyle = '#666';
            ctx.font = '12px Inter';
            ctx.textAlign = 'right';
            ctx.fillText(`₹${(value / 1000).toFixed(0)}K`, padding - 10, y + 4);
        }
    }
    
    drawForecastLine(ctx, data, property, color, padding, chartHeight, maxValue, isDashed = false, startIndex = 0) {
        if (data.length === 0) return;
        
        const chartWidth = ctx.canvas.width - 2 * padding;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        
        if (isDashed) {
            ctx.setLineDash([5, 5]);
        } else {
            ctx.setLineDash([]);
        }
        
        ctx.beginPath();
        
        data.forEach((point, index) => {
            const x = padding + (chartWidth / (data.length + startIndex - 1)) * (index + startIndex);
            const y = padding + chartHeight - (point[property] / maxValue) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    drawForecastArea(ctx, allData, padding, chartHeight, maxValue, historicalLength) {
        const chartWidth = ctx.canvas.width - 2 * padding;
        
        // Draw forecast area background
        ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
        ctx.beginPath();
        
        const forecastStartX = padding + (chartWidth / (allData.length - 1)) * (historicalLength - 1);
        ctx.moveTo(forecastStartX, padding);
        ctx.lineTo(ctx.canvas.width - padding, padding);
        ctx.lineTo(ctx.canvas.width - padding, padding + chartHeight);
        ctx.lineTo(forecastStartX, padding + chartHeight);
        ctx.closePath();
        ctx.fill();
        
        // Draw forecast label
        ctx.fillStyle = '#666';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Forecast', (forecastStartX + ctx.canvas.width - padding) / 2, padding + 20);
    }
    
    drawForecastLegend(ctx, canvas) {
        const legends = [
            { label: 'Historical Income', color: '#10B981', dashed: false },
            { label: 'Historical Expenses', color: '#EF4444', dashed: false },
            { label: 'Forecast Income', color: '#10B981', dashed: true },
            { label: 'Forecast Expenses', color: '#EF4444', dashed: true }
        ];
        
        const legendY = canvas.height - 30;
        let legendX = 60;
        
        legends.forEach(legend => {
            // Draw line sample
            ctx.strokeStyle = legend.color;
            ctx.lineWidth = 2;
            if (legend.dashed) {
                ctx.setLineDash([3, 3]);
            } else {
                ctx.setLineDash([]);
            }
            ctx.beginPath();
            ctx.moveTo(legendX, legendY + 7);
            ctx.lineTo(legendX + 15, legendY + 7);
            ctx.stroke();
            ctx.setLineDash([]);
            
            ctx.fillStyle = '#333';
            ctx.font = '11px Inter';
            ctx.textAlign = 'left';
            ctx.fillText(legend.label, legendX + 20, legendY + 12);
            
            legendX += 120;
        });
    }
    
    updateForecastSummary(forecast) {
        const container = document.getElementById('forecastSummary');
        if (!container) return;
        
        const totalForecastIncome = forecast.forecast.reduce((sum, month) => sum + month.income, 0);
        const totalForecastExpenses = forecast.forecast.reduce((sum, month) => sum + month.expenses, 0);
        const totalForecastSavings = totalForecastIncome - totalForecastExpenses;
        const avgMonthlySavings = totalForecastSavings / forecast.forecast.length;
        
        container.innerHTML = `
            <div class="forecast-summary-content">
                <h4>Forecast Summary (${forecast.forecast.length} months)</h4>
                <div class="forecast-metrics">
                    <div class="forecast-metric">
                        <span class="metric-label">Projected Total Income</span>
                        <span class="metric-value positive">₹${totalForecastIncome.toLocaleString()}</span>
                    </div>
                    <div class="forecast-metric">
                        <span class="metric-label">Projected Total Expenses</span>
                        <span class="metric-value negative">₹${totalForecastExpenses.toLocaleString()}</span>
                    </div>
                    <div class="forecast-metric">
                        <span class="metric-label">Projected Total Savings</span>
                        <span class="metric-value ${totalForecastSavings >= 0 ? 'positive' : 'negative'}">
                            ₹${totalForecastSavings.toLocaleString()}
                        </span>
                    </div>
                    <div class="forecast-metric">
                        <span class="metric-label">Avg Monthly Savings</span>
                        <span class="metric-value ${avgMonthlySavings >= 0 ? 'positive' : 'negative'}">
                            ₹${avgMonthlySavings.toLocaleString()}
                        </span>
                    </div>
                </div>
                <div class="forecast-disclaimer">
                    <p><em>Forecasts are based on historical trends and may not reflect actual future results.</em></p>
                </div>
            </div>
        `;
    }
    
    exportAnalyticsReport() {
        const healthScore = this.calculateHealthScore();
        const keyMetrics = this.calculateKeyMetrics();
        const trendsData = this.dataManager.getTrendsData(12);
        
        const report = {
            generatedAt: new Date().toISOString(),
            healthScore,
            keyMetrics,
            trendsData,
            insights: {
                spendingPatterns: this.analyzeSpendingPatterns(),
                optimizationSuggestions: this.generateOptimizationSuggestions(),
                financialAlerts: this.generateFinancialAlerts()
            }
        };
        
        const jsonString = JSON.stringify(report, null, 2);
        this.downloadFile(
            jsonString,
            `financial-analytics-${this.formatDate(new Date())}.json`,
            'application/json'
        );
        
        if (window.expenseTracker?.notificationManager) {
            window.expenseTracker.notificationManager.showSuccess('Analytics report exported successfully');
        }
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
    
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }
    
    clearCache() {
        this.analyticsCache.clear();
    }
}

// Make AnalyticsManager globally available
window.AnalyticsManager = AnalyticsManager;
