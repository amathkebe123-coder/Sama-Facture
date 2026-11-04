import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.APP_URL || "https://sama-facture-one.vercel.app")
    .trim()
    .replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/connexion", "/inscription", "/aide"],
        disallow: [
          "/dashboard",
          "/dashboard/*",
          "/factures",
          "/factures/*",
          "/clients",
          "/clients/*",
          "/produits",
          "/produits/*",
          "/paiements",
          "/paiements/*",
          "/rapports",
          "/rapports/*",
          "/parametres",
          "/parametres/*",
          "/abonnement",
          "/abonnement/*",
          "/api/*",
          "/auth/*",
          "/verification-email",
          "/mot-de-passe-oublie",
          "/reinitialisation-mot-de-passe",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

