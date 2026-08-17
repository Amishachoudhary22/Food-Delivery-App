'use client';

import { SessionProvider, useSession } from "next-auth/react";
import { createContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export const CartContext = createContext({});

export function cartProductPrice(cartProduct) {
  let price = Number(cartProduct.basePrice || 0);

  if (cartProduct.size) {
    price += Number(cartProduct.size.price || 0);
  }

  if (cartProduct.extras?.length > 0) {
    for (const extra of cartProduct.extras) {
      price += Number(extra.price || 0);
    }
  }

  return price;
}

function CartProvider({ children }) {
  const { data: session, status } = useSession();

  const [cartProducts, setCartProducts] = useState([]);
  const [cartLoaded, setCartLoaded] = useState(false);

  const currentEmail = session?.user?.email
    ?.toLowerCase()
    .trim();

  /*
   * Load the cart whenever the logged-in user changes.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadCart() {
      /*
       * While NextAuth is determining the user,
       * don't touch the cart.
       */
      if (status === "loading") {
        return;
      }

      /*
       * Logged out:
       * clear the in-memory cart.
       */
      if (status === "unauthenticated" || !currentEmail) {
        setCartProducts([]);
        setCartLoaded(false);
        return;
      }

      /*
       * Important:
       * Clear the previous user's cart immediately.
       * This prevents User A's cart from briefly appearing
       * for User B while the API request is running.
       */
      setCartProducts([]);
      setCartLoaded(false);

      try {
        const response = await fetch("/api/cart", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load cart.");
        }

        const data = await response.json();

        if (!cancelled) {
          setCartProducts(
            Array.isArray(data?.cart)
              ? data.cart
              : []
          );

          setCartLoaded(true);
        }
      } catch (error) {
        console.error("LOAD CART ERROR:", error);

        if (!cancelled) {
          setCartProducts([]);
          setCartLoaded(true);
        }
      }
    }

    loadCart();

    return () => {
      cancelled = true;
    };
  }, [status, currentEmail]);

  /*
   * Save cart to MongoDB whenever it changes.
   *
   * We only save after the initial cart has been loaded.
   * This prevents an empty initial state from accidentally
   * overwriting the user's saved cart.
   */
  useEffect(() => {
    if (
      status !== "authenticated" ||
      !currentEmail ||
      !cartLoaded
    ) {
      return;
    }

    async function saveCart() {
      try {
        const response = await fetch("/api/cart", {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            cart: cartProducts,
          }),
        });

        if (!response.ok) {
          throw new Error("Unable to save cart.");
        }
      } catch (error) {
        console.error("SAVE CART ERROR:", error);
      }
    }

    saveCart();
  }, [
    cartProducts,
    cartLoaded,
    status,
    currentEmail,
  ]);

  function clearCart() {
    setCartProducts([]);

    /*
     * The useEffect above will save [] to MongoDB.
     */
  }

  function removeCartProduct(indexToRemove) {
    const removedProduct =
      cartProducts[indexToRemove];

    setCartProducts((prevProducts) => {
      return prevProducts
        .map((product, index) =>
          index === indexToRemove
            ? {
                ...product,
                quantity:
                  Number(product.quantity || 1) - 1,
              }
            : product
        )
        .filter(
          (product) =>
            Number(product.quantity || 0) > 0
        );
    });

    if (removedProduct?.quantity <= 1) {
      toast.success("Product removed from cart");
    } else {
      toast.success("Product quantity updated");
    }
  }

  function addToCart(product, size, extras) {
    setCartProducts((prevProducts) => {
      const existingProductIndex =
        prevProducts.findIndex(
          (p) =>
            p.name === product.name &&
            p.size?.name === size?.name &&
            p.extras?.toString() ===
              extras?.toString()
        );

      if (existingProductIndex !== -1) {
        return prevProducts.map(
          (p, index) =>
            index === existingProductIndex
              ? {
                  ...p,
                  quantity:
                    Number(p.quantity || 1) + 1,
                }
              : p
        );
      }

      return [
        ...prevProducts,
        {
          ...product,
          size,
          extras,
          quantity: 1,
        },
      ];
    });
  }

  function updateCartProductQuantity(
    index,
    newQuantity
  ) {
    if (newQuantity < 1) {
      return;
    }

    setCartProducts((prevProducts) => {
      const updatedProducts = [
        ...prevProducts,
      ];

      if (!updatedProducts[index]) {
        return prevProducts;
      }

      updatedProducts[index] = {
        ...updatedProducts[index],
        quantity: newQuantity,
      };

      return updatedProducts;
    });
  }

  return (
    <CartContext.Provider
      value={{
        cartProducts,
        setCartProducts,
        addToCart,
        removeCartProduct,
        clearCart,
        updateCartProductQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function AppProvider({ children }) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </SessionProvider>
  );
}