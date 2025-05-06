import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "snippets-store",
  description:
    "Store, organize, and share code snippets with real-time collaboration features",
  generator: "vite",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
