/**
 * Offline Queue Utility
 *
 * Uses localforage (IndexedDB) to queue Supabase mutations
 * when the device is offline, and replays them when connectivity returns.
 */
import localforage from 'localforage'

// Initialize a dedicated localforage instance
const offlineDB = localforage.createInstance({
  name: 'aerolift',
  storeName: 'offline_queue',
  description: 'Pending offline operations for AeroLift',
})

/**
 * Add a pending operation to the offline queue
 * @param {Object} operation
 * @param {string} operation.table - Supabase table name
 * @param {string} operation.type - 'insert' | 'update' | 'delete'
 * @param {Object} operation.data - Row data to insert/update
 * @param {string} [operation.id] - Row ID for update/delete
 * @returns {Promise<string>} Queue entry ID
 */
export async function enqueueOperation(operation) {
  const id = `op_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  const entry = {
    id,
    ...operation,
    createdAt: new Date().toISOString(),
    retries: 0,
  }
  await offlineDB.setItem(id, entry)
  return id
}

/**
 * Get all pending operations, ordered by creation time
 * @returns {Promise<Array>}
 */
export async function getPendingOperations() {
  const operations = []
  await offlineDB.iterate((value) => {
    operations.push(value)
  })
  return operations.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
}

/**
 * Remove a completed operation from the queue
 * @param {string} id - Queue entry ID
 */
export async function removeOperation(id) {
  await offlineDB.removeItem(id)
}

/**
 * Increment retry count for a failed operation
 * @param {string} id - Queue entry ID
 */
export async function incrementRetry(id) {
  const entry = await offlineDB.getItem(id)
  if (entry) {
    entry.retries += 1
    await offlineDB.setItem(id, entry)
  }
}

/**
 * Get the number of pending operations
 * @returns {Promise<number>}
 */
export async function getPendingCount() {
  return await offlineDB.length()
}

/**
 * Clear all pending operations (use with caution)
 */
export async function clearQueue() {
  await offlineDB.clear()
}

/**
 * Replay all pending operations against Supabase
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @returns {Promise<{synced: number, failed: number}>}
 */
export async function syncPendingOperations(supabase) {
  const operations = await getPendingOperations()
  let synced = 0
  let failed = 0
  const maxRetries = 3

  for (const op of operations) {
    if (op.retries >= maxRetries) {
      failed += 1
      continue
    }

    try {
      let error = null

      switch (op.type) {
        case 'insert': {
          const result = await supabase.from(op.table).insert(op.data)
          error = result.error
          break
        }
        case 'update': {
          const result = await supabase.from(op.table).update(op.data).eq('id', op.id)
          error = result.error
          break
        }
        case 'delete': {
          const result = await supabase.from(op.table).delete().eq('id', op.id)
          error = result.error
          break
        }
        default:
          error = { message: `Unknown operation type: ${op.type}` }
      }

      if (error) {
        throw new Error(error.message)
      }

      await removeOperation(op.id)
      synced += 1
    } catch (err) {
      console.warn(`[OfflineSync] Failed to sync operation ${op.id}:`, err.message)
      await incrementRetry(op.id)
      failed += 1
    }
  }

  return { synced, failed }
}
