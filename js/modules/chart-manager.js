/**
 * Chart Manager Module
 * Handles advanced chart rendering and visualizations
 */

class ChartManager {
    constructor(categoryColors) {
        this.categoryColors = categoryColors;
        this.chartInstances = new Map();
        this.animationDuration = 1000;
        this.animationEasing = 'easeOutQuart';
    }
    
    renderAllCharts() {
        this.renderCategoryChart();
        this.renderDailyChart();
        this.renderTrendChart();
        this.renderComparisonChart();
        this.renderBudgetChart();
    }
    
    renderCategoryChart() {
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
        
        this.drawPieChart(ctx, canvas, categoryTotals);
        this.drawHTMLLegend(categories, categoryTotals);
    }
    
    renderDailyChart() {
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
        
        this.drawBarChart(ctx, canvas, dailyTotals, days);
    }
    
    renderTrendChart() {
        const canvas = document.getElementById('trendChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const trendData = this.getTrendData();
        if (trendData.length < 2) {
            this.drawNoDataMessage(ctx, canvas, 'Need more data for trends');
            return;
        }
        
        this.drawLineChart(ctx, canvas, trendData);
    }
    
    renderComparisonChart() {
        const canvas = document.getElementById('comparisonChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const comparisonData = this.getComparisonData();
        this.drawComparisonChart(ctx, canvas, comparisonData);
    }
    
    renderBudgetChart() {
        const canvas = document.getElementById('budgetChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const budgetData = this.getBudgetData();
        if (Object.keys(budgetData).length === 0) {
            this.drawNoDataMessage(ctx, canvas, 'No budgets set');
            return;
        }
        
        this.drawBudgetProgressChart(ctx, canvas, budgetData);
    }
    
    // Enhanced Pie Chart with animations and interactions
    drawPieChart(ctx, canvas, categoryTotals) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 40;
        const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
        
        let currentAngle = -Math.PI / 2;
        const categories = Object.keys(categoryTotals);
        
        // Draw drop shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        
        categories.forEach((category, index) => {
            const percentage = categoryTotals[category] / total;
            const sliceAngle = percentage * 2 * Math.PI;
            const color = this.categoryColors[category] || '#64748B';
            
            // Draw slice with gradient
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            gradient.addColorStop(0, this.lightenColor(color, 0.3));
            gradient.addColorStop(1, color);
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = gradient;
            ctx.fill();
            
            // Draw slice border
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw percentage label
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelRadius = radius * 0.7;
            const labelX = centerX + Math.cos(labelAngle) * labelRadius;
            const labelY = centerY + Math.sin(labelAngle) * labelRadius;
            
            if (percentage > 0.05) { // Only show label if slice is large enough
                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 12px Inter';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.lineWidth = 1;
                ctx.strokeText(`${Math.round(percentage * 100)}%`, labelX, labelY);
                ctx.fillText(`${Math.round(percentage * 100)}%`, labelX, labelY);
            }
            
            currentAngle += sliceAngle;
        });
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Draw center circle for donut effect
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.4, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Add total amount in center
        ctx.fillStyle = '#374151';
        ctx.font = 'bold 16px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Total', centerX, centerY - 8);
        ctx.font = '14px Inter';
        ctx.fillText(`₹${total.toLocaleString()}`, centerX, centerY + 8);
    }
    
    // Enhanced Bar Chart with animations
    drawBarChart(ctx, canvas, dailyTotals, days) {
        const padding = 50;
        const chartWidth = canvas.width - 2 * padding;
        const chartHeight = canvas.height - 2 * padding;
        const maxAmount = Math.max(...Object.values(dailyTotals), 1);
        
        // Draw grid and axes
        this.drawGrid(ctx, canvas, padding, chartHeight, maxAmount);
        
        const barWidth = Math.max(chartWidth / days.length - 10, 20);
        const barSpacing = (chartWidth - (barWidth * days.length)) / (days.length - 1);
        
        days.forEach((day, index) => {
            const amount = dailyTotals[day];
            const barHeight = (amount / maxAmount) * chartHeight;
            const x = padding + index * (barWidth + barSpacing);
            const y = canvas.height - padding - barHeight;
            
            // Draw bar with gradient
            const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
            gradient.addColorStop(0, '#3B82F6');
            gradient.addColorStop(1, '#1E40AF');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth, barHeight);
            
            // Draw bar border
            ctx.strokeStyle = '#1E40AF';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, barWidth, barHeight);
            
            // Draw day label
            ctx.fillStyle = '#6B7280';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(day, x + barWidth / 2, canvas.height - padding + 20);
            
            // Draw amount label on bar
            if (barHeight > 30) {
                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 11px Inter';
                const amountText = amount > 1000 ? `₹${(amount / 1000).toFixed(1)}K` : `₹${amount}`;
                ctx.fillText(amountText, x + barWidth / 2, y + 15);
            }
        });
    }
    
    // Line Chart for trends
    drawLineChart(ctx, canvas, trendData) {
        const padding = 60;
        const chartWidth = canvas.width - 2 * padding;
        const chartHeight = canvas.height - 2 * padding;
        
        const maxValue = Math.max(...trendData.map(d => Math.max(d.income, d.expenses)), 1);
        
        // Draw grid
        this.drawGrid(ctx, canvas, padding, chartHeight, maxValue);
        
        // Draw income line
        this.drawTrendLine(ctx, trendData, 'income', '#10B981', padding, chartWidth, chartHeight, maxValue);
        
        // Draw expenses line
        this.drawTrendLine(ctx, trendData, 'expenses', '#EF4444', padding, chartWidth, chartHeight, maxValue);
        
        // Draw savings area
        this.drawSavingsArea(ctx, trendData, padding, chartWidth, chartHeight, maxValue);
        
        // Draw legend
        this.drawTrendLegend(ctx, canvas);
    }
    
    drawTrendLine(ctx, data, property, color, padding, chartWidth, chartHeight, maxValue) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
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
        
        // Draw points with glow effect
        data.forEach((point, index) => {
            const x = padding + (chartWidth / (data.length - 1)) * index;
            const y = padding + chartHeight - (point[property] / maxValue) * chartHeight;
            
            // Glow effect
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
            
            // Inner circle
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();
        });
        
        ctx.shadowBlur = 0;
    }
    
    drawSavingsArea(ctx, data, padding, chartWidth, chartHeight, maxValue) {
        ctx.globalAlpha = 0.2;
        
        const gradient = ctx.createLinearGradient(0, padding, 0, padding + chartHeight);
        gradient.addColorStop(0, '#10B981');
        gradient.addColorStop(1, '#059669');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        
        // Draw savings area between income and expenses
        data.forEach((point, index) => {
            const x = padding + (chartWidth / (data.length - 1)) * index;
            const incomeY = padding + chartHeight - (point.income / maxValue) * chartHeight;
            const expensesY = padding + chartHeight - (point.expenses / maxValue) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, incomeY);
            } else {
                ctx.lineTo(x, incomeY);
            }
        });
        
        // Close the path along expenses line
        for (let i = data.length - 1; i >= 0; i--) {
            const x = padding + (chartWidth / (data.length - 1)) * i;
            const expensesY = padding + chartHeight - (data[i].expenses / maxValue) * chartHeight;
            ctx.lineTo(x, expensesY);
        }
        
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
    }
    
    // Comparison Chart (Current vs Previous Month)
    drawComparisonChart(ctx, canvas, data) {
        if (!data.current || !data.previous) {
            this.drawNoDataMessage(ctx, canvas, 'Insufficient data for comparison');
            return;
        }
        
        const padding = 50;
        const chartWidth = canvas.width - 2 * padding;
        const chartHeight = canvas.height - 2 * padding;
        
        const categories = ['Income', 'Expenses', 'Savings'];
        const barWidth = chartWidth / categories.length / 2 - 10;
        
        categories.forEach((category, index) => {
            const currentValue = data.current[category.toLowerCase()] || 0;
            const previousValue = data.previous[category.toLowerCase()] || 0;
            const maxValue = Math.max(currentValue, previousValue, 1);
            
            const x = padding + index * (chartWidth / categories.length);
            
            // Previous month bar
            const prevHeight = (previousValue / maxValue) * chartHeight * 0.8;
            const prevY = canvas.height - padding - prevHeight;
            
            ctx.fillStyle = '#94A3B8';
            ctx.fillRect(x, prevY, barWidth, prevHeight);
            
            // Current month bar
            const currHeight = (currentValue / maxValue) * chartHeight * 0.8;
            const currY = canvas.height - padding - currHeight;
            
            ctx.fillStyle = this.getCategoryComparisonColor(category);
            ctx.fillRect(x + barWidth + 5, currY, barWidth, currHeight);
            
            // Category label
            ctx.fillStyle = '#374151';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(category, x + barWidth, canvas.height - padding + 20);
            
            // Value labels
            ctx.font = '10px Inter';
            if (prevHeight > 20) {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText(`₹${this.formatAmount(previousValue)}`, x + barWidth / 2, prevY + 15);
            }
            if (currHeight > 20) {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText(`₹${this.formatAmount(currentValue)}`, x + barWidth + 5 + barWidth / 2, currY + 15);
            }
        });
        
        // Legend
        ctx.fillStyle = '#94A3B8';
        ctx.fillRect(padding, padding - 30, 15, 15);
        ctx.fillStyle = '#374151';
        ctx.font = '12px Inter';
        ctx.textAlign = 'left';
        ctx.fillText('Previous Month', padding + 20, padding - 20);
        
        ctx.fillStyle = '#3B82F6';
        ctx.fillRect(padding + 120, padding - 30, 15, 15);
        ctx.fillText('Current Month', padding + 140, padding - 20);
    }
    
    // Budget Progress Chart
    drawBudgetProgressChart(ctx, canvas, budgetData) {
        const padding = 50;
        const categories = Object.keys(budgetData);
        const barHeight = (canvas.height - 2 * padding) / categories.length - 10;
        
        categories.forEach((category, index) => {
            const data = budgetData[category];
            const y = padding + index * (barHeight + 10);
            const maxWidth = canvas.width - 2 * padding - 150;
            
            // Background bar
            ctx.fillStyle = '#F3F4F6';
            ctx.fillRect(padding + 100, y, maxWidth, barHeight);
            
            // Progress bar
            const progressWidth = (data.spent / data.budget) * maxWidth;
            const color = this.getBudgetColor(data.spent / data.budget);
            
            ctx.fillStyle = color;
            ctx.fillRect(padding + 100, y, Math.min(progressWidth, maxWidth), barHeight);
            
            // Category label
            ctx.fillStyle = '#374151';
            ctx.font = '14px Inter';
            ctx.textAlign = 'right';
            ctx.fillText(category, padding + 90, y + barHeight / 2 + 5);
            
            // Amount labels
            ctx.font = '12px Inter';
            ctx.textAlign = 'left';
            ctx.fillText(`₹${data.spent.toLocaleString()}`, padding + 100 + 5, y + barHeight / 2 + 5);
            
            ctx.textAlign = 'right';
            ctx.fillText(`₹${data.budget.toLocaleString()}`, padding + 100 + maxWidth - 5, y + barHeight / 2 + 5);
            
            // Percentage
            const percentage = (data.spent / data.budget) * 100;
            ctx.textAlign = 'center';
            ctx.fillStyle = percentage > 100 ? '#FFFFFF' : '#374151';
            ctx.fillText(`${percentage.toFixed(1)}%`, padding + 100 + maxWidth / 2, y + barHeight / 2 + 5);
        });
    }
    
    // Utility methods
    drawGrid(ctx, canvas, padding, chartHeight, maxValue) {
        const gridLines = 5;
        
        // Horizontal grid lines
        for (let i = 0; i <= gridLines; i++) {
            const y = padding + (chartHeight / gridLines) * i;
            
            ctx.strokeStyle = '#F3F4F6';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            ctx.stroke();
            
            // Y-axis labels
            const value = maxValue - (maxValue / gridLines) * i;
            ctx.fillStyle = '#6B7280';
            ctx.font = '11px Inter';
            ctx.textAlign = 'right';
            ctx.fillText(this.formatAmount(value), padding - 10, y + 4);
        }
        
        // Y-axis line
        ctx.strokeStyle = '#D1D5DB';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.stroke();
        
        // X-axis line
        ctx.beginPath();
        ctx.moveTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();
    }
    
    drawNoDataMessage(ctx, canvas, message) {
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '16px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    }
    
    drawHTMLLegend(categories, totals) {
        const legendContainer = document.getElementById('categoryLegend');
        if (!legendContainer) return;
        
        // Clear existing legend items
        const existingItems = legendContainer.querySelectorAll('.legend-item');
        existingItems.forEach(item => item.remove());
        
        if (categories.length === 0) {
            const noDataDiv = document.createElement('div');
            noDataDiv.className = 'legend-item';
            noDataDiv.innerHTML = '<span class="legend-text" style="color: var(--text-muted);">No data</span>';
            legendContainer.appendChild(noDataDiv);
            return;
        }
        
        const sortedCategories = categories.sort((a, b) => totals[b] - totals[a]);
        
        sortedCategories.forEach((category, index) => {
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            legendItem.style.animationDelay = `${index * 100}ms`;
            
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
            amount.textContent = `₹${totals[category].toLocaleString()}`;
            
            const percentage = document.createElement('div');
            percentage.className = 'legend-percentage';
            const total = Object.values(totals).reduce((sum, val) => sum + val, 0);
            percentage.textContent = `${((totals[category] / total) * 100).toFixed(1)}%`;
            
            textContainer.appendChild(categoryName);
            textContainer.appendChild(amount);
            textContainer.appendChild(percentage);
            
            legendItem.appendChild(colorBox);
            legendItem.appendChild(textContainer);
            
            legendContainer.appendChild(legendItem);
        });
    }
    
    drawTrendLegend(ctx, canvas) {
        const legends = [
            { label: 'Income', color: '#10B981' },
            { label: 'Expenses', color: '#EF4444' },
            { label: 'Savings Area', color: '#10B981', alpha: 0.3 }
        ];
        
        const legendY = canvas.height - 30;
        let legendX = 60;
        
        legends.forEach(legend => {
            if (legend.alpha) {
                ctx.globalAlpha = legend.alpha;
            }
            
            ctx.fillStyle = legend.color;
            ctx.fillRect(legendX, legendY, 15, 15);
            ctx.globalAlpha = 1;
            
            ctx.fillStyle = '#374151';
            ctx.font = '12px Inter';
            ctx.textAlign = 'left';
            ctx.fillText(legend.label, legendX + 20, legendY + 12);
            
            legendX += 100;
        });
    }
    
    // Data retrieval methods
    getCategoryTotals() {
        if (!window.expenseTracker?.dataManager) return {};
        
        const currentDate = new Date();
        return window.expenseTracker.dataManager.getCategoryTotals(
            currentDate.getMonth(),
            currentDate.getFullYear()
        );
    }
    
    getDailyTotals() {
        if (!window.expenseTracker?.dataManager) return {};
        
        const currentDate = new Date();
        return window.expenseTracker.dataManager.getDailyTotals(
            currentDate.getMonth(),
            currentDate.getFullYear()
        );
    }
    
    getTrendData() {
        if (!window.expenseTracker?.dataManager) return [];
        
        return window.expenseTracker.dataManager.getTrendsData(6);
    }
    
    getComparisonData() {
        if (!window.expenseTracker?.dataManager) return {};
        
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        let prevMonth = currentMonth - 1;
        let prevYear = currentYear;
        if (prevMonth < 0) {
            prevMonth = 11;
            prevYear = currentYear - 1;
        }
        
        const dataManager = window.expenseTracker.dataManager;
        
        return {
            current: {
                income: dataManager.getIncome(currentMonth, currentYear),
                expenses: dataManager.getTotalMonthlyExpenses(currentMonth, currentYear),
                savings: dataManager.getIncome(currentMonth, currentYear) - 
                        dataManager.getTotalMonthlyExpenses(currentMonth, currentYear)
            },
            previous: {
                income: dataManager.getIncome(prevMonth, prevYear),
                expenses: dataManager.getTotalMonthlyExpenses(prevMonth, prevYear),
                savings: dataManager.getIncome(prevMonth, prevYear) - 
                        dataManager.getTotalMonthlyExpenses(prevMonth, prevYear)
            }
        };
    }
    
    getBudgetData() {
        if (!window.expenseTracker?.dataManager) return {};
        
        const currentDate = new Date();
        const categoryTotals = this.getCategoryTotals();
        const budgetData = {};
        
        const categories = ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Education', 'Other'];
        
        categories.forEach(category => {
            const budget = window.expenseTracker.dataManager.getBudgetForCategory(
                category,
                currentDate.getMonth(),
                currentDate.getFullYear()
            );
            
            if (budget > 0) {
                budgetData[category] = {
                    budget,
                    spent: categoryTotals[category] || 0
                };
            }
        });
        
        return budgetData;
    }
    
    // Helper methods
    lightenColor(color, amount) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * amount * 100);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    getCategoryComparisonColor(category) {
        const colors = {
            'Income': '#10B981',
            'Expenses': '#EF4444',
            'Savings': '#3B82F6'
        };
        return colors[category] || '#6B7280';
    }
    
    getBudgetColor(ratio) {
        if (ratio > 1) return '#EF4444'; // Over budget - red
        if (ratio > 0.8) return '#F59E0B'; // Warning - yellow
        return '#10B981'; // Good - green
    }
    
    formatAmount(amount) {
        if (amount >= 100000) {
            return `${(amount / 100000).toFixed(1)}L`;
        } else if (amount >= 1000) {
            return `${(amount / 1000).toFixed(1)}K`;
        }
        return amount.toFixed(0);
    }
    
    // Animation helpers
    animateChart(canvas, drawFunction) {
        const ctx = canvas.getContext('2d');
        let start = null;
        
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / this.animationDuration, 1);
            
            // Easing function
            const easedProgress = this.easeOutQuart(progress);
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawFunction(easedProgress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    easeOutQuart(t) {
        return 1 - (--t) * t * t * t;
    }
    
    // Chart export functionality
    exportChart(chartId, filename) {
        const canvas = document.getElementById(chartId);
        if (!canvas) return;
        
        const link = document.createElement('a');
        link.download = filename || `${chartId}-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL();
        link.click();
    }
    
    exportAllCharts() {
        const charts = ['categoryChart', 'dailyChart', 'trendChart', 'comparisonChart', 'budgetChart'];
        
        charts.forEach((chartId, index) => {
            setTimeout(() => {
                this.exportChart(chartId);
            }, index * 500); // Stagger exports
        });
    }
    
    // Responsive chart handling
    resizeCharts() {
        // This would be called on window resize
        setTimeout(() => {
            this.renderAllCharts();
        }, 100);
    }
    
    // Theme support
    updateChartColors(theme) {
        // Update chart colors based on theme
        const themeColors = {
            light: {
                grid: '#F3F4F6',
                text: '#374151',
                background: '#FFFFFF'
            },
            dark: {
                grid: '#374151',
                text: '#F9FAFB',
                background: '#1F2937'
            }
        };
        
        this.currentTheme = themeColors[theme] || themeColors.light;
        this.renderAllCharts();
    }
}

// Make ChartManager globally available
window.ChartManager = ChartManager;
