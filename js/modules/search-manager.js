/**
 * Search Manager Module
 * Handles advanced search and filtering functionality for expenses
 */

class SearchManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.currentFilters = {};
        this.searchHistory = [];
        this.savedSearches = this.loadSavedSearches();
    }
    
    showSearchModal() {
        const modal = document.getElementById('searchModal');
        if (!modal) {
            this.createSearchModal();
        }
        
        this.loadSearchData();
        document.getElementById('searchModal').classList.add('active');
        document.getElementById('overlay').classList.add('active');
    }
    
    createSearchModal() {
        const modalHTML = `
            <div id="searchModal" class="modal search-modal">
                <div class="modal-content search-modal-content">
                    <div class="modal-header">
                        <h3>Search & Filter Expenses</h3>
                        <button id="closeSearchModal" class="close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="search-tabs">
                            <button class="tab-btn active" data-tab="search">Search</button>
                            <button class="tab-btn" data-tab="filter">Advanced Filter</button>
                            <button class="tab-btn" data-tab="saved">Saved Searches</button>
                        </div>
                        
                        <div class="tab-content active" id="searchTab">
                            <div class="search-section">
                                <div class="search-input-group">
                                    <input type="text" id="searchQuery" placeholder="Search expenses by name, category, or amount..." class="search-input">
                                    <button id="performSearch" class="btn btn-primary">🔍 Search</button>
                                    <button id="clearSearch" class="btn btn-secondary">Clear</button>
                                </div>
                                
                                <div class="quick-filters">
                                    <span class="filter-label">Quick Filters:</span>
                                    <button class="quick-filter-btn" data-filter="today">Today</button>
                                    <button class="quick-filter-btn" data-filter="week">This Week</button>
                                    <button class="quick-filter-btn" data-filter="month">This Month</button>
                                    <button class="quick-filter-btn" data-filter="high">High Amount</button>
                                </div>
                                
                                <div class="search-suggestions" id="searchSuggestions"></div>
                            </div>
                        </div>
                        
                        <div class="tab-content" id="filterTab">
                            <div class="filter-section">
                                <div class="filter-grid">
                                    <div class="filter-group">
                                        <label>Date Range</label>
                                        <div class="date-range-inputs">
                                            <input type="date" id="filterStartDate" placeholder="Start Date">
                                            <input type="date" id="filterEndDate" placeholder="End Date">
                                        </div>
                                    </div>
                                    
                                    <div class="filter-group">
                                        <label>Amount Range</label>
                                        <div class="amount-range-inputs">
                                            <input type="number" id="filterMinAmount" placeholder="Min Amount" min="0" step="0.01">
                                            <input type="number" id="filterMaxAmount" placeholder="Max Amount" min="0" step="0.01">
                                        </div>
                                    </div>
                                    
                                    <div class="filter-group">
                                        <label>Categories</label>
                                        <div class="category-checkboxes" id="categoryFilters">
                                            ${this.generateCategoryCheckboxes()}
                                        </div>
                                    </div>
                                    
                                    <div class="filter-group">
                                        <label>Sort By</label>
                                        <select id="sortBy">
                                            <option value="date-desc">Date (Newest First)</option>
                                            <option value="date-asc">Date (Oldest First)</option>
                                            <option value="amount-desc">Amount (Highest First)</option>
                                            <option value="amount-asc">Amount (Lowest First)</option>
                                            <option value="category">Category</option>
                                            <option value="name">Name (A-Z)</option>
                                        </select>
                                    </div>
                                    
                                    <div class="filter-group">
                                        <label>Options</label>
                                        <div class="filter-options">
                                            <label class="checkbox-option">
                                                <input type="checkbox" id="includeRecurring">
                                                <span>Include Recurring Expenses</span>
                                            </label>
                                            <label class="checkbox-option">
                                                <input type="checkbox" id="groupByDate">
                                                <span>Group by Date</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="filter-actions">
                                    <button id="applyFilters" class="btn btn-primary">Apply Filters</button>
                                    <button id="resetFilters" class="btn btn-secondary">Reset</button>
                                    <button id="saveCurrentSearch" class="btn btn-secondary">Save Search</button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tab-content" id="savedTab">
                            <div class="saved-searches-section">
                                <div id="savedSearchesList" class="saved-searches-list"></div>
                                <div class="search-history">
                                    <h4>Recent Searches</h4>
                                    <div id="searchHistoryList" class="search-history-list"></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="search-results" id="searchResults">
                            <div class="results-header">
                                <span class="results-count" id="resultsCount">No search performed</span>
                                <div class="results-actions">
                                    <button id="exportResults" class="btn btn-secondary">Export Results</button>
                                    <select id="resultsPerPage">
                                        <option value="10">10 per page</option>
                                        <option value="25" selected>25 per page</option>
                                        <option value="50">50 per page</option>
                                        <option value="100">100 per page</option>
                                    </select>
                                </div>
                            </div>
                            <div class="results-content" id="resultsContent">
                                <div class="no-results">
                                    <p>Enter a search query or apply filters to see results</p>
                                </div>
                            </div>
                            <div class="results-pagination" id="resultsPagination"></div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="closeSearchModal" class="btn btn-secondary">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.bindSearchEvents();
    }
    
    generateCategoryCheckboxes() {
        const categories = ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Education', 'Other'];
        return categories.map(category => `
            <label class="checkbox-option">
                <input type="checkbox" value="${category}" class="category-filter" checked>
                <span>${this.getCategoryIcon(category)} ${category}</span>
            </label>
        `).join('');
    }
    
    getCategoryIcon(category) {
        const icons = {
            'Food': '🍔',
            'Transportation': '🚗',
            'Entertainment': '🎬',
            'Shopping': '🛒',
            'Bills': '🧾',
            'Health': '🏥',
            'Education': '📚',
            'Other': '📦'
        };
        return icons[category] || '📦';
    }
    
    bindSearchEvents() {
        // Close modal
        document.querySelectorAll('#closeSearchModal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('searchModal').classList.remove('active');
                document.getElementById('overlay').classList.remove('active');
            });
        });
        
        // Tab switching
        document.querySelectorAll('.search-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchSearchTab(tabName);
            });
        });
        
        // Search functionality
        document.getElementById('performSearch')?.addEventListener('click', () => this.performSearch());
        document.getElementById('clearSearch')?.addEventListener('click', () => this.clearSearch());
        document.getElementById('searchQuery')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });
        document.getElementById('searchQuery')?.addEventListener('input', (e) => this.updateSearchSuggestions(e.target.value));
        
        // Quick filters
        document.querySelectorAll('.quick-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.applyQuickFilter(e.target.dataset.filter);
            });
        });
        
        // Advanced filters
        document.getElementById('applyFilters')?.addEventListener('click', () => this.applyAdvancedFilters());
        document.getElementById('resetFilters')?.addEventListener('click', () => this.resetFilters());
        document.getElementById('saveCurrentSearch')?.addEventListener('click', () => this.saveCurrentSearch());
        
        // Results actions
        document.getElementById('exportResults')?.addEventListener('click', () => this.exportSearchResults());
        document.getElementById('resultsPerPage')?.addEventListener('change', () => this.updateResultsDisplay());
        
        // Real-time search
        let searchTimeout;
        document.getElementById('searchQuery')?.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (e.target.value.length >= 2) {
                    this.performSearch();
                }
            }, 300);
        });
    }
    
    switchSearchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.search-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.search-modal .tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');
        
        // Load specific tab data
        if (tabName === 'saved') {
            this.loadSavedSearches();
            this.updateSearchHistory();
        }
    }
    
    loadSearchData() {
        this.updateSearchSuggestions('');
        this.loadSavedSearches();
        this.updateSearchHistory();
    }
    
    performSearch() {
        const query = document.getElementById('searchQuery').value.trim();
        if (!query && Object.keys(this.currentFilters).length === 0) {
            this.showNoResults('Enter a search query or apply filters');
            return;
        }
        
        const filters = this.buildCurrentFilters();
        const results = this.dataManager.searchExpenses(query, filters);
        
        // Add to search history
        if (query) {
            this.addToSearchHistory(query);
        }
        
        this.displaySearchResults(results, query);
    }
    
    buildCurrentFilters() {
        const filters = {};
        
        // Date range
        const startDate = document.getElementById('filterStartDate')?.value;
        const endDate = document.getElementById('filterEndDate')?.value;
        if (startDate) filters.startDate = new Date(startDate);
        if (endDate) filters.endDate = new Date(endDate);
        
        // Amount range
        const minAmount = document.getElementById('filterMinAmount')?.value;
        const maxAmount = document.getElementById('filterMaxAmount')?.value;
        if (minAmount) filters.minAmount = parseFloat(minAmount);
        if (maxAmount) filters.maxAmount = parseFloat(maxAmount);
        
        // Categories
        const selectedCategories = Array.from(document.querySelectorAll('.category-filter:checked'))
            .map(cb => cb.value);
        if (selectedCategories.length > 0 && selectedCategories.length < 8) {
            filters.categories = selectedCategories;
        }
        
        return filters;
    }
    
    applyQuickFilter(filterType) {
        const now = new Date();
        
        switch (filterType) {
            case 'today':
                document.getElementById('filterStartDate').value = now.toISOString().split('T')[0];
                document.getElementById('filterEndDate').value = now.toISOString().split('T')[0];
                break;
            case 'week':
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - now.getDay());
                document.getElementById('filterStartDate').value = weekStart.toISOString().split('T')[0];
                document.getElementById('filterEndDate').value = now.toISOString().split('T')[0];
                break;
            case 'month':
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                document.getElementById('filterStartDate').value = monthStart.toISOString().split('T')[0];
                document.getElementById('filterEndDate').value = now.toISOString().split('T')[0];
                break;
            case 'high':
                document.getElementById('filterMinAmount').value = '1000';
                break;
        }
        
        this.performSearch();
    }
    
    applyAdvancedFilters() {
        this.currentFilters = this.buildCurrentFilters();
        this.performSearch();
    }
    
    resetFilters() {
        document.getElementById('filterStartDate').value = '';
        document.getElementById('filterEndDate').value = '';
        document.getElementById('filterMinAmount').value = '';
        document.getElementById('filterMaxAmount').value = '';
        document.getElementById('sortBy').value = 'date-desc';
        document.getElementById('includeRecurring').checked = false;
        document.getElementById('groupByDate').checked = false;
        
        // Reset category checkboxes
        document.querySelectorAll('.category-filter').forEach(cb => cb.checked = true);
        
        this.currentFilters = {};
        this.showNoResults('Filters reset. Enter a search query or apply new filters.');
    }
    
    clearSearch() {
        document.getElementById('searchQuery').value = '';
        this.resetFilters();
    }
    
    displaySearchResults(results, query) {
        const resultsContainer = document.getElementById('resultsContent');
        const resultsCount = document.getElementById('resultsCount');
        
        if (results.length === 0) {
            this.showNoResults(query ? `No results found for "${query}"` : 'No results found with current filters');
            return;
        }
        
        resultsCount.textContent = `${results.length} result${results.length !== 1 ? 's' : ''} found`;
        
        // Sort results
        const sortBy = document.getElementById('sortBy')?.value || 'date-desc';
        const sortedResults = this.sortResults(results, sortBy);
        
        // Group by date if selected
        const groupByDate = document.getElementById('groupByDate')?.checked;
        if (groupByDate) {
            this.displayGroupedResults(sortedResults);
        } else {
            this.displayListResults(sortedResults);
        }
        
        this.setupPagination(sortedResults);
    }
    
    sortResults(results, sortBy) {
        const sorted = [...results];
        
        switch (sortBy) {
            case 'date-asc':
                return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
            case 'date-desc':
                return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
            case 'amount-asc':
                return sorted.sort((a, b) => a.amount - b.amount);
            case 'amount-desc':
                return sorted.sort((a, b) => b.amount - a.amount);
            case 'category':
                return sorted.sort((a, b) => a.category.localeCompare(b.category));
            case 'name':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            default:
                return sorted;
        }
    }
    
    displayListResults(results) {
        const resultsContainer = document.getElementById('resultsContent');
        const perPage = parseInt(document.getElementById('resultsPerPage')?.value || 25);
        const currentPage = this.currentPage || 1;
        const startIndex = (currentPage - 1) * perPage;
        const endIndex = startIndex + perPage;
        const pageResults = results.slice(startIndex, endIndex);
        
        resultsContainer.innerHTML = `
            <div class="results-list">
                ${pageResults.map(expense => this.createResultItem(expense)).join('')}
            </div>
        `;
        
        this.bindResultEvents();
    }
    
    displayGroupedResults(results) {
        const resultsContainer = document.getElementById('resultsContent');
        const grouped = this.groupResultsByDate(results);
        
        resultsContainer.innerHTML = `
            <div class="results-grouped">
                ${Object.entries(grouped).map(([date, expenses]) => `
                    <div class="result-group">
                        <div class="group-header">
                            <span class="group-date">${new Date(date).toLocaleDateString()}</span>
                            <span class="group-total">₹${expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}</span>
                        </div>
                        <div class="group-items">
                            ${expenses.map(expense => this.createResultItem(expense)).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        this.bindResultEvents();
    }
    
    groupResultsByDate(results) {
        const grouped = {};
        results.forEach(expense => {
            if (!grouped[expense.date]) {
                grouped[expense.date] = [];
            }
            grouped[expense.date].push(expense);
        });
        return grouped;
    }
    
    createResultItem(expense) {
        return `
            <div class="result-item" data-expense-id="${expense.id}" data-date="${expense.date}">
                <div class="result-info">
                    <div class="result-header">
                        <span class="result-name">${expense.name}</span>
                        <span class="result-amount">₹${expense.amount.toLocaleString()}</span>
                    </div>
                    <div class="result-details">
                        <span class="result-category">${this.getCategoryIcon(expense.category)} ${expense.category}</span>
                        <span class="result-date">${expense.dateObj.toLocaleDateString()}</span>
                        ${expense.isRecurring ? '<span class="result-recurring">🔄 Recurring</span>' : ''}
                    </div>
                </div>
                <div class="result-actions">
                    <button class="action-btn edit-result" data-expense-id="${expense.id}" data-date="${expense.date}">✏️</button>
                    <button class="action-btn delete-result" data-expense-id="${expense.id}" data-date="${expense.date}">🗑️</button>
                    <button class="action-btn view-result" data-expense-id="${expense.id}" data-date="${expense.date}">👁️</button>
                </div>
            </div>
        `;
    }
    
    bindResultEvents() {
        // Edit expense
        document.querySelectorAll('.edit-result').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const expenseId = e.target.dataset.expenseId;
                const date = new Date(e.target.dataset.date);
                this.editExpenseFromResults(expenseId, date);
            });
        });
        
        // Delete expense
        document.querySelectorAll('.delete-result').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const expenseId = e.target.dataset.expenseId;
                const date = new Date(e.target.dataset.date);
                this.deleteExpenseFromResults(expenseId, date);
            });
        });
        
        // View expense details
        document.querySelectorAll('.view-result').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const expenseId = e.target.dataset.expenseId;
                const date = new Date(e.target.dataset.date);
                this.viewExpenseDetails(expenseId, date);
            });
        });
    }
    
    editExpenseFromResults(expenseId, date) {
        // Close search modal and open expense modal for editing
        document.getElementById('searchModal').classList.remove('active');
        document.getElementById('overlay').classList.remove('active');
        
        if (window.expenseTracker) {
            window.expenseTracker.showExpenseModal(date);
            // The expense tracker will handle the edit functionality
        }
    }
    
    deleteExpenseFromResults(expenseId, date) {
        if (confirm('Are you sure you want to delete this expense?')) {
            if (this.dataManager.deleteExpenseForDate(date, expenseId)) {
                if (window.expenseTracker?.notificationManager) {
                    window.expenseTracker.notificationManager.showSuccess('Expense deleted successfully');
                }
                
                // Refresh search results
                this.performSearch();
                
                // Refresh main app if available
                if (window.expenseTracker) {
                    window.expenseTracker.refreshDisplay();
                }
            }
        }
    }
    
    viewExpenseDetails(expenseId, date) {
        const expenses = this.dataManager.getExpensesForDate(date);
        const expense = expenses.find(exp => exp.id === expenseId);
        
        if (!expense) return;
        
        const detailsHTML = `
            <div class="expense-details-modal">
                <div class="details-content">
                    <h4>Expense Details</h4>
                    <div class="details-grid">
                        <div class="detail-item">
                            <span class="detail-label">Name:</span>
                            <span class="detail-value">${expense.name}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Category:</span>
                            <span class="detail-value">${this.getCategoryIcon(expense.category)} ${expense.category}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Amount:</span>
                            <span class="detail-value">₹${expense.amount.toLocaleString()}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Date:</span>
                            <span class="detail-value">${date.toLocaleDateString()}</span>
                        </div>
                        ${expense.timestamp ? `
                            <div class="detail-item">
                                <span class="detail-label">Added:</span>
                                <span class="detail-value">${new Date(expense.timestamp).toLocaleString()}</span>
                            </div>
                        ` : ''}
                        ${expense.lastModified ? `
                            <div class="detail-item">
                                <span class="detail-label">Modified:</span>
                                <span class="detail-value">${new Date(expense.lastModified).toLocaleString()}</span>
                            </div>
                        ` : ''}
                        ${expense.isRecurring ? `
                            <div class="detail-item">
                                <span class="detail-label">Type:</span>
                                <span class="detail-value">🔄 Recurring Expense</span>
                            </div>
                        ` : ''}
                    </div>
                    <button class="btn btn-secondary" onclick="this.parentElement.parentElement.remove()">Close</button>
                </div>
            </div>
        `;
        
        const overlay = document.createElement('div');
        overlay.className = 'details-overlay';
        overlay.innerHTML = detailsHTML;
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
        
        document.body.appendChild(overlay);
    }
    
    setupPagination(results) {
        const paginationContainer = document.getElementById('resultsPagination');
        const perPage = parseInt(document.getElementById('resultsPerPage')?.value || 25);
        const totalPages = Math.ceil(results.length / perPage);
        const currentPage = this.currentPage || 1;
        
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        
        let paginationHTML = '<div class="pagination">';
        
        // Previous button
        if (currentPage > 1) {
            paginationHTML += `<button class="page-btn" data-page="${currentPage - 1}">‹ Previous</button>`;
        }
        
        // Page numbers
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        
        for (let page = startPage; page <= endPage; page++) {
            const isActive = page === currentPage ? 'active' : '';
            paginationHTML += `<button class="page-btn ${isActive}" data-page="${page}">${page}</button>`;
        }
        
        // Next button
        if (currentPage < totalPages) {
            paginationHTML += `<button class="page-btn" data-page="${currentPage + 1}">Next ›</button>`;
        }
        
        paginationHTML += '</div>';
        paginationContainer.innerHTML = paginationHTML;
        
        // Bind pagination events
        document.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentPage = parseInt(e.target.dataset.page);
                this.performSearch();
            });
        });
    }
    
    updateResultsDisplay() {
        this.currentPage = 1; // Reset to first page when changing results per page
        this.performSearch();
    }
    
    showNoResults(message) {
        const resultsContainer = document.getElementById('resultsContent');
        const resultsCount = document.getElementById('resultsCount');
        
        resultsCount.textContent = 'No results found';
        resultsContainer.innerHTML = `
            <div class="no-results">
                <p>${message}</p>
            </div>
        `;
        
        document.getElementById('resultsPagination').innerHTML = '';
    }
    
    updateSearchSuggestions(query) {
        const suggestionsContainer = document.getElementById('searchSuggestions');
        if (!suggestionsContainer) return;
        
        if (!query || query.length < 2) {
            suggestionsContainer.innerHTML = '';
            return;
        }
        
        const suggestions = this.generateSearchSuggestions(query);
        
        if (suggestions.length === 0) {
            suggestionsContainer.innerHTML = '';
            return;
        }
        
        suggestionsContainer.innerHTML = `
            <div class="suggestions-list">
                ${suggestions.map(suggestion => `
                    <div class="suggestion-item" data-suggestion="${suggestion.text}">
                        <span class="suggestion-icon">${suggestion.icon}</span>
                        <span class="suggestion-text">${suggestion.text}</span>
                        <span class="suggestion-type">${suggestion.type}</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Bind suggestion clicks
        document.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const suggestion = e.currentTarget.dataset.suggestion;
                document.getElementById('searchQuery').value = suggestion;
                this.performSearch();
                suggestionsContainer.innerHTML = '';
            });
        });
    }
    
    generateSearchSuggestions(query) {
        const suggestions = [];
        const queryLower = query.toLowerCase();
        
        // Get all unique expense names and categories
        const allExpenses = Object.values(this.dataManager.getExpenses()).flat();
        const uniqueNames = [...new Set(allExpenses.map(exp => exp.name))];
        const uniqueCategories = [...new Set(allExpenses.map(exp => exp.category))];
        
        // Name suggestions
        uniqueNames.forEach(name => {
            if (name.toLowerCase().includes(queryLower)) {
                suggestions.push({
                    text: name,
                    type: 'expense',
                    icon: '💰'
                });
            }
        });
        
        // Category suggestions
        uniqueCategories.forEach(category => {
            if (category.toLowerCase().includes(queryLower)) {
                suggestions.push({
                    text: category,
                    type: 'category',
                    icon: this.getCategoryIcon(category)
                });
            }
        });
        
        // Amount suggestions
        if (!isNaN(query) && query.length > 0) {
            suggestions.push({
                text: `₹${parseFloat(query).toLocaleString()}`,
                type: 'amount',
                icon: '💵'
            });
        }
        
        return suggestions.slice(0, 8); // Limit to 8 suggestions
    }
    
    addToSearchHistory(query) {
        // Remove if already exists
        this.searchHistory = this.searchHistory.filter(item => item.query !== query);
        
        // Add to beginning
        this.searchHistory.unshift({
            query,
            timestamp: new Date().toISOString(),
            filters: { ...this.currentFilters }
        });
        
        // Keep only last 10 searches
        this.searchHistory = this.searchHistory.slice(0, 10);
        
        // Save to localStorage
        localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
    }
    
    updateSearchHistory() {
        const container = document.getElementById('searchHistoryList');
        if (!container) return;
        
        const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        this.searchHistory = history;
        
        if (history.length === 0) {
            container.innerHTML = '<p class="empty-history">No recent searches</p>';
            return;
        }
        
        container.innerHTML = history.map(item => `
            <div class="history-item" data-query="${item.query}">
                <div class="history-query">${item.query}</div>
                <div class="history-time">${new Date(item.timestamp).toLocaleDateString()}</div>
                <button class="history-action" data-action="search" data-query="${item.query}">🔍</button>
                <button class="history-action" data-action="delete" data-query="${item.query}">🗑️</button>
            </div>
        `).join('');
        
        // Bind history events
        document.querySelectorAll('.history-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const query = e.target.dataset.query;
                
                if (action === 'search') {
                    document.getElementById('searchQuery').value = query;
                    this.switchSearchTab('search');
                    this.performSearch();
                } else if (action === 'delete') {
                    this.removeFromSearchHistory(query);
                }
            });
        });
    }
    
    removeFromSearchHistory(query) {
        this.searchHistory = this.searchHistory.filter(item => item.query !== query);
        localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
        this.updateSearchHistory();
    }
    
    saveCurrentSearch() {
        const searchName = prompt('Enter a name for this search:');
        if (!searchName) return;
        
        const query = document.getElementById('searchQuery').value;
        const filters = this.buildCurrentFilters();
        
        const savedSearch = {
            id: Date.now().toString(),
            name: searchName,
            query,
            filters,
            createdAt: new Date().toISOString()
        };
        
        this.savedSearches.push(savedSearch);
        this.saveSavedSearches();
        this.loadSavedSearches();
        
        if (window.expenseTracker?.notificationManager) {
            window.expenseTracker.notificationManager.showSuccess('Search saved successfully');
        }
    }
    
    loadSavedSearches() {
        const container = document.getElementById('savedSearchesList');
        if (!container) return;
        
        this.savedSearches = JSON.parse(localStorage.getItem('savedSearches') || '[]');
        
        if (this.savedSearches.length === 0) {
            container.innerHTML = '<p class="empty-saved">No saved searches</p>';
            return;
        }
        
        container.innerHTML = this.savedSearches.map(search => `
            <div class="saved-search-item">
                <div class="saved-search-info">
                    <div class="saved-search-name">${search.name}</div>
                    <div class="saved-search-details">
                        ${search.query ? `Query: "${search.query}"` : 'Filter only'}
                        <span class="saved-search-date">${new Date(search.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="saved-search-actions">
                    <button class="action-btn" onclick="searchManager.applySavedSearch('${search.id}')">🔍</button>
                    <button class="action-btn" onclick="searchManager.deleteSavedSearch('${search.id}')">🗑️</button>
                </div>
            </div>
        `).join('');
    }
    
    saveSavedSearches() {
        localStorage.setItem('savedSearches', JSON.stringify(this.savedSearches));
    }
    
    applySavedSearch(searchId) {
        const search = this.savedSearches.find(s => s.id === searchId);
        if (!search) return;
        
        // Apply query
        document.getElementById('searchQuery').value = search.query || '';
        
        // Apply filters
        if (search.filters.startDate) {
            document.getElementById('filterStartDate').value = search.filters.startDate.toISOString().split('T')[0];
        }
        if (search.filters.endDate) {
            document.getElementById('filterEndDate').value = search.filters.endDate.toISOString().split('T')[0];
        }
        if (search.filters.minAmount) {
            document.getElementById('filterMinAmount').value = search.filters.minAmount;
        }
        if (search.filters.maxAmount) {
            document.getElementById('filterMaxAmount').value = search.filters.maxAmount;
        }
        if (search.filters.categories) {
            // Reset all checkboxes first
            document.querySelectorAll('.category-filter').forEach(cb => cb.checked = false);
            // Check only selected categories
            search.filters.categories.forEach(category => {
                const checkbox = document.querySelector(`.category-filter[value="${category}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
        
        this.currentFilters = search.filters;
        this.switchSearchTab('search');
        this.performSearch();
    }
    
    deleteSavedSearch(searchId) {
        if (confirm('Are you sure you want to delete this saved search?')) {
            this.savedSearches = this.savedSearches.filter(s => s.id !== searchId);
            this.saveSavedSearches();
            this.loadSavedSearches();
        }
    }
    
    exportSearchResults() {
        const query = document.getElementById('searchQuery').value;
        const filters = this.buildCurrentFilters();
        const results = this.dataManager.searchExpenses(query, filters);
        
        if (results.length === 0) {
            if (window.expenseTracker?.notificationManager) {
                window.expenseTracker.notificationManager.showWarning('No results to export');
            }
            return;
        }
        
        // Convert results to CSV
        const headers = ['Date', 'Name', 'Category', 'Amount'];
        let csvContent = headers.join(',') + '\n';
        
        results.forEach(expense => {
            const row = [
                expense.dateObj.toLocaleDateString(),
                `"${expense.name.replace(/"/g, '""')}"`,
                expense.category,
                expense.amount
            ];
            csvContent += row.join(',') + '\n';
        });
        
        // Download file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `search-results-${new Date().toISOString().split('T')[0]}.csv`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        if (window.expenseTracker?.notificationManager) {
            window.expenseTracker.notificationManager.showSuccess('Search results exported successfully');
        }
    }
    
    // Public API for integration with main app
    performQuickSearch(query) {
        if (this.isSearchModalOpen()) {
            document.getElementById('searchQuery').value = query;
            this.performSearch();
        } else {
            // Store query for when modal opens
            this.pendingQuery = query;
            this.showSearchModal();
        }
    }
    
    isSearchModalOpen() {
        const modal = document.getElementById('searchModal');
        return modal && modal.classList.contains('active');
    }
    
    createSearchWidget() {
        return `
            <div class="search-widget">
                <div class="widget-header">
                    <h4>🔍 Quick Search</h4>
                </div>
                <div class="widget-content">
                    <input type="text" class="widget-search-input" placeholder="Search expenses..." id="widgetSearchInput">
                    <div class="widget-actions">
                        <button class="widget-btn" onclick="window.expenseTracker.searchManager.showSearchModal()">
                            Advanced Search
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

// Make SearchManager globally available
window.SearchManager = SearchManager;
