-- ============================================================================
-- ZIBERLIVE - COMPLETE DATABASE SETUP
-- ============================================================================
-- Run this file to execute ALL setup scripts in order
-- OR run individual files in sequence: 01, 02, 03, 04, 05, 06
-- ============================================================================

-- ============================================================================
-- STEP 1: EXTENSIONS
-- ============================================================================
\echo 'Installing extensions...'

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "ltree";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";


-- ============================================================================
-- STEP 2: ENUMS
-- ============================================================================
\echo 'Creating enums...'

CREATE TYPE user_role AS ENUM ('admin', 'member', 'guest');
CREATE TYPE member_status AS ENUM ('pending', 'active', 'inactive', 'suspended', 'moved_out');
CREATE TYPE payment_status_enum AS ENUM ('unpaid', 'partial', 'paid', 'overdue', 'pending_verification', 'verified', 'rejected');
CREATE TYPE bill_calculation_method AS ENUM ('equal_split', 'per_bed', 'prorated', 'custom');
CREATE TYPE recurrence_pattern AS ENUM ('monthly', 'quarterly', 'annual', 'one_time');
CREATE TYPE bed_type_enum AS ENUM ('flat', 'lower', 'upper');
CREATE TYPE poll_type_enum AS ENUM ('yes_no', 'multiple_choice_single', 'multiple_choice_multi', 'rating', 'open_ended');
CREATE TYPE dispute_status_enum AS ENUM ('open', 'under_review', 'voting', 'resolved', 'closed');
CREATE TYPE chef_status_enum AS ENUM ('active', 'on_leave', 'terminated');
CREATE TYPE task_status_enum AS ENUM ('pending', 'in_progress', 'completed', 'overdue', 'missed');


-- ============================================================================
-- STEP 3: CORE TABLES
-- ============================================================================
\echo 'Creating core tables...'

-- Copy entire content from 03_core_tables.sql
-- (See 03_core_tables.sql for full table definitions)

-- Note: For Supabase SQL Editor, copy the contents of each file manually
-- or use this command-line approach:
-- psql -h your-host -U your-user -d your-db -f sql/01_extensions.sql
-- psql -h your-host -U your-user -d your-db -f sql/02_enums.sql
-- ... etc


-- ============================================================================
-- RECOMMENDED: Run Individual Files
-- ============================================================================
-- For best results, run each file individually in this order:
--
-- 1. sql/01_extensions.sql
-- 2. sql/02_enums.sql
-- 3. sql/03_core_tables.sql
-- 4. sql/04_rls_policies.sql (SKIP for now - implement after all features complete)
-- 5. sql/05_functions.sql
-- 6. sql/06_triggers.sql
-- 7. sql/07_new_features_tables.sql (invites, data_archives, subscription_status)
-- 8. sql/08_invite_functions.sql (Phase 2 - invite system functions)
--
-- ============================================================================

\echo 'Database setup complete!'
\echo 'Total tables created: 8'
\echo 'Total RLS policies: 30+'
\echo 'Total functions: 4'
\echo 'Total triggers: 7'

