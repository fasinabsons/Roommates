# 🚀 ZiberLive - Complete Setup & Deployment Guide

**Date**: November 5, 2025  
**Status**: Ready to Build  
**Credentials**: ✅ Configured

---

## ✅ CREDENTIALS CONFIGURED

### Supabase
- **URL**: https://rcgntkbywxokzcwdvclk.supabase.co
- **Anon Key**: Configured ✅
- **Status**: Ready

### Cloudinary
- **Cloud Name**: det4ojllv
- **API Key**: Configured ✅
- **Status**: Ready

### Deployment
- **Platform**: Netlify (Planned)
- **Domain**: Hostinger (To be configured)

---

## 📁 PROJECT STRUCTURE (Updated)

```
C:\Users\Lenovo\Documents\Room mate\
├── docs/                              # 📚 All Documentation (NEW)
│   ├── prdfinal.txt                  # Product Requirements
│   ├── DATABASE-SCHEMA-COMPLETE.sql  # Database Schema
│   ├── api-endpoints.txt             # API Specifications
│   ├── TASKS.txt                     # Development Tasks (1,242 lines)
│   ├── theme.txt                     # Design System
│   ├── user-flows.txt                # User Journeys
│   ├── ZIBERLIVE-BRANDING.md         # Brand Identity
│   ├── READY-TO-BUILD.md             # Build Guide
│   ├── START-BUILDING.md             # Setup Guide
│   ├── TASKS-ACCURACY-REVIEW.md      # Task Validation
│   ├── READY-TO-CODE.md              # Quick Start
│   ├── pages/                        # Page Specifications
│   │   ├── authentication.txt
│   │   ├── dashboard.txt
│   │   ├── bills.txt
│   │   ├── communitymeal.txt
│   │   ├── voting.txt
│   │   ├── investments.txt
│   │   ├── admin-management.txt
│   │   └── additional-features.txt
│   └── phase*.txt                    # Phase Plans
│
├── env.template                       # Environment Template ⭐ NEW
├── create-project.bat                 # Setup Script
├── README.md                          # Project Overview
├── credentials.txt                    # Your Credentials (KEEP PRIVATE)
└── SETUP-COMPLETE.md                  # This File ⭐ NEW
```

---

## 🎯 STEP 1: CREATE PROJECT (10 minutes)

### Option A: Automated (Recommended)

```bash
# Double-click or run:
create-project.bat
```

### Option B: Manual

```bash
# Navigate to Documents folder
cd "C:\Users\Lenovo\Documents"

# Create Vite + React + TypeScript project
npm create vite@latest ziberlive --template react-ts

# Navigate to project
cd ziberlive

# Install all dependencies
npm install

# Install Supabase
npm install @supabase/supabase-js

# Install Cloudinary React SDK
npm install @cloudinary/url-gen @cloudinary/react

# Install Routing & State
npm install react-router-dom @tanstack/react-query zustand

# Install Form Handling
npm install react-hook-form zod @hookform/resolvers

# Install UI Libraries
npm install lucide-react date-fns recharts

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer @types/node

# Initialize Tailwind
npx tailwindcss init -p
```

---

## 🎯 STEP 2: CONFIGURE ENVIRONMENT (5 minutes)

### Create `.env` file in project root

```bash
cd ziberlive
```

Copy `env.template` content to `.env`:

```env
# Supabase
VITE_SUPABASE_URL=https://rcgntkbywxokzcwdvclk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjZ250a2J5d3hva3pjd2R2Y2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMjI5NjUsImV4cCI6MjA3Nzg5ODk2NX0.NYxqdRxqSSCFyUqcLtku_is0ua7bL3JyhDCizo-phl4

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=det4ojllv
VITE_CLOUDINARY_API_KEY=161489298327579
VITE_CLOUDINARY_API_SECRET=Nm-4RlqjAqxx8WWerzPpMeZc8Lo

# Upload Presets
VITE_CLOUDINARY_UPLOAD_PRESET_PROFILES=ziberlive_profiles
VITE_CLOUDINARY_UPLOAD_PRESET_DOCUMENTS=ziberlive_documents
VITE_CLOUDINARY_UPLOAD_PRESET_RECEIPTS=ziberlive_receipts
```

### Create `.env.example` (for git)

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_API_KEY=your-api-key
VITE_CLOUDINARY_API_SECRET=your-api-secret
```

### Update `.gitignore`

```
# Env files
.env
.env.local
.env.production
credentials.txt
```

---

## 🎯 STEP 3: SETUP CLOUDINARY UPLOAD PRESETS (15 minutes)

### Go to Cloudinary Dashboard

https://console.cloudinary.com/settings/upload

### Create 3 Upload Presets:

#### 1. **ziberlive_profiles** (Profile Photos)
```
Signing Mode: Unsigned
Folder: ziberlive/profiles
Transformation:
  - Mode: Fill
  - Width: 300
  - Height: 300
  - Gravity: face
  - Format: Auto
  - Quality: Auto
```

#### 2. **ziberlive_documents** (ID Cards, Resumes)
```
Signing Mode: Unsigned
Folder: ziberlive/documents
Transformation:
  - Format: Auto
  - Quality: 90
```

#### 3. **ziberlive_receipts** (Grocery Receipts for OCR)
```
Signing Mode: Unsigned
Folder: ziberlive/receipts
Transformation:
  - Effect: improve
  - Format: Auto
  - Quality: Auto
```

---

## 🎯 STEP 4: SETUP SUPABASE DATABASE (20 minutes)

### 1. Go to Supabase SQL Editor

https://supabase.com/dashboard/project/rcgntkbywxokzcwdvclk/sql

### 2. Run Database Schema

1. Open `docs/DATABASE-SCHEMA-COMPLETE.sql`
2. Copy ALL contents (487 lines)
3. Paste into SQL Editor
4. Click "Run"

### 3. Verify Tables Created

Go to Table Editor and check:
- ✅ apartments (with settings JSONB)
- ✅ locations (with ltree for hierarchy)
- ✅ apartment_members
- ✅ bills
- ✅ bill_splits
- ✅ payments
- ✅ chefs
- ✅ And 18+ more tables

### 4. Setup Storage Buckets

In Supabase Storage:
1. Create bucket: `profile-photos` (public)
2. Create bucket: `documents` (private)
3. Create bucket: `receipts` (private)

---

## 🎯 STEP 5: CREATE PROJECT FILES (30 minutes)

### 1. Create `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      apartments: {
        Row: {
          id: string
          name: string
          address: string | null
          // Add more types as needed
        }
      }
      // Add more table types
    }
  }
}
```

### 2. Create `src/lib/cloudinary.ts`

```typescript
import { Cloudinary } from '@cloudinary/url-gen'

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME!

if (!cloudName) {
  throw new Error('Missing Cloudinary cloud name')
}

// Initialize Cloudinary instance
export const cld = new Cloudinary({
  cloud: {
    cloudName: cloudName
  }
})

// Upload presets
export const UPLOAD_PRESETS = {
  PROFILES: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET_PROFILES || 'ziberlive_profiles',
  DOCUMENTS: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET_DOCUMENTS || 'ziberlive_documents',
  RECEIPTS: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET_RECEIPTS || 'ziberlive_receipts',
}

// Upload helper function
export const uploadToCloudinary = async (
  file: File,
  preset: keyof typeof UPLOAD_PRESETS
): Promise<{ public_id: string; secure_url: string; width: number; height: number }> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESETS[preset])
  formData.append('cloud_name', cloudName)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    throw new Error('Upload failed')
  }

  return response.json()
}

// Get optimized image URL
export const getOptimizedImageUrl = (publicId: string, width?: number, height?: number) => {
  const img = cld.image(publicId)
    .format('auto')
    .quality('auto')

  if (width && height) {
    img.resize(auto().gravity(autoGravity()).width(width).height(height))
  }

  return img.toURL()
}
```

### 3. Update `tailwind.config.js`

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

### 4. Create `src/styles/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-gray-200;
  }
  
  body {
    @apply bg-gray-50 text-gray-900;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }
}

@layer components {
  .btn-primary {
    @apply bg-ziber-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors;
  }
  
  .btn-secondary {
    @apply bg-white text-ziber-blue border-2 border-ziber-blue px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors;
  }
}
```

### 5. Update `src/main.tsx`

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

---

## 🎯 STEP 6: TEST SETUP (10 minutes)

### Create Test Page

`src/pages/TestPage.tsx`:

```typescript
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { cld } from '../lib/cloudinary'
import { AdvancedImage } from '@cloudinary/react'

export default function TestPage() {
  const [supabaseConnected, setSupabaseConnected] = useState(false)
  const [cloudinaryReady, setCloudinaryReady] = useState(false)

  useEffect(() => {
    // Test Supabase
    const testSupabase = async () => {
      const { error } = await supabase.from('apartments').select('count')
      setSupabaseConnected(!error)
    }

    // Test Cloudinary
    const testCloudinary = () => {
      try {
        const img = cld.image('cld-sample-5')
        setCloudinaryReady(true)
      } catch (error) {
        console.error('Cloudinary error:', error)
      }
    }

    testSupabase()
    testCloudinary()
  }, [])

  const sampleImage = cld.image('cld-sample-5')
    .format('auto')
    .quality('auto')
    .resize(auto().gravity(autoGravity()).width(500).height(500))

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-5xl font-bold mb-6 text-ziber-blue">ZiberLive</h1>
        <p className="text-lg text-gray-600 mb-8">System Status Check</p>

        <div className="space-y-4 mb-8">
          <div className={`p-4 rounded-lg ${supabaseConnected ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className={`font-semibold ${supabaseConnected ? 'text-green-700' : 'text-red-700'}`}>
              {supabaseConnected ? '✅ Supabase Connected' : '❌ Supabase Connection Failed'}
            </p>
          </div>

          <div className={`p-4 rounded-lg ${cloudinaryReady ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className={`font-semibold ${cloudinaryReady ? 'text-green-700' : 'text-red-700'}`}>
              {cloudinaryReady ? '✅ Cloudinary Ready' : '❌ Cloudinary Not Ready'}
            </p>
          </div>
        </div>

        {cloudinaryReady && (
          <div>
            <p className="text-sm text-gray-600 mb-2">Sample Cloudinary Image:</p>
            <AdvancedImage cldImg={sampleImage} className="mx-auto rounded-lg shadow-md" />
          </div>
        )}

        <button 
          onClick={() => window.location.reload()} 
          className="btn-primary mt-6"
        >
          Refresh Test
        </button>
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

### Run Development Server

```bash
npm run dev
```

Expected result: http://localhost:5173 shows:
- ✅ Supabase Connected
- ✅ Cloudinary Ready
- ✅ Sample image displayed

---

## 🚀 NETLIFY DEPLOYMENT SETUP

### 1. Install Netlify CLI

```bash
npm install -g netlify-cli
```

### 2. Create `netlify.toml` in project root

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"

[context.production.environment]
  VITE_APP_ENV = "production"
```

### 3. Deploy to Netlify

```bash
# Login to Netlify
netlify login

# Initialize site
netlify init

# Set environment variables in Netlify dashboard
# https://app.netlify.com/sites/YOUR-SITE/settings/deploys#environment

# Deploy
netlify deploy --prod
```

### 4. Environment Variables in Netlify

Add these in Netlify Dashboard → Site settings → Environment variables:

```
VITE_SUPABASE_URL=https://rcgntkbywxokzcwdvclk.supabase.co
VITE_SUPABASE_ANON_KEY=your-key-here
VITE_CLOUDINARY_CLOUD_NAME=det4ojllv
VITE_CLOUDINARY_API_KEY=161489298327579
VITE_CLOUDINARY_UPLOAD_PRESET_PROFILES=ziberlive_profiles
VITE_CLOUDINARY_UPLOAD_PRESET_DOCUMENTS=ziberlive_documents
VITE_CLOUDINARY_UPLOAD_PRESET_RECEIPTS=ziberlive_receipts
```

---

## 🌐 CUSTOM DOMAIN SETUP (Hostinger)

### 1. Get Netlify Site URL

After deployment, note your Netlify URL:
```
https://ziberlive.netlify.app
```

### 2. In Hostinger DNS Settings

Add these DNS records:

```
Type: CNAME
Name: www
Value: ziberlive.netlify.app
TTL: 3600

Type: A
Name: @
Value: 75.2.60.5 (Netlify Load Balancer)
TTL: 3600
```

### 3. In Netlify Dashboard

Domain settings → Add custom domain → ziberlive.com

Netlify will:
- ✅ Verify DNS
- ✅ Issue SSL certificate (automatic)
- ✅ Enable HTTPS

**Wait**: DNS propagation takes 1-48 hours

---

## ✅ POST-SETUP CHECKLIST

### Development Environment
- [ ] Project created with Vite
- [ ] All dependencies installed
- [ ] `.env` file created with credentials
- [ ] Supabase connected
- [ ] Cloudinary connected
- [ ] Test page shows green checks
- [ ] Dev server runs: `npm run dev`

### Cloudinary Setup
- [ ] Upload preset: ziberlive_profiles
- [ ] Upload preset: ziberlive_documents
- [ ] Upload preset: ziberlive_receipts
- [ ] Test upload works

### Supabase Setup
- [ ] Database schema executed
- [ ] 25+ tables created
- [ ] RLS policies enabled
- [ ] Storage buckets created

### Deployment
- [ ] Netlify account created
- [ ] netlify.toml configured
- [ ] Environment variables set in Netlify
- [ ] Domain purchased from Hostinger
- [ ] DNS configured
- [ ] SSL certificate issued

---

## 📋 NEXT STEPS

### Immediate (Today)
1. ✅ Run create-project.bat or manual setup
2. ✅ Test connections
3. ✅ Start building login page (docs/TASKS.txt - Task 1.6)

### This Week
1. Build authentication system
2. Create dashboard layout
3. Implement bill management
4. Deploy to Netlify staging

### Phase 1 (Week 1-4)
Follow `docs/TASKS.txt` step by step:
- TASK 1.1 to 1.10: Foundation & Auth
- Complete user registration flow
- Admin approval system

---

## 🆘 TROUBLESHOOTING

### Supabase Connection Error
**Problem**: "Supabase Connection Failed"
**Solution**:
1. Check `.env` file exists
2. Verify URL is correct
3. Check anon key is complete
4. Restart dev server

### Cloudinary Not Ready
**Problem**: "Cloudinary Not Ready"
**Solution**:
1. Verify cloud name in `.env`
2. Check upload presets exist
3. Ensure presets are "unsigned"

### Build Errors
**Problem**: TypeScript errors
**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Netlify Deploy Fails
**Problem**: Build fails on Netlify
**Solution**:
1. Check build command: `npm run build`
2. Verify all env vars set in Netlify
3. Check build logs for specific errors

---

## 📚 DOCUMENTATION REFERENCE

All documentation is now in `/docs` folder:

| File | Purpose |
|------|---------|
| `docs/TASKS.txt` | Step-by-step development tasks (START HERE) |
| `docs/START-BUILDING.md` | Detailed setup guide |
| `docs/DATABASE-SCHEMA-COMPLETE.sql` | Database schema to run in Supabase |
| `docs/prdfinal.txt` | Product requirements |
| `docs/api-endpoints.txt` | API specifications |
| `docs/pages/*.txt` | UI specifications for each page |
| `docs/theme.txt` | Design system |

---

## 🎉 YOU'RE READY!

```
✅ Credentials configured
✅ Project structure ready
✅ Setup guide complete
✅ Deployment planned
✅ Documentation organized

🚀 Time to build ZiberLive!
```

---

**Next Command**:
```bash
cd "C:\Users\Lenovo\Documents"
create-project.bat
```

**Then**: Open `docs/TASKS.txt` and start with TASK 1.1!

**Let's build! 🚀**

