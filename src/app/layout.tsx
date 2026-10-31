import type { Metadata, Viewport } from "next";
import { InvoiceProvider } from "@/context/InvoiceContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sama Facture — Facturation & Gestion financière pour l'Afrique de l'Ouest",
  description:
    "Solution de facturation conforme, montants en FCFA, TVA 18%, paiements Wave & Orange Money pour entrepreneurs et PME du Sénégal.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#08100C",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="antialiased overflow-x-hidden">
      <body className="min-h-screen bg-[#F8FAFB] text-slate-900 font-sans overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900">
        <InvoiceProvider>{children}</InvoiceProvider>
      </body>
    </html>
  );
}
