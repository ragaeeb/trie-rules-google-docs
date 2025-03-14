import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trie Rules + Google Docs",
  description: "Format your Google Docs easily",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
