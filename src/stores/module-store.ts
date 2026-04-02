import { create } from 'zustand'
import type { Module } from '@/types'

interface ModulesResponse {
  modules: Module[]
  isSuperAdmin: boolean
}

interface ModuleState {
  modules: Module[]
  isSuperAdmin: boolean
  isLoading: boolean
  isInitialized: boolean
  lockedMenuItems: Set<string>

  // Actions
  initialize: () => Promise<void>
  hasModuleAccess: (slug: string) => boolean
  getLockedMenuItems: () => Set<string>
  refetch: () => Promise<void>
}

function computeLockedMenuItems(modules: Module[], isSuperAdmin: boolean): Set<string> {
  if (isSuperAdmin) return new Set()

  const locked = new Set<string>()

  for (const mod of modules) {
    if (mod.isFree) continue

    const status = mod._clientModule?.status
    if (status === 'active' || status === 'trial') continue

    const menuItems = mod.linkedMenuItems
    if (menuItems?.length) {
      for (const itemId of menuItems) {
        locked.add(itemId)
      }
    }
  }

  return locked
}

export const useModuleStore = create<ModuleState>((set, get) => ({
  modules: [],
  isSuperAdmin: false,
  isLoading: false,
  isInitialized: false,
  lockedMenuItems: new Set(),

  initialize: async () => {
    if (get().isInitialized) return

    set({ isLoading: true })

    try {
      const res = await fetch('/api/admin/modules')
      if (!res.ok) throw new Error(`Failed to fetch modules: ${res.status}`)

      const data: ModulesResponse = await res.json()
      const { modules, isSuperAdmin } = data
      const lockedMenuItems = computeLockedMenuItems(modules, isSuperAdmin)

      set({
        modules,
        isSuperAdmin,
        lockedMenuItems,
        isLoading: false,
        isInitialized: true,
      })
    } catch (error) {
      console.error('Failed to initialize module store:', error)
      set({ isLoading: false })
    }
  },

  hasModuleAccess: (slug: string) => {
    const { modules, isSuperAdmin } = get()
    if (isSuperAdmin) return true

    const mod = modules.find((m) => m.slug === slug)
    if (!mod) return false
    if (mod.isFree) return true

    const status = mod._clientModule?.status
    return status === 'active' || status === 'trial'
  },

  getLockedMenuItems: () => {
    return get().lockedMenuItems
  },

  refetch: async () => {
    set({ isLoading: true, isInitialized: false })

    try {
      const res = await fetch('/api/admin/modules')
      if (!res.ok) throw new Error(`Failed to fetch modules: ${res.status}`)

      const data: ModulesResponse = await res.json()
      const { modules, isSuperAdmin } = data
      const lockedMenuItems = computeLockedMenuItems(modules, isSuperAdmin)

      set({
        modules,
        isSuperAdmin,
        lockedMenuItems,
        isLoading: false,
        isInitialized: true,
      })
    } catch (error) {
      console.error('Failed to refetch module store:', error)
      set({ isLoading: false })
    }
  },
}))
