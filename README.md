# Trello Approvals Power-Up

A Trello Power-Up that adds approval workflows to your Trello cards. Team members can approve, reject, or request changes on cards, with real-time status tracking and visual indicators.

## 🚀 Features

- **Visual Approval Status**: See approval status at a glance with color-coded indicators
- **Individual Member Actions**: Each team member can approve, reject, or reset their status
- **Real-time Updates**: Status changes are immediately reflected across all views
- **Smart Status Logic**: Overall card status based on individual member approvals
- **Member Management**: Easy selection of which team members need to provide approval
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 📁 Project Structure

```
trello-approvals/
├── index.html              # Main Power-Up entry point
├── approval-section.html   # Approval status view (card sections)
├── manage-approvals.html   # Member selection popup
├── css/
│   └── style.css          # Consolidated styles for all components
├── js/
│   ├── client.js          # Main Power-Up logic and Trello integration
│   ├── mock-data.js       # Centralized mock data for development
│   └── mock-utils.js      # Smart mocking system and API abstraction
└── README.md              # This file
```

## 🎯 How It Works

### 1. **Setup Approvals**
- Click "Manage Approvals" from the card menu
- Select team members who need to provide approval
- Save to create the approval workflow

### 2. **Approval Process**
- Team members see the approval section on cards
- Each member can:
  - ✅ **Approve**: Mark as approved
  - ❌ **Reject**: Mark as rejected  
  - 🔄 **Reset**: Return to pending status

### 3. **Status Logic**
The overall card status follows this priority:
1. **Pending**: If any member has pending approval
2. **Rejected**: If no pending and at least one rejection
3. **Approved**: If all members have approved

### 4. **Visual Indicators**
- **Purple**: Pending approvals
- **Green**: Approved
- **Red**: Rejected
- **Yellow highlight**: Current user's row

## 🛠️ Development & Testing

### Smart Mocking System

This project includes an intelligent mocking system for development and testing that **automatically detects** when to use mock data without requiring code changes.

#### 🎛️ Ways to Enable Mock Mode

1. **🔗 URL Parameter** (Quick testing):
   ```
   approval-section.html?mock=true
   manage-approvals.html?mock=true
   ```

2. **💾 Browser Console** (Persistent for development):
   ```javascript
   // Enable mock mode (persists until disabled)
   TrelloMockUtils.enableMockMode()
   
   // Disable mock mode
   TrelloMockUtils.disableMockMode()
   
   // Toggle current state
   TrelloMockUtils.toggleMockMode()
   
   // Check current status
   TrelloMockUtils.logModeStatus()
   ```

3. **🏠 Auto-Detection** (Automatic):
   - Automatically enables on `localhost`, `127.0.0.1`, or `.local` domains
   - No setup required for local development

#### 🎭 Mock Data Features

- **Consistent Data**: Same mock users across all components
- **Realistic Scenarios**: Mix of approved, rejected, and pending statuses
- **Visual Feedback**: Console logs clearly indicate mock mode
- **Zero Risk**: No chance of accidentally deploying with mock data enabled

#### 👨‍💻 Developer Experience

When mock mode is active, you'll see:
```
🎭 Running in MOCK mode
📝 Mock mode enabled by:
  • URL parameter (?mock=true)
💡 Use TrelloMockUtils.disableMockMode() to disable
```

All API calls are intercepted and return mock data instead of calling Trello APIs:
```
🎭 [MOCK] Getting current member: user123
🎭 [MOCK] Getting approval data
🎭 [MOCK] Saving approval data: {...}
```

### File Purposes

#### HTML Files
- **`index.html`**: Main Power-Up entry point, loads the Trello Power-Up framework
- **`approval-section.html`**: Displays approval status and member actions within cards
- **`manage-approvals.html`**: Popup for selecting which members need to provide approval

#### JavaScript Files
- **`client.js`**: Core Power-Up logic, defines capabilities and UI integration
- **`mock-data.js`**: Centralized mock data with helper functions
- **`mock-utils.js`**: Smart detection system and API abstraction layer

#### CSS Files
- **`style.css`**: Consolidated styles for all components, optimized and cleaned of unused rules

## 🔧 Installation & Setup

### For Trello Power-Up Development

1. **Host the files** on a web server (GitHub Pages, Netlify, etc.)

2. **Create a Power-Up** in Trello:
   - Go to [https://trello.com/power-ups/admin](https://trello.com/power-ups/admin)
   - Create new Power-Up
   - Set the iframe connector URL to your hosted `index.html`

3. **Add to a board**:
   - Go to any Trello board
   - Click "Power-Ups" → "Add Power-Ups"
   - Find your Power-Up and enable it

### For Local Development

1. **Clone/download** the project files

2. **Start a local server**:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Access with mock data**:
   ```
   http://localhost:8000/approval-section.html?mock=true
   http://localhost:8000/manage-approvals.html?mock=true
   ```

## 📱 Usage Examples

### Setting Up Approvals

1. Open a Trello card
2. Click "Manage Approvals" from the card menu
3. Select team members (e.g., John Doe, Jane Smith, Mike Johnson)
4. Click "Save Changes"
5. The approval section will appear on the card

### Using Approvals

1. **As a team member**:
   - Open the card
   - Find the "Approvals" section
   - Click "Approve" or "Reject" buttons
   - Your status updates immediately

2. **As a project manager**:
   - View overall status in the banner
   - See individual member statuses
   - Track progress across team members

### Modifying Approvals

1. Click "Manage Approvals" again
2. Add/remove team members as needed
3. Existing statuses are preserved when possible
4. Use "Delete All" to completely remove approvals

## 🎨 Customization

### Styling
All styles are in `css/style.css`. Key customizable elements:

```css
/* Status colors */
.status-pending { background-color: #7c3aed; }
.status-approved { background-color: #10b981; }
.status-rejected { background-color: #ef4444; }

/* Current user highlighting */
.approval-member.current-user { 
    background-color: #fff8e1;
    border-left: 3px solid #ffc107;
}
```

### Mock Data
Customize mock users in `js/mock-data.js`:

```javascript
window.TrelloMockData = {
    boardMembers: [
        {
            id: 'user123',
            fullName: 'Your Name',
            username: 'yourname',
            avatarUrl: 'your-avatar-url'
        }
        // Add more users...
    ]
};
```

## 🐛 Troubleshooting

### Common Issues

**Problem**: "No approvals created" message appears
- **Solution**: First use "Manage Approvals" to select team members

**Problem**: Can't see approval buttons
- **Solution**: Hover over your own row to see action buttons

**Problem**: Changes not saving
- **Solution**: Check browser console for errors, ensure proper Trello Power-Up setup

**Problem**: Mock data not loading
- **Solution**: Add `?mock=true` to URL or use `TrelloMockUtils.enableMockMode()`

### Development Debugging

1. **Check mock mode status**:
   ```javascript
   TrelloMockUtils.logModeStatus()
   ```

2. **Force mock mode**:
   ```javascript
   TrelloMockUtils.enableMockMode()
   // Then reload the page
   ```

3. **Check browser console** for detailed logging:
   - Mock mode indicators: `🎭 [MOCK]`
   - API calls and responses
   - Error messages and stack traces

### Browser Compatibility

- **Supported**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Required**: ES6 features (Promises, const/let, arrow functions)
- **Responsive**: Works on mobile devices and tablets

## 🔐 Security & Privacy

- **No external dependencies**: All code is self-contained
- **Trello API only**: Data is stored using Trello's official APIs
- **No data collection**: No analytics or tracking
- **Local mock data**: Development data never leaves your browser

## 📄 License

This project is open source. Feel free to modify and distribute according to your needs.

## 🤝 Contributing

1. Fork the repository
2. Make your changes
3. Test with mock data using `?mock=true`
4. Submit a pull request

For development, use the mock system to avoid affecting real Trello data:
```javascript
// Enable persistent mock mode for development
TrelloMockUtils.enableMockMode()
```

---

**Need help?** Check the browser console for detailed logs and error messages. The mock system provides extensive debugging information to help identify issues.