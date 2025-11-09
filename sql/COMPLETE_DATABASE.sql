-- ============================================================================
-- ZIBERLIVE - COMPLETE DATABASE SCHEMA
-- All Tables, Functions, Triggers (NO RLS - To be added in Phase 13)
-- ============================================================================
-- PostgreSQL 15+ with Supabase
-- Run this entire file in Supabase SQL Editor to set up complete database
-- ============================================================================

-- ============================================================================
-- STEP 1: EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "ltree";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ============================================================================
-- STEP 2: ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('admin', 'member', 'guest');
CREATE TYPE member_status AS ENUM ('pending', 'active', 'inactive', 'suspended', 'moved_out');
CREATE TYPE payment_status AS ENUM ('unpaid', 'partial', 'paid', 'overdue', 'pending_verification', 'verified', 'rejected');
CREATE TYPE bill_method AS ENUM ('equal_split', 'per_bed', 'prorated', 'custom');
CREATE TYPE recurrence AS ENUM ('monthly', 'quarterly', 'annual', 'one_time');
CREATE TYPE bed_type AS ENUM ('flat', 'lower', 'upper');
CREATE TYPE poll_type AS ENUM ('yes_no', 'multiple_choice_single', 'multiple_choice_multi', 'rating', 'open_ended');
CREATE TYPE dispute_status AS ENUM ('open', 'under_review', 'voting', 'resolved', 'closed');
CREATE TYPE chef_status AS ENUM ('active', 'on_leave', 'terminated');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'overdue', 'missed');

-- ============================================================================
-- STEP 3: CORE TABLES
-- ============================================================================

-- Apartments
CREATE TABLE IF NOT EXISTS apartments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    currency VARCHAR(3) DEFAULT 'INR' CHECK (currency IN ('INR', 'AED', 'NGN', 'KWD', 'USD')),
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    settings JSONB DEFAULT '{"payment_due_day": 5, "grace_period_days": 3, "late_payment_fine": 100, "max_late_fine": 500, "loyalty_enabled": true, "show_leaderboard": true, "quorum_percentage": 50, "majority_percentage": 50, "dispute_timeout_hours": 48}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_apartments_created_by ON apartments(created_by);
CREATE INDEX idx_apartments_active ON apartments(is_active) WHERE is_active = true;

-- Locations (Rooms and Beds with hierarchy)
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    path LTREE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('room', 'bed')),
    name VARCHAR(255) NOT NULL,
    bed_type bed_type,
    monthly_rate DECIMAL(10,2),
    is_vacant BOOLEAN DEFAULT true,
    floor_number INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT chk_bed_has_type CHECK (
        (type = 'bed' AND bed_type IS NOT NULL AND monthly_rate IS NOT NULL) OR
        (type = 'room' AND bed_type IS NULL)
    )
);

CREATE INDEX idx_locations_apartment ON locations(apartment_id);
CREATE INDEX idx_locations_parent ON locations(parent_id);
CREATE INDEX idx_locations_path_gist ON locations USING GIST (path);
CREATE INDEX idx_locations_vacant ON locations(is_vacant) WHERE is_vacant = true;

-- Members
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    location_id UUID REFERENCES locations(id),
    role user_role DEFAULT 'member' NOT NULL,
    status member_status DEFAULT 'pending' NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    photo_url TEXT,
    id_card_url TEXT,
    cv_url TEXT,
    labor_card_url TEXT,
    move_in_date DATE,
    move_out_date DATE,
    monthly_rate_override DECIMAL(10,2),
    emergency_contact JSONB,
    relationship_to_others TEXT,
    invited_by UUID REFERENCES members(id),
    opt_ins JSONB DEFAULT '{"community_meals": false, "drinking_water": false, "meal_types": []}'::jsonb,
    loyalty_points INTEGER DEFAULT 0,
    loyalty_tier VARCHAR(20) DEFAULT 'bronze' CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(apartment_id, user_id)
);

CREATE INDEX idx_members_apartment ON members(apartment_id);
CREATE INDEX idx_members_user ON members(user_id);
CREATE INDEX idx_members_location ON members(location_id);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_loyalty ON members(loyalty_points DESC);

-- Bill Types
CREATE TABLE IF NOT EXISTS bill_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    calculation_method bill_method DEFAULT 'equal_split' NOT NULL,
    is_prorated BOOLEAN DEFAULT false,
    is_opt_in BOOLEAN DEFAULT false,
    recurrence_pattern recurrence DEFAULT 'monthly' NOT NULL,
    default_due_day INTEGER CHECK (default_due_day BETWEEN 1 AND 31),
    grace_period_days INTEGER DEFAULT 3,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bill_types_apartment ON bill_types(apartment_id);
CREATE INDEX idx_bill_types_active ON bill_types(is_active) WHERE is_active = true;

-- Bills
CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE NOT NULL,
    bill_type_id UUID REFERENCES bill_types(id) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'partially_paid', 'paid', 'overdue')),
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bills_apartment ON bills(apartment_id);
CREATE INDEX idx_bills_type ON bills(bill_type_id);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_bills_due_date ON bills(due_date);

-- Bill Splits
CREATE TABLE IF NOT EXISTS bill_splits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id UUID REFERENCES bills(id) ON DELETE CASCADE NOT NULL,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    calculation_basis JSONB,
    amount_paid DECIMAL(10,2) DEFAULT 0 CHECK (amount_paid >= 0),
    payment_status payment_status DEFAULT 'unpaid' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(bill_id, member_id)
);

CREATE INDEX idx_bill_splits_bill ON bill_splits(bill_id);
CREATE INDEX idx_bill_splits_member ON bill_splits(member_id);
CREATE INDEX idx_bill_splits_status ON bill_splits(payment_status);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE NOT NULL,
    payer_member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
    bill_split_id UUID REFERENCES bill_splits(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(50) NOT NULL,
    transaction_reference VARCHAR(255),
    receipt_url TEXT,
    payment_date DATE NOT NULL,
    status payment_status DEFAULT 'pending_verification' NOT NULL,
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_apartment ON payments(apartment_id);
CREATE INDEX idx_payments_payer ON payments(payer_member_id);
CREATE INDEX idx_payments_split ON payments(bill_split_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Chefs
CREATE TABLE IF NOT EXISTS chefs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    photo_url TEXT,
    id_card_url TEXT NOT NULL,
    monthly_salary DECIMAL(10,2) NOT NULL CHECK (monthly_salary >= 0),
    start_date DATE NOT NULL,
    end_date DATE,
    status chef_status DEFAULT 'active' NOT NULL,
    emergency_contact JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chefs_apartment ON chefs(apartment_id);
CREATE INDEX idx_chefs_status ON chefs(status);

-- Menus
CREATE TABLE IF NOT EXISTS menus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE NOT NULL,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(apartment_id, week_start_date)
);

CREATE INDEX idx_menus_apartment ON menus(apartment_id);
CREATE INDEX idx_menus_week ON menus(week_start_date);

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_id UUID REFERENCES menus(id) ON DELETE CASCADE NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
    main_course VARCHAR(255),
    curry_1 VARCHAR(255),
    curry_2 VARCHAR(255),
    side_dish VARCHAR(255),
    dessert VARCHAR(255),
    beverage VARCHAR(255),
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(menu_id, day_of_week, meal_type)
);

CREATE INDEX idx_menu_items_menu ON menu_items(menu_id);

-- Grocery Teams
CREATE TABLE IF NOT EXISTS grocery_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE NOT NULL,
    team_name VARCHAR(100),
    week_number INTEGER NOT NULL,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    budget DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_grocery_teams_apartment ON grocery_teams(apartment_id);
CREATE INDEX idx_grocery_teams_week ON grocery_teams(week_start_date);

-- Team Members
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grocery_team_id UUID REFERENCES grocery_teams(id) ON DELETE CASCADE NOT NULL,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('lead', 'member')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(grocery_team_id, member_id)
);

CREATE INDEX idx_team_members_team ON team_members(grocery_team_id);
CREATE INDEX idx_team_members_member ON team_members(member_id);

-- Grocery Purchases
CREATE TABLE IF NOT EXISTS grocery_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grocery_team_id UUID REFERENCES grocery_teams(id) ON DELETE CASCADE NOT NULL,
    purchase_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    receipt_url TEXT,
    store_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'rejected')),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    submitted_by UUID REFERENCES members(id) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_grocery_purchases_team ON grocery_purchases(grocery_team_id);
CREATE INDEX idx_grocery_purchases_status ON grocery_purchases(status);

-- Grocery Items (OCR extracted)
CREATE TABLE IF NOT EXISTS grocery_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grocery_purchase_id UUID REFERENCES grocery_purchases(id) ON DELETE CASCADE NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2),
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    confidence_score DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_grocery_items_purchase ON grocery_items(grocery_purchase_id);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(50),
    recurrence_pattern recurrence DEFAULT 'one_time',
    due_date DATE,
    due_time TIME,
    points INTEGER DEFAULT 0,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status task_status DEFAULT 'pending',
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_apartment ON tasks(apartment_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Task Assignments
CREATE TABLE IF NOT EXISTS task_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
    assigned_date DATE NOT NULL,
    completed_date TIMESTAMPTZ,
    proof_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_task_assignments_task ON task_assignments(task_id);
CREATE INDEX idx_task_assignments_member ON task_assignments(member_id);

-- Resources
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    resource_type VARCHAR(50),
    booking_duration_minutes INTEGER DEFAULT 30,
    max_bookings_per_day INTEGER DEFAULT 3,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_resources_apartment ON resources(apartment_id);

-- Resource Bookings
CREATE TABLE IF NOT EXISTS resource_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE NOT NULL,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'checked_in', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_resource_bookings_resource ON resource_bookings(resource_id);
CREATE INDEX idx_resource_bookings_member ON resource_bookings(member_id);
CREATE INDEX idx_resource_bookings_date ON resource_bookings(booking_date);

-- Polls
CREATE TABLE IF NOT EXISTS polls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    poll_type poll_type NOT NULL,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    quorum_required INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_polls_apartment ON polls(apartment_id);
CREATE INDEX idx_polls_active ON polls(is_active) WHERE is_active = true;

-- Poll Options
CREATE TABLE IF NOT EXISTS poll_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
    option_text TEXT NOT NULL,
    option_order INTEGER,
    vote_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_poll_options_poll ON poll_options(poll_id);

-- Poll Votes
CREATE TABLE IF NOT EXISTS poll_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
    poll_option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
    vote_value INTEGER,
    vote_text TEXT,
    voted_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(poll_id, member_id)
);

CREATE INDEX idx_poll_votes_poll ON poll_votes(poll_id);
CREATE INDEX idx_poll_votes_member ON poll_votes(member_id);

-- Money Pools
CREATE TABLE IF NOT EXISTS money_pools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE NOT NULL,
    pool_name VARCHAR(255) NOT NULL,
    contribution_amount DECIMAL(10,2) NOT NULL CHECK (contribution_amount > 0),
    contribution_frequency recurrence DEFAULT 'monthly',
    total_participants INTEGER NOT NULL,
    start_date DATE NOT NULL,
    duration_months INTEGER NOT NULL,
    payout_order UUID[],
    current_payout_index INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completing', 'completed', 'cancelled')),
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_money_pools_apartment ON money_pools(apartment_id);
CREATE INDEX idx_money_pools_status ON money_pools(status);

-- Money Pool Participants
CREATE TABLE IF NOT EXISTS money_pool_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    money_pool_id UUID REFERENCES money_pools(id) ON DELETE CASCADE NOT NULL,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
    payout_position INTEGER NOT NULL,
    has_received_payout BOOLEAN DEFAULT false,
    payout_received_date DATE,
    total_contributed DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(money_pool_id, member_id)
);

CREATE INDEX idx_money_pool_participants_pool ON money_pool_participants(money_pool_id);
CREATE INDEX idx_money_pool_participants_member ON money_pool_participants(member_id);

-- Money Pool Contributions
CREATE TABLE IF NOT EXISTS money_pool_contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    money_pool_id UUID REFERENCES money_pools(id) ON DELETE CASCADE NOT NULL,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
    contribution_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    payment_status payment_status DEFAULT 'pending',
    payment_method VARCHAR(50),
    transaction_reference VARCHAR(255),
    month_number INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_money_pool_contributions_pool ON money_pool_contributions(money_pool_id);
CREATE INDEX idx_money_pool_contributions_member ON money_pool_contributions(member_id);

-- Money Pool Payouts
CREATE TABLE IF NOT EXISTS money_pool_payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    money_pool_id UUID REFERENCES money_pools(id) ON DELETE CASCADE NOT NULL,
    recipient_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    month_number INTEGER NOT NULL,
    payout_method VARCHAR(50),
    transaction_reference VARCHAR(255),
    paid_at TIMESTAMPTZ DEFAULT NOW(),
    processed_by UUID REFERENCES auth.users(id) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_money_pool_payouts_pool ON money_pool_payouts(money_pool_id);
CREATE INDEX idx_money_pool_payouts_recipient ON money_pool_payouts(recipient_id);

-- Investment Pools (Manual tracking)
CREATE TABLE IF NOT EXISTS investment_pools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    investment_type VARCHAR(50),
    total_amount DECIMAL(10,2),
    current_value DECIMAL(10,2),
    expected_return_rate DECIMAL(5,2),
    start_date DATE,
    maturity_date DATE,
    lock_in_months INTEGER,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_investment_pools_apartment ON investment_pools(apartment_id);

-- Investment Participants
CREATE TABLE IF NOT EXISTS investment_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investment_pool_id UUID REFERENCES investment_pools(id) ON DELETE CASCADE NOT NULL,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    ownership_percentage DECIMAL(5,2),
    joined_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_investment_participants_pool ON investment_participants(investment_pool_id);
CREATE INDEX idx_investment_participants_member ON investment_participants(member_id);

-- Disputes
CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    raised_by UUID REFERENCES members(id) NOT NULL,
    against_member_id UUID REFERENCES members(id),
    status dispute_status DEFAULT 'open',
    escalated_to_poll_id UUID REFERENCES polls(id),
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_disputes_apartment ON disputes(apartment_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_raised_by ON disputes(raised_by);

-- Dispute Messages
CREATE TABLE IF NOT EXISTS dispute_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispute_id UUID REFERENCES disputes(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES members(id) NOT NULL,
    message TEXT NOT NULL,
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dispute_messages_dispute ON dispute_messages(dispute_id);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50),
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_member ON notifications(member_id);
CREATE INDEX idx_notifications_unread ON notifications(member_id, is_read) WHERE is_read = false;

-- Activity Log
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE NOT NULL,
    member_id UUID REFERENCES members(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_log_apartment ON activity_log(apartment_id);
CREATE INDEX idx_activity_log_member ON activity_log(member_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);

-- Point Actions (Loyalty system)
CREATE TABLE IF NOT EXISTS point_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    points_value INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Member Points Ledger
CREATE TABLE IF NOT EXISTS member_points_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
    points INTEGER NOT NULL,
    description TEXT,
    related_table VARCHAR(50),
    related_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_member_points_ledger_member ON member_points_ledger(member_id);

-- Ad Views (Monetization)
CREATE TABLE IF NOT EXISTS ad_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
    apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE NOT NULL,
    view_date DATE NOT NULL,
    session_type VARCHAR(20) CHECK (session_type IN ('morning', 'evening')) NOT NULL,
    ad_count INTEGER NOT NULL,
    revenue_generated DECIMAL(10,2) DEFAULT 0,
    user_share DECIMAL(10,2) DEFAULT 0,
    platform_share DECIMAL(10,2) DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ad_views_member ON ad_views(member_id);
CREATE INDEX idx_ad_views_date ON ad_views(view_date DESC);

-- Developer Donations
CREATE TABLE IF NOT EXISTS developer_donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
    apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2),
    donation_type VARCHAR(20) CHECK (donation_type IN ('earnings', 'bonus_ads')),
    ad_count INTEGER,
    donated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_developer_donations_member ON developer_donations(member_id);

-- Guests (Temporary residents)
CREATE TABLE IF NOT EXISTS guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE NOT NULL,
    sponsor_member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    photo_url TEXT,
    id_proof_url TEXT,
    stay_from DATE NOT NULL,
    stay_to DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'completed', 'cancelled')),
    entry_code VARCHAR(20),
    meal_opt_in BOOLEAN DEFAULT false,
    total_charges DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guests_apartment ON guests(apartment_id);
CREATE INDEX idx_guests_sponsor ON guests(sponsor_member_id);
CREATE INDEX idx_guests_status ON guests(status);

-- Apartment Invites (NEW)
CREATE TABLE IF NOT EXISTS invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE NOT NULL,
    invite_code VARCHAR(20) UNIQUE NOT NULL,
    invite_type VARCHAR(20) CHECK (invite_type IN ('general', 'single_use', 'limited')) DEFAULT 'general',
    max_uses INTEGER DEFAULT 1,
    current_uses INTEGER DEFAULT 0,
    location_id UUID REFERENCES locations(id),
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invites_code ON invites(invite_code);
CREATE INDEX idx_invites_apartment ON invites(apartment_id);
CREATE INDEX idx_invites_active ON invites(is_active) WHERE is_active = true;

-- Data Archives (NEW)
CREATE TABLE IF NOT EXISTS data_archives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE NOT NULL,
    archive_date DATE NOT NULL,
    archive_type VARCHAR(50) CHECK (archive_type IN ('monthly', 'quarterly', 'full_cleanup')) DEFAULT 'monthly',
    data_json JSONB NOT NULL,
    file_size_mb DECIMAL(10,2),
    tables_archived TEXT[],
    records_count INTEGER,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_data_archives_apartment ON data_archives(apartment_id);
CREATE INDEX idx_data_archives_date ON data_archives(archive_date DESC);

-- Subscription Status (NEW)
CREATE TABLE IF NOT EXISTS subscription_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE UNIQUE NOT NULL,
    plan_type VARCHAR(20) CHECK (plan_type IN ('paid', 'ad_supported', 'trial')) DEFAULT 'trial',
    storage_used_mb DECIMAL(10,2) DEFAULT 0,
    storage_limit_mb DECIMAL(10,2) DEFAULT 500,
    payment_due_date DATE,
    last_payment_date DATE,
    last_payment_amount DECIMAL(10,2),
    payment_method VARCHAR(50),
    ads_watched_this_month INTEGER DEFAULT 0,
    ads_required_this_month INTEGER DEFAULT 300,
    grace_period_end DATE,
    status VARCHAR(20) CHECK (status IN ('active', 'payment_due', 'grace_period', 'suspended')) DEFAULT 'active',
    auto_archive_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscription_apartment ON subscription_status(apartment_id);
CREATE INDEX idx_subscription_status ON subscription_status(status);

-- Vacancy Alerts
CREATE TABLE IF NOT EXISTS vacancy_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE NOT NULL,
    apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE NOT NULL,
    vacant_since DATE NOT NULL,
    shared_count INTEGER DEFAULT 0,
    last_shared_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vacancy_alerts_location ON vacancy_alerts(location_id);
CREATE INDEX idx_vacancy_alerts_apartment ON vacancy_alerts(apartment_id);

-- ============================================================================
-- STEP 4: FUNCTIONS
-- ============================================================================

-- Updated timestamp trigger function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add loyalty points function
CREATE OR REPLACE FUNCTION add_loyalty_points(
    p_member_id UUID,
    p_points INTEGER,
    p_description TEXT,
    p_related_table VARCHAR DEFAULT NULL,
    p_related_id UUID DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO member_points_ledger (member_id, points, description, related_table, related_id)
    VALUES (p_member_id, p_points, p_description, p_related_table, p_related_id);
    
    UPDATE members
    SET loyalty_points = loyalty_points + p_points,
        updated_at = NOW()
    WHERE id = p_member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update loyalty tier function
CREATE OR REPLACE FUNCTION update_loyalty_tier(p_member_id UUID)
RETURNS VOID AS $$
DECLARE
    v_points INTEGER;
    v_new_tier VARCHAR(20);
BEGIN
    SELECT loyalty_points INTO v_points FROM members WHERE id = p_member_id;
    
    IF v_points >= 5000 THEN
        v_new_tier := 'platinum';
    ELSIF v_points >= 2000 THEN
        v_new_tier := 'gold';
    ELSIF v_points >= 500 THEN
        v_new_tier := 'silver';
    ELSE
        v_new_tier := 'bronze';
    END IF;
    
    UPDATE members SET loyalty_tier = v_new_tier WHERE id = p_member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment poll vote count
CREATE OR REPLACE FUNCTION increment_poll_vote_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.poll_option_id IS NOT NULL THEN
        UPDATE poll_options
        SET vote_count = vote_count + 1
        WHERE id = NEW.poll_option_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Phase 2: Invite System Functions

-- Increment invite usage counter
CREATE OR REPLACE FUNCTION increment_invite_usage(code VARCHAR)
RETURNS VOID AS $$
BEGIN
  UPDATE invites
  SET current_uses = current_uses + 1,
      updated_at = NOW()
  WHERE invite_code = code;
END;
$$ LANGUAGE plpgsql;

-- Check if invite is valid and available
CREATE OR REPLACE FUNCTION is_invite_valid(code VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  invite_record RECORD;
BEGIN
  SELECT * INTO invite_record
  FROM invites
  WHERE invite_code = code;

  -- Check if invite exists
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Check if active
  IF NOT invite_record.is_active THEN
    RETURN FALSE;
  END IF;

  -- Check if expired
  IF invite_record.expires_at IS NOT NULL AND invite_record.expires_at < NOW() THEN
    RETURN FALSE;
  END IF;

  -- Check if uses exhausted
  IF invite_record.current_uses >= invite_record.max_uses THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Get invite statistics for an apartment
CREATE OR REPLACE FUNCTION get_invite_stats(apartment_uuid UUID)
RETURNS TABLE (
  total_invites BIGINT,
  active_invites BIGINT,
  expired_invites BIGINT,
  used_up_invites BIGINT,
  total_uses BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS total_invites,
    COUNT(*) FILTER (WHERE is_active = true AND (expires_at IS NULL OR expires_at > NOW()) AND current_uses < max_uses) AS active_invites,
    COUNT(*) FILTER (WHERE expires_at IS NOT NULL AND expires_at < NOW()) AS expired_invites,
    COUNT(*) FILTER (WHERE current_uses >= max_uses) AS used_up_invites,
    COALESCE(SUM(current_uses), 0) AS total_uses
  FROM invites
  WHERE apartment_id = apartment_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 5: TRIGGERS
-- ============================================================================

-- Timestamp triggers
CREATE TRIGGER set_timestamp_apartments BEFORE UPDATE ON apartments FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_locations BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_members BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_bills BEFORE UPDATE ON bills FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_bill_splits BEFORE UPDATE ON bill_splits FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_payments BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_chefs BEFORE UPDATE ON chefs FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_menus BEFORE UPDATE ON menus FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_tasks BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_disputes BEFORE UPDATE ON disputes FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_investment_pools BEFORE UPDATE ON investment_pools FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_guests BEFORE UPDATE ON guests FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_invites BEFORE UPDATE ON invites FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_subscription_status BEFORE UPDATE ON subscription_status FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Poll vote count trigger
CREATE TRIGGER increment_vote_count_on_vote
    AFTER INSERT ON poll_votes
    FOR EACH ROW
    EXECUTE FUNCTION increment_poll_vote_count();

-- ============================================================================
-- STEP 6: SEED DATA
-- ============================================================================

-- Loyalty point actions
INSERT INTO point_actions (action_name, description, points_value, is_active) VALUES
    ('complete_profile', 'Complete profile with ID', 500, true),
    ('payment_on_time', 'Pay bill on time', 100, true),
    ('payment_early', 'Pay bill 3+ days early', 150, true),
    ('task_completed', 'Complete assigned task', 20, true),
    ('grocery_duty_completed', 'Complete grocery duty', 200, true),
    ('vote_in_poll', 'Participate in voting', 10, true),
    ('refer_member', 'Refer approved member', 500, true),
    ('payment_late_1day', 'Late payment 1 day', -25, true),
    ('payment_late_3days', 'Late payment 3 days', -50, true),
    ('payment_late_7days', 'Late payment 7 days', -100, true),
    ('task_missed', 'Missed assigned task', -30, true),
    ('no_show_resource', 'No-show for resource booking', -15, true)
ON CONFLICT (action_name) DO NOTHING;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Count all tables
SELECT COUNT(*) as total_tables 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================================================
-- COMPLETE!
-- ============================================================================
-- Total Tables: 40+
-- Total Indexes: 100+
-- Total Functions: 4
-- Total Triggers: 15+
-- RLS Policies: To be added in Phase 13
-- ============================================================================

