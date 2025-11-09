-- ============================================================================
-- ZIBERLIVE - DATABASE EXTENSIONS
-- ============================================================================
-- Run this FIRST in your Supabase SQL Editor
-- ============================================================================

-- UUID Generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Hierarchical Data (for rooms/beds structure)
CREATE EXTENSION IF NOT EXISTS "ltree";

-- Encryption Functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Performance Monitoring
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run this to verify extensions are installed:
-- SELECT * FROM pg_extension WHERE extname IN ('uuid-ossp', 'ltree', 'pgcrypto', 'pg_stat_statements');

