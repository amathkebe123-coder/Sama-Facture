import { test, describe } from "node:test";
import assert from "node:assert";
import { generateInvoicePdfBlob } from "../../src/lib/pdf-generator.ts";
import type { Invoice } from "../../src/lib/data/fixtures.ts";
import type { CompanySettings } from "../../src/lib/company.ts";

describe("lib/pdf-generator.ts — Génération de PDF Factures A4 Conforme", () => {
  const mockCompany: CompanySettings = {
    companyName: "Sama Facture SN SARL",
    ninea: "008472912 2G3",
    rccm: "SN-DKR-2024-B-1420",
    phone: "+221 77 821 45 67",
    address: "12 Avenue Léopold Sédar Senghor, Dakar Plateau",
    prefix: "FAC-2026-",
    defaultTax: "18",
    paymentTerms: "30",
  };

  const mockInvoice: Invoice = {
    id: "inv-test-1",
    invoiceNumber: "FAC-2026-0042",
    client: {
      id: "cli-1",
      name: "Teranga Tech Solutions",
      email: "facturation@terangatech.sn",
      phone: "+221 77 123 45 67",
      address: "Plateau, Immeuble Fahd",
      city: "Dakar",
    },
    issueDate: "2026-10-28",
    dueDate: "2026-11-27",
    channel: "Wave Business",
    status: "paid",
    subtotal: 2754237,
    taxRate: 18,
    taxTotal: 495763,
    total: 3250000,
    notes: "Paiement reçu intégralement par Wave Business.",
    lines: [
      {
        id: "line-1",
        description: "Développement Application Web & API Node.js",
        quantity: 1,
        unitPrice: 2200000,
        taxRate: 18,
        lineTotal: 2200000,
      },
      {
        id: "line-2",
        description: "Intégration Passerelle Mobile Wave & Orange Money",
        quantity: 1,
        unitPrice: 554237,
        taxRate: 18,
        lineTotal: 554237,
      },
    ],
  };

  test("1. Génère un Blob PDF conforme avec entête standard et taille A4", async () => {
    const blob = generateInvoicePdfBlob(mockInvoice, mockCompany);
    assert.strictEqual(blob.type, "application/pdf");
    assert.ok(blob.size > 2000, "Le PDF doit avoir une taille supérieure à 2 Ko");

    const arrayBuffer = await blob.arrayBuffer();
    const latin1Text = Buffer.from(arrayBuffer).toString("latin1");

    assert.ok(latin1Text.startsWith("%PDF-1.4"), "Doit débuter par l'entête PDF 1.4");
    assert.ok(latin1Text.includes("/MediaBox [0 0 595.28 841.89]"), "Format A4 595.28 x 841.89 pt");
    assert.ok(latin1Text.includes("%%EOF"), "Doit se terminer par %%EOF");
  });

  test("2. Intègre les coordonnées de l'entreprise (Raison sociale, NINEA, RCCM, Tél, Siège)", async () => {
    const blob = generateInvoicePdfBlob(mockInvoice, mockCompany);
    const latin1Text = Buffer.from(await blob.arrayBuffer()).toString("latin1");

    assert.ok(latin1Text.includes("Sama Facture SN SARL"));
    assert.ok(latin1Text.includes("008472912 2G3"));
    assert.ok(latin1Text.includes("SN-DKR-2024-B-1420"));
    assert.ok(latin1Text.includes("+221 77 821 45 67"));
  });

  test("3. Intègre le numéro de facture, dates, statut et informations du client", async () => {
    const blob = generateInvoicePdfBlob(mockInvoice, mockCompany);
    const latin1Text = Buffer.from(await blob.arrayBuffer()).toString("latin1");

    assert.ok(latin1Text.includes("FAC-2026-0042"));
    assert.ok(latin1Text.includes("Teranga Tech Solutions"));
    assert.ok(latin1Text.includes("facturation@terangatech.sn"));
    assert.ok(latin1Text.includes("Wave Business"));
  });

  test("4. Intègre le détail des lignes et les totaux calculés en FCFA", async () => {
    const blob = generateInvoicePdfBlob(mockInvoice, mockCompany);
    const latin1Text = Buffer.from(await blob.arrayBuffer()).toString("latin1");

    assert.ok(latin1Text.includes("3 250 000 FCFA"), "Total TTC présent");
    assert.ok(latin1Text.includes("2 754 237 FCFA"), "Sous-total HT présent");
    assert.ok(latin1Text.includes("495 763 FCFA"), "TVA présente");
  });

  test("5. Reflète immédiatement les modifications après mise à jour d'une facture", async () => {
    const updatedInvoice: Invoice = {
      ...mockInvoice,
      total: 4500000,
      subtotal: 3813559,
      taxTotal: 686441,
      lines: [
        {
          id: "line-mod",
          description: "Audit Cybersécurité & Tests d'intrusion",
          quantity: 2,
          unitPrice: 1906780,
          taxRate: 18,
          lineTotal: 3813559,
        },
      ],
    };

    const blob = generateInvoicePdfBlob(updatedInvoice, mockCompany);
    const latin1Text = Buffer.from(await blob.arrayBuffer()).toString("latin1");

    assert.ok(latin1Text.includes("4 500 000 FCFA"), "Nouveau total TTC reflété");
    assert.ok(latin1Text.includes("Audit Cybers\\351curit\\351"), "Nouvelle prestation reflétée");
  });
});
