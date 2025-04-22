"use client";

import { useState } from "react";

export default function Settings() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  const handleSave = async () => {
    setStatus("saving");
    setErrorMessage("");

    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      setStatus("error");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setStatus("error");
      return;
    }

    try {
      const res = await fetch("/api/password/new-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setStatus("success");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setErrorMessage(result.error || "Failed to change password.");
        setStatus("error");
      }
    } catch (err) {
      setErrorMessage("Something went wrong.");
      setStatus("error");
    }
  };

  const buttonEnabled =
    newPassword.length >= 8 && newPassword === confirmPassword;

  return (
    <div className="max-w-xl mx-auto space-y-6 mt-10">
      <h2 className="text-xl font-semibold mb-4">Change Password</h2>

      <div>
        <label className="block mb-1 font-medium">New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder={"At least 8 characters"}
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder={"Re-enter your password"}
        />
      </div>

      {errorMessage && <p className="text-red-600 text-sm">{errorMessage}</p>}

      <button
        onClick={handleSave}
        disabled={!buttonEnabled || status === "saving"}
        className={`w-full py-2 rounded transition ${
          buttonEnabled
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-300 text-gray-600 cursor-not-allowed"
        }`}
      >
        {status === "saving"
          ? "Saving..."
          : status === "success"
          ? "✅ Saved"
          : "Change Password"}
      </button>
    </div>
  );
}
