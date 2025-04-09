import type { Metadata } from "next";
import "./globals.css";

// Define default metadata that will be used when no other metadata is specified
export const metadata: Metadata = {
  title: {
    template: "%s | TyNo",
    default: "Typo",
  },
  description: "Make TyNos*",
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
