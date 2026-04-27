'use client'
import React, { createContext, useContext, useState } from 'react'

export type TicketType = 'Student' | 'Resident' | 'Nurse'

export interface CartItem {
  id: number
  name: string
  price: string
  priceNum: number
  type: TicketType
  typeColor: string
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
})

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])

  const addToCart = (item: CartItem) => setCart(prev => [...prev, item])
  const removeFromCart = (id: number) => setCart(prev => prev.filter(i => i.id !== id))
  const clearCart = () => setCart([])

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)