"use client";

import { signIn } from "next-auth/react";
import Image from "next/legacy/image";
import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);
  const [userCreated, setUserCreated] = useState(false);
  const [error, setError] = useState("");

  async function handleFormSubmit(ev) {
    ev.preventDefault();

    setCreatingUser(true);
    setError("");
    setUserCreated(false);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setUserCreated(true);

        setName("");
        setEmail("");
        setPassword("");
      } else {
        console.error("Registration failed:", data);

        setError(
          data?.error || "Registration failed"
        );
      }
    } catch (error) {
      console.error(
        "Registration request failed:",
        error
      );

      setError(
        "Unable to connect to the server"
      );
    } finally {
      setCreatingUser(false);
    }
  }

  return (
    <section className="mt-8">
      <h1 className="text-center text-primary text-4xl mb-4">
        Register
      </h1>

      {/* SUCCESS MESSAGE */}
      {userCreated && (
        <div className="my-4 text-center">
          User created.
          <br />

          Now you can{" "}

          <Link
            className="underline"
            href="/login"
          >
            Login &raquo;
          </Link>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="my-4 text-center text-red-600">
          {error}
        </div>
      )}

      {/* REGISTRATION FORM */}
      <form
        onSubmit={handleFormSubmit}
        className="max-w-md mx-auto"
      >

        {/* NAME */}
        <label
          htmlFor="name"
          className="block mb-1"
        >
          What should we call you?
        </label>

        <input
          id="name"
          type="text"
          name="name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          placeholder="e.g. Prashant"
          disabled={creatingUser}
          required
          className="w-full border rounded-lg px-3 py-2 mb-4"
        />

        {/* EMAIL */}
        <label
          htmlFor="email"
          className="block mb-1"
        >
          Email
        </label>

        <input
          id="email"
          type="email"
          name="email"
          placeholder="email@example.com"
          value={email}
          disabled={creatingUser}
          onChange={(ev) =>
            setEmail(ev.target.value)
          }
          required
          className="w-full border rounded-lg px-3 py-2 mb-4"
        />

        {/* PASSWORD */}
        <label
          htmlFor="password"
          className="block mb-1"
        >
          Password
        </label>

        <input
          id="password"
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          disabled={creatingUser}
          onChange={(ev) =>
            setPassword(ev.target.value)
          }
          required
          minLength={5}
          className="w-full border rounded-lg px-3 py-2 mb-4"
        />

        {/* REGISTER BUTTON */}
        <button
          type="submit"
          disabled={creatingUser}
          className="w-full bg-primary text-white rounded-full py-2"
        >
          {creatingUser
            ? "Creating account..."
            : "Register"}
        </button>

      </form>

      {/* GOOGLE LOGIN */}
      <div className="max-w-md mx-auto">

        <div className="my-4 text-center text-gray-500">
          or login with provider
        </div>

        <button
          type="button"
          onClick={() =>
            signIn("google", {
              callbackUrl: "/",
            })
          }
          className="w-full flex gap-4 justify-center items-center"
        >
          <Image
            src="/google.png"
            alt="Google"
            width={24}
            height={24}
          />

          Login with Google
        </button>

        {/* LOGIN LINK */}
        <div className="text-center my-4 text-gray-500 border-t pt-4">
          Existing account?{" "}

          <Link
            className="underline"
            href="/login"
          >
            Login here &raquo;
          </Link>
        </div>

      </div>
    </section>
  );
}