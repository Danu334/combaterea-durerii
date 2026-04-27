import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "NoPainMoldova",
  description: "International Pain Congress 2026",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro" style={{ height: "100%" }}>
      <body style={{ margin: 0, padding: 0, height: "100%", overflowX: "hidden" }}>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}