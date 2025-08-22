# Data Persistence Test Guide

## How to Test if Data Persists After Logout/Login

### Step 1: Open Browser Console
1. Press **F12** (or right-click → Inspect)
2. Go to **Console** tab
3. Clear the console (click the clear button 🗑️)

### Step 2: Login/Create Account
1. If you have an account, login
2. If not, create a new account
3. **Look for colored console messages** - you should see:
   - `🧪 TESTING DATA PERSISTENCE` in green
   - `✅ User session found: [user-id]`
   - `📊 Data keys found: [array of keys]`

### Step 3: Add Some Test Data
1. **Set Income**: Click "Set Income" → Enter amount (e.g., 50000) → Save
2. **Add Expenses**: 
   - Click any date on calendar
   - Add expense (e.g., "Groceries", Food category, 2000)
   - Add another (e.g., "Gas", Transportation, 1500)
3. **Add Task**:
   - Go to Tasks tab
   - Click "Add Task"
   - Create task with budget (e.g., "Buy laptop", Shopping, 50000 budget)

### Step 4: Verify Data is Saved
1. In console, type: `testDataPersistence()` and press Enter
2. You should see your data listed in the console

### Step 5: Logout
1. Click profile icon (top right) → Click "Logout" 
2. You should see "Your data is preserved" message

### Step 6: Login Again  
1. Enter your PIN and login
2. **Check Console** - look for:
   - `🎉 DATA FOUND! Found X total entries` in green
   - OR `📝 NO DATA FOUND ANYWHERE` in orange

### Step 7: Verify Data is Restored
1. Check if your income amount is still there
2. Check if expenses are visible on calendar dates
3. Check if tasks are still in Tasks tab

## What to Look For:

### ✅ **SUCCESS** - Data Persists:
- Console shows: `🎉 DATA FOUND! Found X total entries`
- Income, expenses, and tasks are exactly as you left them

### ❌ **FAILURE** - Data Lost:
- Console shows: `📝 NO DATA FOUND ANYWHERE`
- Income shows 0, no expenses on calendar, no tasks

## If Data is Still Lost:

1. **Copy ALL console output** and share it
2. In console, type: `Object.keys(localStorage)` and share the result
3. Try typing: `localStorage.getItem('current_user_id')` and share result

This will help identify exactly what's happening with the data storage.
