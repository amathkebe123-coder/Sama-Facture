import { describe, it } from "node:test";
import assert from "node:assert";
import { validateAllowedEmail } from "../../src/lib/email-validator.ts";

describe("lib/email-validator.ts — Validation stricte des adresses email", () => {
  it("accepte les adresses Gmail valides", () => {
    assert.strictEqual(validateAllowedEmail("awa.diop@gmail.com").isValid, true);
    assert.strictEqual(validateAllowedEmail("contact.test@googlemail.com").isValid, true);
  });

  it("accepte les adresses iCloud valides (@icloud.com, @me.com, @mac.com)", () => {
    assert.strictEqual(validateAllowedEmail("user@icloud.com").isValid, true);
    assert.strictEqual(validateAllowedEmail("entrepreneur@me.com").isValid, true);
    assert.strictEqual(validateAllowedEmail("fondateur@mac.com").isValid, true);
  });

  it("accepte les adresses professionnelles d'entreprise", () => {
    assert.strictEqual(validateAllowedEmail("contact@monentreprise.sn").isValid, true);
    assert.strictEqual(validateAllowedEmail("comptabilite@terangatech.sn").isValid, true);
    assert.strictEqual(validateAllowedEmail("directeur@cabinet-sene.com").isValid, true);
    assert.strictEqual(validateAllowedEmail("hello@startup.tech").isValid, true);
  });

  it("refuse les messageries grand public gratuites (Yahoo, Outlook, Hotmail, etc.) avec le message exact", () => {
    const expectedError = "Utilisez une adresse Gmail, iCloud ou votre adresse email professionnelle.";

    const yahooRes = validateAllowedEmail("test@yahoo.com");
    assert.strictEqual(yahooRes.isValid, false);
    assert.strictEqual(yahooRes.error, expectedError);

    const yahooFrRes = validateAllowedEmail("test@yahoo.fr");
    assert.strictEqual(yahooFrRes.isValid, false);
    assert.strictEqual(yahooFrRes.error, expectedError);

    const outlookRes = validateAllowedEmail("test@outlook.com");
    assert.strictEqual(outlookRes.isValid, false);
    assert.strictEqual(outlookRes.error, expectedError);

    const hotmailRes = validateAllowedEmail("test@hotmail.com");
    assert.strictEqual(hotmailRes.isValid, false);
    assert.strictEqual(hotmailRes.error, expectedError);

    const liveRes = validateAllowedEmail("test@live.com");
    assert.strictEqual(liveRes.isValid, false);
    assert.strictEqual(liveRes.error, expectedError);
  });

  it("refuse les adresses email jetables et temporaires", () => {
    const expectedError = "Utilisez une adresse Gmail, iCloud ou votre adresse email professionnelle.";

    const yopmailRes = validateAllowedEmail("spam@yopmail.com");
    assert.strictEqual(yopmailRes.isValid, false);
    assert.strictEqual(yopmailRes.error, expectedError);

    const mailinatorRes = validateAllowedEmail("user@mailinator.com");
    assert.strictEqual(mailinatorRes.isValid, false);
    assert.strictEqual(mailinatorRes.error, expectedError);
  });

  it("refuse les formats invalides sans @ ou sans domaine", () => {
    assert.strictEqual(validateAllowedEmail("invalide").isValid, false);
    assert.strictEqual(validateAllowedEmail("invalide@").isValid, false);
    assert.strictEqual(validateAllowedEmail("@domaine.com").isValid, false);
  });
});
