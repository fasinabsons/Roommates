# ZiberLive - Database Setup Instructions

## Step 1: Access Your Supabase Dashboard

1. Go to [https://supabase.com](https://supabase.com)
2. Log in to your account
3. Navigate to your project: `rcgntkbywxokzcwdvclk`

## Step 2: Run the Database Schema

1. In your Supabase dashboard, click on **SQL Editor** in the left sidebar
2. Click on **New Query**
3. Open the file `docs/DATABASE-SCHEMA-COMPLETE.sql` from this project
4. Copy the entire contents of that file
5. Paste it into the SQL Editor
6. Click **Run** to execute the schema

## Step 3: Verify the Setup

After running the schema, you should see the following tables created:

### Core Tables
- `apartments` - Main apartment/property records
- `locations` - Hierarchical rooms and beds
- `apartment_members` - User membership in apartments
- `bill_types` - Bill templates
- `bills` - Individual bill instances
- `bill_splits` - Member shares of bills
- `payments` - Payment records
- `chefs` - Chef profiles

### Custom Types (Enums)
- `user_role`
- `member_status`
- `payment_status_enum`
- `bill_calculation_method`
- `recurrence_pattern`
- `bed_type_enum`
- `poll_type_enum`
- `dispute_status_enum`
- `chef_status_enum`
- `task_status_enum`

## Step 4: Enable Row Level Security (RLS)

The schema automatically enables RLS and creates basic policies. These policies ensure:
- Members can only view data from their own apartments
- Admins have elevated permissions within their apartments
- Users can update their own profiles
- All data access is properly secured

## Step 5: Test the Connection

1. In the SQL Editor, run this test query:
```sql
SELECT * FROM apartments LIMIT 1;
```

2. If you see the table structure (even if empty), the setup is successful!

## Step 6: Create Your First Apartment (Optional)

To test the app, you can create a test apartment:

```sql
-- First, sign up a user in your app (use the /login page)
-- Then run this query with your user ID:

INSERT INTO apartments (name, address, city, country, created_by) 
VALUES (
  'Test Apartment',
  '123 Main Street',
  'Mumbai',
  'India',
  'YOUR_USER_ID_HERE'  -- Replace with actual user ID from auth.users
);
```

## Troubleshooting

### Error: "Extension does not exist"
Make sure you have the required extensions enabled in your Supabase project:
- uuid-ossp
- ltree
- pgcrypto
- pg_stat_statements

### Error: "RLS policy prevents access"
This is expected! RLS is working correctly. You need to be logged in and have proper membership to access data.

### Error: "Function already exists"
If you're re-running the schema, you may need to drop existing objects first. Contact support if you need help with this.

## Next Steps

Once the database is set up:

1. ✅ Test the connection from your app
2. ✅ Create your first apartment
3. ✅ Invite members
4. ✅ Start managing bills and payments!

## Support

If you encounter any issues:
- Check the Supabase logs for detailed error messages
- Review the RLS policies to ensure they're working correctly
- Consult the main documentation in `docs/` folder

---

**Note:** The complete schema includes 25+ tables, 100+ indexes, 50+ functions, and 100+ RLS policies. The version in `DATABASE-SCHEMA-COMPLETE.sql` is production-ready with security and performance optimizations.

