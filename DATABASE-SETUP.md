# Database Setup Instructions

This document contains the SQL commands needed to set up the Synapse database with all security and concurrency improvements.

## Step 1: Run the Main Schema

Execute the `supabase-schema.sql` file first to create all tables, indexes, and basic constraints.

```bash
# In Supabase SQL Editor or via CLI
psql -f supabase-schema.sql
```

## Step 2: Run the Security Functions

Execute the `supabase-functions.sql` file to add atomic functions and triggers.

```bash
# In Supabase SQL Editor or via CLI  
psql -f supabase-functions.sql
```

## Key Security Features Added

### 1. Race Condition Protection
- ✅ Atomic match creation function
- ✅ Prevents duplicate matches for same request
- ✅ Handles concurrent match attempts gracefully

### 2. Business Rule Enforcement
- ✅ Prevents self-matching via triggers
- ✅ Validates match scores are reasonable (0-1000)
- ✅ Ensures feedback ratings are valid (1-5)
- ✅ Unique constraint on active matches per request-user pair

### 3. Data Integrity
- ✅ Automatic timestamp updates
- ✅ Cascading deletes for data consistency
- ✅ Proper foreign key relationships

### 4. Performance Optimizations
- ✅ Indexes on frequently queried columns
- ✅ GIN indexes for array fields (tags)
- ✅ Composite indexes for complex queries

## Error Handling

The database functions will raise specific exceptions that the application can handle:

- `'Users cannot be matched with themselves'` - Self-matching attempt
- `'Request already has active matches'` - Race condition detected
- `'Active match already exists for this request-user pair'` - Duplicate match attempt
- `'Match not found'` - Invalid match ID
- `'Unauthorized'` - User doesn't own the match
- `'Match already processed'` - Match status already changed

## Testing the Setup

After running both SQL files, test the setup with:

```sql
-- Test self-matching prevention
SELECT public.create_match_atomic(
    'request-uuid-here',
    'same-user-uuid-as-requester', 
    50,
    NOW() + INTERVAL '7 days'
);
-- Should raise: 'Users cannot be matched with themselves'

-- Test duplicate match prevention  
SELECT public.create_match_atomic(
    'request-uuid-here',
    'different-user-uuid',
    50, 
    NOW() + INTERVAL '7 days'
);
-- First call should succeed, second call should raise: 'Request already has active matches'
```

## Production Considerations

1. **Backup Strategy**: Ensure regular backups before applying schema changes
2. **Migration Testing**: Test all functions in staging environment first
3. **Monitoring**: Set up alerts for constraint violations and function errors
4. **Performance**: Monitor query performance after adding new indexes

## Rollback Plan

If issues occur, you can rollback by:

1. Dropping the new functions:
```sql
DROP FUNCTION IF EXISTS public.create_match_atomic;
DROP FUNCTION IF EXISTS public.update_match_status_atomic;
DROP FUNCTION IF EXISTS public.validate_match_creation;
```

2. Removing the triggers:
```sql
DROP TRIGGER IF EXISTS validate_match_creation_trigger ON public.matches;
```

3. Removing the unique index:
```sql
DROP INDEX IF EXISTS unique_active_matches;
```

The core application will continue to work with basic race condition checks in the application layer.