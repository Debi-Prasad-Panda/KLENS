# Settings Section Features

## Overview
The Settings section provides user preferences, security settings, notifications, and privacy controls.

## Key Components

### 1. Notifications Settings
- **Email Notifications**: Toggle email alerts
- **Push Notifications**: Browser push notifications
- **Critical Alerts Only**: Filter to critical events
- **Notification Frequency**: Immediate, Daily digest, Weekly summary
- **Notification Types**:
  - Document uploads
  - Approval requests
  - Compliance alerts
  - System updates

### 2. Security Settings
- **Change Password**: Update account password
- **Two-Factor Authentication (2FA)**:
  - Enable/disable 2FA
  - QR code for authenticator app
  - Backup codes generation
  - SMS fallback option
- **Active Sessions**:
  - List of logged-in devices
  - Device information (browser, OS, location)
  - Last activity timestamp
  - Remote logout capability
- **Security Audit Log**: Recent security events

### 3. Preferences Settings
- **Theme Selection**:
  - Dark Mode (default)
  - Light Mode
  - Auto (system preference)
  - Custom themes (future)
- **Language Selection**:
  - English (primary)
  - Hindi
  - Malayalam
  - Tamil
  - Telugu
  - Kannada
  - Bengali
  - Marathi
  - Gujarati
  - Punjabi
- **Date Format**:
  - DD/MM/YYYY (Indian)
  - MM/DD/YYYY (US)
  - YYYY-MM-DD (ISO)
- **Time Format**: 12-hour, 24-hour
- **Timezone**: Auto-detect or manual selection

### 4. Privacy Settings
- **Show Online Status**: Visibility to other users
- **Allow Analytics**: Usage data collection
- **Data Sharing**: Share data with third parties
- **Download My Data**: GDPR data export
- **Delete Account**: Permanent account deletion
- **Cookie Preferences**: Manage cookie consent

### 5. Display Settings
- **Sidebar Position**: Left, Right
- **Compact Mode**: Reduce spacing
- **Font Size**: Small, Medium, Large
- **Animation Speed**: Slow, Normal, Fast, Off
- **Color Scheme**: Accent color selection

## Technical Implementation

### Frontend Components
- `SettingsView.tsx`: Main settings interface
- Setting category panels
- Toggle switches
- Dropdown selectors
- Modal dialogs for confirmations

### State Management
- **Local Storage**: Save preferences locally
- **API Sync**: Sync to backend for cross-device
- **Real-time Updates**: WebSocket for live changes
- **Optimistic Updates**: Update UI immediately

### Data Persistence
- **User Preferences Table**: Store user settings
- **Encrypted Storage**: Sensitive settings encrypted
- **Backup**: Regular backups of settings
- **Restore**: Restore default settings option

## Integration Points

### Backend APIs
- `GET /api/settings/` - Fetch user settings
- `PUT /api/settings/` - Update settings
- `POST /api/settings/reset` - Reset to defaults
- `GET /api/settings/sessions` - List active sessions
- `DELETE /api/settings/sessions/{id}` - Revoke session
- `POST /api/settings/2fa/enable` - Enable 2FA
- `POST /api/settings/2fa/verify` - Verify 2FA code

### Database Schema
- **user_settings table**: User preferences
- **user_sessions table**: Active sessions
- **security_events table**: Security audit log

## Security Features

### Password Management
- **Strength Validation**: Minimum 8 characters, uppercase, lowercase, number, special
- **Password History**: Prevent reuse of last 5 passwords
- **Expiration**: Optional password expiration (90 days)
- **Breach Detection**: Check against known breaches (HaveIBeenPwned)

### Two-Factor Authentication
- **TOTP**: Time-based one-time passwords
- **Authenticator Apps**: Google Authenticator, Authy, Microsoft Authenticator
- **Backup Codes**: 10 single-use backup codes
- **SMS Fallback**: Optional SMS verification
- **Recovery Email**: Alternative recovery method

### Session Management
- **Session Timeout**: Auto-logout after 30 minutes inactivity
- **Concurrent Sessions**: Limit to 5 active sessions
- **Device Fingerprinting**: Detect suspicious devices
- **IP Tracking**: Log IP addresses
- **Geolocation**: Track login locations

## Privacy Features

### Data Export (GDPR)
- **Export Format**: JSON, CSV, PDF
- **Data Included**:
  - User profile
  - Documents uploaded
  - Search history
  - Activity logs
  - Settings
- **Delivery**: Email download link
- **Encryption**: Encrypted ZIP file

### Data Deletion
- **Soft Delete**: Mark as deleted, retain for 30 days
- **Hard Delete**: Permanent deletion after 30 days
- **Anonymization**: Replace PII with anonymous IDs
- **Cascade**: Delete related data (documents, logs)
- **Confirmation**: Require password + 2FA

### Cookie Management
- **Essential Cookies**: Required for functionality
- **Analytics Cookies**: Optional usage tracking
- **Marketing Cookies**: Optional advertising
- **Consent Banner**: GDPR-compliant consent
- **Granular Control**: Enable/disable by category

## User Experience

### Visual Design
- **Card-based Layout**: Grouped settings in cards
- **Icons**: Visual icons for each setting
- **Toggle Switches**: Easy on/off controls
- **Dropdowns**: Select from options
- **Color Coding**: Visual feedback for changes

### Responsive Design
- **Mobile**: Single column, stacked cards
- **Tablet**: 2-column grid
- **Desktop**: 2-3 column grid
- **Large Screens**: Expanded view with side panels

### Accessibility
- **Keyboard Navigation**: Tab through all settings
- **Screen Reader**: ARIA labels on all controls
- **Color Contrast**: WCAG AA compliant
- **Focus Indicators**: Visible focus states

## Notification System

### Notification Types
- **Info**: General information
- **Success**: Successful actions
- **Warning**: Warnings and cautions
- **Error**: Errors and failures
- **Critical**: Urgent alerts

### Notification Channels
- **In-app**: Toast notifications
- **Email**: Email alerts
- **Push**: Browser push notifications
- **SMS**: Text message alerts (premium)
- **Webhook**: Custom webhook integrations

### Notification Preferences
- **Per-type Control**: Enable/disable by type
- **Quiet Hours**: Mute during specific hours
- **Frequency Limits**: Max notifications per hour
- **Digest Mode**: Batch notifications

## Future Enhancements
- **Custom Themes**: User-created color schemes
- **Keyboard Shortcuts**: Customizable shortcuts
- **Dashboard Layouts**: Drag-and-drop customization
- **Widget Preferences**: Show/hide dashboard widgets
- **Export Settings**: Backup settings to file
- **Import Settings**: Restore from backup
- **Profile Sync**: Sync across multiple accounts
- **Voice Settings**: Voice command preferences
