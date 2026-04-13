import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { getUser } from "@/lib/auth";
import AuthProvider from "@/components/auth/AuthProvider";
import Navbar from "@/components/layout/Navbar";
import LeftSidebar from "@/components/layout/LeftSidebar";
import CreateReportModal from "@/components/post/CreateReportModal";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
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
    <html lang="en" className={`${jakartaSans.variable}`}>
      <body className="min-h-screen flex flex-col font-sans">
        <AuthProvider initialUser={user}>
          {/* Mobile navbar — hidden on lg+ since LeftSidebar takes over */}
          <div className="lg:hidden">
            <Navbar />
          </div>

          {/* Desktop: LeftSidebar + Content */}
          <div className="flex flex-1">
            <LeftSidebar />
            <main className="flex-1 min-w-0 relative z-[1]">{children}</main>
          </div>

          <CreateReportModal />

          <Toaster
            position="bottom-right"
            toastOptions={{
              className: "!bg-surface-elevated !text-foreground !border !border-surface-border !shadow-2xl !rounded-xl !text-sm",
              duration: 3000,
              style: {
                background: '#1a332f',
                color: '#e8f4ef',
                border: '1px solid rgba(40, 90, 72, 0.3)',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
