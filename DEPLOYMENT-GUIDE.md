# 🚀 ZiberLive - Complete Deployment Guide

## 📋 Prerequisites

Before deploying, ensure you have:
- ✅ Supabase account with project created
- ✅ Cloudinary account with credentials
- ✅ Netlify account (free tier works!)
- ✅ Domain from Hostinger (optional, can use Netlify subdomain)
- ✅ Git repository (GitHub, GitLab, or Bitbucket)

## 🗄️ Part 1: Database Setup (Supabase)

### Step 1: Access Your Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project: `rcgntkbywxokzcwdvclk`
3. Note your credentials:
   - **URL:** `https://rcgntkbywxokzcwdvclk.supabase.co`
   - **Anon Key:** (from Project Settings → API)

### Step 2: Run SQL Scripts
Navigate to **SQL Editor** and run scripts in order:

```sql
-- 1. Extensions (01_extensions.sql)
-- 2. Enums (02_enums.sql)
-- 3. Core Tables (03_core_tables.sql)
-- 4. RLS Policies (04_rls_policies.sql)
-- 5. Functions (05_functions.sql)
-- 6. Triggers (06_triggers.sql)
```

**Detailed instructions:** See `sql/README.md`

### Step 3: Verify Database
```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Should see: apartments, apartment_members, bills, bill_splits, 
--              bill_types, chefs, locations, payments
```

### Step 4: Configure Auth
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional)
4. Set redirect URLs:
   - `http://localhost:5173/*` (development)
   - `https://your-domain.com/*` (production)

---

## ☁️ Part 2: Image Storage Setup (Cloudinary)

### Step 1: Access Cloudinary Dashboard
1. Go to https://cloudinary.com/console
2. Your credentials:
   - **Cloud Name:** `det4ojllv`
   - **API Key:** `161489298327579`
   - **API Secret:** `Nm-4RlqjAqxx8WWerzPpMeZc8Lo`

### Step 2: Create Upload Presets
1. Go to **Settings** → **Upload**
2. Click **Add upload preset**
3. Create these presets:

**Preset 1: ziberlive_members**
- Unsigned: Yes
- Folder: members
- Transformation: Limit to 2MB, max 1920x1920
- Format: Auto
- Quality: Auto

**Preset 2: ziberlive_receipts**
- Unsigned: Yes
- Folder: receipts
- Format: Auto
- Quality: Auto

**Preset 3: ziberlive_documents**
- Unsigned: Yes
- Folder: documents
- Format: Auto
- Quality: Auto

### Step 3: Configure Security
1. Go to **Settings** → **Security**
2. Add allowed domains:
   - `localhost:5173`
   - `your-netlify-domain.netlify.app`
   - `your-custom-domain.com`

---

## 🌐 Part 3: Hosting Setup (Netlify)

### Step 1: Connect Repository
1. Go to https://app.netlify.com
2. Click **Add new site** → **Import an existing project**
3. Choose your Git provider (GitHub recommended)
4. Select your repository
5. Grant Netlify access

### Step 2: Configure Build Settings
Netlify will auto-detect settings from `netlify.toml`, but verify:

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 18

### Step 3: Set Environment Variables
Go to **Site settings** → **Environment variables** → **Add variables**

```bash
# Supabase
VITE_SUPABASE_URL=https://rcgntkbywxokzcwdvclk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjZ250a2J5d3hva3pjd2R2Y2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMjI5NjUsImV4cCI6MjA3Nzg5ODk2NX0.NYxqdRxqSSCFyUqcLtku_is0ua7bL3JyhDCizo-phl4

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=det4ojllv
VITE_CLOUDINARY_API_KEY=161489298327579

# App Config (optional)
VITE_APP_ENV=production
VITE_APP_DOMAIN=your-domain.com
```

⚠️ **IMPORTANT:** Never commit API secrets to Git!

### Step 4: Deploy
1. Click **Deploy site**
2. Netlify will:
   - Install dependencies
   - Run build command
   - Deploy to CDN
   - Provide a URL: `random-name-123.netlify.app`

### Step 5: Verify Deployment
1. Visit your Netlify URL
2. Test:
   - ✅ Login page loads
   - ✅ Can create account
   - ✅ Can login
   - ✅ Dashboard loads
   - ✅ Images load from Cloudinary

---

## 🌍 Part 4: Custom Domain (Hostinger)

### Step 1: Purchase Domain
1. Go to https://hostinger.com
2. Search for `ziberlive.com` (or your preferred name)
3. Purchase domain (₹500-1000/year typically)

### Step 2: Configure DNS in Hostinger
1. Go to **Domains** → **DNS/Name Servers**
2. Add these records:

**Primary Domain (ziberlive.com):**
```
Type: A
Name: @
Value: 75.2.60.5 (Netlify's load balancer)
TTL: 3600
```

**WWW Subdomain:**
```
Type: CNAME
Name: www
Value: your-site.netlify.app
TTL: 3600
```

### Step 3: Configure Domain in Netlify
1. Go to **Site settings** → **Domain management**
2. Click **Add custom domain**
3. Enter: `ziberlive.com`
4. Netlify will verify DNS
5. Click **Verify DNS configuration**
6. Enable **HTTPS** (automatic with Let's Encrypt)

### Step 4: Wait for Propagation
- DNS changes take 15 minutes to 48 hours
- Check status: https://www.whatsmydns.net

### Step 5: Force HTTPS
1. In Netlify → **Site settings** → **Domain management**
2. Enable **Force HTTPS**
3. Enable **HSTS** (optional, for extra security)

---

## ✅ Part 5: Post-Deployment Checklist

### Security
- [ ] All environment variables set in Netlify
- [ ] HTTPS enabled and working
- [ ] RLS policies active in Supabase
- [ ] Cloudinary security settings configured
- [ ] No secrets in Git repository

### Functionality
- [ ] Can access site via custom domain
- [ ] Login/signup works
- [ ] Database connections work
- [ ] Images upload to Cloudinary
- [ ] All pages load correctly
- [ ] Mobile responsive
- [ ] No console errors

### Performance
- [ ] Lighthouse score > 90
- [ ] Images optimized (Cloudinary auto-optimization)
- [ ] Gzip compression enabled (Netlify automatic)
- [ ] Browser caching configured (via netlify.toml)

### Monitoring
- [ ] Netlify analytics enabled
- [ ] Supabase logs monitored
- [ ] Error tracking setup (optional: Sentry)

---

## 🔄 Continuous Deployment

Once set up, every git push deploys automatically:

```bash
# Local development
git add .
git commit -m "Add new feature"
git push origin main

# Netlify automatically:
# 1. Detects push
# 2. Runs build
# 3. Deploys to production
# 4. Invalidates CDN cache
```

### Branch Previews
- Create a branch: `git checkout -b feature/new-ui`
- Push: `git push origin feature/new-ui`
- Netlify creates preview URL: `feature-new-ui--your-site.netlify.app`

---

## 🚨 Troubleshooting

### Build Fails on Netlify
```
Error: Cannot find module 'X'
```
**Solution:** Check `package.json` dependencies are correct

### Environment Variables Not Working
```
Error: VITE_SUPABASE_URL is undefined
```
**Solution:** 
1. Verify variables in Netlify dashboard
2. Trigger manual redeploy
3. Variables must start with `VITE_` for Vite

### Database Connection Fails
```
Error: Could not connect to Supabase
```
**Solution:**
1. Check Supabase project is active
2. Verify URL and anon key are correct
3. Check Supabase dashboard for errors

### Images Don't Load
```
Error: Cloudinary image failed to load
```
**Solution:**
1. Verify cloud name is correct
2. Check Cloudinary security settings
3. Ensure domain is whitelisted in Cloudinary

### Custom Domain Not Working
```
Error: This site can't be reached
```
**Solution:**
1. Wait 24-48 hours for DNS propagation
2. Verify DNS records in Hostinger
3. Check Netlify domain verification
4. Try clearing DNS cache: `ipconfig /flushdns` (Windows)

---

## 📊 Monitoring & Analytics

### Netlify Analytics (Built-in)
- Site Settings → Analytics & Logs
- See traffic, bandwidth, build times

### Supabase Monitoring
- Dashboard → Database → Logs
- Monitor queries, connections, errors

### Custom Analytics (Optional)
Add Google Analytics:
```html
<!-- Add to index.html <head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 🎉 Success!

Your app is now live at:
- **Development:** http://localhost:5173
- **Netlify:** https://your-site.netlify.app
- **Custom Domain:** https://ziberlive.com

### Next Steps:
1. ✅ Test all features in production
2. ✅ Create your first apartment
3. ✅ Invite team members
4. ✅ Monitor performance
5. ✅ Gather user feedback
6. ✅ Iterate and improve!

---

## 📞 Support Resources

- **Netlify Docs:** https://docs.netlify.com
- **Supabase Docs:** https://supabase.com/docs
- **Cloudinary Docs:** https://cloudinary.com/documentation
- **Hostinger Support:** https://www.hostinger.com/tutorials

**Need Help?** Check the troubleshooting section or review the logs in each service's dashboard.

Happy Deploying! 🚀✨

