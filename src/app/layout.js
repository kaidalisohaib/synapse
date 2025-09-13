import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Synapse - Curiosity Connector",
  description: "A pedagogical research platform connecting McGill students through interdisciplinary conversations",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950`}>
        <Navbar />
        <main className="min-h-screen relative">
          {children}
        </main>
        <footer className="relative z-10 bg-slate-900/70 backdrop-blur-sm border-t border-purple-500/20 py-8">
          {/* Subtle radial glow behind footer */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(168,85,247,0.15),rgba(0,0,0,0))]"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm text-gray-300 mb-4 md:mb-0">
                © {new Date().getFullYear()} McGill University • Synapse Neural Network
              </div>
              <div className="flex space-x-6 text-sm">
                <a href="/privacy" className="text-purple-300 hover:text-purple-200 transition-colors">
                  Privacy Policy
                </a>
                <a href="/terms" className="text-purple-300 hover:text-purple-200 transition-colors">
                  Terms of Service
                </a>
                <a href="mailto:synapse-support@mcgill.ca" className="text-purple-300 hover:text-purple-200 transition-colors">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
