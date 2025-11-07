-- ============================================================================
-- ZIBERLIVE - DATABASE FUNCTIONS
-- ============================================================================
-- Run this FIFTH after RLS policies
-- ============================================================================

-- ============================================================================
-- TIMESTAMP TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION trigger_set_timestamp() IS 'Automatically update updated_at timestamp';


-- ============================================================================
-- LOYALTY POINTS FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION add_loyalty_points(
    p_member_id UUID,
    p_points INTEGER,
    p_description TEXT
) RETURNS VOID AS $$
BEGIN
    -- Update member total points
    UPDATE apartment_members
    SET loyalty_points = loyalty_points + p_points,
        updated_at = NOW()
    WHERE id = p_member_id;
    
    -- Update tier if needed (simplified logic)
    UPDATE apartment_members
    SET loyalty_tier = CASE
        WHEN loyalty_points >= 5000 THEN 'platinum'
        WHEN loyalty_points >= 3000 THEN 'gold'
        WHEN loyalty_points >= 1500 THEN 'silver'
        ELSE 'bronze'
    END
    WHERE id = p_member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION add_loyalty_points IS 'Add loyalty points to a member and update their tier';


-- ============================================================================
-- CALCULATE BILL SPLIT FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_bill_split(
    p_bill_id UUID,
    p_calculation_method bill_calculation_method
) RETURNS TABLE (
    member_id UUID,
    amount DECIMAL(10,2)
) AS $$
DECLARE
    v_total_amount DECIMAL(10,2);
    v_apartment_id UUID;
    v_active_members_count INTEGER;
BEGIN
    -- Get bill details
    SELECT total_amount, apartment_id 
    INTO v_total_amount, v_apartment_id
    FROM bills
    WHERE id = p_bill_id;
    
    -- Count active members
    SELECT COUNT(*) 
    INTO v_active_members_count
    FROM apartment_members
    WHERE apartment_id = v_apartment_id 
    AND status = 'active';
    
    -- Calculate split based on method
    IF p_calculation_method = 'equal_split' THEN
        RETURN QUERY
        SELECT 
            am.id as member_id,
            (v_total_amount / v_active_members_count)::DECIMAL(10,2) as amount
        FROM apartment_members am
        WHERE am.apartment_id = v_apartment_id
        AND am.status = 'active';
    
    ELSIF p_calculation_method = 'per_bed' THEN
        RETURN QUERY
        SELECT 
            am.id as member_id,
            COALESCE(am.monthly_rate_override, l.monthly_rate, 0)::DECIMAL(10,2) as amount
        FROM apartment_members am
        LEFT JOIN locations l ON am.location_id = l.id
        WHERE am.apartment_id = v_apartment_id
        AND am.status = 'active';
    
    ELSE
        -- Default to equal split
        RETURN QUERY
        SELECT 
            am.id as member_id,
            (v_total_amount / v_active_members_count)::DECIMAL(10,2) as amount
        FROM apartment_members am
        WHERE am.apartment_id = v_apartment_id
        AND am.status = 'active';
    END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_bill_split IS 'Calculate how a bill should be split among members';


-- ============================================================================
-- GET MEMBER DASHBOARD STATS
-- ============================================================================
CREATE OR REPLACE FUNCTION get_member_dashboard_stats(p_user_id UUID)
RETURNS TABLE (
    apartment_name VARCHAR,
    pending_bills_count INTEGER,
    pending_bills_amount DECIMAL(10,2),
    loyalty_points INTEGER,
    loyalty_tier VARCHAR,
    member_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.name as apartment_name,
        COUNT(DISTINCT bs.id)::INTEGER as pending_bills_count,
        COALESCE(SUM(bs.amount - bs.amount_paid), 0)::DECIMAL(10,2) as pending_bills_amount,
        am.loyalty_points,
        am.loyalty_tier,
        (SELECT COUNT(*)::INTEGER FROM apartment_members 
         WHERE apartment_id = am.apartment_id 
         AND status = 'active') as member_count
    FROM apartment_members am
    JOIN apartments a ON am.apartment_id = a.id
    LEFT JOIN bill_splits bs ON bs.member_id = am.id 
        AND bs.payment_status IN ('unpaid', 'partial', 'overdue')
    WHERE am.user_id = p_user_id
    GROUP BY a.name, am.loyalty_points, am.loyalty_tier, am.apartment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_member_dashboard_stats IS 'Get dashboard statistics for a member';


-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run this to verify functions:
-- SELECT routine_name, routine_type 
-- FROM information_schema.routines 
-- WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
-- ORDER BY routine_name;

