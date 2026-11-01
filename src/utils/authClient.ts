import { supabase } from './supabaseClient';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export async function loginUser(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // Query the users table to authenticate
    const { data: users, error: queryError } = await supabase
      .from('users')
      .select('id, email, name, password, created_at')
      .eq('email', email)
      .single();

    if (queryError || !users) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Simple password comparison (in production, use bcrypt or similar)
    // For now, we'll store plain passwords (NOT SECURE - for MVP only)
    if (users.password !== password) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Store user session in localStorage
    const user: User = {
      id: users.id,
      email: users.email,
      name: users.name,
      createdAt: users.created_at,
    };

    localStorage.setItem('sciencemap_user', JSON.stringify(user));
    localStorage.setItem('sciencemap_session', new Date().toISOString());

    return { success: true, user };
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, error: error.message || 'An error occurred during login' };
  }
}

export async function registerUser(email: string, password: string, name: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return { success: false, error: 'Email already registered' };
    }

    // Create new user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          email,
          password, // NOT SECURE - should be hashed
          name,
          created_at: new Date().toISOString(),
        },
      ])
      .select('id, email, name, created_at')
      .single();

    if (insertError || !newUser) {
      return { success: false, error: insertError?.message || 'Failed to create user' };
    }

    // Auto-login after registration
    const user: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      createdAt: newUser.created_at,
    };

    localStorage.setItem('sciencemap_user', JSON.stringify(user));
    localStorage.setItem('sciencemap_session', new Date().toISOString());

    return { success: true, user };
  } catch (error: any) {
    console.error('Registration error:', error);
    return { success: false, error: error.message || 'An error occurred during registration' };
  }
}

export function getCurrentUser(): User | null {
  try {
    const userStr = localStorage.getItem('sciencemap_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

export function logoutUser(): void {
  localStorage.removeItem('sciencemap_user');
  localStorage.removeItem('sciencemap_session');
}

export function isUserLoggedIn(): boolean {
  return getCurrentUser() !== null;
}
