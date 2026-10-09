import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

const CART_STORAGE_KEY = "tyohara-cart";

// The server accepts at most 20 of one product per order
const MAX_QUANTITY = 20;

// Products from the database have a productId.
// (Older static products used id, so both are supported.)
const idOf = (item) => item.productId ?? item.id;

const loadSavedCart = () => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);

    const parsed = savedCart ? JSON.parse(savedCart) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not read saved cart:", error);

    return [];
  }
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(loadSavedCart);

  useEffect(() => {
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cartItems)
      );
    } catch (error) {
      console.error("Could not save cart:", error);
    }
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => idOf(item) === idOf(product)
      );

      if (existingItem) {
        return currentItems.map((item) =>
          idOf(item) === idOf(product)
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + quantity,
                  MAX_QUANTITY
                )
              }
            : item
        );
      }

      return [
        ...currentItems,
        {
          ...product,
          quantity: Math.min(quantity, MAX_QUANTITY)
        }
      ];
    });
  };

  const increaseQuantity = (productId) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        idOf(item) === productId
          ? {
              ...item,
              quantity: Math.min(
                item.quantity + 1,
                MAX_QUANTITY
              )
            }
          : item
      )
    );
  };

  const decreaseQuantity = (productId) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          idOf(item) === productId
            ? {
                ...item,
                quantity: item.quantity - 1
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((currentItems) =>
      currentItems.filter(
        (item) => idOf(item) !== productId
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cartItems.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
