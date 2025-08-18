/**
 * Goals Manager Module
 * Handles financial goals, savings targets, and progress tracking
 */

class GoalsManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.goalTypes = {
            'savings': { label: 'Savings Target', icon: '💰' },
            'expense': { label: 'Expense Limit', icon: '🎯' },
            'emergency': { label: 'Emergency Fund', icon: '🛡️' },
            'investment': { label: 'Investment Goal', icon: '📈' },
            'vacation': { label: 'Vacation Fund', icon: '✈️' },
            'purchase': { label: 'Purchase Goal', icon: '🛒' },
            'debt': { label: 'Debt Payoff', icon: '💳' },
            'custom': { label: 'Custom Goal', icon: '🎪' }
        };
    }
    
    showGoalsModal() {
        const modal = document.getElementById('goalsModal');
        if (!modal) {
            this.createGoalsModal();
        }
        
        this.loadGoalsData();
        document.getElementById('goalsModal').classList.add('active');
        document.getElementById('overlay').classList.add('active');
    }
    
    createGoalsModal() {
        const modalHTML = `
            <div id="goalsModal" class="modal goals-modal">
                <div class="modal-content goals-modal-content">
                    <div class="modal-header">
                        <h3>Financial Goals & Targets</h3>
                        <button id="closeGoalsModal" class="close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="goals-tabs">
                            <button class="tab-btn active" data-tab="overview">Overview</button>
                            <button class="tab-btn" data-tab="add">Add Goal</button>
                            <button class="tab-btn" data-tab="manage">Manage Goals</button>
                            <button class="tab-btn" data-tab="insights">Insights</button>
                        </div>
                        
                        <div class="tab-content active" id="overviewTab">
                            <div class="goals-overview">
                                <div class="goals-summary">
                                    <div class="summary-cards">
                                        <div class="summary-card">
                                            <div class="card-header">
                                                <span class="card-icon">🎯</span>
                                                <span class="card-title">Active Goals</span>
                                            </div>
                                            <div class="card-value" id="activeGoalsCount">0</div>
                                        </div>
                                        <div class="summary-card">
                                            <div class="card-header">
                                                <span class="card-icon">✅</span>
                                                <span class="card-title">Completed</span>
                                            </div>
                                            <div class="card-value" id="completedGoalsCount">0</div>
                                        </div>
                                        <div class="summary-card">
                                            <div class="card-header">
                                                <span class="card-icon">💰</span>
                                                <span class="card-title">Total Target</span>
                                            </div>
                                            <div class="card-value" id="totalTargetAmount">₹0</div>
                                        </div>
                                        <div class="summary-card">
                                            <div class="card-header">
                                                <span class="card-icon">📊</span>
                                                <span class="card-title">Progress</span>
                                            </div>
                                            <div class="card-value" id="overallProgress">0%</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="goals-quick-view" id="goalsQuickView">
                                    <h4>Recent Goals</h4>
                                    <div class="quick-goals-list" id="quickGoalsList"></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tab-content" id="addTab">
                            <div class="add-goal-section">
                                <form id="goalForm">
                                    <div class="form-grid">
                                        <div class="form-group">
                                            <label for="goalName">Goal Name</label>
                                            <input type="text" id="goalName" placeholder="e.g., Emergency Fund, New Car" required>
                                        </div>
                                        
                                        <div class="form-group">
                                            <label for="goalType">Goal Type</label>
                                            <select id="goalType" required>
                                                ${Object.entries(this.goalTypes).map(([key, type]) => 
                                                    `<option value="${key}">${type.icon} ${type.label}</option>`
                                                ).join('')}
                                            </select>
                                        </div>
                                        
                                        <div class="form-group">
                                            <label for="goalAmount">Target Amount (₹)</label>
                                            <input type="number" id="goalAmount" placeholder="0.00" min="0" step="0.01" required>
                                        </div>
                                        
                                        <div class="form-group">
                                            <label for="goalTargetDate">Target Date</label>
                                            <input type="date" id="goalTargetDate" required>
                                        </div>
                                        
                                        <div class="form-group">
                                            <label for="goalPriority">Priority</label>
                                            <select id="goalPriority">
                                                <option value="low">🟢 Low</option>
                                                <option value="medium" selected>🟡 Medium</option>
                                                <option value="high">🔴 High</option>
                                            </select>
                                        </div>
                                        
                                        <div class="form-group">
                                            <label for="goalCategory">Related Category (Optional)</label>
                                            <select id="goalCategory">
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
                                        </div>
                                    </div>
                                    
                                    <div class="form-group full-width">
                                        <label for="goalDescription">Description (Optional)</label>
                                        <textarea id="goalDescription" placeholder="Describe your goal and why it's important to you..." rows="3"></textarea>
                                    </div>
                                    
                                    <div class="goal-preview" id="goalPreview">
                                        <h4>Goal Preview</h4>
                                        <div class="preview-content" id="previewContent">
                                            <p>Fill in the form to see a preview of your goal</p>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                        
                        <div class="tab-content" id="manageTab">
                            <div class="manage-goals-section">
                                <div class="goals-filters">
                                    <select id="goalsFilter">
                                        <option value="all">All Goals</option>
                                        <option value="active">Active</option>
                                        <option value="completed">Completed</option>
                                        <option value="overdue">Overdue</option>
                                    </select>
                                    <select id="goalsSortBy">
                                        <option value="date-asc">Target Date (Nearest First)</option>
                                        <option value="date-desc">Target Date (Farthest First)</option>
                                        <option value="amount-desc">Amount (Highest First)</option>
                                        <option value="amount-asc">Amount (Lowest First)</option>
                                        <option value="priority">Priority</option>
                                        <option value="progress">Progress</option>
                                    </select>
                                </div>
                                <div id="goalsList" class="goals-list">
                                    <div class="loading">Loading goals...</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tab-content" id="insightsTab">
                            <div class="insights-section">
                                <div class="insights-grid">
                                    <div class="insight-card">
                                        <h4>🎯 Goal Achievement Rate</h4>
                                        <div id="achievementRate" class="insight-value">0%</div>
                                        <div class="insight-description">Percentage of goals completed on time</div>
                                    </div>
                                    <div class="insight-card">
                                        <h4>💰 Average Goal Amount</h4>
                                        <div id="averageGoalAmount" class="insight-value">₹0</div>
                                        <div class="insight-description">Average target amount across all goals</div>
                                    </div>
                                    <div class="insight-card">
                                        <h4>📅 Average Timeline</h4>
                                        <div id="averageTimeline" class="insight-value">0 days</div>
                                        <div class="insight-description">Average time to complete goals</div>
                                    </div>
                                    <div class="insight-card">
                                        <h4>🏆 Most Common Type</h4>
                                        <div id="mostCommonType" class="insight-value">None</div>
                                        <div class="insight-description">Your most frequent goal type</div>
                                    </div>
                                </div>
                                <div class="recommendations" id="goalsRecommendations">
                                    <h4>💡 Recommendations</h4>
                                    <div id="recommendationsList" class="recommendations-list"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="saveGoal" class="btn btn-primary">Save Goal</button>
                        <button id="closeGoalsModal" class="btn btn-secondary">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.bindGoalsEvents();
    }
    
    bindGoalsEvents() {
        // Close modal
        document.querySelectorAll('#closeGoalsModal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('goalsModal').classList.remove('active');
                document.getElementById('overlay').classList.remove('active');
            });
        });
        
        // Tab switching
        document.querySelectorAll('.goals-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchGoalsTab(tabName);
            });
        });
        
        // Save goal
        document.getElementById('saveGoal')?.addEventListener('click', () => this.saveGoal());
        
        // Form inputs for preview
        ['goalName', 'goalType', 'goalAmount', 'goalTargetDate', 'goalPriority'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', () => this.updateGoalPreview());
        });
        
        // Goals management
        document.getElementById('goalsFilter')?.addEventListener('change', () => this.filterGoals());
        document.getElementById('goalsSortBy')?.addEventListener('change', () => this.sortGoals());
        
        // Set default target date to 1 year from now
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        document.getElementById('goalTargetDate').value = oneYearFromNow.toISOString().split('T')[0];
    }
    
    switchGoalsTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.goals-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.goals-modal .tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');
        
        // Hide/show save button based on tab
        const saveBtn = document.getElementById('saveGoal');
        if (tabName === 'add') {
            saveBtn.style.display = 'block';
        } else {
            saveBtn.style.display = 'none';
        }
        
        // Load specific tab data
        switch (tabName) {
            case 'overview':
                this.updateOverview();
                break;
            case 'add':
                this.updateGoalPreview();
                break;
            case 'manage':
                this.loadGoalsList();
                break;
            case 'insights':
                this.generateInsights();
                break;
        }
    }
    
    loadGoalsData() {
        this.updateOverview();
    }
    
    updateOverview() {
        const goals = this.dataManager.getGoals();
        const activeGoals = goals.filter(g => g.status === 'active');
        const completedGoals = goals.filter(g => g.status === 'completed');
        const totalTarget = activeGoals.reduce((sum, g) => sum + g.amount, 0);
        
        // Calculate overall progress
        let totalProgress = 0;
        if (activeGoals.length > 0) {
            totalProgress = activeGoals.reduce((sum, goal) => {
                const progress = this.calculateGoalProgress(goal);
                return sum + progress.percentage;
            }, 0) / activeGoals.length;
        }
        
        // Update summary cards
        document.getElementById('activeGoalsCount').textContent = activeGoals.length;
        document.getElementById('completedGoalsCount').textContent = completedGoals.length;
        document.getElementById('totalTargetAmount').textContent = `₹${totalTarget.toLocaleString()}`;
        document.getElementById('overallProgress').textContent = `${Math.round(totalProgress)}%`;
        
        // Update quick goals view
        this.updateQuickGoalsView(goals.slice(0, 5));
    }
    
    updateQuickGoalsView(goals) {
        const container = document.getElementById('quickGoalsList');
        if (!container) return;
        
        if (goals.length === 0) {
            container.innerHTML = '<p class="empty-goals">No goals set yet. Create your first goal to get started!</p>';
            return;
        }
        
        container.innerHTML = goals.map(goal => {
            const progress = this.calculateGoalProgress(goal);
            const daysRemaining = this.getDaysRemaining(goal.targetDate);
            
            return `
                <div class="quick-goal-item ${goal.status}">
                    <div class="goal-info">
                        <div class="goal-header">
                            <span class="goal-icon">${this.goalTypes[goal.type]?.icon || '🎯'}</span>
                            <span class="goal-name">${goal.name}</span>
                            <span class="goal-priority priority-${goal.priority}"></span>
                        </div>
                        <div class="goal-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progress.percentage}%"></div>
                            </div>
                            <span class="progress-text">${Math.round(progress.percentage)}%</span>
                        </div>
                        <div class="goal-details">
                            <span class="goal-amount">₹${progress.current.toLocaleString()} / ₹${goal.amount.toLocaleString()}</span>
                            <span class="goal-deadline ${daysRemaining < 30 ? 'urgent' : ''}">${daysRemaining} days left</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    updateGoalPreview() {
        const name = document.getElementById('goalName').value;
        const type = document.getElementById('goalType').value;
        const amount = parseFloat(document.getElementById('goalAmount').value) || 0;
        const targetDate = document.getElementById('goalTargetDate').value;
        const priority = document.getElementById('goalPriority').value;
        
        const previewContainer = document.getElementById('previewContent');
        
        if (!name || !amount || !targetDate) {
            previewContainer.innerHTML = '<p>Fill in the required fields to see a preview</p>';
            return;
        }
        
        const daysToTarget = Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24));
        const monthlyTarget = daysToTarget > 0 ? (amount / (daysToTarget / 30)).toFixed(0) : amount;
        const weeklyTarget = daysToTarget > 0 ? (amount / (daysToTarget / 7)).toFixed(0) : amount;
        const dailyTarget = daysToTarget > 0 ? (amount / daysToTarget).toFixed(0) : amount;
        
        const typeInfo = this.goalTypes[type] || { icon: '🎯', label: 'Custom Goal' };
        
        previewContainer.innerHTML = `
            <div class="goal-preview-card">
                <div class="preview-header">
                    <span class="preview-icon">${typeInfo.icon}</span>
                    <span class="preview-name">${name}</span>
                    <span class="preview-priority priority-${priority}"></span>
                </div>
                <div class="preview-amount">₹${amount.toLocaleString()}</div>
                <div class="preview-deadline">Target: ${new Date(targetDate).toLocaleDateString()}</div>
                <div class="preview-breakdown">
                    <div class="breakdown-item">
                        <span class="breakdown-label">Monthly:</span>
                        <span class="breakdown-value">₹${monthlyTarget}</span>
                    </div>
                    <div class="breakdown-item">
                        <span class="breakdown-label">Weekly:</span>
                        <span class="breakdown-value">₹${weeklyTarget}</span>
                    </div>
                    <div class="breakdown-item">
                        <span class="breakdown-label">Daily:</span>
                        <span class="breakdown-value">₹${dailyTarget}</span>
                    </div>
                </div>
                ${daysToTarget < 0 ? '<div class="preview-warning">⚠️ Target date is in the past</div>' : ''}
            </div>
        `;
    }
    
    saveGoal() {
        const goalData = {
            name: document.getElementById('goalName').value.trim(),
            type: document.getElementById('goalType').value,
            amount: parseFloat(document.getElementById('goalAmount').value),
            targetDate: document.getElementById('goalTargetDate').value,
            priority: document.getElementById('goalPriority').value,
            category: document.getElementById('goalCategory').value || null,
            description: document.getElementById('goalDescription').value.trim(),
            status: 'active',
            progress: 0
        };
        
        // Validation
        if (!goalData.name || !goalData.amount || goalData.amount <= 0 || !goalData.targetDate) {
            if (window.expenseTracker?.notificationManager) {
                window.expenseTracker.notificationManager.showError('Please fill in all required fields');
            }
            return;
        }
        
        if (new Date(goalData.targetDate) <= new Date()) {
            if (window.expenseTracker?.notificationManager) {
                window.expenseTracker.notificationManager.showError('Target date must be in the future');
            }
            return;
        }
        
        const goalId = this.dataManager.addGoal(goalData);
        if (goalId) {
            if (window.expenseTracker?.notificationManager) {
                window.expenseTracker.notificationManager.showSuccess('Goal created successfully');
            }
            this.clearGoalForm();
            this.updateOverview();
            this.switchGoalsTab('overview');
        }
    }
    
    clearGoalForm() {
        document.getElementById('goalName').value = '';
        document.getElementById('goalType').value = 'savings';
        document.getElementById('goalAmount').value = '';
        document.getElementById('goalPriority').value = 'medium';
        document.getElementById('goalCategory').value = '';
        document.getElementById('goalDescription').value = '';
        
        // Reset target date to 1 year from now
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        document.getElementById('goalTargetDate').value = oneYearFromNow.toISOString().split('T')[0];
        
        this.updateGoalPreview();
    }
    
    loadGoalsList() {
        const goals = this.dataManager.getGoals();
        this.renderGoalsList(goals);
    }
    
    renderGoalsList(goals) {
        const container = document.getElementById('goalsList');
        if (!container) return;
        
        if (goals.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No goals found.</p>
                    <button class="btn btn-primary" onclick="window.expenseTracker.goalsManager.switchGoalsTab('add')">
                        Create Your First Goal
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = goals.map(goal => this.createGoalItemHTML(goal)).join('');
        this.bindGoalItemEvents();
    }
    
    createGoalItemHTML(goal) {
        const progress = this.calculateGoalProgress(goal);
        const daysRemaining = this.getDaysRemaining(goal.targetDate);
        const typeInfo = this.goalTypes[goal.type] || { icon: '🎯', label: 'Custom' };
        
        return `
            <div class="goal-item ${goal.status}" data-goal-id="${goal.id}">
                <div class="goal-header">
                    <div class="goal-title">
                        <span class="goal-icon">${typeInfo.icon}</span>
                        <span class="goal-name">${goal.name}</span>
                        <span class="goal-type">${typeInfo.label}</span>
                    </div>
                    <div class="goal-priority">
                        <span class="priority-indicator priority-${goal.priority}"></span>
                    </div>
                </div>
                
                <div class="goal-progress-section">
                    <div class="progress-info">
                        <span class="progress-amount">₹${progress.current.toLocaleString()} / ₹${goal.amount.toLocaleString()}</span>
                        <span class="progress-percentage">${Math.round(progress.percentage)}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill ${this.getProgressClass(progress.percentage)}" 
                             style="width: ${Math.min(progress.percentage, 100)}%"></div>
                    </div>
                </div>
                
                <div class="goal-details">
                    <div class="goal-timeline">
                        <span class="timeline-label">Target:</span>
                        <span class="timeline-date">${new Date(goal.targetDate).toLocaleDateString()}</span>
                        <span class="timeline-remaining ${daysRemaining < 30 ? 'urgent' : daysRemaining < 0 ? 'overdue' : ''}">
                            ${daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`}
                        </span>
                    </div>
                    ${goal.description ? `<div class="goal-description">${goal.description}</div>` : ''}
                </div>
                
                <div class="goal-actions">
                    ${goal.status === 'active' ? `
                        <button class="action-btn update-progress" data-goal-id="${goal.id}">📊 Update Progress</button>
                        <button class="action-btn edit-goal" data-goal-id="${goal.id}">✏️ Edit</button>
                        ${progress.percentage >= 100 ? `
                            <button class="action-btn complete-goal" data-goal-id="${goal.id}">✅ Mark Complete</button>
                        ` : ''}
                    ` : ''}
                    <button class="action-btn delete-goal" data-goal-id="${goal.id}">🗑️ Delete</button>
                </div>
            </div>
        `;
    }
    
    getProgressClass(percentage) {
        if (percentage >= 100) return 'complete';
        if (percentage >= 75) return 'excellent';
        if (percentage >= 50) return 'good';
        if (percentage >= 25) return 'fair';
        return 'poor';
    }
    
    bindGoalItemEvents() {
        // Update progress
        document.querySelectorAll('.update-progress').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const goalId = e.target.dataset.goalId;
                this.showUpdateProgressModal(goalId);
            });
        });
        
        // Edit goal
        document.querySelectorAll('.edit-goal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const goalId = e.target.dataset.goalId;
                this.editGoal(goalId);
            });
        });
        
        // Complete goal
        document.querySelectorAll('.complete-goal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const goalId = e.target.dataset.goalId;
                this.completeGoal(goalId);
            });
        });
        
        // Delete goal
        document.querySelectorAll('.delete-goal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const goalId = e.target.dataset.goalId;
                this.deleteGoal(goalId);
            });
        });
    }
    
    calculateGoalProgress(goal) {
        let current = 0;
        
        switch (goal.type) {
            case 'savings':
                // Calculate based on current savings
                current = this.dataManager.getAllTimeIncome() - this.dataManager.getAllTimeExpenses();
                current = Math.max(0, current);
                break;
            case 'expense':
                // Calculate based on category expenses if linked
                if (goal.category) {
                    const currentDate = new Date();
                    const categoryTotals = this.dataManager.getCategoryTotals(currentDate.getMonth(), currentDate.getFullYear());
                    current = categoryTotals[goal.category] || 0;
                    // For expense goals, we want to track how much is left, not spent
                    current = Math.max(0, goal.amount - current);
                }
                break;
            default:
                // Use manual progress for other goal types
                current = (goal.progress / 100) * goal.amount;
                break;
        }
        
        const percentage = goal.amount > 0 ? (current / goal.amount) * 100 : 0;
        
        return {
            current: Math.max(0, current),
            target: goal.amount,
            percentage: Math.max(0, percentage)
        };
    }
    
    getDaysRemaining(targetDate) {
        const target = new Date(targetDate);
        const now = new Date();
        const diffTime = target - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    showUpdateProgressModal(goalId) {
        const goal = this.dataManager.getGoals().find(g => g.id === goalId);
        if (!goal) return;
        
        const currentProgress = this.calculateGoalProgress(goal);
        
        const modalHTML = `
            <div class="progress-update-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Update Progress: ${goal.name}</h3>
                        <button class="close-btn" onclick="this.closest('.progress-update-modal').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="current-progress">
                            <p>Current Progress: ₹${currentProgress.current.toLocaleString()} (${Math.round(currentProgress.percentage)}%)</p>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${currentProgress.percentage}%"></div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="newProgress">Update Progress (%)</label>
                            <input type="number" id="newProgress" min="0" max="100" value="${Math.round(currentProgress.percentage)}">
                        </div>
                        <div class="form-group">
                            <label for="progressNote">Note (Optional)</label>
                            <textarea id="progressNote" placeholder="Add a note about your progress..."></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" onclick="window.expenseTracker.goalsManager.updateGoalProgress('${goalId}')">
                            Update Progress
                        </button>
                        <button class="btn btn-secondary" onclick="this.closest('.progress-update-modal').remove()">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = modalHTML;
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
        
        document.body.appendChild(overlay);
    }
    
    updateGoalProgress(goalId) {
        const newProgress = parseFloat(document.getElementById('newProgress').value);
        const note = document.getElementById('progressNote').value.trim();
        
        if (isNaN(newProgress) || newProgress < 0 || newProgress > 100) {
            if (window.expenseTracker?.notificationManager) {
                window.expenseTracker.notificationManager.showError('Please enter a valid progress percentage (0-100)');
            }
            return;
        }
        
        const updateData = { progress: newProgress };
        if (note) {
            updateData.lastNote = note;
            updateData.lastNoteDate = new Date().toISOString();
        }
        
        if (this.dataManager.updateGoal(goalId, updateData)) {
            if (window.expenseTracker?.notificationManager) {
                window.expenseTracker.notificationManager.showSuccess('Goal progress updated successfully');
            }
            
            document.querySelector('.progress-update-modal').remove();
            this.loadGoalsList();
            this.updateOverview();
        }
    }
    
    editGoal(goalId) {
        const goal = this.dataManager.getGoals().find(g => g.id === goalId);
        if (!goal) return;
        
        // Switch to add tab and populate form
        this.switchGoalsTab('add');
        
        document.getElementById('goalName').value = goal.name;
        document.getElementById('goalType').value = goal.type;
        document.getElementById('goalAmount').value = goal.amount;
        document.getElementById('goalTargetDate').value = goal.targetDate;
        document.getElementById('goalPriority').value = goal.priority;
        document.getElementById('goalCategory').value = goal.category || '';
        document.getElementById('goalDescription').value = goal.description || '';
        
        // Change save button to update
        const saveBtn = document.getElementById('saveGoal');
        saveBtn.textContent = 'Update Goal';
        saveBtn.onclick = () => this.updateGoal(goalId);
        
        this.updateGoalPreview();
    }
    
    updateGoal(goalId) {
        const updatedGoal = {
            name: document.getElementById('goalName').value.trim(),
            type: document.getElementById('goalType').value,
            amount: parseFloat(document.getElementById('goalAmount').value),
            targetDate: document.getElementById('goalTargetDate').value,
            priority: document.getElementById('goalPriority').value,
            category: document.getElementById('goalCategory').value || null,
            description: document.getElementById('goalDescription').value.trim()
        };
        
        if (this.dataManager.updateGoal(goalId, updatedGoal)) {
            if (window.expenseTracker?.notificationManager) {
                window.expenseTracker.notificationManager.showSuccess('Goal updated successfully');
            }
            
            this.clearGoalForm();
            this.loadGoalsList();
            this.updateOverview();
            
            // Reset save button
            const saveBtn = document.getElementById('saveGoal');
            saveBtn.textContent = 'Save Goal';
            saveBtn.onclick = () => this.saveGoal();
            
            this.switchGoalsTab('manage');
        }
    }
    
    completeGoal(goalId) {
        if (confirm('Mark this goal as completed?')) {
            const updateData = {
                status: 'completed',
                completedDate: new Date().toISOString(),
                progress: 100
            };
            
            if (this.dataManager.updateGoal(goalId, updateData)) {
                if (window.expenseTracker?.notificationManager) {
                    window.expenseTracker.notificationManager.showSuccess('🎉 Congratulations! Goal completed!');
                }
                
                this.loadGoalsList();
                this.updateOverview();
            }
        }
    }
    
    deleteGoal(goalId) {
        const goal = this.dataManager.getGoals().find(g => g.id === goalId);
        if (!goal) return;
        
        if (confirm(`Are you sure you want to delete the goal "${goal.name}"?`)) {
            if (this.dataManager.deleteGoal(goalId)) {
                if (window.expenseTracker?.notificationManager) {
                    window.expenseTracker.notificationManager.showSuccess('Goal deleted successfully');
                }
                
                this.loadGoalsList();
                this.updateOverview();
            }
        }
    }
    
    filterGoals() {
        const filter = document.getElementById('goalsFilter').value;
        const goals = this.dataManager.getGoals();
        
        let filteredGoals;
        switch (filter) {
            case 'active':
                filteredGoals = goals.filter(g => g.status === 'active');
                break;
            case 'completed':
                filteredGoals = goals.filter(g => g.status === 'completed');
                break;
            case 'overdue':
                filteredGoals = goals.filter(g => {
                    return g.status === 'active' && this.getDaysRemaining(g.targetDate) < 0;
                });
                break;
            default:
                filteredGoals = goals;
        }
        
        this.renderGoalsList(filteredGoals);
    }
    
    sortGoals() {
        const sortBy = document.getElementById('goalsSortBy').value;
        const goals = this.dataManager.getGoals();
        
        let sortedGoals = [...goals];
        switch (sortBy) {
            case 'date-asc':
                sortedGoals.sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate));
                break;
            case 'date-desc':
                sortedGoals.sort((a, b) => new Date(b.targetDate) - new Date(a.targetDate));
                break;
            case 'amount-asc':
                sortedGoals.sort((a, b) => a.amount - b.amount);
                break;
            case 'amount-desc':
                sortedGoals.sort((a, b) => b.amount - a.amount);
                break;
            case 'priority':
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                sortedGoals.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
                break;
            case 'progress':
                sortedGoals.sort((a, b) => {
                    const progressA = this.calculateGoalProgress(a).percentage;
                    const progressB = this.calculateGoalProgress(b).percentage;
                    return progressB - progressA;
                });
                break;
        }
        
        this.renderGoalsList(sortedGoals);
    }
    
    generateInsights() {
        const goals = this.dataManager.getGoals();
        
        if (goals.length === 0) {
            this.showNoInsights();
            return;
        }
        
        // Calculate insights
        const completedGoals = goals.filter(g => g.status === 'completed');
        const achievementRate = goals.length > 0 ? (completedGoals.length / goals.length) * 100 : 0;
        
        const totalAmount = goals.reduce((sum, g) => sum + g.amount, 0);
        const averageAmount = goals.length > 0 ? totalAmount / goals.length : 0;
        
        const completedWithTimeline = completedGoals.filter(g => g.completedDate);
        let averageTimeline = 0;
        if (completedWithTimeline.length > 0) {
            const totalDays = completedWithTimeline.reduce((sum, goal) => {
                const start = new Date(goal.createdAt);
                const end = new Date(goal.completedDate);
                return sum + Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            }, 0);
            averageTimeline = totalDays / completedWithTimeline.length;
        }
        
        const typeCount = {};
        goals.forEach(goal => {
            typeCount[goal.type] = (typeCount[goal.type] || 0) + 1;
        });
        const mostCommonType = Object.keys(typeCount).reduce((a, b) => 
            typeCount[a] > typeCount[b] ? a : b, 'None'
        );
        
        // Update insights
        document.getElementById('achievementRate').textContent = `${Math.round(achievementRate)}%`;
        document.getElementById('averageGoalAmount').textContent = `₹${averageAmount.toLocaleString()}`;
        document.getElementById('averageTimeline').textContent = `${Math.round(averageTimeline)} days`;
        document.getElementById('mostCommonType').textContent = this.goalTypes[mostCommonType]?.label || mostCommonType;
        
        // Generate recommendations
        this.generateRecommendations(goals);
    }
    
    generateRecommendations(goals) {
        const recommendations = [];
        const activeGoals = goals.filter(g => g.status === 'active');
        
        // Too many goals
        if (activeGoals.length > 5) {
            recommendations.push({
                icon: '⚠️',
                text: 'You have many active goals. Consider focusing on 3-5 key goals for better success.',
                type: 'warning'
            });
        }
        
        // No emergency fund goal
        const hasEmergencyGoal = goals.some(g => g.type === 'emergency' && g.status === 'active');
        if (!hasEmergencyGoal) {
            recommendations.push({
                icon: '🛡️',
                text: 'Consider setting up an emergency fund goal for financial security.',
                type: 'suggestion'
            });
        }
        
        // Overdue goals
        const overdueGoals = activeGoals.filter(g => this.getDaysRemaining(g.targetDate) < 0);
        if (overdueGoals.length > 0) {
            recommendations.push({
                icon: '📅',
                text: `${overdueGoals.length} goal(s) are overdue. Review and update target dates.`,
                type: 'urgent'
            });
        }
        
        // Low progress goals
        const lowProgressGoals = activeGoals.filter(g => {
            const progress = this.calculateGoalProgress(g);
            const daysRemaining = this.getDaysRemaining(g.targetDate);
            const expectedProgress = daysRemaining > 0 ? 
                (1 - (daysRemaining / ((new Date(g.targetDate) - new Date(g.createdAt)) / (1000 * 60 * 60 * 24)))) * 100 : 100;
            return progress.percentage < expectedProgress * 0.8; // 20% behind expected
        });
        
        if (lowProgressGoals.length > 0) {
            recommendations.push({
                icon: '📊',
                text: `${lowProgressGoals.length} goal(s) are behind schedule. Consider adjusting your strategy.`,
                type: 'info'
            });
        }
        
        // Default recommendation
        if (recommendations.length === 0) {
            recommendations.push({
                icon: '🎯',
                text: 'Great job managing your goals! Keep up the good work.',
                type: 'positive'
            });
        }
        
        this.updateRecommendations(recommendations);
    }
    
    updateRecommendations(recommendations) {
        const container = document.getElementById('recommendationsList');
        if (!container) return;
        
        container.innerHTML = recommendations.map(rec => `
            <div class="recommendation-item ${rec.type}">
                <span class="recommendation-icon">${rec.icon}</span>
                <span class="recommendation-text">${rec.text}</span>
            </div>
        `).join('');
    }
    
    showNoInsights() {
        document.getElementById('achievementRate').textContent = '0%';
        document.getElementById('averageGoalAmount').textContent = '₹0';
        document.getElementById('averageTimeline').textContent = '0 days';
        document.getElementById('mostCommonType').textContent = 'None';
        
        document.getElementById('recommendationsList').innerHTML = `
            <div class="recommendation-item info">
                <span class="recommendation-icon">💡</span>
                <span class="recommendation-text">Create some goals to see personalized insights and recommendations.</span>
            </div>
        `;
    }
    
    checkGoalProgress() {
        const goals = this.dataManager.getGoals().filter(g => g.status === 'active');
        const alerts = [];
        
        goals.forEach(goal => {
            const progress = this.calculateGoalProgress(goal);
            const daysRemaining = this.getDaysRemaining(goal.targetDate);
            
            // Check if goal is achieved
            if (progress.percentage >= 100) {
                alerts.push({
                    type: 'success',
                    message: `🎉 Goal "${goal.name}" is complete! Consider marking it as achieved.`
                });
            }
            // Check if goal is overdue
            else if (daysRemaining < 0) {
                alerts.push({
                    type: 'warning',
                    message: `⏰ Goal "${goal.name}" is ${Math.abs(daysRemaining)} days overdue.`
                });
            }
            // Check if goal deadline is approaching
            else if (daysRemaining <= 7) {
                alerts.push({
                    type: 'info',
                    message: `📅 Goal "${goal.name}" deadline is in ${daysRemaining} days.`
                });
            }
        });
        
        // Show alerts via notification manager
        alerts.forEach(alert => {
            if (window.expenseTracker?.notificationManager) {
                switch (alert.type) {
                    case 'success':
                        window.expenseTracker.notificationManager.showSuccess(alert.message);
                        break;
                    case 'warning':
                        window.expenseTracker.notificationManager.showWarning(alert.message);
                        break;
                    case 'info':
                        window.expenseTracker.notificationManager.showInfo(alert.message);
                        break;
                }
            }
        });
    }
    
    createGoalsWidget() {
        const goals = this.dataManager.getGoals().filter(g => g.status === 'active');
        const upcomingGoals = goals
            .filter(g => this.getDaysRemaining(g.targetDate) <= 30)
            .sort((a, b) => this.getDaysRemaining(a.targetDate) - this.getDaysRemaining(b.targetDate))
            .slice(0, 3);
        
        return `
            <div class="goals-widget">
                <div class="widget-header">
                    <h4>🎯 Goals Progress</h4>
                    <span class="goals-count">${goals.length} active</span>
                </div>
                <div class="widget-content">
                    ${upcomingGoals.length > 0 ? upcomingGoals.map(goal => {
                        const progress = this.calculateGoalProgress(goal);
                        const daysRemaining = this.getDaysRemaining(goal.targetDate);
                        return `
                            <div class="widget-goal">
                                <div class="goal-name">${goal.name}</div>
                                <div class="goal-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${progress.percentage}%"></div>
                                    </div>
                                    <span class="progress-text">${Math.round(progress.percentage)}%</span>
                                </div>
                                <div class="goal-deadline">${daysRemaining} days left</div>
                            </div>
                        `;
                    }).join('') : '<p class="no-goals">No upcoming goals</p>'}
                </div>
                <div class="widget-actions">
                    <button class="widget-btn" onclick="window.expenseTracker.goalsManager.showGoalsModal()">
                        Manage Goals
                    </button>
                </div>
            </div>
        `;
    }
}

// Make GoalsManager globally available
window.GoalsManager = GoalsManager;
