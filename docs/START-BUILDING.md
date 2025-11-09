# 🚀 START BUILDING ZIBERLIVE - Step by Step Guide

**Date**: November 5, 2025  
**Status**: Ready to Build  
**First Task**: Project Initialization

---

## 📋 PREREQUISITES CHECKLIST

Before we start coding, you need:

### ✅ Accounts (Free Tier)
- [ ] **Supabase Account** - supabase.com
  - Create project: "ziberlive-production"
  - Note down: Project URL, Anon Key, Service Key
  
- [ ] **Cloudinary Account** - cloudinary.com
  - Free tier: 25GB storage
  - Note down: Cloud Name, API Key, API Secret

### ✅ Development Tools Installed
- [ ] **Node.js** v18+ - node --version
- [ ] **npm** or **pnpm** - npm --version
- [ ] **Git** - git --version
- [ ] **VS Code** (Recommended)

---

## 🎯 TASK 1.1: PROJECT INITIALIZATION (30 minutes)

### Step 1: Create Project Directory

```bash
# Open terminal in your development folder
cd "C:\Users\Lenovo\Documents"

# Create new React + TypeScript + Vite project
npm create vite@latest ziberlive -- --template react-ts

# Navigate to project
cd ziberlive

# Open in VS Code
code .
```

### Step 2: Install Core Dependencies

```bash
# Core libraries
npm install @supabase/supabase-js
npm install react-router-dom
npm install @tanstack/react-query
npm install zustand

# Form handling
npm install react-hook-form zod @hookform/resolvers

# UI libraries
npm install tailwindcss postcss autoprefixer
npm install lucide-react
npm install date-fns
npm install recharts

# Development dependencies
npm install -D @types/node
```

### Step 3: Setup Tailwind CSS

```bash
# Initialize Tailwind
npx tailwindcss init -p
```

Update `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ZiberLive Brand Colors
        ziber: {
          blue: '#2563EB',
          purple: '#7C3AED',
          green: '#10B981',
          orange: '#F59E0B',
          teal: '#14B8A6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

### Step 4: Setup Project Structure

```bash
# Create folder structure
mkdir -p src/components/ui
mkdir -p src/components/layout
mkdir -p src/pages
mkdir -p src/lib
mkdir -p src/hooks
mkdir -p src/stores
mkdir -p src/types
mkdir -p src/styles
```

### Step 5: Setup Base Styles

Create `src/styles/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-gray-50 text-gray-900;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }
}
```

Update `src/main.tsx`:

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### Step 6: Test Build

```bash
# Run dev server
npm run dev
```

Expected: Browser opens at `http://localhost:5173` with blank page (no errors).

---

## 🎯 TASK 1.2: SUPABASE SETUP (20 minutes)

### Step 1: Get Supabase Credentials

**WAIT FOR USER TO PROVIDE:**
- Supabase Project URL
- Supabase Anon Key
- Supabase Service Key (for admin operations)

### Step 2: Create Environment Variables

Create `.env` file in project root:

```env
VITE_SUPABASE_URL=your-project-url-here
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Create `.env.example` for reference:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Step 3: Create Supabase Client

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export type Database = any // We'll define this properly later
```

### Step 4: Test Supabase Connection

Create `src/pages/TestPage.tsx`:

```typescript
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function TestPage() {
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const testConnection = async () => {
      const { error } = await supabase.from('apartments').select('count')
      if (!error) {
        setConnected(true)
      }
    }
    testConnection()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">ZiberLive</h1>
        <p className={connected ? 'text-green-600' : 'text-red-600'}>
          {connected ? '✅ Supabase Connected!' : '❌ Connecting...'}
        </p>
      </div>
    </div>
  )
}
```

Update `src/App.tsx`:

```typescript
import TestPage from './pages/TestPage'

function App() {
  return <TestPage />
}

export default App
```

**Test**: Should see "✅ Supabase Connected!" after database is setup.

---

## 🎯 TASK 1.3: DATABASE SETUP (30 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click "SQL Editor" in left sidebar
3. Click "New Query"

### Step 2: Run Schema

1. Open `DATABASE-SCHEMA-COMPLETE.sql` from your project folder
2. Copy ALL contents (487 lines)
3. Paste into Supabase SQL Editor
4. Click "Run" button

**Expected Result**: 
- ✅ "Success. No rows returned"
- ✅ Check "Table Editor" - should see 25+ tables

### Step 3: Verify Tables Created

Go to "Table Editor" and verify these core tables exist:
- ✅ apartments
- ✅ locations
- ✅ apartment_members
- ✅ bills
- ✅ bill_splits
- ✅ payments
- ✅ chefs
- And 18+ more...

### Step 4: Setup Storage Buckets (for Cloudinary alternative)

In Supabase:
1. Go to "Storage"
2. Create bucket: "profile-photos" (public)
3. Create bucket: "documents" (private)

---

## 🎯 NEXT STEPS AFTER SETUP

Once Tasks 1.1, 1.2, 1.3 are complete:

### ✅ You'll Have:
- React + TypeScript + Vite project running
- Supabase connected
- Database with 25+ tables
- Proper folder structure
- Tailwind CSS configured

### 📋 Next Tasks (We'll do these together):
1. **TASK 1.4**: Theme Configuration
2. **TASK 1.5**: Layout Components
3. **TASK 1.6**: Login Page
4. **TASK 1.7**: Registration Page (4-step wizard)
5. Continue with TASKS.txt...

---

## 🆘 TROUBLESHOOTING

### Issue: npm install fails
**Solution**: 
```bash
# Clear cache
npm cache clean --force
# Try again
npm install
```

### Issue: Supabase connection error
**Solution**: 
- Check `.env` file exists
- Verify URL and Key are correct
- Restart dev server: `npm run dev`

### Issue: Tailwind not working
**Solution**:
```bash
# Reinstall Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## 📞 READY TO START?

### Provide These Details:

**1. Supabase Credentials:**
```
Project URL: https://xxxxx.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**2. Cloudinary Credentials (for later):**
```
Cloud Name: your-cloud-name
API Key: 123456789012345
API Secret: your-api-secret
```

Once you provide these, I'll:
1. ✅ Help you setup `.env` file
2. ✅ Run database schema
3. ✅ Test connection
4. ✅ Start building login page!

---

## 🎯 CURRENT STATUS

```
📍 Current Task: TASK 1.1 - Project Initialization
⏱️  Estimated Time: 30 minutes
🎯 Next: Waiting for Supabase & Cloudinary credentials
```

**Let's build ZiberLive! 🚀**

---

**Ready when you are!** Provide your Supabase and Cloudinary details, and we'll start building immediately!

