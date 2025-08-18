/**
 * Data Export/Import Module
 * Handles data export to various formats and import functionality
 */

class DataExportImport {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }
    
    // Export to JSON
    exportToJSON() {
        const data = this.dataManager.exportData();
        const jsonString = JSON.stringify(data, null, 2);
        
        this.downloadFile(
            jsonString,
            `expense-tracker-backup-${this.formatDate(new Date())}.json`,
            'application/json'
        );
        
        return jsonString;
    }
    
    // Export to CSV
    exportToCSV(options = {}) {
        const { 
            startDate = null, 
            endDate = null, 
            categories = null,
            includeIncome = true,
            includeExpenses = true 
        } = options;
        
        let csvContent = '';
        const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Balance'];
        csvContent += headers.join(',') + '\n';
        
        const data = this.prepareCSVData(startDate, endDate, categories, includeIncome, includeExpenses);
        
        data.forEach(row => {
            const csvRow = [
                `"${row.date}"`,
                `"${row.type}"`,
                `"${row.category || ''}"`,
                `"${(row.description || '').replace(/"/g, '""')}"`,
                row.amount,
                row.balance || ''
            ];
            csvContent += csvRow.join(',') + '\n';
        });
        
        this.downloadFile(
            csvContent,
            `expense-tracker-${this.formatDate(new Date())}.csv`,
            'text/csv'
        );
        
        return csvContent;
    }
    
    prepareCSVData(startDate, endDate, categories, includeIncome, includeExpenses) {
        const data = [];
        const allIncomes = this.dataManager.getAllIncomes();
        const allExpenses = this.dataManager.getExpenses();
        
        // Add income data
        if (includeIncome) {
            Object.entries(allIncomes).forEach(([monthKey, amount]) => {
                const [year, month] = monthKey.split('-');
                const date = new Date(parseInt(year), parseInt(month) - 1, 1);
                
                if (this.isDateInRange(date, startDate, endDate)) {
                    data.push({
                        date: this.formatDate(date),
                        type: 'Income',
                        category: 'Monthly Income',
                        description: 'Monthly Income',
                        amount: parseFloat(amount)
                    });
                }
            });
        }
        
        // Add expense data
        if (includeExpenses) {
            Object.entries(allExpenses).forEach(([dateKey, expenses]) => {
                const [year, month, day] = dateKey.split('-');
                const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                
                if (this.isDateInRange(date, startDate, endDate)) {
                    expenses.forEach(expense => {
                        if (!categories || categories.includes(expense.category)) {
                            data.push({
                                date: this.formatDate(date),
                                type: 'Expense',
                                category: expense.category,
                                description: expense.name,
                                amount: -parseFloat(expense.amount)
                            });
                        }
                    });
                }
            });
        }
        
        // Sort by date
        data.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Calculate running balance
        let runningBalance = 0;
        data.forEach(row => {
            runningBalance += row.amount;
            row.balance = runningBalance;
        });
        
        return data;
    }
    
    // Export monthly report
    exportMonthlyReport(month, year) {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        const income = this.dataManager.getIncome(month, year);
        const categoryTotals = this.dataManager.getCategoryTotals(month, year);
        const dailyTotals = this.dataManager.getDailyTotals(month, year);
        const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
        const savings = income - totalExpenses;
        
        let csvContent = `Monthly Report - ${monthNames[month]} ${year}\n\n`;
        
        // Summary
        csvContent += 'SUMMARY\n';
        csvContent += 'Type,Amount\n';
        csvContent += `"Monthly Income",${income}\n`;
        csvContent += `"Total Expenses",${totalExpenses}\n`;
        csvContent += `"Net Savings",${savings}\n\n`;
        
        // Category breakdown
        csvContent += 'CATEGORY BREAKDOWN\n';
        csvContent += 'Category,Amount,Percentage\n';
        Object.entries(categoryTotals).forEach(([category, amount]) => {
            const percentage = totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(2) : 0;
            csvContent += `"${category}",${amount},${percentage}%\n`;
        });
        
        csvContent += '\n';
        
        // Daily breakdown
        csvContent += 'DAILY BREAKDOWN\n';
        csvContent += 'Day,Amount\n';
        Object.entries(dailyTotals).forEach(([day, amount]) => {
            csvContent += `${day},${amount}\n`;
        });
        
        this.downloadFile(
            csvContent,
            `monthly-report-${monthNames[month].toLowerCase()}-${year}.csv`,
            'text/csv'
        );
        
        return csvContent;
    }
    
    // Export budget report
    exportBudgetReport(month, year) {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        const categoryTotals = this.dataManager.getCategoryTotals(month, year);
        const categories = [
            'Food', 'Transportation', 'Entertainment', 'Shopping', 
            'Bills', 'Health', 'Education', 'Other'
        ];
        
        let csvContent = `Budget Report - ${monthNames[month]} ${year}\n\n`;
        csvContent += 'Category,Budget,Spent,Remaining,Status\n';
        
        categories.forEach(category => {
            const budget = this.dataManager.getBudgetForCategory(category, month, year);
            const spent = categoryTotals[category] || 0;
            const remaining = budget - spent;
            const status = budget === 0 ? 'No Budget' : 
                          spent > budget ? 'Over Budget' :
                          spent > budget * 0.8 ? 'Warning' : 'On Track';
            
            csvContent += `"${category}",${budget},${spent},${remaining},"${status}"\n`;
        });
        
        this.downloadFile(
            csvContent,
            `budget-report-${monthNames[month].toLowerCase()}-${year}.csv`,
            'text/csv'
        );
        
        return csvContent;
    }
    
    // Import from JSON
    async importFromJSON(file) {
        try {
            const text = await this.readFileAsText(file);
            const data = JSON.parse(text);
            
            // Validate data structure
            if (!this.validateImportData(data)) {
                throw new Error('Invalid data format');
            }
            
            // Backup current data
            this.dataManager.createBackup();
            
            // Import data
            const success = this.dataManager.importData(data);
            
            if (success) {
                // Refresh the app
                if (window.expenseTracker) {
                    window.expenseTracker.loadData();
                    window.expenseTracker.refreshDisplay();
                }
                return { success: true, message: 'Data imported successfully' };
            } else {
                throw new Error('Failed to import data');
            }
        } catch (error) {
            console.error('Import error:', error);
            return { success: false, message: error.message };
        }
    }
    
    // Import from CSV
    async importFromCSV(file) {
        try {
            const text = await this.readFileAsText(file);
            const rows = this.parseCSV(text);
            
            if (rows.length === 0) {
                throw new Error('No data found in CSV file');
            }
            
            // Backup current data
            this.dataManager.createBackup();
            
            const result = this.processCSVData(rows);
            
            if (result.imported > 0) {
                // Refresh the app
                if (window.expenseTracker) {
                    window.expenseTracker.loadData();
                    window.expenseTracker.refreshDisplay();
                }
                return { 
                    success: true, 
                    message: `Imported ${result.imported} records. ${result.skipped} records skipped.`,
                    details: result
                };
            } else {
                throw new Error('No valid records found to import');
            }
        } catch (error) {
            console.error('CSV Import error:', error);
            return { success: false, message: error.message };
        }
    }
    
    parseCSV(text) {
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const rows = [];
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
                const values = this.parseCSVLine(line);
                if (values.length === headers.length) {
                    const row = {};
                    headers.forEach((header, index) => {
                        row[header.toLowerCase()] = values[index];
                    });
                    rows.push(row);
                }
            }
        }
        
        return rows;
    }
    
    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        values.push(current.trim());
        return values;
    }
    
    processCSVData(rows) {
        let imported = 0;
        let skipped = 0;
        const errors = [];
        
        rows.forEach((row, index) => {
            try {
                const type = (row.type || '').toLowerCase();
                const amount = parseFloat(row.amount);
                const date = new Date(row.date);
                
                if (isNaN(amount) || isNaN(date.getTime())) {
                    skipped++;
                    errors.push(`Row ${index + 2}: Invalid amount or date`);
                    return;
                }
                
                if (type === 'income') {
                    const month = date.getMonth();
                    const year = date.getFullYear();
                    this.dataManager.setIncome(Math.abs(amount), month, year);
                    imported++;
                } else if (type === 'expense') {
                    const expense = {
                        name: row.description || 'Imported Expense',
                        category: row.category || 'Other',
                        amount: Math.abs(amount)
                    };
                    this.dataManager.addExpenseForDate(date, expense);
                    imported++;
                } else {
                    skipped++;
                    errors.push(`Row ${index + 2}: Unknown type '${row.type}'`);
                }
            } catch (error) {
                skipped++;
                errors.push(`Row ${index + 2}: ${error.message}`);
            }
        });
        
        return { imported, skipped, errors };
    }
    
    validateImportData(data) {
        // Check if data has the expected structure
        return data && 
               typeof data === 'object' && 
               (data.incomes || data.expenses || data.budgets || data.goals);
    }
    
    // Utility methods
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = e => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
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
    
    isDateInRange(date, startDate, endDate) {
        if (startDate && date < startDate) return false;
        if (endDate && date > endDate) return false;
        return true;
    }
    
    // Create export modal
    showExportModal() {
        const modalHTML = `
            <div id="exportModal" class="modal">
                <div class="modal-content export-modal-content">
                    <div class="modal-header">
                        <h3>Export Data</h3>
                        <button id="closeExportModal" class="close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="export-options">
                            <div class="export-section">
                                <h4>Export Format</h4>
                                <div class="format-options">
                                    <label class="radio-option">
                                        <input type="radio" name="exportFormat" value="json" checked>
                                        <span>JSON (Complete Backup)</span>
                                    </label>
                                    <label class="radio-option">
                                        <input type="radio" name="exportFormat" value="csv">
                                        <span>CSV (Spreadsheet Compatible)</span>
                                    </label>
                                    <label class="radio-option">
                                        <input type="radio" name="exportFormat" value="monthly">
                                        <span>Monthly Report</span>
                                    </label>
                                    <label class="radio-option">
                                        <input type="radio" name="exportFormat" value="budget">
                                        <span>Budget Report</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="export-section csv-options" style="display: none;">
                                <h4>CSV Options</h4>
                                <div class="csv-filters">
                                    <div class="date-range">
                                        <label>Start Date:</label>
                                        <input type="date" id="exportStartDate">
                                        <label>End Date:</label>
                                        <input type="date" id="exportEndDate">
                                    </div>
                                    <div class="include-options">
                                        <label class="checkbox-option">
                                            <input type="checkbox" id="includeIncome" checked>
                                            <span>Include Income</span>
                                        </label>
                                        <label class="checkbox-option">
                                            <input type="checkbox" id="includeExpenses" checked>
                                            <span>Include Expenses</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="export-section report-options" style="display: none;">
                                <h4>Report Options</h4>
                                <div class="month-selector">
                                    <label>Month:</label>
                                    <select id="reportMonth">
                                        ${this.generateMonthOptions()}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="executeExport" class="btn btn-primary">Export</button>
                        <button id="closeExportModal" class="btn btn-secondary">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if present
        const existingModal = document.getElementById('exportModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.bindExportEvents();
        
        document.getElementById('exportModal').classList.add('active');
        document.getElementById('overlay').classList.add('active');
    }
    
    bindExportEvents() {
        // Close modal
        document.querySelectorAll('#closeExportModal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('exportModal').classList.remove('active');
                document.getElementById('overlay').classList.remove('active');
            });
        });
        
        // Format option changes
        document.querySelectorAll('input[name="exportFormat"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const csvOptions = document.querySelector('.csv-options');
                const reportOptions = document.querySelector('.report-options');
                
                if (e.target.value === 'csv') {
                    csvOptions.style.display = 'block';
                    reportOptions.style.display = 'none';
                } else if (e.target.value === 'monthly' || e.target.value === 'budget') {
                    csvOptions.style.display = 'none';
                    reportOptions.style.display = 'block';
                } else {
                    csvOptions.style.display = 'none';
                    reportOptions.style.display = 'none';
                }
            });
        });
        
        // Execute export
        document.getElementById('executeExport')?.addEventListener('click', () => {
            this.executeExport();
        });
    }
    
    generateMonthOptions() {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        let options = '';
        const currentDate = new Date();
        
        for (let year = currentDate.getFullYear() - 1; year <= currentDate.getFullYear() + 1; year++) {
            months.forEach((month, index) => {
                const value = `${year}-${index}`;
                const selected = (year === currentDate.getFullYear() && index === currentDate.getMonth()) ? 'selected' : '';
                options += `<option value="${value}" ${selected}>${month} ${year}</option>`;
            });
        }
        
        return options;
    }
    
    executeExport() {
        const format = document.querySelector('input[name="exportFormat"]:checked').value;
        
        try {
            switch (format) {
                case 'json':
                    this.exportToJSON();
                    break;
                case 'csv':
                    const options = {
                        startDate: document.getElementById('exportStartDate').value ? 
                                  new Date(document.getElementById('exportStartDate').value) : null,
                        endDate: document.getElementById('exportEndDate').value ? 
                                new Date(document.getElementById('exportEndDate').value) : null,
                        includeIncome: document.getElementById('includeIncome').checked,
                        includeExpenses: document.getElementById('includeExpenses').checked
                    };
                    this.exportToCSV(options);
                    break;
                case 'monthly':
                    const [year, month] = document.getElementById('reportMonth').value.split('-');
                    this.exportMonthlyReport(parseInt(month), parseInt(year));
                    break;
                case 'budget':
                    const [budgetYear, budgetMonth] = document.getElementById('reportMonth').value.split('-');
                    this.exportBudgetReport(parseInt(budgetMonth), parseInt(budgetYear));
                    break;
            }
            
            if (window.expenseTracker?.notificationManager) {
                window.expenseTracker.notificationManager.showSuccess('Export completed successfully');
            }
            
            // Close modal
            document.getElementById('exportModal').classList.remove('active');
            document.getElementById('overlay').classList.remove('active');
            
        } catch (error) {
            console.error('Export error:', error);
            if (window.expenseTracker?.notificationManager) {
                window.expenseTracker.notificationManager.showError('Export failed: ' + error.message);
            }
        }
    }
    
    // Create import modal
    showImportModal() {
        const modalHTML = `
            <div id="importModal" class="modal">
                <div class="modal-content import-modal-content">
                    <div class="modal-header">
                        <h3>Import Data</h3>
                        <button id="closeImportModal" class="close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="import-warning">
                            <p><strong>⚠️ Warning:</strong> Importing data will merge with existing data. Create a backup first!</p>
                        </div>
                        <div class="import-options">
                            <div class="file-input-section">
                                <label for="importFile" class="file-input-label">
                                    <span class="file-icon">📁</span>
                                    Choose File (JSON or CSV)
                                </label>
                                <input type="file" id="importFile" accept=".json,.csv" style="display: none;">
                                <div class="file-info" id="fileInfo" style="display: none;">
                                    <span class="file-name"></span>
                                    <span class="file-size"></span>
                                </div>
                            </div>
                        </div>
                        <div class="import-preview" id="importPreview" style="display: none;">
                            <h4>Import Preview</h4>
                            <div class="preview-content"></div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="executeImport" class="btn btn-primary" disabled>Import</button>
                        <button id="createBackup" class="btn btn-secondary">Create Backup First</button>
                        <button id="closeImportModal" class="btn btn-secondary">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if present
        const existingModal = document.getElementById('importModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.bindImportEvents();
        
        document.getElementById('importModal').classList.add('active');
        document.getElementById('overlay').classList.add('active');
    }
    
    bindImportEvents() {
        // Close modal
        document.querySelectorAll('#closeImportModal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('importModal').classList.remove('active');
                document.getElementById('overlay').classList.remove('active');
            });
        });
        
        // File selection
        document.getElementById('importFile')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleFileSelection(file);
            }
        });
        
        // File input label click
        document.querySelector('.file-input-label')?.addEventListener('click', () => {
            document.getElementById('importFile').click();
        });
        
        // Execute import
        document.getElementById('executeImport')?.addEventListener('click', () => {
            this.executeImport();
        });
        
        // Create backup
        document.getElementById('createBackup')?.addEventListener('click', () => {
            this.dataManager.createBackup();
            if (window.expenseTracker?.notificationManager) {
                window.expenseTracker.notificationManager.showSuccess('Backup created successfully');
            }
        });
    }
    
    handleFileSelection(file) {
        const fileInfo = document.getElementById('fileInfo');
        const fileName = fileInfo.querySelector('.file-name');
        const fileSize = fileInfo.querySelector('.file-size');
        const executeBtn = document.getElementById('executeImport');
        
        fileName.textContent = file.name;
        fileSize.textContent = this.formatFileSize(file.size);
        fileInfo.style.display = 'block';
        executeBtn.disabled = false;
        
        // Store file for import
        this.selectedFile = file;
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    async executeImport() {
        if (!this.selectedFile) return;
        
        const fileExtension = this.selectedFile.name.split('.').pop().toLowerCase();
        let result;
        
        try {
            if (fileExtension === 'json') {
                result = await this.importFromJSON(this.selectedFile);
            } else if (fileExtension === 'csv') {
                result = await this.importFromCSV(this.selectedFile);
            } else {
                throw new Error('Unsupported file format');
            }
            
            if (result.success) {
                if (window.expenseTracker?.notificationManager) {
                    window.expenseTracker.notificationManager.showSuccess(result.message);
                }
                
                // Close modal
                document.getElementById('importModal').classList.remove('active');
                document.getElementById('overlay').classList.remove('active');
            } else {
                if (window.expenseTracker?.notificationManager) {
                    window.expenseTracker.notificationManager.showError(result.message);
                }
            }
        } catch (error) {
            console.error('Import execution error:', error);
            if (window.expenseTracker?.notificationManager) {
                window.expenseTracker.notificationManager.showError('Import failed: ' + error.message);
            }
        }
    }
}
