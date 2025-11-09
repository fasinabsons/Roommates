-- ============================================================================
-- ZIBERLIVE - TRIGGERS
-- ============================================================================
-- Run this SIXTH after functions
-- ============================================================================

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

-- Apartments
CREATE TRIGGER set_timestamp_apartments
    BEFORE UPDATE ON apartments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Locations
CREATE TRIGGER set_timestamp_locations
    BEFORE UPDATE ON locations
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Apartment Members
CREATE TRIGGER set_timestamp_apartment_members
    BEFORE UPDATE ON apartment_members
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Bills
CREATE TRIGGER set_timestamp_bills
    BEFORE UPDATE ON bills
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Bill Splits
CREATE TRIGGER set_timestamp_bill_splits
    BEFORE UPDATE ON bill_splits
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Payments
CREATE TRIGGER set_timestamp_payments
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Chefs
CREATE TRIGGER set_timestamp_chefs
    BEFORE UPDATE ON chefs
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();


-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run this to verify triggers:
-- SELECT trigger_name, event_manipulation, event_object_table 
-- FROM information_schema.triggers 
-- WHERE trigger_schema = 'public'
-- ORDER BY event_object_table, trigger_name;

