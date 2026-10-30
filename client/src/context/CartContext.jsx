import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi, productApi } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const initialCartState = {
  items: [],
  subtotal: 0,
  shippingFee: 0,
  discount: 0,
  total: 0,
  itemCount: 0
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(initialCartState);
  const [loading, setLoading] = useState(true);

  // Helper to calculate guest cart totals locally
  const calculateGuestCart = (items) => {
    let subtotal = 0;
    let itemCount = 0;
    const formattedItems = items.map((item) => {
      const lineTotal = Number((item.product.price * item.quantity).toFixed(2));
      subtotal += lineTotal;
      itemCount += item.quantity;
      return {
        ...item,
        lineTotal,
        unitPrice: item.product.price
      };
    });

    subtotal = Number(subtotal.toFixed(2));
    const shippingFee = subtotal >= 500 || subtotal === 0 ? 0 : 50;
    const discount = 0;
    const total = Number((subtotal + shippingFee - discount).toFixed(2));

    return {
      items: formattedItems,
      subtotal,
      shippingFee,
      discount,
      total,
      itemCount
    };
  };

  // Fetch or revalidate cart
  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        // Check if there was a guest cart to merge
        const savedGuest = localStorage.getItem('shopsphere_guest_cart');
        if (savedGuest) {
          try {
            const guestItems = JSON.parse(savedGuest);
            if (Array.isArray(guestItems) && guestItems.length > 0) {
              const mergePayload = guestItems.map((g) => ({
                productId: g.product._id,
                quantity: g.quantity
              }));
              const res = await cartApi.mergeGuestCart(mergePayload);
              localStorage.removeItem('shopsphere_guest_cart');
              if (res.data.success && res.data.cart) {
                setCart(res.data.cart);
                setLoading(false);
                return;
              }
            }
          } catch (e) {
            console.warn('Failed to parse or merge guest cart:', e);
            localStorage.removeItem('shopsphere_guest_cart');
          }
        }

        // Standard authenticated fetch
        const res = await cartApi.getCart();
        if (res.data.success && res.data.cart) {
          setCart(res.data.cart);
        }
      } else {
        // Guest mode
        const saved = localStorage.getItem('shopsphere_guest_cart');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setCart(calculateGuestCart(parsed));
          } catch (e) {
            setCart(initialCartState);
          }
        } else {
          setCart(initialCartState);
        }
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add Item
  const addToCart = async (product, quantity = 1) => {
    const qty = parseInt(quantity, 10) || 1;

    if (isAuthenticated) {
      try {
        const res = await cartApi.addItem({
          productId: product._id,
          quantity: qty
        });
        if (res.data.success && res.data.cart) {
          setCart(res.data.cart);
          return { success: true, message: 'Added to cart' };
        }
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || 'Failed to add item to cart'
        };
      }
    } else {
      // Guest local storage
      const currentItems = [...cart.items];
      const existingIdx = currentItems.findIndex((i) => i.product._id === product._id);

      if (existingIdx > -1) {
        const newQty = currentItems[existingIdx].quantity + qty;
        if (newQty > product.stock) {
          return {
            success: false,
            message: `Only ${product.stock} items available in stock.`
          };
        }
        currentItems[existingIdx].quantity = newQty;
      } else {
        if (qty > product.stock) {
          return {
            success: false,
            message: `Only ${product.stock} items available in stock.`
          };
        }
        currentItems.push({
          product,
          quantity: qty,
          unitPrice: product.price,
          lineTotal: Number((product.price * qty).toFixed(2))
        });
      }

      const updated = calculateGuestCart(currentItems);
      setCart(updated);
      localStorage.setItem('shopsphere_guest_cart', JSON.stringify(currentItems));
      return { success: true, message: 'Added to cart' };
    }
  };

  // Update Quantity
  const updateQuantity = async (productId, quantity) => {
    const qty = parseInt(quantity, 10);

    if (isAuthenticated) {
      try {
        const res = await cartApi.updateQuantity(productId, qty);
        if (res.data.success && res.data.cart) {
          setCart(res.data.cart);
          return { success: true };
        }
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || 'Failed to update quantity'
        };
      }
    } else {
      let currentItems = [...cart.items];
      if (qty <= 0) {
        currentItems = currentItems.filter((i) => i.product._id !== productId);
      } else {
        const idx = currentItems.findIndex((i) => i.product._id === productId);
        if (idx > -1) {
          if (qty > currentItems[idx].product.stock) {
            return {
              success: false,
              message: `Only ${currentItems[idx].product.stock} units available in stock.`
            };
          }
          currentItems[idx].quantity = qty;
        }
      }
      const updated = calculateGuestCart(currentItems);
      setCart(updated);
      localStorage.setItem('shopsphere_guest_cart', JSON.stringify(currentItems));
      return { success: true };
    }
  };

  // Remove Item
  const removeFromCart = async (productId) => {
    if (isAuthenticated) {
      try {
        const res = await cartApi.removeItem(productId);
        if (res.data.success && res.data.cart) {
          setCart(res.data.cart);
          return { success: true };
        }
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || 'Failed to remove item'
        };
      }
    } else {
      const currentItems = cart.items.filter((i) => i.product._id !== productId);
      const updated = calculateGuestCart(currentItems);
      setCart(updated);
      localStorage.setItem('shopsphere_guest_cart', JSON.stringify(currentItems));
      return { success: true };
    }
  };

  // Clear Cart
  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await cartApi.clearCart();
      } catch (err) {
        console.warn('Error clearing cart on server:', err);
      }
    }
    setCart(initialCartState);
    localStorage.removeItem('shopsphere_guest_cart');
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: fetchCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
