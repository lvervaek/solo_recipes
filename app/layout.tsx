import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Soloteam Recipes",
  description: "Personal recipe collection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="relative min-h-full overflow-x-hidden bg-amber-50 text-gray-900">

        {/* Sofie — left side */}
        <div className="pointer-events-none fixed bottom-0 left-0 z-0 hidden xl:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/foto_s.png"
            alt=""
            width={280}
            className="rotate-6 origin-bottom-left drop-shadow-xl"
          />
        </div>

        {/* Loic — right side */}
        <div className="pointer-events-none fixed bottom-0 right-0 z-0 hidden xl:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/foto_l.png"
            alt=""
            width={300}
            className="-rotate-6 origin-bottom-right drop-shadow-xl"
          />
        </div>

        {/* Semi-transparent content backdrop */}
        <div className="relative z-10 min-h-screen bg-white/85">
          {children}
        </div>

      </body>
    </html>
  );
}
