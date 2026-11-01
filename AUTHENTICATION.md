# Authentication Setup for ScienceMap Benelux

## Overview
The ScienceMap Benelux app now includes a login screen that shares authentication with the LeadScanner app, using the same Supabase database instance.

## Login Credentials (Demo)
- **Email**: `demo@example.com`
- **Password**: `demo123`

## Setup Instructions

### 1. Initialize the Users Table in Supabase

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select the sciencemap project
3. Open the **SQL Editor**
4. Copy and paste the contents of `setup-auth-table.sql`
5. Click **Run** to execute the SQL

This will create:
- `users` table with id, email, password, name, and timestamps
- An index on the email column for faster lookups
- A demo user with the credentials above
- Row Level Security (RLS) policies

### 2. Verify the Setup

After running the SQL script, you should see:
- The `users` table in the Tables section
- A row for `demo@example.com` in the table

### 3. Test the Login

1. Visit: https://rpbeuk.github.io/sciencemap/
2. Enter demo credentials:
   - Email: `demo@example.com`
   - Password: `demo123`
3. Click "Sign In"
4. After login, you should see the ScienceMap Benelux map

## Features

- **Sign In**: Existing users can log in with email and password
- **Create Account**: New users can self-register
- **Logout**: Users can logout from the top-right corner
- **Shared Database**: Uses the same Supabase instance as LeadScanner

## User Management

### Create a New User (Manual)

In the Supabase SQL Editor:

```sql
INSERT INTO users (email, password, name, created_at, updated_at)
VALUES (
  'user@example.com',
  'password123',
  'User Name',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;
```

### List All Users

```sql
SELECT id, email, name, created_at FROM users ORDER BY created_at DESC;
```

## Security Notes ⚠️

**IMPORTANT**: The current implementation stores passwords in plain text for MVP simplicity. For production use:

1. **Hash passwords** using bcrypt or Argon2
2. **Enable Supabase Auth** instead of custom implementation
3. **Use HTTPS only** (already enabled on GitHub Pages)
4. **Add CORS policies** to restrict API access
5. **Implement rate limiting** for login attempts
6. **Add password reset functionality**

## Integration with LeadScanner

Both apps use the same Supabase project and can share:
- User authentication table
- Campaign data
- Lead information

To share data across apps, add foreign keys or additional tables as needed.

## Troubleshooting

### "Invalid email or password" on login
- Verify the user exists in the database
- Check that the password matches exactly (case-sensitive)
- Try the demo credentials first

### Users table not found
- Ensure you ran the SQL setup script
- Check that the Supabase project is correctly linked in `src/utils/supabaseClient.ts`

### Users can't see the map after login
- Check browser console for errors
- Ensure the data is loading correctly in the DataContext
- Verify network connectivity to Supabase

## Files Modified

- `src/components/LoginScreen.tsx` - Login/registration UI component
- `src/components/LoginScreen.css` - Styling for login screen
- `src/utils/authClient.ts` - Authentication logic
- `src/App.tsx` - App entry point with auth check
- `setup-auth-table.sql` - Database initialization script
