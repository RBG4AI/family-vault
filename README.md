# Vault - Premium Credential Manager

A super-premium, Apple/Samsung/CRED-style personal credential and financial management website built with React, TailwindCSS, and Framer Motion.

## Features

### 🔐 Security
- Master password authentication
- Local data storage (IndexedDB/localStorage)
- Session-based access control
- Copy-to-clipboard for sensitive data
- Hide/show password toggles

### 💎 Premium UI/UX
- Ultra-modern dark mode design
- Glassmorphism effects and gradients
- Smooth animations and micro-interactions
- Elegant typography (Inter font)
- Responsive grid/card layouts

### 📊 Data Management
- **Email Accounts**: Domain selection, recovery emails
- **Applications & Websites**: Login credentials with notes
- **Internet Banking**: Bank details, customer IDs, transaction PINs
- **Government IDs**: PAN, Aadhaar, Passport, UAN, Driving License
- **Insurance**: Health, Life/LIC, NPS with policy details
- **Investments**: Mutual funds, stocks, demat accounts with portfolio tracking

### 🎯 Smart Features
- Global search across all sections
- Tag-based filtering and organization
- Dashboard with charts and analytics
- Add/Edit/Delete with floating action buttons
- Recent activity tracking

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: TailwindCSS with custom glassmorphism utilities
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **Storage**: LocalStorage with structured data management

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## Usage

1. **First Time Setup**: Enter any password (6+ characters) - this becomes your master password
2. **Login**: Use your master password to access the vault
3. **Add Data**: Use the floating "Add New" buttons in each section
4. **Search & Filter**: Use the search bar and tag filters to find specific items
5. **Security**: All data is stored locally on your device

## Project Structure

```
src/
├── components/          # React components
│   ├── LoginScreen.jsx     # Master password authentication
│   ├── Sidebar.jsx         # Navigation sidebar
│   ├── Dashboard.jsx       # Analytics dashboard
│   ├── CredentialCard.jsx  # Individual credential cards
│   ├── AddCredentialModal.jsx # Add/edit modal
│   └── CredentialsSection.jsx # Main content sections
├── hooks/              # Custom React hooks
│   └── useAuth.js         # Authentication logic
├── utils/              # Utility functions
│   └── storage.js         # Local storage management
├── App.jsx             # Main application component
├── main.jsx           # React entry point
└── index.css          # Global styles and utilities
```

## Security Notes

- Data is stored locally in your browser
- No data is sent to external servers
- Master password is stored in localStorage (consider encryption for production)
- Session expires when browser is closed
- Ready for AES encryption implementation

## Customization

The app uses a modular design with:
- Custom Tailwind utilities for glassmorphism effects
- Configurable color schemes in `tailwind.config.js`
- Reusable components for different data types
- Extensible storage system for new data categories

## Future Enhancements

- AES encryption for sensitive data
- Biometric authentication
- Cloud sync capabilities
- Import/export functionality
- Advanced portfolio analytics
- Mobile app version

---

**Built with ❤️ for premium user experience**