// Simple Data Persistence Test
// Add this to test data persistence without complex debugging

function testDataPersistence() {
    console.log('%c🧪 TESTING DATA PERSISTENCE', 'color: green; font-size: 20px; font-weight: bold;');
    
    // Check if user is logged in
    const currentUserId = localStorage.getItem('current_user_id');
    const sessionData = localStorage.getItem('app_session_token');
    
    if (!currentUserId || !sessionData) {
        console.log('%c❌ No user session found', 'color: red; font-size: 16px;');
        return;
    }
    
    console.log('%c✅ User session found:', 'color: green; font-size: 14px;', currentUserId);
    
    // Check what data exists in localStorage
    const allKeys = Object.keys(localStorage);
    const dataKeys = allKeys.filter(key => 
        key.includes('profile_data') || 
        key.includes('income') || 
        key.includes('expense') || 
        key.includes('task')
    );
    
    console.log('%c📊 Data keys found:', 'color: blue; font-size: 14px;', dataKeys);
    
    // Show actual data
    dataKeys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
            try {
                const parsed = JSON.parse(data);
                console.log(`%c📁 ${key}:`, 'color: purple; font-weight: bold;', parsed);
            } catch (e) {
                console.log(`%c📁 ${key} (raw):`, 'color: orange;', data);
            }
        }
    });
}

// Test on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testDataPersistence);
} else {
    testDataPersistence();
}

// Make it globally available
window.testDataPersistence = testDataPersistence;
