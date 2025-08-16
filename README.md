# 💰 Smart Expense Tracker

A comprehensive, feature-rich expense tracking application built with pure HTML, CSS, and JavaScript. Track your monthly income, expenses, and savings with beautiful visualizations and smart analytics.

![Smart Expense Tracker](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)
![Tech Stack](https://img.shields.io/badge/Tech-HTML%20%7C%20CSS%20%7C%20JavaScript-orange.svg)

## ✨ Features

### 📊 **Dashboard Overview**
- **Monthly Income Tracking**: Set different income for each month
- **Real-time Balance**: See your remaining balance at a glance
- **Spending Summary**: Track total monthly expenses
- **Visual Cards**: Beautiful, animated dashboard cards with emoji icons

### 📅 **Calendar-Based Expense Management**
- **Interactive Calendar**: Click any date to add/view expenses
- **Visual Indicators**: See spending amounts directly on calendar dates
- **Month Navigation**: Easily switch between months with arrow controls
- **Today Highlighting**: Current date is clearly marked

### 🏷️ **Smart Categorization**
- **8 Expense Categories**: Food, Transportation, Entertainment, Shopping, Bills, Health, Education, Other
- **Category Icons**: Each category has distinct emoji icons for easy identification
- **Expense Management**: Add, edit, and delete expenses with full CRUD operations

### 📈 **Data Visualization**
- **Pie Chart**: Category-wise spending breakdown with percentages
- **Bar Chart**: Daily spending patterns throughout the month
- **Interactive Legend**: Color-coded category legend with amounts
- **Responsive Charts**: Charts adapt to different screen sizes

### 🔄 **Month-to-Month Comparison**
- **Smart Analytics**: Compare current month with previous month
- **Savings Tracking**: See if you're saving more or less than last month
- **Spending Analysis**: Track spending changes between months
- **Performance Indicators**: Visual feedback on financial performance (📈 Better / 📉 Needs Improvement)

### 🏦 **All-Time Financial Summary**
- **Total Income**: Cumulative income across all months
- **Total Expenses**: Sum of all expenses ever recorded
- **Total Savings**: Overall financial health indicator
- **Visual Status**: Color-coded savings (green for positive, red for negative)

### 📱 **Responsive Design**
- **Mobile-First**: Optimized for smartphones and tablets
- **Desktop Enhanced**: Rich experience on larger screens
- **Touch-Friendly**: Large touch targets for mobile users
- **Adaptive Layout**: Content reflows beautifully across devices

### 💾 **Data Persistence**
- **Local Storage**: All data saved in browser's local storage
- **Automatic Saving**: Changes are saved instantly
- **Data Isolation**: Each month's data is completely separate
- **No Server Required**: Works entirely offline

## 🚀 Quick Start

### Prerequisites
- Any modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software installation required

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KanishJebaMathewM/Smart-Expense-Tracker.git
   cd Smart-Expense-Tracker
   ```

2. **Open the application**
   ```bash
   # Option 1: Open directly in browser
   open index.html
   
   # Option 2: Use a simple HTTP server (recommended)
   python3 -m http.server 3000
   # Then open http://localhost:3000
   ```

3. **Start tracking your expenses!**

## 📖 Usage Guide

### Setting Up Your First Month

1. **Set Monthly Income**
   - Click the "Set Monthly Income" button
   - Enter your monthly income amount
   - Click "Save Income"

2. **Add Your First Expense**
   - Click on any date in the calendar
   - Fill in the expense details:
     - **Name**: Description of the expense
     - **Category**: Choose from 8 predefined categories
     - **Amount**: Enter the expense amount
   - Click "Add Expense"

### Managing Expenses

#### Adding Expenses
- Click any calendar date to open the expense modal
- Each date can have multiple expenses
- Expenses are automatically categorized and calculated

#### Editing Expenses
- Click the ✏️ edit button next to any expense
- Modify the details and click "Update Expense"

#### Deleting Expenses
- Click the 🗑️ delete button next to any expense
- Confirm deletion in the popup dialog

### Navigating Between Months

- Use the **‹** and **›** arrows in the calendar header
- Each month maintains its own:
  - Income setting
  - Expense records
  - Charts and analytics
  - Comparison data

### Understanding the Analytics

#### Dashboard Cards
- **Monthly Income**: Income set for current month
- **Total Spent**: Sum of all expenses for current month
- **Remaining**: Income minus expenses (color-coded)

#### Month Comparison
- Appears when both current and previous months have data
- Shows savings change, spending change, and performance
- Helps track financial progress over time

#### Charts
- **Category Chart**: Visual breakdown of spending by category
- **Daily Chart**: Shows spending patterns throughout the month
- Both charts update in real-time as you add expenses

#### All-Time Summary
- **Total Income**: Sum across all months
- **Total Expenses**: Cumulative spending
- **Total Savings**: Overall financial position

## 📁 Project Structure

```
Smart-Expense-Tracker/
├── index.html          # Main HTML file
├── style.css           # Complete CSS styling
├── script.js           # Core JavaScript functionality
├── counter.js          # Additional utilities
└── README.md           # This documentation
```

### Key Files Explained

#### `index.html`
- Main application structure
- Modal dialogs for income and expense management
- Responsive layout with semantic HTML

#### `style.css` 
- Comprehensive styling with CSS custom properties
- Mobile-first responsive design
- Dark/light theme support
- Smooth animations and transitions
- Glass-morphism effects for modern UI

#### `script.js`
- Core expense tracking logic
- Local storage management
- Chart rendering with Canvas API
- Event handling and user interactions
- Data validation and calculations

## 🛠️ Technical Details

### Technologies Used
- **HTML5**: Semantic markup and structure
- **CSS3**: Advanced styling with custom properties, flexbox, grid
- **Vanilla JavaScript**: No frameworks or dependencies
- **Canvas API**: For chart rendering
- **Local Storage API**: For data persistence

### Browser Support
- ✅ Chrome 70+
- ✅ Firefox 65+
- ✅ Safari 12+
- ✅ Edge 79+

### Performance Features
- **Lightweight**: No external dependencies
- **Fast Loading**: Minimal resource usage
- **Efficient Storage**: Optimized data structures
- **Smooth Animations**: Hardware-accelerated CSS transitions

## 🎨 Design Features

### Color Scheme
- **Primary**: Blue (#3B82F6) for main actions
- **Success**: Green (#10B981) for positive values
- **Error**: Red (#EF4444) for negative values
- **Neutral**: Gray scale for text and backgrounds

### Typography
- **Font Family**: Inter (Google Fonts)
- **Responsive Text**: Scales appropriately across devices
- **Accessibility**: High contrast ratios for readability

### UI Components
- **Glass-morphism Cards**: Modern, translucent design
- **Animated Interactions**: Smooth hover and click effects
- **Color-coded Categories**: Visual association with expense types
- **Status Indicators**: Immediate visual feedback

## 🔧 Customization

### Adding New Categories
1. Open `script.js`
2. Find the `categoryColors` object
3. Add new category with color:
   ```javascript
   'NewCategory': '#HEX_COLOR'
   ```
4. Update the HTML select options in `index.html`

### Modifying Colors
1. Edit CSS custom properties in `style.css`
2. Look for `:root` section with color variables
3. Change values to your preferred colors

### Extending Features
The modular structure makes it easy to add:
- New chart types
- Additional expense fields
- Export functionality
- Data backup/restore

## 📱 Mobile Experience

### Optimized Features
- **Touch-friendly Interface**: Large buttons and touch targets
- **Swipe Navigation**: Easy month switching
- **Responsive Charts**: Optimized for small screens
- **Modal Dialogs**: Full-screen on mobile for better usability

### Performance
- **Fast Loading**: Optimized for mobile networks
- **Efficient Memory**: Minimal resource usage
- **Smooth Scrolling**: Optimized scroll performance

## 🔒 Privacy & Security

### Data Handling
- **Local Only**: All data stays in your browser
- **No Server**: No data transmitted to external servers
- **Private**: Complete privacy of financial information
- **Secure**: Uses browser's built-in security features

### Data Management
- **Backup**: Export your data manually if needed
- **Clear Data**: Clear browser storage to reset
- **Migration**: Copy local storage to move between devices

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Contribution Guidelines
- Follow existing code style
- Test on multiple browsers
- Update documentation if needed
- Keep commits focused and clear

### Reporting Issues
Please use GitHub issues to report:
- Bugs or errors
- Feature requests
- Performance issues
- Documentation improvements

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Kanish Jeba Mathew M**
- GitHub: [@KanishJebaMathewM](https://github.com/KanishJebaMathewM)

## 🎯 Future Enhancements

### Planned Features
- [ ] Data export (CSV, JSON)
- [ ] Budget setting and alerts
- [ ] Recurring expense templates
- [ ] Multi-currency support
- [ ] Advanced analytics and trends
- [ ] Expense categories customization
- [ ] Data backup and sync

### Community Suggestions
We're open to feature requests! Please create an issue to suggest new features.

## 📞 Support

### Getting Help
- **Documentation**: Check this README first
- **Issues**: Create a GitHub issue for bugs
- **Discussions**: Use GitHub discussions for questions

### Troubleshooting

#### Common Issues
1. **Data not saving**: Check if browser storage is enabled
2. **Charts not showing**: Ensure JavaScript is enabled
3. **Mobile layout issues**: Try refreshing the page
4. **Performance problems**: Clear browser cache

#### Browser Storage
- Uses approximately 1-5MB for typical usage
- Automatically managed by browser
- Can be cleared from browser settings

---

**Made with ❤️ for better financial management**

*Last updated: August 2025*
