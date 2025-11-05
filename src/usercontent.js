// usercontent.js
import { create } from 'zustand';

const useUserStore = create((set, get) => ({
  user: null,
  loading: false,        // start bez spinnera; fetch ustawi loading=true
  error: null,
  hydrated: false,       // <-- NOWE: wiemy, że pierwsza próba pobrania sesji już była

  setUser: (u) => set({ user: u }),
  clearUser: () => set({ user: null }),

  // Pobiera profil z backendu (cookie sesji musi być wysyłane)
  fetchMe: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('http://localhost:5007/api/me', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user || null });
      } else {
        set({ user: null });
      }
    } catch (e) {
      set({ error: e?.message || 'Fetch error', user: null });
    } finally {
      set({ loading: false });
    }
  },

  // Jednorazowa hydratacja sesji na starcie aplikacji
  init: async () => {
    if (get().hydrated) return;
    try {
      await get().fetchMe();
    } finally {
      set({ hydrated: true });
    }
  },
}));

// API imperatywne (poza Reactem)
export const getUser    = () => useUserStore.getState().user;
export const setUser    = (u) => useUserStore.setState({ user: u });
export const clearUser  = () => useUserStore.setState({ user: null });
export const fetchMe    = () => useUserStore.getState().fetchMe();
export const initAuth   = () => useUserStore.getState().init();   // <-- NOWE: do wywołania w App

export default useUserStore;
