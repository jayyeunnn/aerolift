import { create } from 'zustand'
import { getPendingCount, syncPendingOperations } from '../utils/offlineQueue'
import { supabase } from '../config/supabase'

/**
 * Offline Store (Zustand)
 * Tracks online status, pending operations count, and sync state
 */
export const useOfflineStore = create((set, get) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  pendingCount: 0,
  isSyncing: false,
  lastSyncResult: null,

  /**
   * Initialize online/offline listeners
   */
  initialize: () => {
    const handleOnline = () => {
      set({ isOnline: true })
      // Auto-sync when coming back online
      get().syncNow()
    }

    const handleOffline = () => {
      set({ isOnline: false })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check pending count on init
    get().refreshPendingCount()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  },

  /**
   * Refresh the pending operations count
   */
  refreshPendingCount: async () => {
    const count = await getPendingCount()
    set({ pendingCount: count })
  },

  /**
   * Manually trigger sync
   */
  syncNow: async () => {
    if (get().isSyncing || !get().isOnline) return

    const count = await getPendingCount()
    if (count === 0) return

    set({ isSyncing: true })

    try {
      const result = await syncPendingOperations(supabase)
      set({ lastSyncResult: result, isSyncing: false })
      await get().refreshPendingCount()
    } catch (err) {
      console.error('[OfflineSync] Sync failed:', err)
      set({ isSyncing: false })
    }
  },
}))
