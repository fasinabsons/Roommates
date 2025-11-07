# ZiberLive - Database Setup Guide

## 📋 Overview

This folder contains all SQL scripts needed to set up the complete ZiberLive database on Supabase.

## 🗂️ Files Structure

```
sql/
├── 00_run_all.sql          # Combined script (or run individually)
├── 01_extensions.sql       # PostgreSQL extensions
├── 02_enums.sql            # Custom types/enums
├── 03_core_tables.sql      # Main database tables
├── 04_rls_policies.sql     # Row Level Security
├── 05_functions.sql        # Database functions
├── 06_triggers.sql         # Automated triggers
└── README.md               # This file
```

## 🚀 Quick Start (Supabase Dashboard)

### Method 1: Run All at Once (Recommended for First Time)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: `rcgntkbywxokzcwdvclk`

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run Scripts in Order**
   Copy and paste each file's contents in this exact order:
   
   - **Step 1:** `01_extensions.sql` → Click "Run"
   - **Step 2:** `02_enums.sql` → Click "Run"
   - **Step 3:** `03_core_tables.sql` → Click "Run"
   - **Step 4:** `04_rls_policies.sql` → Click "Run"
   - **Step 5:** `05_functions.sql` → Click "Run"
   - **Step 6:** `06_triggers.sql` → Click "Run"

### Method 2: Command Line (Advanced)

If you have PostgreSQL client installed:

```bash
# Navigate to project root
cd "C:\Users\Lenovo\Documents\Room mate\ziberlive"

# Run scripts in order
psql -h db.rcgntkbywxokzcwdvclk.supabase.co -U postgres -d postgres -f sql/01_extensions.sql
psql -h db.rcgntkbywxokzcwdvclk.supabase.co -U postgres -d postgres -f sql/02_enums.sql
psql -h db.rcgntkbywxokzcwdvclk.supabase.co -U postgres -d postgres -f sql/03_core_tables.sql
psql -h db.rcgntkbywxokzcwdvclk.supabase.co -U postgres -d postgres -f sql/04_rls_policies.sql
psql -h db.rcgntkbywxokzcwdvclk.supabase.co -U postgres -d postgres -f sql/05_functions.sql
psql -h db.rcgntkbywxokzcwdvclk.supabase.co -U postgres -d postgres -f sql/06_triggers.sql
```

## 📊 What Gets Created

### Extensions (01_extensions.sql)
- `uuid-ossp` - UUID generation
- `ltree` - Hierarchical data (rooms/beds)
- `pgcrypto` - Encryption functions
- `pg_stat_statements` - Performance monitoring

### Custom Types (02_enums.sql)
- `user_role` - Admin, Member, Guest
- `member_status` - Pending, Active, Inactive, etc.
- `payment_status_enum` - Payment lifecycle states
- `bill_calculation_method` - Bill splitting methods
- `recurrence_pattern` - Bill recurrence
- `bed_type_enum` - Flat, Lower, Upper
- `poll_type_enum` - Voting types
- `dispute_status_enum` - Dispute resolution states
- `chef_status_enum` - Chef status
- `task_status_enum` - Task lifecycle

### Core Tables (03_core_tables.sql)
1. **apartments** - Property/apartment records
2. **locations** - Rooms and beds (hierarchical)
3. **apartment_members** - User membership
4. **bill_types** - Bill templates
5. **bills** - Bill instances
6. **bill_splits** - Member bill shares
7. **payments** - Payment records
8. **chefs** - Community meal chefs

### Security (04_rls_policies.sql)
- 30+ Row Level Security policies
- Ensures data isolation between apartments
- Role-based access (admin vs member)
- Secure multi-tenancy

### Functions (05_functions.sql)
- `trigger_set_timestamp()` - Auto-update timestamps
- `add_loyalty_points()` - Loyalty point management
- `calculate_bill_split()` - Bill splitting logic
- `get_member_dashboard_stats()` - Dashboard data

### Triggers (06_triggers.sql)
- Auto-update `updated_at` on all tables
- Maintain data consistency

## ✅ Verification

After running all scripts, verify the setup:

### Check Extensions
```sql
SELECT * FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'ltree', 'pgcrypto', 'pg_stat_statements');
```

### Check Enums
```sql
SELECT typname FROM pg_type 
WHERE typtype = 'e' 
ORDER BY typname;
```

### Check Tables
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

Expected tables:
- apartments
- apartment_members
- bills
- bill_splits
- bill_types
- chefs
- locations
- payments

### Check RLS Policies
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Check Functions
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
ORDER BY routine_name;
```

### Check Triggers
```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

## 🧪 Test Data (Optional)

Create a test apartment:

```sql
-- First, get your user ID from auth
SELECT id, email FROM auth.users;

-- Create test apartment (replace YOUR_USER_ID)
INSERT INTO apartments (name, address, city, country, created_by) 
VALUES (
  'Test Apartment',
  '123 Main Street',
  'Mumbai',
  'India',
  'YOUR_USER_ID'
) RETURNING *;
```

## 🔧 Maintenance

### Reset Database (DANGER!)
```sql
-- Drop all tables (WARNING: This deletes ALL data!)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bill_splits CASCADE;
DROP TABLE IF EXISTS bills CASCADE;
DROP TABLE IF EXISTS bill_types CASCADE;
DROP TABLE IF EXISTS chefs CASCADE;
DROP TABLE IF EXISTS apartment_members CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS apartments CASCADE;

-- Drop enums
DROP TYPE IF EXISTS task_status_enum CASCADE;
DROP TYPE IF EXISTS chef_status_enum CASCADE;
DROP TYPE IF EXISTS dispute_status_enum CASCADE;
DROP TYPE IF EXISTS poll_type_enum CASCADE;
DROP TYPE IF EXISTS bed_type_enum CASCADE;
DROP TYPE IF EXISTS recurrence_pattern CASCADE;
DROP TYPE IF EXISTS bill_calculation_method CASCADE;
DROP TYPE IF EXISTS payment_status_enum CASCADE;
DROP TYPE IF EXISTS member_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Then re-run all setup scripts
```

### Update Schema
To add new tables or modify existing ones, create new migration files:
```
sql/migrations/
├── 20250101_add_notifications.sql
├── 20250102_add_tasks.sql
└── etc...
```

## 📝 Notes

- **Order Matters:** Always run scripts in numerical order (01 → 06)
- **Extensions First:** Extensions must be installed before creating tables
- **RLS is Critical:** Never disable RLS on production
- **Backup Regularly:** Use Supabase's backup features
- **Test in Development:** Always test schema changes in dev first

## 🆘 Troubleshooting

### Error: "Extension does not exist"
**Solution:** Run `01_extensions.sql` first

### Error: "Type does not exist"
**Solution:** Run `02_enums.sql` before tables

### Error: "Relation already exists"
**Solution:** Database already has tables. Either drop them or skip that step

### Error: "Permission denied"
**Solution:** Ensure you're logged in as the database owner

### RLS Blocks All Queries
**Solution:** Check that:
1. You're logged in (auth.uid() returns a value)
2. You're a member of the apartment you're querying
3. Policies are correctly defined

## 📚 Additional Resources

- [Supabase SQL Documentation](https://supabase.com/docs/guides/database)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🎉 Success!

Once all scripts run successfully:
1. ✅ All tables created
2. ✅ RLS enabled and policies active
3. ✅ Functions and triggers working
4. ✅ Ready to use from your app!

Navigate to your app and start creating apartments! 🏠✨

