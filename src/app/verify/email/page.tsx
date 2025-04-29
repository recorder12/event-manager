"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!code) {
        setStatus("error");
        setErrorMessage("Invalid verification code.");
        return;
      }

      try {
        const res = await fetch(`/api/verify/email?code=${code}`);
        if (res.ok) {
          setStatus("success");
        } else {
          const result = await res.json();
          setErrorMessage(result.error || "Verification failed.");
          setStatus("error");
        }
      } catch (err) {
        console.error("Email verification failed", err);
        setErrorMessage("Server error. Please try again.");
        setStatus("error");
      }
    };

    verifyEmail();
  }, [code]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded shadow p-6 text-center">
        {status === "loading" && (
          <div>
            <p className="text-lg font-semibold mb-2">
              Verifying your email...
            </p>
            <p className="text-sm text-gray-500">
              Please wait while we confirm your account.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <h2 className="text-green-600 text-2xl font-bold">
              ✅ Email Verified!
            </h2>
            <p className="text-gray-700">You can now log in to your account.</p>
            <Link
              href="/auth/login"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded transition"
            >
              Go to Login
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <h2 className="text-red-600 text-2xl font-bold">
              ❌ Verification Failed
            </h2>
            <p className="text-gray-700">{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EmailVerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
