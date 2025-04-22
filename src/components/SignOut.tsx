"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignOut() {
  const router = useRouter();

  const handleCancel = () => {
    router.push("/account");
  };

  const handleConfirm = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="max-w-xl mx-auto mt-16 text-center space-y-6">
      <h2 className="text-2xl font-semibold">Do you want to sign out?</h2>
      <div className="flex justify-center gap-4">
        <button
          onClick={handleConfirm}
          className="px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Yes, Sign Out
        </button>
        <button
          onClick={handleCancel}
          className="px-5 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
        >
          No
        </button>
      </div>
    </div>
  );
}
