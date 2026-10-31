import type { Metadata } from "next";
import { InvoiceProvider } from "@/context/InvoiceContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sama Facture — Facturation & Gestion financière pour l'Afrique de l'Ouest",
  description:
    "Solution de facturation conforme, montants en FCFA, TVA 18%, paiements Wave & Orange Money pour entrepreneurs et PME du Sénégal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="antialiased">
      <body className="min-h-screen bg-[#F8FAFB] text-slate-900 font-sans">
        <InvoiceProvider>{children}</InvoiceProvider>
      </body>
    </html>
  );
}
