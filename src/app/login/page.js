"use client";

import { signIn } from "next-auth/react";
import Image from "next/legacy/image";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginInProgress, setLoginInProgress] = useState(false);
  const [error, setError] = useState("");

  async function handleFormSubmit(ev) {
    ev.preventDefault();

    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoginInProgress(true);

    try {
      const result = await signIn("credentials", {
        email: cleanEmail,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        setLoginInProgress(false);
        return;
      }

      if (result?.ok) {
        window.location.href = "/";
        return;
      }

      setError("Unable to login. Please try again.");
      setLoginInProgress(false);
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      setError("Something went wrong. Please try again.");
      setLoginInProgress(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setLoginInProgress(true);

    try {
      await signIn("google", {
        callbackUrl: "/",
      });
    } catch (error) {
      console.error("GOOGLE LOGIN ERROR:", error);

      setError("Unable to login with Google. Please try again.");
      setLoginInProgress(false);
    }
  }

  return (
    <section className="mt-8">
      <h1 className="text-center text-primary text-4xl mb-4">
        Login
      </h1>

      <form
        className="max-w-xs mx-auto"
        onSubmit={handleFormSubmit}
      >
        {error && (
          <div className="my-4 p-3 text-center text-red-600 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        <input
          type="email"
          name="email"
          placeholder="email"
          value={email}
          disabled={loginInProgress}
          onChange={(ev) => setEmail(ev.target.value)}
        />

        <input
          type="password"
          name="password"
          placeholder="password"
          value={password}
          disabled={loginInProgress}
          onChange={(ev) => setPassword(ev.target.value)}
        />

        <button
          disabled={loginInProgress}
          type="submit"
        >
          {loginInProgress ? "Logging in..." : "Login"}
        </button>

        <div className="text-center mt-3 mb-2">
          <Link
            href="/forgot-password"
            className="text-primary underline"
          >
            Forgot password?
          </Link>
        </div>

        <div className="my-4 text-center text-gray-500">
          or login with provider
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loginInProgress}
          className="flex gap-4 justify-center"
        >
          <Image
            src="/google.png"
            alt=""
            width={24}
            height={24}
          />

          Login with Google
        </button>

        <div className="text-center mt-6">
          <span>Don't have an account? </span>

          <Link
            href="/register"
            className="text-primary underline"
          >
            Register
          </Link>
        </div>
      </form>
    </section>
  );
}