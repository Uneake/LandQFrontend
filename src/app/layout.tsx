import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import TopMenu from "@/components/TopMenu";

const prompt = Prompt({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-prompt",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LandQ - ระบบตรวจสอบนัดโอนมรดกที่ดิน",
  description: "ระบบตรวจสอบและจัดการนัดหมายโอนมรดกที่ดิน สำนักงานที่ดิน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={prompt.variable}>
      <body className="font-sans antialiased text-base bg-[#FAF8F5] text-[#2C2520] min-h-screen selection:bg-[#C59B27]/30">
        <AuthProvider>
          <TopMenu/>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

