import { describe, it } from "node:test";
import assert from "node:assert";
import { getInvoiceStatusConfig } from "../../src/lib/invoice-status.ts";

describe("lib/invoice-status.ts — Configuration des statuts et pastilles", () => {
  it("retourne le badge vert pour le statut 'paid'", () => {
    const config = getInvoiceStatusConfig("paid");
    assert.strictEqual(config.label, "Payée");
    assert.match(config.badgeClass, /emerald/);
  });

  it("retourne le badge orange pour le statut 'sent'", () => {
    const config = getInvoiceStatusConfig("sent");
    assert.strictEqual(config.label, "Envoyée");
    assert.match(config.badgeClass, /amber/);
  });

  it("retourne le badge rouge pour le statut 'overdue'", () => {
    const config = getInvoiceStatusConfig("overdue");
    assert.strictEqual(config.label, "En retard");
    assert.match(config.badgeClass, /rose/);
  });

  it("retourne le badge gris pour le statut 'draft'", () => {
    const config = getInvoiceStatusConfig("draft");
    assert.strictEqual(config.label, "Brouillon");
    assert.match(config.badgeClass, /slate/);
  });
});

