import { create } from 'zustand'

/**
 * Theme Store
 * Manages dark/light mode with system preference detection
 */
function getSystemPreference() {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem('aerolift-theme')
  if (stored === 'dark' || stored === 'light') return stored
  return getSystemPreference()
}

function applyTheme(theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
    root.classList.remove('light')
  } else {
    root.classList.add('light')
    root.classList.remove('dark')
  }
}

export const useThemeStore = create((set) => {
  const initial = getInitialTheme()
  // Apply on store creation
  if (typeof window !== 'undefined') {
    applyTheme(initial)
  }

  return {
    theme: initial,
    isDark: initial === 'dark',

    toggleTheme: () =>
      set((state) => {
        const next = state.theme === 'dark' ? 'light' : 'dark'
        localStorage.setItem('aerolift-theme', next)
        applyTheme(next)
        return { theme: next, isDark: next === 'dark' }
      }),

    setTheme: (theme) =>
      set(() => {
        localStorage.setItem('aerolift-theme', theme)
        applyTheme(theme)
        return { theme, isDark: theme === 'dark' }
      }),
  }
})
