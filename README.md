# Yearify - Year Progress Tracker

A modern, feature-rich web application that visually tracks the progress of time across multiple scales - year, month, week, and day. Yearify provides real-time progress visualization with advanced features like milestone tracking, custom date ranges, GitHub integration, and a beautiful dark/light theme system.

![Yearify Screenshot](https://via.placeholder.com/800x400/23272f/00cec9?text=Yearify+Progress+Tracker)

## 🌟 Features

### 📊 **Multi-Scale Progress Tracking**
- **Year Progress**: Visual progress bar showing how much of the current year has passed
- **Month Progress**: Current month completion percentage
- **Week Progress**: Current week advancement
- **Day Progress**: Real-time daily progress (hours passed)
- **Custom Date Ranges**: Set any start and end date for personalized tracking

### 🎯 **Milestone Management**
- **Add Milestones**: Mark important dates with custom labels, colors, and emojis
- **Visual Indicators**: Milestones appear as markers on progress bars
- **GitHub Sync**: Save and sync milestones across devices via GitHub Gists
- **Milestone Panel**: Comprehensive management interface for all milestones
- **Smart Positioning**: Automatic milestone positioning on progress bars

### 🎨 **Theme System**
- **Dark/Light Mode**: Beautiful theme toggle with smooth transitions
- **Adaptive Colors**: All UI elements adapt to the selected theme
- **System Integration**: Respects user's system preferences
- **Custom Styling**: Unique yearify-pixel header with theme-aware styling

### 🔧 **Custom Range Features**
- **Flexible Date Selection**: Choose any start and end date
- **Quick Presets**: 
  - This Quarter
  - This Semester  
  - Last 30 Days
  - Next 30 Days
  - Year Remaining
- **Persistence**: Custom ranges save across browser sessions
- **Real-time Updates**: Progress updates automatically as time passes

### 🔐 **GitHub Integration**
- **OAuth Authentication**: Secure login with GitHub
- **Data Synchronization**: Sync milestones and settings across devices
- **Gist Storage**: Uses private GitHub Gists for data storage
- **Offline Fallback**: Works without login using local storage

### 🎉 **User Experience**
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Real-time Updates**: All progress bars update every minute
- **Smooth Animations**: Fluid transitions and loading states
- **Daily Quotes**: Inspirational quotes that change daily
- **Image Export**: Download progress as image for sharing
- **Copy Progress**: Copy progress text to clipboard

### 🛠️ **Advanced Features**
- **Service Worker**: Offline functionality and caching
- **Error Handling**: Comprehensive error management and recovery
- **Performance Monitoring**: Built-in performance tracking
- **Accessibility**: Keyboard navigation and screen reader support
- **Toast Notifications**: User-friendly feedback system

## 🚀 Live Demo

[**🌐 View Yearify Live**](https://pappater.github.io/yearprogress/)

Experience all features instantly - no installation required!

## 📖 Quick Start

### Option 1: Use Online (Recommended)
Simply visit the [live demo](https://pappater.github.io/yearprogress/) and start tracking your progress immediately.

### Option 2: Local Development
1. **Clone the repository:**
   ```bash
   git clone https://github.com/pappater/yearprogress.git
   cd yearprogress
   ```

2. **Start a local server:**
   ```bash
   # Using Python
   python3 -m http.server 8080
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8080
   ```

3. **Open in browser:**
   Navigate to `http://localhost:8080`

## 🏗️ Project Architecture

### **Frontend Structure**
```
yearify/
├── src/
│   ├── components/           # Core application components
│   │   ├── auth-manager.js      # GitHub authentication
│   │   ├── custom-range-manager.js  # Custom date ranges
│   │   ├── milestone-manager.js     # Milestone functionality
│   │   ├── progress-tracker.js     # Progress calculations
│   │   ├── theme-manager.js        # Theme system
│   │   └── ui-controls.js          # UI interactions
│   ├── config/              # Configuration files
│   │   └── auth-config.js          # Authentication settings
│   ├── data/                # Data and utilities
│   │   └── quotes.js               # Daily quotes system
│   ├── styles/              # Styling and themes
│   │   ├── components.css          # Component styles
│   │   ├── layout.css              # Layout and structure
│   │   ├── responsive.css          # Mobile responsiveness
│   │   └── theme.css               # Theme variables
│   ├── utils/               # Utility functions
│   │   └── date-utils.js           # Date calculations
│   └── app.js               # Main application entry
├── backend/                 # Optional backend services
│   └── server.js               # Express server for automation
├── index.html              # Main HTML file
├── style.css               # Additional styles
├── yearify-header.css      # Header-specific styling
└── sw.js                   # Service worker for PWA features
```

### **Core Components**

#### **ProgressTracker**
- Calculates progress percentages for all time scales
- Updates UI elements with real-time data
- Handles custom date range calculations
- Formats progress text and percentages

#### **MilestoneManager**
- Creates, edits, and deletes milestones
- Syncs data with GitHub Gists
- Positions milestones on progress bars
- Manages milestone panel interface

#### **CustomRangeManager**
- Handles custom date range selection
- Provides quick preset options
- Persists ranges across sessions
- Validates date inputs and ranges

#### **ThemeManager**
- Manages dark/light theme switching
- Handles system preference detection
- Smooth theme transition animations
- Persists theme choice

#### **AuthManager**
- GitHub OAuth flow management
- Token storage and validation
- User session management
- Data synchronization coordination

## 🎯 How to Use

### **Basic Usage**
1. **View Progress**: Open the app to see current year, month, week, and day progress
2. **Switch Themes**: Click the theme toggle button for dark/light mode
3. **Read Daily Quote**: Enjoy a new inspirational quote each day

### **Adding Milestones**
1. Click the **"+"** button in the header
2. Select a date and optional time
3. Add a custom label and choose a color
4. Pick an emoji icon from suggestions
5. Click **"Add"** to save

### **Custom Date Ranges**
1. Scroll to the **"Custom Range"** section
2. **Quick Presets**: Click preset buttons for common ranges
3. **Manual Entry**: Use date pickers for custom start/end dates
4. **Clear Range**: Use the X button to remove custom range

### **GitHub Integration**
1. Click **"Login"** button in the header
2. Authorize with GitHub (redirects to GitHub)
3. Your milestones and settings sync automatically
4. Data persists across all your devices

### **Milestone Management**
1. Click the **grid icon** to open milestone panel
2. **View All**: See complete list of milestones
3. **Edit**: Modify existing milestones
4. **Delete**: Remove unwanted milestones
5. **Export**: Download milestone data

### **Sharing Progress**
1. Click the **hamburger menu** (three lines)
2. **Copy Progress**: Copy text to clipboard
3. **Share as Image**: Generate shareable image
4. **Download Image**: Save progress visualization

## ⚙️ Configuration

### **GitHub OAuth Setup** (Optional)
To enable GitHub integration for your own deployment:

1. **Create GitHub OAuth App:**
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Click "New OAuth App"
   - Set Authorization callback URL to your domain

2. **Update Configuration:**
   ```javascript
   // src/config/auth-config.js
   export const CLIENT_ID = 'your_github_client_id';
   export const REDIRECT_URI = 'https://yourdomain.com/';
   ```

### **Customization Options**
- **Quotes**: Edit `src/data/quotes.js` to add custom daily quotes
- **Colors**: Modify theme colors in `src/styles/theme.css`
- **Presets**: Add custom date presets in `CustomRangeManager`

## 🔧 Technical Details

### **Browser Compatibility**
- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 12+
- **Edge**: 79+

### **Dependencies**
- **Frontend**: Pure vanilla JavaScript (no frameworks)
- **Backend**: Node.js with Express (optional)
- **APIs**: GitHub REST API for data sync
- **Storage**: localStorage + GitHub Gists

### **Performance Features**
- **Lazy Loading**: Components load on demand
- **Service Worker**: Caches resources for offline use
- **Optimized Updates**: Smart refresh intervals
- **Error Recovery**: Automatic retry mechanisms

### **Security**
- **OAuth Flow**: Secure GitHub authentication
- **Token Storage**: Encrypted local storage
- **Data Privacy**: No analytics or tracking
- **HTTPS**: All API calls over secure connections

## 📱 Mobile Experience

Yearify is fully optimized for mobile devices:
- **Touch-Friendly**: Large tap targets and intuitive gestures
- **Responsive Layout**: Adapts to all screen sizes
- **Mobile Menus**: Collapsible navigation for small screens
- **Fast Loading**: Optimized assets and caching
- **PWA Ready**: Add to home screen capability

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Commit changes:** `git commit -m 'Add amazing feature'`
5. **Push to branch:** `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### **Development Guidelines**
- Follow existing code style and patterns
- Add comments for complex functionality
- Test on multiple browsers and devices
- Update documentation for new features
- Ensure accessibility compliance

## 🐛 Bug Reports & Feature Requests

Found a bug or have a feature idea?
- **Bug Reports**: [Open an issue](https://github.com/pappater/yearprogress/issues) with detailed reproduction steps
- **Feature Requests**: Describe your idea and use case
- **Questions**: Check existing issues or start a discussion

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Design Inspiration**: Modern productivity apps and time tracking tools
- **Icons**: SVG icons from various open-source collections
- **Color Palette**: Carefully selected for accessibility and aesthetics
- **Community**: Thanks to all contributors and users!

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/pappater/yearprogress?style=social)
![GitHub forks](https://img.shields.io/github/forks/pappater/yearprogress?style=social)
![GitHub issues](https://img.shields.io/github/issues/pappater/yearprogress)
![GitHub license](https://img.shields.io/github/license/pappater/yearprogress)

---

**Built with ❤️ by [pappater](https://github.com/pappater)**

*Track your time, achieve your goals, make every moment count with Yearify!*
