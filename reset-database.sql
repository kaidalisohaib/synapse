-- Reset Database Script for Synapse
-- This will delete ALL data but preserve table structure and policies

-- Disable triggers temporarily to avoid conflicts
SET session_replication_role = replica;

-- Delete all data from tables (order matters due to foreign keys)
DELETE FROM matches;
DELETE FROM requests;
DELETE FROM profiles;

-- Reset sequences (if any)
-- Note: UUIDs don't use sequences, so this may not be needed

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Verify tables are empty
SELECT 'profiles' as table_name, COUNT(*) as row_count FROM profiles
UNION ALL
SELECT 'requests' as table_name, COUNT(*) as row_count FROM requests  
UNION ALL
SELECT 'matches' as table_name, COUNT(*) as row_count FROM matches;

-- Show the result
SELECT 'Database reset complete. All tables are now empty.' as status;
