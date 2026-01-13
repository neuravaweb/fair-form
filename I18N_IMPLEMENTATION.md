# Bilingual Implementation (PL/EN)

## Overview

The website now supports bilingual functionality with Polish (PL) and English (EN) languages using URL-based routing.

## Features Implemented

### ✅ URL-Based Routing
- Polish: `/pl` or `/pl/`
- English: `/en` or `/en/`
- Root `/` automatically redirects based on browser language

### ✅ Automatic Language Detection
- Detects browser language from `Accept-Language` header
- Defaults to Polish (`pl`) if no preference detected
- Seamless redirect on first visit

### ✅ Manual Language Switching
- Language switcher component in top-right corner
- PL/EN buttons with visual feedback
- Maintains current page context when switching

### ✅ Translation Files
- All translations stored in JSON files:
  - `/locales/pl.json` - Polish translations
  - `/locales/en.json` - English translations
- Organized by sections: `common`, `hero`, `form`, `admin`

### ✅ Admin Panel (Polish Only)
- Admin routes (`/admin/*`) remain in Polish only
- No language switching in admin area
- All admin UI uses Polish translations

### ✅ Language-Independent Form Data
- Form submissions store data in original format
- No translation of submitted data
- Database stores raw form values

### ✅ SEO-Friendly Structure
- Proper `lang` attribute on `<html>` tag
- Language-specific metadata
- Canonical URLs for each language
- `hreflang` alternates for search engines

## File Structure

```
app/
├── [locale]/              # Locale-based routes
│   ├── layout.tsx         # Locale-specific layout
│   └── page.tsx           # Home page with locale
├── admin/                 # Admin (Polish only)
│   ├── login/
│   ├── page.tsx
│   └── submissions/[id]/
└── layout.tsx             # Root layout

components/
├── HeroSection.tsx        # Uses translations
├── CustomerForm.tsx       # Uses translations
├── CardboardGrid.tsx      # Uses translations
└── LanguageSwitcher.tsx  # Language switcher

locales/
├── pl.json                # Polish translations
└── en.json                # English translations

lib/
└── i18n.ts                # Translation utilities
```

## Usage

### Adding New Translations

1. Add key to both `locales/pl.json` and `locales/en.json`:

```json
{
  "newSection": {
    "key": "Polish translation"
  }
}
```

2. Use in components:

```typescript
import { getTranslations } from '@/lib/i18n'

const t = getTranslations(locale)
const text = t.newSection.key
```

### Language Detection Flow

1. User visits `/` → Middleware checks `Accept-Language` header
2. Redirects to `/pl` or `/en` based on preference
3. Defaults to `/pl` if no preference

### Admin Panel

- Always uses Polish (`getTranslations('pl')`)
- No language parameter needed
- Routes remain at `/admin/*` (not localized)

## Technical Details

### Middleware
- Handles language detection
- Redirects root path to appropriate locale
- Protects admin routes
- Skips API routes and static files

### Translation System
- Type-safe with TypeScript
- Centralized in JSON files
- Easy to extend with new languages

### SEO
- Proper `lang` attributes
- Language-specific metadata
- Canonical URLs
- `hreflang` alternates

## Testing

1. **Test Language Detection:**
   - Visit `/` - should redirect based on browser language
   - Polish browser → `/pl`
   - English browser → `/en`

2. **Test Language Switching:**
   - Click PL/EN buttons in top-right
   - Should switch language and maintain page context

3. **Test Admin Panel:**
   - Should always be in Polish
   - No language switcher visible

4. **Test Form Submission:**
   - Submit form in both languages
   - Data should be stored correctly
   - Admin panel should show data in original format

## Future Enhancements

- Add more languages (e.g., DE, FR)
- Language-specific date/number formatting
- RTL support if needed
- Translation management system
