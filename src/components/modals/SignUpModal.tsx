"use client";

import { useEffect, useState } from "react";

export default function SignUpModal() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const handleOpen = () => {
      setOpen(true);
      setError("");
      setSuccessMessage("");
    };
    window.addEventListener("open-signup-modal", handleOpen);
    return () => window.removeEventListener("open-signup-modal", handleOpen);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      }),
    });

    const result = await res.json();

    if (res.ok) {
      setSuccessMessage(
        "A verification email has been sent. Please check your inbox to complete the sign-up process."
      );
      setEmail("");
      setFirstName("");
      setLastName("");
      setPassword("");
      setConfirm("");
    } else {
      setError(result.error || "Failed to sign up");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <h2 className="text-xl font-bold mb-4">Sign Up</h2>

        {successMessage ? (
          <div className="text-green-700 font-medium space-y-4">
            <p>{successMessage}</p>
            <button
              onClick={() => setOpen(false)}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full border p-2 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="First name"
                className="w-1/2 border p-2 rounded"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Last name"
                className="w-1/2 border p-2 rounded"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <input
              type="password"
              placeholder="Password"
              className="w-full border p-2 rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full border p-2 rounded"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
            >
              Sign Up
            </button>
          </form>
        )}

        <button
          onClick={() => setOpen(false)}
          className="absolute p-2 top-2 right-3 text-gray-400 hover:text-gray-600 text-xl"
        >
          ×
        </button>
      </div>
    </div>
  );
}
