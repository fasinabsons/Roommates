-- ============================================
-- Phase 2: Invite System Functions
-- ============================================
-- Description: Additional functions for invite management
-- Created: November 5, 2025
-- ============================================

-- Function to increment invite usage counter
CREATE OR REPLACE FUNCTION increment_invite_usage(code VARCHAR)
RETURNS VOID AS $$
BEGIN
  UPDATE invites
  SET current_uses = current_uses + 1,
      updated_at = NOW()
  WHERE invite_code = code;
END;
$$ LANGUAGE plpgsql;

-- Function to check if invite is valid and available
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

-- Function to get invite statistics
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

-- Comment on functions
COMMENT ON FUNCTION increment_invite_usage IS 'Increments the usage counter for an invite code';
COMMENT ON FUNCTION is_invite_valid IS 'Checks if an invite code is valid and can be used';
COMMENT ON FUNCTION get_invite_stats IS 'Returns statistics about invites for an apartment';

