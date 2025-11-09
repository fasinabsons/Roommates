# 🗄️ Complete Database Setup Guide

## Quick Start

### Option 1: Run Complete Database (Recommended)

1. Open Supabase Dashboard: https://rcgntkbywxokzcwdvclk.supabase.co
2. Go to **SQL Editor** in left sidebar
3. Click **New Query**
4. Open file: `ziberlive/sql/COMPLETE_DATABASE.sql`
5. Copy entire contents (20KB+ of SQL)
6. Paste into Supabase SQL Editor
7. Click **RUN** button ▶️
8. Wait 5-10 seconds for completion

**Success Message**: "Success. No rows returned" or similar

### Verify Installation

Run this query to count tables:
```sql
SELECT COUNT(*) as total_tables 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';
```

**Expected Result**: ~40+ tables

### List All Tables

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**Should include**:
- apartments
- members
- bills, bill_splits, bill_types
- payments
- chefs, menus, menu_items
- grocery_teams, grocery_purchases, grocery_items
- tasks, task_assignments
- resources, resource_bookings
- polls, poll_options, poll_votes
- money_pools, money_pool_participants, money_pool_contributions
- investment_pools, investment_participants
- disputes, dispute_messages
- notifications, activity_log
- point_actions, member_points_ledger
- ad_views, developer_donations
- guests
- invites ✅ NEW
- data_archives ✅ NEW
- subscription_status ✅ NEW
- vacancy_alerts ✅ NEW

---

## Table Names - Simple & Clear

All table names follow simple patterns:
- ✅ `members` (not `apartment_members`)
- ✅ `invites` (not `apartment_invites`)
- ✅ `bills` (singular for lookup tables: `bill_types`)
- ✅ Clear, short names throughout

---

## What This SQL Does

### 1. Extensions (4)
- `uuid-ossp` - UUID generation
- `ltree` - Hierarchical data (rooms/beds)
- `pgcrypto` - Encryption functions
- `pg_stat_statements` - Query performance monitoring

### 2. Enums (10)
- `user_role` - admin, member, guest
- `member_status` - pending, active, inactive, suspended, moved_out
- `payment_status` - unpaid, partial, paid, overdue, etc.
- `bill_method` - equal_split, per_bed, prorated, custom
- `recurrence` - monthly, quarterly, annual, one_time
- `bed_type` - flat, lower, upper
- `poll_type` - yes_no, multiple_choice, rating, etc.
- `dispute_status` - open, under_review, voting, resolved, closed
- `chef_status` - active, on_leave, terminated
- `task_status` - pending, in_progress, completed, overdue, missed

### 3. Core Tables (40+)

**Apartments & Members**:
- apartments - Main apartment records
- locations - Rooms & beds (hierarchical with ltree)
- members - User membership and profiles

**Billing**:
- bill_types - Bill templates
- bills - Bill instances
- bill_splits - Individual shares
- payments - Payment records with verification

**Community Meals**:
- chefs - Chef profiles
- menus - Weekly menus
- menu_items - Individual meals
- grocery_teams - 4-week rotation teams
- team_members - Team assignments
- grocery_purchases - Receipts with OCR
- grocery_items - Extracted line items

**Tasks & Resources**:
- tasks - Household tasks
- task_assignments - Task assignments to members
- resources - Bookable resources (washing machine, etc.)
- resource_bookings - Resource reservations

**Voting & Disputes**:
- polls - Voting polls
- poll_options - Poll choices
- poll_votes - Member votes
- disputes - Conflict tracking
- dispute_messages - Dispute chat

**Money Management**:
- money_pools - Rotating money pools (chit fund model)
- money_pool_participants - Pool members
- money_pool_contributions - Monthly contributions
- money_pool_payouts - Payout records
- investment_pools - Manual investment tracking
- investment_participants - Investment participants

**System & Engagement**:
- notifications - In-app notifications
- activity_log - Audit trail
- point_actions - Loyalty point actions
- member_points_ledger - Points history
- ad_views - Ad watching tracking
- developer_donations - User donations
- guests - Temporary residents

**NEW Features**:
- invites - Invitation links/codes/QR ✅
- data_archives - Compressed archives ✅
- subscription_status - Storage & monetization ✅
- vacancy_alerts - Vacant bed alerts ✅

### 4. Functions (4)
- `trigger_set_timestamp()` - Auto-update `updated_at`
- `add_loyalty_points()` - Award loyalty points
- `update_loyalty_tier()` - Calculate loyalty tier
- `increment_poll_vote_count()` - Update poll vote counts

### 5. Triggers (15+)
- Timestamp triggers on all main tables
- Poll vote count increment trigger

### 6. Indexes (100+)
- Primary key indexes (automatic)
- Foreign key indexes for joins
- Status/date indexes for filtering
- Composite indexes for common queries
- Partial indexes for active records

### 7. Seed Data
- 12 predefined loyalty point actions
- Ready for immediate use

---

## Common Issues & Solutions

### Issue: "relation already exists"
**Solution**: Table already created. This is fine! The SQL uses `CREATE TABLE IF NOT EXISTS`.

### Issue: "type already exists"
**Solution**: Enum already created. This is fine! The SQL checks for existing types.

### Issue: "permission denied"
**Solution**: Ensure you're logged in as admin/owner in Supabase dashboard.

### Issue: "function does not exist"
**Solution**: Ensure you run the ENTIRE SQL file, not just parts of it.

### Issue: Long execution time
**Solution**: 40+ tables takes 5-10 seconds. Be patient!

---

## Post-Setup Checklist

### ✅ Verify Tables
```sql
-- Should return ~40
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';
```

### ✅ Verify Functions
```sql
-- Should return 4
SELECT COUNT(*) FROM information_schema.routines 
WHERE routine_schema = 'public';
```

### ✅ Verify Triggers
```sql
-- Should return 15+
SELECT COUNT(*) FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

### ✅ Test a Query
```sql
-- Should work without errors
SELECT * FROM apartments LIMIT 1;
SELECT * FROM members LIMIT 1;
SELECT * FROM invites LIMIT 1;
```

---

## Next Steps After Setup

### 1. Create First Apartment
```sql
-- Example: Create apartment manually
INSERT INTO apartments (name, created_by)
VALUES ('My Test Apartment', auth.uid());
```

### 2. Test Registration Flow
- Go to http://localhost:5173/register
- Fill out 4-step form
- Upload documents
- Enter invite code (create one first!)

### 3. Set User as Admin
```sql
-- After registering, make yourself admin
UPDATE members
SET role = 'admin', status = 'active'
WHERE email = 'your-email@example.com';
```

### 4. Create Test Data
```sql
-- Create invite code
INSERT INTO invites (apartment_id, invite_code, created_by)
VALUES (
  'your-apartment-id',
  'TEST-2025-ABC',
  auth.uid()
);

-- Create subscription status
INSERT INTO subscription_status (apartment_id, plan_type)
VALUES ('your-apartment-id', 'trial');
```

---

## Performance Notes

### Indexes
All foreign keys are indexed for fast joins.

### Partial Indexes
Active-only records have partial indexes:
```sql
-- Only indexes active apartments
CREATE INDEX idx_apartments_active ON apartments(is_active) 
WHERE is_active = true;
```

### JSONB Columns
Used for flexible data:
- `settings` in apartments
- `metadata` in multiple tables
- `emergency_contact` in members
- `opt_ins` in members

---

## Database Size Estimate

**Empty Database**: ~5MB
**With 1 Apartment (20 members, 1 year data)**: ~50MB
**With 10 Apartments (200 members, 1 year data)**: ~500MB

**Storage Limits**:
- Trial: 500MB
- Paid: 500MB-5GB

---

## Backup & Recovery

### Export Database
Supabase Dashboard → Database → Backups → Download

### Restore Database
1. Delete all tables (dangerous!)
2. Run `COMPLETE_DATABASE.sql`
3. Import backup data

---

## Schema Diagram

```
apartments
├── locations (rooms & beds)
├── members
│   ├── bills → bill_splits → payments
│   ├── tasks → task_assignments
│   ├── resource_bookings
│   ├── poll_votes
│   ├── money_pool_participants
│   ├── disputes
│   └── notifications
├── chefs
│   └── menus → menu_items
├── grocery_teams
│   ├── team_members
│   └── grocery_purchases → grocery_items
├── invites ✅
├── subscription_status ✅
└── data_archives ✅
```

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify you ran ENTIRE SQL file
3. Check Supabase logs: Dashboard → Logs
4. Try running individual sections
5. Contact support or check GitHub issues

---

**Status**: ✅ **READY TO RUN**
**File**: `ziberlive/sql/COMPLETE_DATABASE.sql`
**Size**: ~20KB
**Tables**: 40+
**Time**: 5-10 seconds

**Let's build something amazing! 🚀**

