# Settings Page Features

## ✨ What's New

### 🌙 Dark Mode
- **Beautiful Dark Theme**: A carefully crafted dark color palette that's easy on the eyes
- **Smooth Transitions**: Elegant 300ms transitions between light and dark modes
- **Persistent Settings**: Your preference is saved to localStorage
- **Instant Toggle**: Switch themes with a gorgeous animated toggle switch

### 🌍 Multi-Language Support
- **6 Languages Supported**:
  - 🇺🇸 English
  - 🇪🇸 Español (Spanish)
  - 🇫🇷 Français (French)
  - 🇩🇪 Deutsch (German)
  - 🇨🇳 中文 (Chinese)
  - 🇯🇵 日本語 (Japanese)

- **Full Translation Coverage**: All UI text, buttons, messages, and placeholders are translated
- **Persistent Selection**: Your language choice is remembered
- **Beautiful UI**: Animated language cards with flags and smooth selection states

## 🎨 Design Features

### Aesthetic Choices
- **Soft Medical Modernism**: Combining healthcare's gentle, trustworthy feel with contemporary UI
- **Rounded Everything**: Consistent 3xl border radius for a soft, approachable feel
- **Gradient Accents**: Subtle gradients on settings cards for depth
- **Smooth Animations**:
  - Fade-in effects for page transitions
  - Slide-in animations for lists
  - Checkmark animation on language selection
  - Hover effects with scale and shadow

### Dark Mode Colors
- **Background**: Deep charcoal (#1A1D23) - easy on the eyes
- **Lighter sections**: #23272F and #2C3139 for subtle depth
- **Text**: Soft white (#E8EAED) with muted gray (#A0A4AB) for secondary text
- **Accent colors**: Kit-red and kit-teal maintain vibrancy in dark mode

## 🛠️ Technical Implementation

### Architecture
```
frontend/src/
├── contexts/
│   └── SettingsContext.jsx    # Central settings management
├── utils/
│   └── translations.js         # All language translations
└── components/
    ├── Home.jsx                # Updated with dark mode support
    ├── ChatInput.jsx           # Dark mode + translations
    └── ChatMessage.jsx         # Dark mode styling
```

### Key Technologies
- **React Context API**: For global settings state
- **localStorage**: Persistent settings across sessions
- **Tailwind CSS**: Dark mode with `class` strategy
- **CSS Transitions**: Smooth 300ms transitions throughout

### How It Works

1. **SettingsContext** provides:
   - `darkMode` state and setter
   - `language` state and setter
   - `t(key)` function for translations
   - Automatic localStorage persistence

2. **Dark Mode**:
   - Adds/removes `dark` class on `<html>`
   - Tailwind's `dark:` prefix applies dark styles
   - All components use `transition-colors duration-300`

3. **Translations**:
   - `t('key')` looks up translations
   - Falls back to English if translation missing
   - Covers all user-facing text

## 🚀 Usage

### In Components
```jsx
import { useSettings } from '../contexts/SettingsContext'

function MyComponent() {
  const { darkMode, setDarkMode, language, setLanguage, t } = useSettings()

  return (
    <div className="bg-white dark:bg-kit-dark-bg">
      <h1>{t('welcomeMessage')}</h1>
      <button onClick={() => setDarkMode(!darkMode)}>
        Toggle Dark Mode
      </button>
    </div>
  )
}
```

### Adding New Translations
Edit `src/utils/translations.js`:
```js
export const translations = {
  en: {
    newKey: 'New English Text',
    // ...
  },
  es: {
    newKey: 'Nuevo Texto Español',
    // ...
  },
  // ... other languages
}
```

## 🎯 Future Enhancements

- [ ] Add more languages (Portuguese, Italian, etc.)
- [ ] RTL support for Arabic/Hebrew
- [ ] Auto-detect browser language
- [ ] Font size adjustment
- [ ] Custom theme colors
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)
- [ ] Export/import settings

## 📝 Notes

- All animations respect `prefers-reduced-motion` for accessibility
- Dark mode uses semantic color tokens for maintainability
- Translations are organized by feature for easy updates
- Settings persist across browser sessions
