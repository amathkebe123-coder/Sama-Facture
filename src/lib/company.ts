"use client";

export interface CompanySettings {
  companyName: string;
  ninea: string;
  rccm: string;
  phone: string;
  address: string;
  prefix: string;
  defaultTax: string;
  paymentTerms: string;
}

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  companyName: "",
  ninea: "",
  rccm: "",
  phone: "+221 ",
  address: "",
  prefix: "FAC-2026-",
  defaultTax: "18",
  paymentTerms: "30",
};

export const SETTINGS_STORAGE_KEY = "sama_facture_settings_v1";

/**
 * Récupère les paramètres de l'entreprise depuis le stockage local (avec fallback serveur et défaut)
 */
export function getCompanySettings(): CompanySettings {
  if (typeof window === "undefined") {
    return DEFAULT_COMPANY_SETTINGS;
  }

  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_COMPANY_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      companyName: parsed.companyName || DEFAULT_COMPANY_SETTINGS.companyName,
      ninea: parsed.ninea || DEFAULT_COMPANY_SETTINGS.ninea,
      rccm: parsed.rccm || DEFAULT_COMPANY_SETTINGS.rccm,
      phone: parsed.phone || DEFAULT_COMPANY_SETTINGS.phone,
      address: parsed.address || DEFAULT_COMPANY_SETTINGS.address,
      prefix: parsed.prefix || DEFAULT_COMPANY_SETTINGS.prefix,
      defaultTax: parsed.defaultTax || DEFAULT_COMPANY_SETTINGS.defaultTax,
      paymentTerms: parsed.paymentTerms || DEFAULT_COMPANY_SETTINGS.paymentTerms,
    };
  } catch {
    return DEFAULT_COMPANY_SETTINGS;
  }
}

/**
 * Sauvegarde les paramètres de l'entreprise
 */
export function saveCompanySettings(settings: CompanySettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event("sama_facture_settings_updated"));
  } catch (e) {
    console.error("Erreur lors de la sauvegarde des paramètres:", e);
  }
}

