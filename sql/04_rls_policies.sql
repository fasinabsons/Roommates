-- ============================================================================
-- ZIBERLIVE - ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Run this FOURTH after core tables
-- ============================================================================

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE apartment_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chefs ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- APARTMENTS POLICIES
-- ============================================================================

-- Users can view apartments they created or are members of
CREATE POLICY "Users can view their apartments"
    ON apartments FOR SELECT
    USING (
        created_by = auth.uid() OR
        id IN (
            SELECT apartment_id FROM apartment_members
            WHERE user_id = auth.uid()
        )
    );

-- Users can create apartments
CREATE POLICY "Users can create apartments"
    ON apartments FOR INSERT
    WITH CHECK (created_by = auth.uid());

-- Only apartment creators (admins) can update
CREATE POLICY "Creators can update apartments"
    ON apartments FOR UPDATE
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

-- Only creators can delete
CREATE POLICY "Creators can delete apartments"
    ON apartments FOR DELETE
    USING (created_by = auth.uid());


-- ============================================================================
-- LOCATIONS POLICIES
-- ============================================================================

-- Members can view locations in their apartment
CREATE POLICY "Members can view apartment locations"
    ON locations FOR SELECT
    USING (
        apartment_id IN (
            SELECT apartment_id FROM apartment_members
            WHERE user_id = auth.uid()
        )
    );

-- Only admins can manage locations
CREATE POLICY "Admins can insert locations"
    ON locations FOR INSERT
    WITH CHECK (
        apartment_id IN (
            SELECT apartment_id FROM apartment_members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update locations"
    ON locations FOR UPDATE
    USING (
        apartment_id IN (
            SELECT apartment_id FROM apartment_members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete locations"
    ON locations FOR DELETE
    USING (
        apartment_id IN (
            SELECT apartment_id FROM apartment_members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );


-- ============================================================================
-- APARTMENT MEMBERS POLICIES
-- ============================================================================

-- Members can view other members in their apartment
CREATE POLICY "Members can view apartment members"
    ON apartment_members FOR SELECT
    USING (
        apartment_id IN (
            SELECT apartment_id FROM apartment_members
            WHERE user_id = auth.uid()
        )
    );

-- Admins can add members
CREATE POLICY "Admins can add members"
    ON apartment_members FOR INSERT
    WITH CHECK (
        apartment_id IN (
            SELECT apartment_id FROM apartment_members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Members can update their own profile
CREATE POLICY "Members can update own profile"
    ON apartment_members FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Admins can update any member in their apartment
CREATE POLICY "Admins can update apartment members"
    ON apartment_members FOR UPDATE
    USING (
        apartment_id IN (
            SELECT apartment_id FROM apartment_members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can remove members
CREATE POLICY "Admins can remove members"
    ON apartment_members FOR DELETE
    USING (
        apartment_id IN (
            SELECT apartment_id FROM apartment_members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );


-- ============================================================================
-- BILL TYPES POLICIES
-- ============================================================================

-- Members can view bill types
CREATE POLICY "Members can view bill types"
    ON bill_types FOR SELECT
    USING (
        apartment_id IN (
            SELECT apartment_id FROM apartment_members
            WHERE user_id = auth.uid()
        )
    );

-- Admins can manage bill types
CREATE POLICY "Admins can manage bill types"
    ON bill_types FOR ALL
    USING (
        apartment_id IN (
            SELECT apartment_id FROM apartment_members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );


-- ============================================================================
-- BILLS POLICIES
-- ============================================================================

-- Members can view bills in their apartment
CREATE POLICY "Members can view bills"
    ON bills FOR SELECT
    USING (
        apartment_id IN (
            SELECT apartment_id FROM apartment_members
            WHERE user_id = auth.uid()
        )
    );

-- Admins can manage bills
CREATE POLICY "Admins can manage bills"
    ON bills FOR ALL
    USING (
        apartment_id IN (
            SELECT apartment_id FROM apartment_members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );


-- ============================================================================
-- BILL SPLITS POLICIES
-- ============================================================================

-- Members can view their own splits
CREATE POLICY "Members can view their bill splits"
    ON bill_splits FOR SELECT
    USING (
        member_id IN (
            SELECT id FROM apartment_members
            WHERE user_id = auth.uid()
        )
    );

-- Admins can view all splits in their apartment
CREATE POLICY "Admins can view all bill splits"
    ON bill_splits FOR SELECT
    USING (
        bill_id IN (
            SELECT id FROM bills
            WHERE apartment_id IN (
                SELECT apartment_id FROM apartment_members
                WHERE user_id = auth.uid() AND role = 'admin'
            )
        )
    );

-- System manages bill splits (admins create via bills)
CREATE POLICY "Admins can manage bill splits"
    ON bill_splits FOR ALL
    USING (
        bill_id IN (
            SELECT id FROM bills
            WHERE apartment_id IN (
                SELECT apartment_id FROM apartment_members
                WHERE user_id = auth.uid() AND role = 'admin'
            )
        )
    );


-- ============================================================================
-- PAYMENTS POLICIES
-- ============================================================================

-- Members can view their own payments
CREATE POLICY "Members can view own payments"
    ON payments FOR SELECT
    USING (
        payer_member_id IN (
            SELECT id FROM apartment_members
            WHERE user_id = auth.uid()
        )
    );

-- Admins can view all payments in their apartment
CREATE POLICY "Admins can view all payments"
    ON payments FOR SELECT
    USING (
        apartment_id IN (
            SELECT apartment_id FROM apartment_members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Members can submit payments
CREATE POLICY "Members can submit payments"
    ON payments FOR INSERT
    WITH CHECK (
        payer_member_id IN (
            SELECT id FROM apartment_members
            WHERE user_id = auth.uid()
        )
    );

-- Admins can verify/reject payments
CREATE POLICY "Admins can update payments"
    ON payments FOR UPDATE
    USING (
        apartment_id IN (
            SELECT apartment_id FROM apartment_members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );


-- ============================================================================
-- CHEFS POLICIES
-- ============================================================================

-- Members can view chefs
CREATE POLICY "Members can view chefs"
    ON chefs FOR SELECT
    USING (
        apartment_id IN (
            SELECT apartment_id FROM apartment_members
            WHERE user_id = auth.uid()
        )
    );

-- Admins can manage chefs
CREATE POLICY "Admins can manage chefs"
    ON chefs FOR ALL
    USING (
        apartment_id IN (
            SELECT apartment_id FROM apartment_members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );


-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run this to verify RLS policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

