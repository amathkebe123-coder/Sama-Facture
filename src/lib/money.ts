/**
 * Utilitaire de gestion des montants en FCFA (sans décimales)
 */
export function formatFCFA(amount: number | bigint): string {
  const numericAmount = typeof amount === "bigint" ? Number(amount) : amount;
  // Formatage avec séparateur de milliers espace insécable et suffixe FCFA
  const formatted = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(numericAmount);

  // Normalisation des espaces
  return `${formatted.replace(/\s/g, " ")} FCFA`;
}

export function computeLineTotal(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice);
}

export function computeInvoiceTotals(items: { quantity: number; unitPrice: number; taxRate?: number }[]) {
  const subtotal = items.reduce((acc, item) => acc + computeLineTotal(item.quantity, item.unitPrice), 0);
  const taxTotal = items.reduce((acc, item) => {
    const lineHT = computeLineTotal(item.quantity, item.unitPrice);
    const rate = item.taxRate ?? 18;
    return acc + Math.round((lineHT * rate) / 100);
  }, 0);
  const total = subtotal + taxTotal;

  return { subtotal, taxTotal, total };
}

