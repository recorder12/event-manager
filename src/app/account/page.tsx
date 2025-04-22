"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Profile from "@/components/Profile";
import Settings from "@/components/Settings";
import SignOut from "@/components/SignOut";

type MenuKey = "profile" | "settings" | "signout";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const user = session?.user;

  const [activePage, setActivePage] = useState<MenuKey>("profile");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (["profile", "settings", "signout"].includes(hash)) {
      setActivePage(hash as MenuKey);
    }
  }, []);

  if (status === "loading" || !user) return null;

  const labels: Record<MenuKey, string> = {
    profile: "Profile",
    settings: "Settings",
    signout: "Sign Out",
  };

  // 메뉴 순서 설정
  const menuItems: MenuKey[] = ["profile", "settings", "signout"];

  // 배경색 테마
  const backgroundMap: Record<MenuKey, string> = {
    profile: "bg-blue-50",
    settings: "bg-purple-50",
    signout: "bg-gray-50",
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* 사이드바 */}
      <aside className="w-60 bg-white p-4 pt-20 border-r shadow-sm">
        <h2 className="text-lg font-bold mb-4">My Account</h2>
        <ul className="space-y-2">
          {menuItems.map((key) => (
            <li key={key}>
              <button
                onClick={() => setActivePage(key)}
                className={`w-full text-left px-3 py-2 rounded ${
                  activePage === key
                    ? "bg-blue-600 text-white font-semibold"
                    : "hover:bg-gray-100"
                }`}
              >
                {labels[key]}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* 콘텐츠 영역 */}
      <main
        className={`flex-1 p-8 pt-20 transition-all duration-200 ${backgroundMap[activePage]}`}
      >
        <div className="max-w-2xl mx-auto">
          {activePage === "profile" && <Profile />}
          {activePage === "settings" && <Settings />}
          {activePage === "signout" && <SignOut />}
        </div>
      </main>
    </div>
  );
}
