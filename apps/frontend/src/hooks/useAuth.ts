import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    if (!supabase) {
      console.error('🔴🔴🔴 AUTHENTICATION ATTEMPT FAILED - SUPABASE NOT CONFIGURED 🔴🔴🔴')
      console.error('Check the browser console for configuration instructions')
      
      // Check if we have specific config errors
      const configError = (window as unknown as { __SUPABASE_CONFIG_ERROR__?: boolean }).__SUPABASE_CONFIG_ERROR__;
      const configErrors = (window as unknown as { __SUPABASE_CONFIG_ERRORS__?: string[] }).__SUPABASE_CONFIG_ERRORS__ || [];
      
      if (configError && configErrors.length > 0) {
        const errorMessage = `Supabase configuration error: ${configErrors.join(', ')}. Please contact the administrator to configure the authentication system.`;
        return { data: null, error: new Error(errorMessage) }
      }
      
      return { data: null, error: new Error('Authentication system not configured. Please contact the administrator.') }
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'https://wildedit.luminarimud.com/auth/callback'
      }
    })
    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      console.error('🔴🔴🔴 AUTHENTICATION ATTEMPT FAILED - SUPABASE NOT CONFIGURED 🔴🔴🔴')
      console.error('Check the browser console for configuration instructions')
      
      // Check if we have specific config errors
      const configError = (window as unknown as { __SUPABASE_CONFIG_ERROR__?: boolean }).__SUPABASE_CONFIG_ERROR__;
      const configErrors = (window as unknown as { __SUPABASE_CONFIG_ERRORS__?: string[] }).__SUPABASE_CONFIG_ERRORS__ || [];
      
      if (configError && configErrors.length > 0) {
        const errorMessage = `Supabase configuration error: ${configErrors.join(', ')}. Please contact the administrator to configure the authentication system.`;
        return { data: null, error: new Error(errorMessage) }
      }
      
      return { data: null, error: new Error('Authentication system not configured. Please contact the administrator.') }
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    if (!supabase) {
      return { error: new Error('Supabase not configured') }
    }
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email: string) => {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not configured') }
    }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://wildedit.luminarimud.com/reset-password',
    })
    return { data, error }
  }

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  }
}