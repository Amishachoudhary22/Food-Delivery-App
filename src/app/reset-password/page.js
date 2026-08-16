"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSubmit(ev) {
    ev.preventDefault();

    setMessage("");
    setError("");

    if (!token || !email) {
      setError("Invalid password reset link.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters long."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            token,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to reset password."
        );
        return;
      }

      setMessage(
        "Password reset successfully. You can now login."
      );

      setPassword("");
      setConfirmPassword("");
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
        Reset Password
      </h1>

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
          type="password"
          placeholder="New password"
          value={password}
          disabled={loading}
          onChange={(ev) =>
            setPassword(ev.target.value)
          }
          required
        />

        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          disabled={loading}
          onChange={(ev) =>
            setConfirmPassword(ev.target.value)
          }
          required
        />

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Resetting..."
            : "Reset Password"}
        </button>

        {message && (
          <div className="text-center mt-6">
            <Link
              href="/login"
              className="text-primary underline"
            >
              Go to Login
            </Link>
          </div>
        )}
      </form>
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <section className="mt-8">
          <h1 className="text-center text-primary text-4xl mb-4">
            Reset Password
          </h1>

          <p className="text-center">
            Loading...
          </p>
        </section>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}