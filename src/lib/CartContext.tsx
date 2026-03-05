'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type CartItemKind = 'package' | 'service' | 'ebook';

export type CartLine = {
  id: string;
  name: string;
  description: string;
  kind: CartItemKind;
  price: number;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  addToCart: (item: Omit<CartLine, 'quantity'>, quantity?: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  subtotal: number;
  count: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = 'ds_cart_v1';

function safeParseCart(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const cleaned: CartLine[] = [];
    for (const entry of parsed) {
      if (!entry || typeof entry !== 'object') continue;
      const id = typeof entry.id === 'string' ? entry.id : '';
      const name = typeof entry.name === 'string' ? entry.name : '';
      const description = typeof entry.description === 'string' ? entry.description : '';
      const kind = entry.kind === 'package' || entry.kind === 'service' || entry.kind === 'ebook' ? entry.kind : null;
      const price = typeof entry.price === 'number' && Number.isFinite(entry.price) ? entry.price : NaN;
      const quantity = typeof entry.quantity === 'number' && Number.isFinite(entry.quantity) ? entry.quantity : NaN;
      if (!id || !name || !kind) continue;
      if (!Number.isFinite(price) || price < 0) continue;
      if (!Number.isFinite(quantity) || quantity <= 0) continue;
      cleaned.push({ id, name, description, kind, price, quantity: Math.floor(quantity) });
    }
    return cleaned;
  } catch {
    return [];
  }
}

function readCartFromStorage(): CartLine[] {
  if (typeof window === 'undefined') return [];
  return safeParseCart(window.localStorage.getItem(STORAGE_KEY));
}

function writeCartToStorage(lines: CartLine[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {}
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    setLines(readCartFromStorage());
  }, []);

  useEffect(() => {
    writeCartToStorage(lines);
  }, [lines]);

  const addToCart = useCallback((item: Omit<CartLine, 'quantity'>, quantity: number = 1) => {
    const qty = Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1;
    setLines((prev) => {
      const idx = prev.findIndex((l) => l.id === item.id);
      if (idx === -1) {
        return [...prev, { ...item, quantity: qty }];
      }
      const next = prev.slice();
      next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
      return next;
    });
  }, []);

  const setQuantity = useCallback((id: string, quantity: number) => {
    const qty = Number.isFinite(quantity) ? Math.floor(quantity) : 0;
    setLines((prev) => {
      if (qty <= 0) return prev.filter((l) => l.id !== id);
      return prev.map((l) => (l.id === id ? { ...l, quantity: qty } : l));
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setLines([]);
  }, []);

  const subtotal = useMemo(() => lines.reduce((acc, l) => acc + l.price * l.quantity, 0), [lines]);
  const count = useMemo(() => lines.reduce((acc, l) => acc + l.quantity, 0), [lines]);

  const value: CartContextValue = useMemo(
    () => ({
      lines,
      addToCart,
      setQuantity,
      removeFromCart,
      clearCart,
      subtotal,
      count,
    }),
    [addToCart, clearCart, count, lines, removeFromCart, setQuantity, subtotal],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}

