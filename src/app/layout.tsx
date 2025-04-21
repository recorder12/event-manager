import type { Metadata } from "next";
import "./globals.css";
import { Prompt } from "next/font/google";
import AuthContext from "@/contexts/AuthContext";
import NavBar from "@/components/NavBar";
import SignInModal from "@/components/modals/SignInModal";
import SignUpModal from "@/components/modals/SignUpModal";

const prompt = Prompt({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "CMNY Event Management",
  description: "CMNY Event Management to manage rehearsal schedules and parts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={prompt.className}>
      <body className="w-full h-full bg-orange-100">
        <AuthContext>
          <header>
            <NavBar />
          </header>
          <main className="flex justify-center">{children}</main>
          {/* 항상 로딩되어 있어야 함 */}
          <SignInModal />
          <SignUpModal />
          <footer className="bg-gray-800 text-white py-4">
            <div className="container mx-auto text-center">
              <p>&copy; 2023 CMNY Event Management. All rights reserved.</p>
            </div>
          </footer>
        </AuthContext>
      </body>
    </html>
  );
}
