import { create } from 'zustand'
import { supabase } from '../config/supabase'

/**
 * Auth Store (Zustand)
 * Manages authentication state: user, session, profile, loading
 */
export const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: true,
  error: null,

  /**
   * Initialize auth: listen for session changes
   */
  initialize: () => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session, user: session?.user ?? null, loading: false })
      if (session?.user) {
        get().fetchProfile(session.user.id)
      }
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        set({ session, user: session?.user ?? null, loading: false })
        if (session?.user) {
          get().fetchProfile(session.user.id)
        } else {
          set({ profile: null })
        }
      }
    )

    return () => subscription.unsubscribe()
  },

  /**
   * Fetch user profile from profiles table
   */
  fetchProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.warn('[Auth] Failed to fetch profile:', error.message)
      return
    }

    set({ profile: data })
  },

  /**
   * Register a new user
   */
  register: async (email, password, displayName) => {
    set({ loading: true, error: null })
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    })

    if (error) {
      set({ loading: false, error: error.message })
      return { success: false, error: error.message }
    }

    set({ loading: false })
    return { success: true, data }
  },

  /**
   * Login with email and password
   */
  login: async (email, password) => {
    set({ loading: true, error: null })
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      set({ loading: false, error: error.message })
      return { success: false, error: error.message }
    }

    set({ loading: false })
    return { success: true, data }
  },

  /**
   * Logout
   */
  logout: async () => {
    set({ loading: true })
    await supabase.auth.signOut()
    set({ user: null, session: null, profile: null, loading: false, error: null })
  },

  /**
   * Update profile fields
   */
  updateProfile: async (updates) => {
    const userId = get().user?.id
    if (!userId) return { success: false, error: 'Tidak terautentikasi' }

    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Refresh profile
    await get().fetchProfile(userId)
    return { success: true }
  },

  /**
   * Update password
   */
  updatePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  },

  /**
   * Upload avatar image
   */
  uploadAvatar: async (file) => {
    const userId = get().user?.id
    if (!userId) return { success: false, error: 'Tidak terautentikasi' }

    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/avatar.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('workout-photos')
      .upload(fileName, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      return { success: false, error: uploadError.message }
    }

    const { data: urlData } = supabase.storage
      .from('workout-photos')
      .getPublicUrl(fileName)

    // Update profile with new avatar URL
    const result = await get().updateProfile({ avatar_url: urlData.publicUrl })
    return result
  },

  clearError: () => set({ error: null }),
}))
