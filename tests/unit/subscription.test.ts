import { test, describe } from "node:test";
import assert from "node:assert";
import {
  SUBSCRIPTION_PLANS,
  isValidPlanId,
} from "../../src/lib/subscription-plans.ts";
import {
  computePayDunyaMasterHash,
  verifyPayDunyaHash,
  getPayDunyaBaseUrl,
} from "../../src/lib/paydunya.ts";

describe("lib/subscription-plans.ts — Constante serveur des offres", () => {
  test("1. Contient exactement les 3 offres requises avec leurs montants stricts", () => {
    assert.strictEqual(SUBSCRIPTION_PLANS.monthly.amount, 3900);
    assert.strictEqual(SUBSCRIPTION_PLANS.monthly.durationLabel, "1 mois");

    assert.strictEqual(SUBSCRIPTION_PLANS.six_months.amount, 22000);
    assert.strictEqual(SUBSCRIPTION_PLANS.six_months.durationLabel, "6 mois");

    assert.strictEqual(SUBSCRIPTION_PLANS.yearly.amount, 45000);
    assert.strictEqual(SUBSCRIPTION_PLANS.yearly.durationLabel, "1 an");
  });

  test("2. Valide uniquement les identifiants autorisés et refuse toute autre valeur", () => {
    assert.strictEqual(isValidPlanId("monthly"), true);
    assert.strictEqual(isValidPlanId("six_months"), true);
    assert.strictEqual(isValidPlanId("yearly"), true);

    assert.strictEqual(isValidPlanId("weekly"), false);
    assert.strictEqual(isValidPlanId("lifetime"), false);
    assert.strictEqual(isValidPlanId(""), false);
    assert.strictEqual(isValidPlanId(null), false);
    assert.strictEqual(isValidPlanId(123), false);
  });
});

describe("lib/paydunya.ts — Intégration PayDunya & Hash SHA-512", () => {
  test("3. Détermine correctement l'URL de base selon PAYDUNYA_MODE", () => {
    const originalMode = process.env.PAYDUNYA_MODE;

    process.env.PAYDUNYA_MODE = "test";
    assert.strictEqual(getPayDunyaBaseUrl(), "https://app.paydunya.com/sandbox-api/v1");

    process.env.PAYDUNYA_MODE = "live";
    assert.strictEqual(getPayDunyaBaseUrl(), "https://app.paydunya.com/api/v1");

    // Restauration
    process.env.PAYDUNYA_MODE = originalMode;
  });

  test("4. Calcule et vérifie le hash SHA-512 de PAYDUNYA_MASTER_KEY avec comparaison sécurisée", () => {
    const originalKey = process.env.PAYDUNYA_MASTER_KEY;
    process.env.PAYDUNYA_MASTER_KEY = "test_secret_master_key_123456";

    const hash = computePayDunyaMasterHash();
    assert.strictEqual(typeof hash, "string");
    assert.strictEqual(hash.length, 128); // 128 caractères hexadécimaux pour SHA-512

    // Doit être validé
    assert.strictEqual(verifyPayDunyaHash(hash), true);

    // Hash falsifié ou invalide doit être rejeté
    assert.strictEqual(verifyPayDunyaHash("bad_hash"), false);
    assert.strictEqual(verifyPayDunyaHash(""), false);
    assert.strictEqual(verifyPayDunyaHash(undefined), false);

    process.env.PAYDUNYA_MASTER_KEY = originalKey;
  });
});

