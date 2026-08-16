"use client";

import { useState } from "react";

export default function ResetAdminPage() {
  const [email, setEmail] = useState(
    "amishachoudhary2212@gmail.com"
  );

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(e) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/reset-admin-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || "Password reset failed");
        return;
      }

      setMessage(
        "Password reset successfully. You can now login."
      );
    } catch (error) {
      console.error(error);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">
          Admin Password Recovery
        </h1>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block mb-1">
              Admin Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block mb-1">
              New Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2"
              minLength={5}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded px-4 py-2 bg-black text-white disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Admin Password"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-green-600">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-4 text-red-600">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}