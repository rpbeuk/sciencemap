/**
 * SQL Script to create users table in Supabase
 * Run this in the Supabase SQL Editor to set up authentication
 * 
 * IMPORTANT: In production, passwords should be hashed with bcrypt
 * This MVP uses plain passwords for simplicity - NOT FOR PRODUCTION
 */

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Insert demo user (password: demo123)
-- IMPORTANT: Passwords should be hashed in production!
INSERT INTO users (email, password, name, created_at, updated_at)
VALUES (
  'demo@example.com',
  'demo123',
  'Demo User',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Grant public access (adjust based on your RLS policies)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Create policy to allow public registration (insert)
CREATE POLICY "Allow public registration" ON users
  FOR INSERT WITH CHECK (true);

-- Create policy for updates
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);
