-- ============================================================================
-- ZIBERLIVE - CUSTOM TYPES (ENUMS)
-- ============================================================================
-- Run this SECOND after extensions
-- ============================================================================

-- User Roles in Apartment
CREATE TYPE user_role AS ENUM ('admin', 'member', 'guest');

-- Member Status Lifecycle
CREATE TYPE member_status AS ENUM ('pending', 'active', 'inactive', 'suspended', 'moved_out');

-- Payment Status
CREATE TYPE payment_status_enum AS ENUM (
    'unpaid', 
    'partial', 
    'paid', 
    'overdue', 
    'pending_verification', 
    'verified', 
    'rejected'
);

-- Bill Calculation Methods
CREATE TYPE bill_calculation_method AS ENUM (
    'equal_split',  -- Split equally among all members
    'per_bed',      -- Calculate based on bed rates
    'prorated',     -- Prorated based on days
    'custom'        -- Custom split logic
);

-- Recurrence Patterns for Bills
CREATE TYPE recurrence_pattern AS ENUM (
    'monthly', 
    'quarterly', 
    'annual', 
    'one_time'
);

-- Bed Types (for bunk beds, flats, etc.)
CREATE TYPE bed_type_enum AS ENUM ('flat', 'lower', 'upper');

-- Poll Types for Voting
CREATE TYPE poll_type_enum AS ENUM (
    'yes_no', 
    'multiple_choice_single', 
    'multiple_choice_multi', 
    'rating', 
    'open_ended'
);

-- Dispute Resolution Status
CREATE TYPE dispute_status_enum AS ENUM (
    'open', 
    'under_review', 
    'voting', 
    'resolved', 
    'closed'
);

-- Chef/Cook Status
CREATE TYPE chef_status_enum AS ENUM ('active', 'on_leave', 'terminated');

-- Task Status
CREATE TYPE task_status_enum AS ENUM (
    'pending', 
    'in_progress', 
    'completed', 
    'overdue', 
    'missed'
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run this to verify enums are created:
-- SELECT typname FROM pg_type WHERE typtype = 'e' ORDER BY typname;

