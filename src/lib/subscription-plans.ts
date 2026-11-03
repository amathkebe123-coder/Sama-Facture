export type SubscriptionPlanId = "monthly" | "six_months" | "yearly";

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  durationLabel: string;
  amount: number; // Montant entier en FCFA
  description: string;
  badge?: string;
  features: string[];
}

/**
 * Constante unique des offres d'abonnement Yomb Facture.
 * Tout changement de tarif doit être effectué ici.
 */
export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanId, SubscriptionPlan> = {
  monthly: {
    id: "monthly",
    name: "Mensuel",
    durationLabel: "1 mois",
    amount: 3900,
    description: "Idéal pour tester ou pour les besoins ponctuels",
    features: [
      "Factures illimitées en FCFA",
      "Calcul automatique TVA 18%",
      "PDF certifiés prêts à l'envoi",
      "Paiements Wave & Orange Money",
      "Support standard par email",
    ],
  },
  six_months: {
    id: "six_months",
    name: "Semestriel",
    durationLabel: "6 mois",
    amount: 22000,
    description: "La formule la plus populaire pour les consultants et PME",
    badge: "Populaire",
    features: [
      "Toutes les fonctionnalités Mensuel",
      "Économisez 1 400 FCFA par rapport au mois",
      "Rapports de trésorerie & TVA",
      "Historique complet des encaissements",
      "Support prioritaire",
    ],
  },
  yearly: {
    id: "yearly",
    name: "Annuel",
    durationLabel: "1 an",
    amount: 45000,
    description: "Sérénité totale et rentabilité maximale toute l'année",
    badge: "Meilleure valeur",
    features: [
      "Toutes les fonctionnalités Semestriel",
      "Économisez 1 800 FCFA (soit 3 750 FCFA/mois)",
      "Accès anticipé aux nouveautés",
      "Export comptable complet",
      "Support VIP direct WhatsApp",
    ],
  },
};

/**
 * Vérifie si un identifiant de plan est autorisé
 */
export function isValidPlanId(plan: any): plan is SubscriptionPlanId {
  return typeof plan === "string" && (plan === "monthly" || plan === "six_months" || plan === "yearly");
}

