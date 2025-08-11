import React, { createContext, useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { http } from '../https'; // ✅ your axios instance that includes token

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const isInitialLoad = useRef(true);

  const fetchCartFromBackend = async () => {
    try {
      const res = await http.get('/cart'); // ✅ no /api, token handled in http.js
      return res.data.items || [];
    } catch (error) {
      console.error("Failed to fetch cart from backend", error);
      return [];
    }
  };

  const saveCartToBackend = async (items) => {
    try {
      await http.post('/cart', { items }); // ✅ no /api, token handled in http.js
    } catch (error) {
      console.error("Failed to save cart to backend", error);
    }
  };

  // Load cart on mount
  useEffect(() => {
    fetchCartFromBackend().then(fetchedItems => {
      setCart(fetchedItems);
      isInitialLoad.current = false;
    });
  }, []);

  // Save cart when cart changes, but not on first load
  useEffect(() => {
    if (!isInitialLoad.current) {
      saveCartToBackend(cart);
    }
  }, [cart]);

  // Cart manipulation functions
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.productId);
      if (existing) {
        return prev.map(item =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      toast.success("Product added to cart");
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const increaseQty = (productId) => {
    setCart(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQty = (productId) => {
    setCart(prev =>
      prev.map(item =>
        item.productId === productId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      increaseQty,
      decreaseQty,
      removeFromCart,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
