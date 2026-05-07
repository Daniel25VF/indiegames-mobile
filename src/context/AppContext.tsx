import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Game } from '@shared/types/games'
import type { AuthUser } from '@shared/services/auth'
import { configure, setAuthToken, addToCart, removeFromCart, getCart, mapGameSummary, checkoutCart } from '@shared/services/api'
import { restoreSession, logout } from '@shared/services/auth'

configure('http://10.0.2.2:5239')

interface AppContextValue {
  cartItems: Game[]
  authUser: AuthUser | null
  addToCartLocal: (game: Game) => void
  removeFromCartLocal: (id: string) => void
  checkout: () => Promise<void>
  handleAuthSuccess: (user: AuthUser) => void
  handleSignOut: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<Game[]>([])
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)

  const loadCart = async () => {
    try {
      const cart = await getCart()
      if (cart.game.length > 0) setCartItems(cart.game.map(mapGameSummary))
    } catch { /* non-critical */ }
  }

  useEffect(() => {
    restoreSession().then(user => {
      if (user) {
        setAuthUser(user)
        setAuthToken(user.accessToken)
        loadCart()
      }
    })
  }, [])

  const addToCartLocal = async (game: Game) => {
    if (cartItems.find(g => g.id === game.id)) return
    setCartItems(prev => [...prev, game])
    if (authUser) {
      try { await addToCart(game.id) } catch { /* non-critical */ }
    }
  }

  const removeFromCartLocal = async (id: string) => {
    setCartItems(prev => prev.filter(g => g.id !== id))
    if (authUser) {
      try { await removeFromCart(id) } catch { /* non-critical */ }
    }
  }

  const checkout = async () => {
    await checkoutCart()
    setCartItems([])
  }

  const handleAuthSuccess = async (user: AuthUser) => {
    setAuthUser(user)
    setAuthToken(user.accessToken)
    await loadCart()
  }

  const handleSignOut = () => {
    logout()
    setAuthUser(null)
    setAuthToken(null)
    setCartItems([])
  }

  return (
    <AppContext.Provider value={{
      cartItems,
      authUser,
      addToCartLocal,
      removeFromCartLocal,
      checkout,
      handleAuthSuccess,
      handleSignOut,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
