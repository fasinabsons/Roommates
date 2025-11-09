# ⚠️ IMPORTANT: Create .env File

Before running the app, you **MUST** create a `.env` file in this directory.

## Quick Setup:

1. **Copy** the file `env.local.example`
2. **Rename** it to `.env`
3. **Run** the development server

```bash
# Copy the example file
copy env.local.example .env

# Or manually create .env with these contents:
```

## .env File Contents:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://rcgntkbywxokzcwdvclk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjZ250a2J5d3hva3pjd2R2Y2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMjI5NjUsImV4cCI6MjA3Nzg5ODk2NX0.NYxqdRxqSSCFyUqcLtku_is0ua7bL3JyhDCizo-phl4

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=det4ojllv
VITE_CLOUDINARY_API_KEY=161489298327579
VITE_CLOUDINARY_API_SECRET=Nm-4RlqjAqxx8WWerzPpMeZc8Lo

# Upload Presets
VITE_CLOUDINARY_UPLOAD_PRESET_PROFILES=ziberlive_profiles
VITE_CLOUDINARY_UPLOAD_PRESET_DOCUMENTS=ziberlive_documents
VITE_CLOUDINARY_UPLOAD_PRESET_RECEIPTS=ziberlive_receipts
```

## Then Run:

```bash
npm run dev
```

## What to Expect:

The test page will show:
- ✅ Supabase Connected (green) - If database is setup
- ✅ Cloudinary Ready (green) - Should work immediately
- Sample Cloudinary image displayed

## Next Steps:

1. ✅ Create `.env` file
2. ✅ Run `npm run dev`
3. ✅ Setup database in Supabase (see ../docs/DATABASE-SCHEMA-COMPLETE.sql)
4. ✅ Start building features!

