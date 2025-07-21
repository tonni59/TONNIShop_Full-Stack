import React, { createContext, useState, useEffect } from "react";

// Create context
export const ShopContext = createContext(null);

// Function to initialize an empty cart with product IDs 1–300
const getDefaultCart = () => {
  let cart = {};
  for (let index = 1; index <= 300; index++) {
    cart[index] = 0;
  }
  return cart;
};

const ShopContextProvider = (props) => {
  const [all_product, setAll_Product] = useState([]);
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : getDefaultCart();
  });

  // Fetch all products from backend
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const response = await fetch("http://localhost:4000/allproducts");
        const data = await response.json();
        setAll_Product(data);
        console.log("✅ Products loaded from backend");
      } catch (error) {
        console.error("❌ Failed to fetch products:", error);
      }
    };

    fetchAllProducts();
  }, []);

  // Save cart state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // Add item to cart
  const addToCart = (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));

    // Sync with backend if logged in
    if (localStorage.getItem("auth-token")) {
      fetch("http://localhost:4000/addtocart", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "auth-token": localStorage.getItem("auth-token"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId }),
      })
        .then((res) => res.text())
        .then((data) => console.log("🛒 Backend cart sync:", data))
        .catch((err) => console.error("❌ Cart sync error:", err));
    }
  };

  // Remove item from cart (decrease quantity)
  const removeFromCart = (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: Math.max((prev[itemId] || 0) - 1, 0),
    }));
  };

  // Fully remove item from cart (quantity = 0)
  const removeItemCompletely = (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: 0,
    }));
  };

  // Get total cart amount (price × quantity)
  const getTotalCartAmount = () => {
    let total = 0;
    for (const itemId in cartItems) {
      const quantity = cartItems[itemId];
      if (quantity > 0) {
        const product = all_product.find((p) => p.id === Number(itemId));
        if (product) {
          total += product.new_price * quantity;
        }
      }
    }
    return total;
  };

  // Get total number of items in cart (only where quantity > 0)
  const getTotalCartItems = () => {
    return Object.values(cartItems).reduce(
      (sum, qty) => (qty > 0 ? sum + qty : sum),
      0
    );
  };

  const contextValue = {
    all_product,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    removeItemCompletely,
    getTotalCartAmount,
    getTotalCartItems,
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
