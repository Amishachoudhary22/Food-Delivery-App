"use client";

import { CartContext } from "@/components/AppContext";
import Bars2 from "@/components/icons/Bars2";
import ShoppingCart from "@/components/icons/ShoppingCart";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useContext, useEffect, useRef, useState } from "react";


// ==========================================
// GET FIRST NAME
// ==========================================
function getDisplayName(userName) {
  if (!userName) return "User";

  const trimmedName = userName.trim();

  if (!trimmedName) return "User";

  return trimmedName.split(/\s+/)[0];
}


// ==========================================
// AUTH LINKS
// ==========================================
function AuthLinks({ status, userName }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);


  // ==========================================
  // LOGGED IN
  // ==========================================
  if (status === "authenticated") {
    return (
      <div
        ref={menuRef}
        className="relative"
      >

        {/* USER BUTTON */}
        <button
          type="button"
          onClick={() =>
            setUserMenuOpen((prev) => !prev)
          }
          className="
            border-0
            p-0
            w-auto
            bg-transparent
            text-gray-500
            font-semibold
            whitespace-nowrap
            flex
            items-center
            gap-2
          "
        >
          <span>
            Hello, {getDisplayName(userName)}
          </span>

          <span
            className={`
              text-sm
              transition-transform
              duration-200
              ${userMenuOpen ? "rotate-180" : ""}
            `}
          >
            ▾
          </span>
        </button>


        {/* DROPDOWN */}
        {userMenuOpen && (
          <div className="absolute right-0 top-full pt-3 z-50">

            <div
              className="
                w-40
                flex
                flex-col
                rounded-lg
                border
                bg-white
                p-2
                shadow-lg
              "
            >

              <Link
                href="/profile"
                onClick={() =>
                  setUserMenuOpen(false)
                }
                className="
                  rounded-md
                  px-3
                  py-2
                  hover:bg-gray-100
                "
              >
                Profile
              </Link>


              <Link
                href="/orders"
                onClick={() =>
                  setUserMenuOpen(false)
                }
                className="
                  rounded-md
                  px-3
                  py-2
                  hover:bg-gray-100
                "
              >
                Orders
              </Link>


              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false);
                  signOut({
                    callbackUrl: "/",
                  });
                }}
                className="
                  !w-full
                  !border-0
                  !rounded-md
                  !px-3
                  !py-2
                  !justify-start
                  hover:bg-gray-100
                  text-left
                "
              >
                Logout
              </button>

            </div>
          </div>
        )}

      </div>
    );
  }


  // ==========================================
  // LOGGED OUT
  // ==========================================
  if (status === "unauthenticated") {
    return (
      <>
        <Link href="/login">
          Login
        </Link>

        <Link
          href="/register"
          className="
            bg-primary
            rounded-full
            text-white
            px-8
            py-2
          "
        >
          Register
        </Link>
      </>
    );
  }


  // ==========================================
  // SESSION STILL LOADING
  // ==========================================
  return (
    <span className="invisible">
      Loading
    </span>
  );
}


// ==========================================
// HEADER
// ==========================================
export default function Header() {

  const session = useSession();

  const status = session?.status;

  const userData = session?.data?.user;

  const userName =
    userData?.name || "User";


  const { cartProducts } =
    useContext(CartContext);


  const [mobileNavOpen, setMobileNavOpen] =
    useState(false);


  // ==========================================
  // IMPORTANT:
  // WAIT UNTIL CLIENT HAS MOUNTED
  // ==========================================
  const [mounted, setMounted] =
    useState(false);


  useEffect(() => {
    setMounted(true);
  }, []);


  /*
   * During server rendering and the first
   * browser render, show a consistent
   * placeholder for authentication.
   *
   * This prevents hydration mismatch.
   */
  const authStatus = mounted
    ? status
    : "loading";


  return (
    <header>

      {/* ======================================
          MOBILE HEADER
      ====================================== */}
      <div
        className="
          flex
          items-center
          md:hidden
          justify-between
        "
      >

        <Link
          className="
            text-primary
            font-semibold
            text-2xl
          "
          href="/"
        >
          TASTY FOODS
        </Link>


        <div
          className="
            flex
            gap-8
            items-center
          "
        >

          <Link
            href="/cart"
            className="relative"
          >

            <ShoppingCart />

            {mounted &&
              cartProducts?.length > 0 && (
                <span
                  className="
                    absolute
                    -top-2
                    -right-4
                    bg-primary
                    text-white
                    text-xs
                    py-1
                    px-1
                    rounded-full
                    leading-3
                  "
                >
                  {cartProducts.length}
                </span>
              )}

          </Link>


          <button
            className="p-1 border"
            onClick={() =>
              setMobileNavOpen(
                (prev) => !prev
              )
            }
          >
            <Bars2 />
          </button>

        </div>

      </div>


      {/* ======================================
          MOBILE NAVIGATION
      ====================================== */}
      {mobileNavOpen && (
        <div
          className="
            md:hidden
            p-4
            bg-gray-200
            rounded-lg
            mt-2
            flex
            flex-col
            gap-2
            text-center
          "
        >

          <Link
            href="/"
            onClick={() =>
              setMobileNavOpen(false)
            }
          >
            Home
          </Link>


          <Link
            href="/menu"
            onClick={() =>
              setMobileNavOpen(false)
            }
          >
            Menu
          </Link>


          <Link
            href="/#about"
            onClick={() =>
              setMobileNavOpen(false)
            }
          >
            About
          </Link>


          <Link
            href="/#contact"
            onClick={() =>
              setMobileNavOpen(false)
            }
          >
            Contact
          </Link>


          {mounted &&
            authStatus === "authenticated" && (
              <>
                <Link
                  href="/profile"
                  onClick={() =>
                    setMobileNavOpen(false)
                  }
                >
                  Hello, {getDisplayName(userName)}
                </Link>

                <Link
                  href="/orders"
                  onClick={() =>
                    setMobileNavOpen(false)
                  }
                >
                  Orders
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setMobileNavOpen(false);
                    signOut({
                      callbackUrl: "/",
                    });
                  }}
                >
                  Logout
                </button>
              </>
            )}


          {mounted &&
            authStatus === "unauthenticated" && (
              <>
                <Link
                  href="/login"
                  onClick={() =>
                    setMobileNavOpen(false)
                  }
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  onClick={() =>
                    setMobileNavOpen(false)
                  }
                >
                  Register
                </Link>
              </>
            )}

        </div>
      )}


      {/* ======================================
          DESKTOP HEADER
      ====================================== */}
      <div
        className="
          hidden
          md:flex
          items-center
          justify-between
          gap-8
        "
      >

        {/* LEFT NAVIGATION */}
        <nav
          className="
            flex
            items-center
            gap-8
            text-gray-500
            font-semibold
          "
        >

          <Link
            className="
              text-primary
              font-semibold
              text-2xl
            "
            href="/"
          >
            TASTY FOODS
          </Link>


          <Link href="/">
            Home
          </Link>


          <Link href="/menu">
            Menu
          </Link>


          <Link href="/#about">
            About
          </Link>


          <Link href="/#contact">
            Contact
          </Link>

        </nav>


        {/* RIGHT NAVIGATION */}
        <nav
          className="
            flex
            items-center
            gap-8
            text-gray-500
            font-semibold
          "
        >

          <AuthLinks
            status={authStatus}
            userName={userName}
          />


          <Link
            href="/cart"
            className="
              relative
              shrink-0
            "
          >

            <ShoppingCart />

            {mounted &&
              cartProducts?.length > 0 && (
                <span
                  className="
                    absolute
                    -top-2
                    -right-4
                    bg-primary
                    text-white
                    text-xs
                    py-1
                    px-1
                    rounded-full
                    leading-3
                  "
                >
                  {cartProducts.length}
                </span>
              )}

          </Link>

        </nav>

      </div>

    </header>
  );
}