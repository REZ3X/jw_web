import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { getUser } from "@/lib/auth";
import AuthProvider from "@/components/auth/AuthProvider";
import Navbar from "@/components/layout/Navbar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: {
    template: "%s | JogjaWaskita",
    default: "JogjaWaskita — Civic Engagement Platform",
  },
  description:
    "Report and track local issues transparently. Empower citizens and government to resolve community problems together.",
  keywords: ["civic", "engagement", "report", "government", "community", "Yogyakarta", "transparency"],
};

export default async function RootLayout({ children }) {
  const user = await getUser();

  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen flex flex-col bg-background text-foreground font-sans">
        <AuthProvider initialUser={user}>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: "!bg-surface !text-foreground !border !border-surface-border !shadow-xl !rounded-xl !text-sm",
              duration: 3000,
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
