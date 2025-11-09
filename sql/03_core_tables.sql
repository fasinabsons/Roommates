-- ============================================================================
-- ZIBERLIVE - CORE TABLES
-- ============================================================================
-- Run this THIRD after extensions and enums
-- ============================================================================

-- ============================================================================
-- APARTMENTS - Top-level container
-- ============================================================================
CREATE TABLE apartments (
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
    settings JSONB DEFAULT '{
        "payment_due_day": 5,
        "grace_period_days": 3,
        "late_payment_fine": 100,
        "max_late_fine": 500,
        "loyalty_enabled": true,
        "show_leaderboard": true,
        "quorum_percentage": 50,
        "majority_percentage": 50,
        "dispute_timeout_hours": 48
    }'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_apartments_created_by ON apartments(created_by);
CREATE INDEX idx_apartments_active ON apartments(is_active) WHERE is_active = true;

COMMENT ON TABLE apartments IS 'Top-level apartment/property records';
COMMENT ON COLUMN apartments.settings IS 'JSON configuration for apartment-specific settings';


-- ============================================================================
-- LOCATIONS - Hierarchical rooms and beds
-- ============================================================================
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    path LTREE NOT NULL,  -- e.g., 'apt1.room301.bed1'
    type VARCHAR(20) NOT NULL CHECK (type IN ('room', 'bed')),
    name VARCHAR(255) NOT NULL,
    bed_type bed_type_enum,
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
CREATE INDEX idx_locations_type ON locations(type);

COMMENT ON TABLE locations IS 'Hierarchical structure for rooms and beds using ltree';


-- ============================================================================
-- APARTMENT MEMBERS - User membership in apartments
-- ============================================================================
CREATE TABLE apartment_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    location_id UUID REFERENCES locations(id),
    role user_role DEFAULT 'member' NOT NULL,
    status member_status DEFAULT 'pending' NOT NULL,
    
    -- Personal Information
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    photo_url TEXT,
    identity_card_url TEXT,
    cv_url TEXT,
    labor_card_url TEXT,
    
    -- Dates
    move_in_date DATE,
    move_out_date DATE,
    
    -- Pricing
    monthly_rate_override DECIMAL(10,2),
    
    -- Emergency Contact
    emergency_contact JSONB,
    
    -- Relationships
    relationship_to_others TEXT,
    invited_by UUID REFERENCES apartment_members(id),
    
    -- Meal Participation
    opt_ins JSONB DEFAULT '{
        "community_meals": false,
        "drinking_water": false,
        "meal_types": []
    }'::jsonb,
    
    -- Gamification
    loyalty_points INTEGER DEFAULT 0,
    loyalty_tier VARCHAR(20) DEFAULT 'bronze' CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum')),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(apartment_id, user_id)
);

CREATE INDEX idx_members_apartment ON apartment_members(apartment_id);
CREATE INDEX idx_members_user ON apartment_members(user_id);
CREATE INDEX idx_members_location ON apartment_members(location_id);
CREATE INDEX idx_members_status ON apartment_members(status);
CREATE INDEX idx_members_role ON apartment_members(role);
CREATE INDEX idx_members_loyalty ON apartment_members(loyalty_points DESC);

COMMENT ON TABLE apartment_members IS 'User membership in apartments with roles and status';


-- ============================================================================
-- BILL TYPES - Templates for recurring bills
-- ============================================================================
CREATE TABLE bill_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    calculation_method bill_calculation_method DEFAULT 'equal_split' NOT NULL,
    is_prorated BOOLEAN DEFAULT false,
    is_opt_in BOOLEAN DEFAULT false,
    recurrence_pattern recurrence_pattern DEFAULT 'monthly' NOT NULL,
    default_due_day INTEGER CHECK (default_due_day BETWEEN 1 AND 31),
    grace_period_days INTEGER DEFAULT 3,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bill_types_apartment ON bill_types(apartment_id);
CREATE INDEX idx_bill_types_active ON bill_types(is_active) WHERE is_active = true;

COMMENT ON TABLE bill_types IS 'Bill type templates defining calculation rules';


-- ============================================================================
-- BILLS - Actual bill instances
-- ============================================================================
CREATE TABLE bills (
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
CREATE INDEX idx_bills_period ON bills(period_start, period_end);
CREATE INDEX idx_bills_apartment_due ON bills(apartment_id, due_date DESC);

COMMENT ON TABLE bills IS 'Individual bill instances for billing periods';


-- ============================================================================
-- BILL SPLITS - Individual member shares
-- ============================================================================
CREATE TABLE bill_splits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id UUID REFERENCES bills(id) ON DELETE CASCADE NOT NULL,
    member_id UUID REFERENCES apartment_members(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    calculation_basis JSONB,
    amount_paid DECIMAL(10,2) DEFAULT 0 CHECK (amount_paid >= 0),
    payment_status payment_status_enum DEFAULT 'unpaid' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(bill_id, member_id)
);

CREATE INDEX idx_bill_splits_bill ON bill_splits(bill_id);
CREATE INDEX idx_bill_splits_member ON bill_splits(member_id);
CREATE INDEX idx_bill_splits_status ON bill_splits(payment_status);
CREATE INDEX idx_bill_splits_member_status ON bill_splits(member_id, payment_status);

COMMENT ON TABLE bill_splits IS 'Individual member shares of bills';


-- ============================================================================
-- PAYMENTS - Payment records
-- ============================================================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE NOT NULL,
    payer_member_id UUID REFERENCES apartment_members(id) ON DELETE CASCADE NOT NULL,
    bill_split_id UUID REFERENCES bill_splits(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(50) NOT NULL,
    transaction_reference VARCHAR(255),
    receipt_url TEXT,
    payment_date DATE NOT NULL,
    status payment_status_enum DEFAULT 'pending_verification' NOT NULL,
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
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_payments_member_date ON payments(payer_member_id, payment_date DESC);

COMMENT ON TABLE payments IS 'Payment records submitted by members';


-- ============================================================================
-- CHEFS - Community meal chefs/cooks
-- ============================================================================
CREATE TABLE chefs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    photo_url TEXT,
    identity_card_url TEXT NOT NULL,
    monthly_salary DECIMAL(10,2) NOT NULL CHECK (monthly_salary >= 0),
    start_date DATE NOT NULL,
    end_date DATE,
    status chef_status_enum DEFAULT 'active' NOT NULL,
    emergency_contact JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chefs_apartment ON chefs(apartment_id);
CREATE INDEX idx_chefs_status ON chefs(status);

COMMENT ON TABLE chefs IS 'Chef/cook profiles managing community meals';

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run this to verify all tables are created:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
-- ORDER BY table_name;

