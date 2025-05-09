import type { Metadata } from "next";
import "./globals.css";

// Define default metadata that will be used when no other metadata is specified
export const metadata: Metadata = {
  title: {
    template: "%s | Typo*",
    default: "Typo*",
  },
  description: "Make Typos*",
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
