# Smart Expense Tracker

A comprehensive and user-friendly expense tracking application built with vanilla HTML, CSS, and JavaScript. Features a clean, modern interface with robust functionality for managing personal finances.

## 🌟 Features

### Core Functionality
- **📊 Dashboard Overview**: Real-time financial summary with income, expenses, balance, and savings rate
- **📅 Interactive Calendar**: Visual expense tracking with easy date-based entry
- **💰 Month-Specific Income**: Set different income amounts for each month
- **📈 Month Comparison**: Compare current month with previous month performance
- **📊 Visual Charts**: Category breakdown pie chart and daily spending bar chart
- **💳 All-Time Totals**: Comprehensive lifetime financial summary

### Smart Features
- **🎯 Smart Alerts**: Proper error handling with user-friendly notifications
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **🔄 Offline Support**: Progressive Web App with service worker for offline functionality
- **📋 Monthly Reports**: Detailed financial analysis with insights and recommendations
- **📤 Data Export**: Export your financial data in JSON format
- **⌨️ Keyboard Shortcuts**: Quick access with Ctrl+I (income), Ctrl+E (expense), Esc (close)

### Categories
- 🍔 Food
- 🚗 Transportation
- 🎬 Entertainment
- 🛒 Shopping
- 🧾 Bills
- 🏥 Health
- 📚 Education
- 📦 Other

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software installation required

### Installation
1. Download or clone this repository
2. Open `index.html` in your web browser
3. Start tracking your expenses!

### First Time Setup
1. The app will prompt you to set your monthly income
2. Click on any date in the calendar to add expenses
3. View your financial overview in the dashboard

## 💡 Usage

### Adding Income
- Click "Set Income" button in the header or dashboard
- Enter your monthly income amount
- Income is set per month, so you can have different amounts for different months

### Adding Expenses
- Click on any date in the calendar
- Fill in expense name, select category, and enter amount
- Save to add the expense to that date

### Viewing Reports
- Navigate to the "Reports" tab
- Click "Generate Monthly Report" for detailed analysis
- Export your data using the "Export Data" button

### Navigation
- **Dashboard**: Main overview with cards and charts
- **Analytics**: Detailed spending analysis and patterns
- **Reports**: Monthly reports and data export

## 🛠️ Technical Details

### Architecture
- **Frontend**: Pure HTML5, CSS3, and ES6+ JavaScript
- **Storage**: Browser localStorage for data persistence
- **Offline**: Service Worker for PWA functionality
- **Responsive**: CSS Grid and Flexbox for responsive design

### File Structure
```
├── index.html          # Main application file
├── app.js             # Consolidated JavaScript application
├── style.css          # Main styles and responsive design
├── report-styles.css  # Additional styles for reports
├── sw.js             # Service Worker for offline support
└── README.md         # Documentation
```

### Browser Support
- Chrome/Chromium 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 🎨 Design Features

### Color Scheme
- Modern blue and teal gradient design
- High contrast for accessibility
- Consistent spacing and typography
- Smooth animations and transitions

### User Experience
- Intuitive navigation with clear visual hierarchy
- Loading animations and smooth transitions
- Error handling with friendly messages
- Keyboard shortcuts for power users

## 📊 Data Management

### Storage
- All data stored locally in browser localStorage
- No server required - completely client-side
- Data persists between sessions
- Export functionality for backup

### Privacy
- No data sent to external servers
- Complete privacy - all data stays on your device
- No tracking or analytics
- No account registration required

## 🔧 Customization

The application uses CSS custom properties (variables) for easy theming:
- Primary colors: `--primary-500`, `--primary-600`, etc.
- Spacing: `--spacing-4`, `--spacing-6`, etc.
- Typography: `--font-size-base`, `--font-weight-medium`, etc.

## 🚀 Future Enhancements

Potential features for future versions:
- Budget management with alerts
- Goal setting and tracking
- Recurring expense management
- Data synchronization across devices
- Multiple currency support
- Advanced analytics and forecasting

## 🤝 Contributing

This is a personal expense tracking tool, but suggestions and improvements are welcome! Feel free to:
- Report bugs or issues
- Suggest new features
- Improve documentation
- Enhance the user interface

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check browser console for error messages
2. Ensure you're using a modern browser
3. Try refreshing the page or clearing browser cache
4. Verify localStorage is enabled in your browser

## 🎯 Version 2.0.0

This version represents a complete rewrite with:
- ✅ Consolidated JavaScript for better performance
- ✅ Improved error handling and user feedback
- ✅ Enhanced UI with better responsiveness
- ✅ Simplified architecture for easier maintenance
- ✅ Better accessibility and keyboard navigation
- ✅ Progressive Web App features

---

**Start tracking your expenses today and take control of your finances!** 💰📊
