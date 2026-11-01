import { supabase } from './supabaseClient';

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt?: string;
}

export async function loginUser(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // Use Supabase native authentication (shared with LeadScanner)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return { success: false, error: authError.message || 'Invalid email or password' };
    }

    if (!authData?.user) {
      return { success: false, error: 'Login failed - no user data returned' };
    }

    const user: User = {
      id: authData.user.id,
      email: authData.user.email || '',
      name: authData.user.user_metadata?.name,
      createdAt: authData.user.created_at,
    };

    // Supabase stores session automatically, but also cache in localStorage for quick access
    localStorage.setItem('sciencemap_user', JSON.stringify(user));

    return { success: true, user };
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, error: error.message || 'An error occurred during login' };
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    // First check Supabase session
    const { data: sessionData } = await supabase.auth.getSession();

    if (sessionData?.session?.user) {
      const user: User = {
        id: sessionData.session.user.id,
        email: sessionData.session.user.email || '',
        name: sessionData.session.user.user_metadata?.name,
        createdAt: sessionData.session.user.created_at,
      };
      return user;
    }

    // Fallback to cached localStorage
    const cached = localStorage.getItem('sciencemap_user');
    if (cached) {
      return JSON.parse(cached);
    }

    return null;
  } catch (error) {
    console.error('Get current user error:', error);
    // Fallback to localStorage cache on error
    try {
      const cached = localStorage.getItem('sciencemap_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('sciencemap_user');
  }
}

export async function isUserLoggedIn(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}
