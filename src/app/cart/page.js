'use client';
import { CartContext, cartProductPrice } from "@/components/AppContext";
import Trash from "@/components/icons/Trash";
import AddressInputs from "@/components/layout/AddressInputs";
import SectionHeaders from "@/components/layout/SectionHeaders";
import CartProduct from "@/components/menu/CartProduct";
import { useProfile } from "@/components/UseProfile";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function CartPage() {
  const { cartProducts, removeCartProduct, updateCartProductQuantity, clearCart } = useContext(CartContext);
  const [address, setAddress] = useState({});
  const { data: profileData } = useProfile();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);

      if (params.get('canceled') === '1') {
        toast.error('Payment failed 😔');
      }

      // If Stripe/payment flow ever returns directly to the cart after a
      // successful payment, make sure the cart is cleared immediately.
      if (params.get('payment') === 'success' || params.get('clear-cart') === '1') {
        clearCart();
      }
    }
  }, [clearCart]);

  useEffect(() => {
    if (profileData?.city) {
      const { phone, streetAddress, city, postalCode, country } = profileData;
      const addressFromProfile = {
        phone,
        streetAddress,
        city,
        postalCode,
        country
      };
      setAddress(addressFromProfile);
    }
  }, [profileData]);

  // Define `handleUpdateQuantity` here
  const handleUpdateQuantity = (index, newQuantity) => {
    updateCartProductQuantity(index, newQuantity);
  };

  let subtotal = 0;
for (const p of cartProducts) {
  subtotal += cartProductPrice(p) * p.quantity; // Include quantity in the calculation
}


  function handleAddressChange(propName, value) {
    setAddress(prevAddress => ({ ...prevAddress, [propName]: value }));
  }

  async function proceedToCheckout(ev) {
  ev.preventDefault();

  const promise = fetch("/api/checkout", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      address,
      cartProducts,
    }),
  }).then(async (response) => {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error ||
        "Unable to start checkout."
      );
    }

    if (!data?.url) {
      throw new Error(
        "Stripe checkout URL was not returned."
      );
    }

    window.location.href = data.url;
  });

  await toast.promise(promise, {
    loading: "Preparing your order...",
    success: "Redirecting to payment...",
    error: (error) =>
      error?.message ||
      "Something went wrong. Please try again.",
  });
}

  if (cartProducts?.length === 0) {
    return (
      <section className="mt-8 text-center">
        <SectionHeaders mainHeader="Cart" />
        <p className="mt-4">Your shopping cart is empty 😔</p>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <div className="text-center">
        <SectionHeaders mainHeader="Cart" />
      </div>
      <div className="mt-8 grid gap-8 grid-cols-2">
        <div>
          {cartProducts?.length > 0 && cartProducts.map((product, index) => (
            <CartProduct
              key={index}
              product={product}
              index={index}
              onRemove={() => removeCartProduct(index)} // Pass `index` to `removeCartProduct`
              updateQuantity={handleUpdateQuantity} // Pass handleUpdateQuantity here
            />
          ))}
          <div className="py-2 pr-16 flex justify-end items-center">
            <div className="text-gray-500">
              Subtotal:<br />
              Delivery:<br />
              Total:
            </div>
            <div className="font-semibold pl-2 text-right">
              ${subtotal}<br />
              $5<br />
              ${subtotal + 5}
            </div>
          </div>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2>Checkout</h2>
          <form onSubmit={proceedToCheckout}>
            <AddressInputs
              addressProps={address}
              setAddressProp={handleAddressChange}
            />
            <button type="submit">Pay ${subtotal + 5}</button>
          </form>
        </div>
      </div>
    </section>
  );
}
