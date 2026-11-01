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

    localStorage.setItem('sciencemap_user', JSON.stringify(user));
    localStorage.setItem('sciencemap_session', new Date().toISOString());

    return { success: true, user };
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, error: error.message || 'An error occurred during login' };
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData?.session?.user) {
      return null;
    }

    const user: User = {
      id: sessionData.session.user.id,
      email: sessionData.session.user.email || '',
      name: sessionData.session.user.user_metadata?.name,
      createdAt: sessionData.session.user.created_at,
    };

    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await supabase.auth.signOut();
    localStorage.removeItem('sciencemap_user');
    localStorage.removeItem('sciencemap_session');
  } catch (error) {
    console.error('Logout error:', error);
  }
}

export async function isUserLoggedIn(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}
