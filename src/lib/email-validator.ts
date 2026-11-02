/**
 * Utilitaires de validation d'adresses email pour Sama Facture.
 * Règle stricte :
 * - Accepte uniquement Gmail (@gmail.com, @googlemail.com)
 * - Accepte uniquement iCloud (@icloud.com, @me.com, @mac.com)
 * - Accepte les adresses professionnelles d'entreprise (ex: contact@entreprise.sn, nom@societe.com)
 * - Refuse les autres messageries gratuites (Yahoo, Outlook, Hotmail, etc.) et les emails jetables.
 */

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  domain?: string;
}

// Domaines de messageries gratuites grand public interdits
const BLOCKED_FREE_PROVIDERS = new Set([
  "yahoo.com",
  "yahoo.fr",
  "ymail.com",
  "yahoo.co.uk",
  "yahoo.ca",
  "outlook.com",
  "outlook.fr",
  "hotmail.com",
  "hotmail.fr",
  "live.com",
  "live.fr",
  "msn.com",
  "aol.com",
  "aol.fr",
  "proton.me",
  "protonmail.com",
  "protonmail.ch",
  "zoho.com",
  "zoho.eu",
  "gmx.com",
  "gmx.fr",
  "gmx.de",
  "gmx.net",
  "mail.com",
  "laposte.net",
  "orange.fr",
  "wanadoo.fr",
  "sfr.fr",
  "free.fr",
  "bbox.fr",
  "tutanota.com",
  "tuta.com",
  "tuta.io",
  "mail.ru",
  "yandex.com",
  "yandex.ru",
]);

// Fournisseurs d'adresses temporaires / jetables interdits
const BLOCKED_DISPOSABLE_PROVIDERS = new Set([
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "cool.fr.nf",
  "jetable.fr.nf",
  "mailinator.com",
  "tempmail.com",
  "temp-mail.org",
  "guerrillamail.com",
  "10minutemail.com",
  "trashmail.com",
  "trashmail.net",
  "throwawaymail.com",
  "sharklasers.com",
  "dispostable.com",
  "getairmail.com",
  "fakemailgenerator.com",
  "mohmal.com",
  "generator.email",
]);

export function validateAllowedEmail(email: string): EmailValidationResult {
  if (!email || typeof email !== "string") {
    return { isValid: false, error: "Veuillez saisir une adresse email." };
  }

  const trimmed = email.trim().toLowerCase();

  // 1. Syntaxe email standard RFC 5322
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: "Format d'adresse email invalide." };
  }

  const parts = trimmed.split("@");
  if (parts.length !== 2) {
    return { isValid: false, error: "Format d'adresse email invalide." };
  }

  const domain = parts[1];

  // 2. Vérification des fournisseurs autorisés explicitement
  const isGmail = domain === "gmail.com" || domain === "googlemail.com";
  const isICloud = domain === "icloud.com" || domain === "me.com" || domain === "mac.com";

  if (isGmail || isICloud) {
    return { isValid: true, domain };
  }

  // 3. Vérification des fournisseurs interdits
  if (BLOCKED_FREE_PROVIDERS.has(domain) || BLOCKED_DISPOSABLE_PROVIDERS.has(domain)) {
    return {
      isValid: false,
      error: "Utilisez une adresse Gmail, iCloud ou votre adresse email professionnelle.",
      domain,
    };
  }

  // 4. Vérification de la structure du nom de domaine d'entreprise
  const domainParts = domain.split(".");
  if (domainParts.length < 2) {
    return { isValid: false, error: "Nom de domaine incomplet." };
  }

  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) {
    return { isValid: false, error: "Extension de nom de domaine invalide." };
  }

  // Domaine professionnel valide
  return { isValid: true, domain };
}

