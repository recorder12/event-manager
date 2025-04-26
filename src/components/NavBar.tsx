"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function NavBar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-white shadow relative z-50">
      {/* Left: Logo */}
      <Link href="/" className="text-xl font-bold text-orange-600">
        CMNY
      </Link>

      {/* Right: Account or Auth Buttons */}

      <div className="hidden md:flex space-x-10">
        {session?.user?.role === "ADMIN" ? (
          <div className="relative items-center space-x-4">
            <Link
              href="/admin/events"
              className="text-sm font-medium text-gray-700 hover:underline"
            >
              Admin Page
            </Link>
          </div>
        ) : null}
        {session?.user ? (
          <div className="relative items-center space-x-4">
            <div>
              <button
                onClick={toggleMenu}
                className="text-sm font-medium text-gray-700 hover:underline"
              >
                Account ▼
              </button>

              {menuOpen && (
                <div
                  onMouseLeave={closeMenu}
                  className="absolute right-0 mt-2 w-48 bg-white border shadow rounded z-50"
                >
                  <Link
                    href="/account?tab=profile"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={closeMenu}
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/account?tab=settings"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={closeMenu}
                  >
                    Settings
                  </Link>

                  <button
                    onClick={() => {
                      closeMenu();
                      signOut();
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-x-4 text-sm font-medium">
            <button
              onClick={() => {
                const event = new CustomEvent("open-signin-modal");
                window.dispatchEvent(event);
              }}
              className="hover:underline"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                const event = new CustomEvent("open-signup-modal");
                window.dispatchEvent(event);
              }}
              className="hover:underline"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
