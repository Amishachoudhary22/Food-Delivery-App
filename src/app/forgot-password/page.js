"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(ev) {
    ev.preventDefault();

    setMessage("");
    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: cleanEmail,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to process your request."
        );
        return;
      }

      setMessage(data.message);
    } catch (error) {
      console.error(error);

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-8">
      <h1 className="text-center text-primary text-4xl mb-4">
        Forgot Password
      </h1>

      <p className="text-center max-w-md mx-auto mb-6">
        Enter your email address and we&apos;ll send you
        a link to reset your password.
      </p>

      <form
        onSubmit={handleSubmit}
        className="max-w-xs mx-auto"
      >
        {error && (
          <div className="my-4 p-3 text-center text-red-600 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        {message && (
          <div className="my-4 p-3 text-center text-green-700 bg-green-50 rounded-lg">
            {message}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          disabled={loading}
          onChange={(ev) =>
            setEmail(ev.target.value)
          }
          required
        />

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Sending..."
            : "Send Reset Link"}
        </button>

        <div className="text-center mt-6">
          <Link
            href="/login"
            className="text-primary underline"
          >
            Back to Login
          </Link>
        </div>
      </form>
    </section>
  );
}