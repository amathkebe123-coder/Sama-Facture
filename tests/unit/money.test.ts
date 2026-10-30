import { describe, it } from "node:test";
import assert from "node:assert";
import { formatFCFA, computeLineTotal, computeInvoiceTotals } from "../../src/lib/money.ts";

describe("lib/money.ts — Utilitaires financiers FCFA", () => {
  it("formate correctement les montants en FCFA sans décimales avec espaces insécables", () => {
    assert.strictEqual(formatFCFA(0), "0 FCFA");
    assert.strictEqual(formatFCFA(250000), "250 000 FCFA");
    assert.strictEqual(formatFCFA(1250000), "1 250 000 FCFA");
    assert.strictEqual(formatFCFA(18450000), "18 450 000 FCFA");
  });

  it("gère les types BigInt sans perte de précision pour les gros montants", () => {
    assert.strictEqual(formatFCFA(BigInt(2500000000)), "2 500 000 000 FCFA");
  });

  it("calcule correctement le montant d'une ligne HT arrondi à l'entier", () => {
    assert.strictEqual(computeLineTotal(3, 150000), 450000);
    assert.strictEqual(computeLineTotal(1.5, 300000), 450000);
  });

  it("calcule correctement les totaux d'une facture avec TVA 18% sénégalaise", () => {
    const items = [
      { quantity: 2, unitPrice: 500000, taxRate: 18 }, // HT: 1 000 000, TVA: 180 000
      { quantity: 1, unitPrice: 200000, taxRate: 18 }, // HT: 200 000, TVA: 36 000
    ];
    const totals = computeInvoiceTotals(items);
    assert.strictEqual(totals.subtotal, 1200000);
    assert.strictEqual(totals.taxTotal, 216000);
    assert.strictEqual(totals.total, 1416000);
  });
});
