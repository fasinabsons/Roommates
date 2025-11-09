-- ============================================================================
-- NEW FEATURES TABLES
-- Apartment Invites, Data Archives, Subscription Status
-- ============================================================================

-- Apartment Invites (for link/code/QR invitation)
CREATE TABLE IF NOT EXISTS apartment_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE NOT NULL,
    invite_code VARCHAR(20) UNIQUE NOT NULL,
    invite_type VARCHAR(20) CHECK (invite_type IN ('general', 'single_use', 'limited')) DEFAULT 'general',
    max_uses INTEGER DEFAULT 1,
    current_uses INTEGER DEFAULT 0,
    location_id UUID REFERENCES locations(id), -- Pre-assign bed (optional)
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_apartment_invites_code ON apartment_invites(invite_code);
CREATE INDEX idx_apartment_invites_apartment ON apartment_invites(apartment_id);
CREATE INDEX idx_apartment_invites_active ON apartment_invites(is_active) WHERE is_active = true;

COMMENT ON TABLE apartment_invites IS 'Invitation links, codes, and QR codes for new members';


-- Data Archives (for 3-month+ archival)
CREATE TABLE IF NOT EXISTS data_archives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE NOT NULL,
    archive_date DATE NOT NULL,
    archive_type VARCHAR(50) CHECK (archive_type IN ('monthly', 'quarterly', 'full_cleanup')) DEFAULT 'monthly',
    data_json JSONB NOT NULL, -- Compressed archived data
    file_size_mb DECIMAL(10,2),
    tables_archived TEXT[], -- List of tables included
    records_count INTEGER,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_data_archives_apartment ON data_archives(apartment_id);
CREATE INDEX idx_data_archives_date ON data_archives(archive_date DESC);

COMMENT ON TABLE data_archives IS 'Archived data for storage optimization and compliance';


-- Subscription Status (pay vs watch ads)
CREATE TABLE IF NOT EXISTS subscription_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE UNIQUE NOT NULL,
    plan_type VARCHAR(20) CHECK (plan_type IN ('paid', 'ad_supported', 'trial')) DEFAULT 'trial',
    storage_used_mb DECIMAL(10,2) DEFAULT 0,
    storage_limit_mb DECIMAL(10,2) DEFAULT 500, -- 500MB free tier
    payment_due_date DATE,
    last_payment_date DATE,
    last_payment_amount DECIMAL(10,2),
    payment_method VARCHAR(50),
    ads_watched_this_month INTEGER DEFAULT 0,
    ads_required_this_month INTEGER DEFAULT 300, -- 10 ads/day × 30 days
    grace_period_end DATE,
    status VARCHAR(20) CHECK (status IN ('active', 'payment_due', 'grace_period', 'suspended')) DEFAULT 'active',
    auto_archive_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscription_apartment ON subscription_status(apartment_id);
CREATE INDEX idx_subscription_status ON subscription_status(status);
CREATE INDEX idx_subscription_payment_due ON subscription_status(payment_due_date) WHERE status = 'payment_due';

COMMENT ON TABLE subscription_status IS 'Apartment subscription and storage management';


-- Add trigger for updated_at on new tables
CREATE TRIGGER set_timestamp_apartment_invites
    BEFORE UPDATE ON apartment_invites
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_subscription_status
    BEFORE UPDATE ON subscription_status
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();


-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Note: Subscription status will be created automatically when an apartment is created
-- via application logic (trigger or edge function)

COMMENT ON DATABASE current_database() IS 'ZiberLive - Complete Database with New Features';

