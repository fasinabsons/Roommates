# Phase 1 - Database Setup Guide

## New Tables Added for Phase 1

Three critical tables have been added to support new features:

### 1. `apartment_invites`
**Purpose**: Manage invite links, codes, and QR codes for new members

**Features**:
- Generate unique invite codes (e.g., "ZIBER-APT-2025-ABC")
- Support for different invite types: general, single_use, limited
- Track usage count and max uses
- Optional bed pre-assignment
- Expiration dates
- Active/inactive status

### 2. `data_archives`
**Purpose**: Archive old data after 3 months to save storage

**Features**:
- Monthly and quarterly archival
- Compressed JSON storage
- Track file size and record count
- List of archived tables
- Admin notes

### 3. `subscription_status`
**Purpose**: Manage storage limits and payment/ad-watching options

**Features**:
- Plan types: paid, ad_supported, trial
- Storage tracking (used vs limit)
- Payment tracking
- Ad-watching requirements (300 ads/month = 10/day)
- Grace periods
- Auto-archival settings

## Setup Instructions

### Option 1: Run Individual Files in Supabase (Recommended)

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Run each file in order:

```sql
-- Step 1: Extensions (if not already done)
-- Copy/paste contents of: sql/01_extensions.sql

-- Step 2: Enums (if not already done)
-- Copy/paste contents of: sql/02_enums.sql

-- Step 3: Core Tables (if not already done)
-- Copy/paste contents of: sql/03_core_tables.sql

-- Step 4: Functions (if not already done)
-- Copy/paste contents of: sql/05_functions.sql

-- Step 5: Triggers (if not already done)
-- Copy/paste contents of: sql/06_triggers.sql

-- Step 6: NEW FEATURES TABLES ⭐
-- Copy/paste contents of: sql/07_new_features_tables.sql
```

**Important**: SKIP `04_rls_policies.sql` for now! RLS will be added after all features are complete.

### Option 2: Run New Tables Only (If Core Schema Exists)

If you've already set up the core database, just run:

```sql
-- Copy/paste contents of: sql/07_new_features_tables.sql
```

## Verification

After running the scripts, verify the tables exist:

```sql
-- Check new tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('apartment_invites', 'data_archives', 'subscription_status');

-- Should return 3 rows
```

Check indexes:

```sql
-- View indexes on new tables
SELECT 
    tablename, 
    indexname 
FROM pg_indexes 
WHERE tablename IN ('apartment_invites', 'data_archives', 'subscription_status')
ORDER BY tablename, indexname;
```

## Initial Data (Optional)

You can create a trial subscription for your apartment:

```sql
-- Create a trial subscription for testing
-- (Replace with your actual apartment_id)
INSERT INTO subscription_status (
    apartment_id,
    plan_type,
    storage_limit_mb,
    ads_required_this_month,
    status
) VALUES (
    'your-apartment-id-here',
    'trial',
    500, -- 500MB free
    300, -- 10 ads/day × 30 days
    'active'
);
```

## Next Steps

After database setup is complete:
1. ✅ Test database connections from frontend
2. ✅ Create invite management UI (Admin)
3. ✅ Create join-with-invite flow (Public)
4. ✅ Build subscription/storage UI
5. ✅ Implement ad-watching system

## Troubleshooting

### Error: "relation already exists"
- This is fine! It means the table was created in a previous run
- The `CREATE TABLE IF NOT EXISTS` clause will skip creation

### Error: "permission denied"
- Ensure you're using an admin account in Supabase
- Check that RLS is disabled on these tables (we're not using RLS yet)

### Error: "function trigger_set_timestamp() does not exist"
- Run `sql/05_functions.sql` first before running `sql/07_new_features_tables.sql`

## Summary

**Files Created**:
- ✅ `sql/07_new_features_tables.sql` - New tables for invites, archives, subscription

**Tables Added**:
- ✅ `apartment_invites` - Invitation management
- ✅ `data_archives` - Data archival
- ✅ `subscription_status` - Storage & payment tracking

**Ready for**:
- ✅ Phase 1 development
- ✅ Invite system implementation
- ✅ Data management features
- ✅ Subscription/monetization features

---

**Status**: ✅ **DATABASE READY FOR PHASE 1**

