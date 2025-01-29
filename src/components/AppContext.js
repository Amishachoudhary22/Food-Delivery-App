'use client';
import {SessionProvider} from "next-auth/react";
import {createContext, useEffect, useState} from "react";
import toast from "react-hot-toast";

export const CartContext = createContext({});

export function cartProductPrice(cartProduct) {
  let price = cartProduct.basePrice;
  if (cartProduct.size) {
    price += cartProduct.size.price;
  }
  if (cartProduct.extras?.length > 0) {
    for (const extra of cartProduct.extras) {
      price += extra.price;
    }
  }
  return price;
}

export function AppProvider({children}) {
  const [cartProducts,setCartProducts] = useState([]);

  const ls = typeof window !== 'undefined' ? window.localStorage : null;

  useEffect(() => {
    if (ls && ls.getItem('cart')) {
      setCartProducts( JSON.parse( ls.getItem('cart') ) );
    }
  }, [ls]);

  function clearCart() {
    setCartProducts([]);
    saveCartProductsToLocalStorage([]);
  }

  function removeCartProduct(indexToRemove) {
    const removedProduct = cartProducts[indexToRemove]; // Get the product before the state change
  
    setCartProducts((prevProducts) => {
      const updatedProducts = prevProducts
        .map((product, index) =>
          index === indexToRemove
            ? { ...product, quantity: product.quantity - 1 }
            : product
        )
        .filter((product) => product.quantity > 0);
  
      saveCartProductsToLocalStorage(updatedProducts);
      return updatedProducts;
    });
  
    // Trigger toast outside of `setCartProducts` to ensure a single notification
    if (removedProduct?.quantity <= 1) {
      toast.success("Product removed from cart");
    } else {
      toast.success("Product quantity updated");
    }
  }
  
  
  
  function saveCartProductsToLocalStorage(cartProducts) {
    if (ls) {
      ls.setItem('cart', JSON.stringify(cartProducts));
    }
  }

  function addToCart(product, size, extras) {
    setCartProducts((prevProducts) => {
      const existingProductIndex = prevProducts.findIndex(
        (p) =>
          p.name === product.name &&
          p.size?.name === size?.name &&
          p.extras?.toString() === extras?.toString()
      );
  
      if (existingProductIndex !== -1) {
        return prevProducts.map((p, index) =>
          index === existingProductIndex
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      } else {
        const cartProduct = { ...product, size, extras, quantity: 1 };
        const newProducts = [...prevProducts, cartProduct];
        saveCartProductsToLocalStorage(newProducts);
        return newProducts;
      }
    });
  }

  function updateCartProductQuantity(index, newQuantity) {
    if (newQuantity < 1) {
      return; // Handle invalid quantity (optional: display error message)
    }

    setCartProducts((prevProducts) => {
      const updatedProducts = [...prevProducts];
      updatedProducts[index].quantity = newQuantity;
      saveCartProductsToLocalStorage(updatedProducts);
      return updatedProducts;
    });
  }
  return (
    <SessionProvider>
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
    </SessionProvider>
  );
}
