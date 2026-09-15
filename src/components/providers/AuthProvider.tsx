'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase';
import { UserProfile } from '@/types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = useMemo(() => getSupabaseClient(), []);

  const fetchProfile = async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (!error && data) {
        setProfile(data as UserProfile);
      } else {
        // Fallback profile object from user metadata
        setProfile({
          id: currentUser.id,
          email: currentUser.email || '',
          name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'User',
          avatar_url: currentUser.user_metadata?.avatar_url,
          role: 'user',
        });
      }
    } catch {
      setProfile({
        id: currentUser.id,
        email: currentUser.email || '',
        name: currentUser.email?.split('@')[0] || 'User',
        role: 'user',
      });
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (!mounted) return;

        setSession(initialSession);
        setUser(initialSession?.user || null);

        if (initialSession?.user) {
          await fetchProfile(initialSession.user);
        }
      } catch (err) {
        console.warn('Auth initialization notice:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        setUser(newSession?.user || null);

        if (newSession?.user) {
          await fetchProfile(newSession.user);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signInWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);
    return { error: error as Error | null };
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (!error && data.user) {
      try {
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email,
          name: name || email.split('@')[0],
          role: 'user',
        });
      } catch {
        // Table may be populated by trigger
      }
    }

    setIsLoading(false);
    return { error: error as Error | null };
  };

  const signInWithOAuth = async (provider: 'google' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    setIsLoading(false);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        signInWithEmail,
        signUpWithEmail,
        signInWithOAuth,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
