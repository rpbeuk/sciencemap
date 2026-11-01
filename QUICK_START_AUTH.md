# 🔐 Quick Start: Enable Authentication

## One-Time Setup (2 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to https://app.supabase.com
2. Select your sciencemap project
3. Click **SQL Editor** on the left sidebar

### Step 2: Create the Users Table
1. Click **New Query**
2. Copy this SQL:

```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

INSERT INTO users (email, password, name, created_at, updated_at)
VALUES ('demo@example.com', 'demo123', 'Demo User', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public registration" ON users FOR INSERT WITH CHECK (true);
```

3. Click **Run** (or Ctrl+Enter)
4. See message: "Success. No rows returned"

### Step 3: Verify Setup
In the left sidebar under **Table Editor**:
- You should see a `users` table
- Click it and verify one row exists: `demo@example.com`

### Step 4: Test Login
1. Visit https://rpbeuk.github.io/sciencemap/
2. Enter:
   - Email: `demo@example.com`
   - Password: `demo123`
3. Click **Sign In**
4. See the ScienceMap map load! ✅

## That's it! 🎉

Users can now:
- **Sign In** with email/password
- **Create an Account** by signing up
- **Logout** from the top-right button

## Share With Team

To let team members access:
1. Manually add them to the users table, OR
2. They can create their own account via "Create Account" tab

Example to add a user via SQL:
```sql
INSERT INTO users (email, password, name)
VALUES ('team@example.com', 'password123', 'Team Member');
```

## Common Issues

| Issue | Solution |
|-------|----------|
| "Invalid email or password" | Check demo credentials: `demo@example.com` / `demo123` |
| Users table not found | Run the SQL setup again in SQL Editor |
| Blank page after login | Check browser DevTools (F12) for errors |
| Can't find SQL Editor | Look for **SQL Editor** in left sidebar of Supabase |

## Full Documentation

See `AUTHENTICATION.md` for detailed info on:
- User management
- Security considerations
- Integration with LeadScanner
- Production recommendations
