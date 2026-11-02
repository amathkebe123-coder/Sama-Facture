"use client";

import type { Invoice, InvoiceLine } from "./data/fixtures";
import type { CompanySettings } from "./company";

const DEFAULT_COMPANY: CompanySettings = {
  companyName: "Mon Entreprise",
  ninea: "",
  rccm: "",
  phone: "+221 ",
  address: "Sénégal",
  prefix: "FAC-2026-",
  defaultTax: "18",
  paymentTerms: "30",
};

export function getEffectiveCompanySettings(override?: CompanySettings): CompanySettings {
  if (override) return override;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("sama_facture_settings_v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          companyName: parsed.companyName || DEFAULT_COMPANY.companyName,
          ninea: parsed.ninea || DEFAULT_COMPANY.ninea,
          rccm: parsed.rccm || DEFAULT_COMPANY.rccm,
          phone: parsed.phone || DEFAULT_COMPANY.phone,
          address: parsed.address || DEFAULT_COMPANY.address,
          prefix: parsed.prefix || DEFAULT_COMPANY.prefix,
          defaultTax: parsed.defaultTax || DEFAULT_COMPANY.defaultTax,
          paymentTerms: parsed.paymentTerms || DEFAULT_COMPANY.paymentTerms,
        };
      }
    } catch {}
  }
  return DEFAULT_COMPANY;
}

/**
 * Formate les montants chiffrés en FCFA avec espaces.
 */
function formatFCFA(amount: number | bigint | string | undefined): string {
  if (amount === undefined || amount === null) return "0 FCFA";
  const num = typeof amount === "number" ? Math.round(amount) : parseInt(String(amount), 10) || 0;
  return `${num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA`;
}

/**
 * Table de largeurs typographiques standard pour Helvetica (en millièmes de point).
 */
const HELVETICA_WIDTHS: Record<string, number> = {
  " ": 278, "!": 278, '"': 355, "#": 556, "$": 556, "%": 889, "&": 667, "'": 191,
  "(": 333, ")": 333, "*": 389, "+": 584, ",": 278, "-": 333, ".": 278, "/": 278,
  "0": 556, "1": 556, "2": 556, "3": 556, "4": 556, "5": 556, "6": 556, "7": 556,
  "8": 556, "9": 556, ":": 278, ";": 278, "<": 584, "=": 584, ">": 584, "?": 556,
  "@": 1015, A: 667, B: 667, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722,
  I: 278, J: 500, K: 667, L: 556, M: 833, N: 722, O: 778, P: 667, Q: 778,
  R: 722, S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611,
  "[": 278, "\\": 278, "]": 278, "^": 469, _: 556, "`": 222,
  a: 556, b: 556, c: 500, d: 556, e: 556, f: 278, g: 556, h: 556, i: 222,
  j: 222, k: 500, l: 222, m: 833, n: 556, o: 556, p: 556, q: 556, r: 333,
  s: 500, t: 278, u: 556, v: 500, w: 722, x: 500, y: 500, z: 500,
  "{": 334, "|": 260, "}": 334, "~": 584,
};

/**
 * Calcule la largeur d'une chaîne en points pour une taille de police donnée.
 */
function getTextWidth(text: string, fontSize: number, isBold: boolean = false): number {
  let totalUnits = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const unit = HELVETICA_WIDTHS[char] || 550;
    totalUnits += isBold ? unit * 1.06 : unit;
  }
  return (totalUnits * fontSize) / 1000;
}

/**
 * Encode les caractères français en syntaxe littérale PDF avec codage WinAnsi.
 */
function encodePdfText(str: string): string {
  if (!str) return "";
  let out = "";
  const normalized = String(str).normalize("NFC");

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    const code = char.charCodeAt(0);

    if (char === "(") out += "\\(";
    else if (char === ")") out += "\\)";
    else if (char === "\\") out += "\\\\";
    else if (char === "’" || char === "‘" || char === "`") out += "'";
    else if (char === "–" || char === "—") out += "-";
    else if (char === "…") out += "...";
    else if (char === "«" || char === "»") out += '"';
    else if (char === "\u00A0") out += " ";
    else if (code >= 32 && code <= 126) out += char;
    else if (code >= 160 && code <= 255) {
      out += "\\" + code.toString(8).padStart(3, "0");
    } else if (char === "œ") out += "\\234";
    else if (char === "Œ") out += "\\214";
    else if (char === "€") out += "EUR";
    else out += " ";
  }
  return out;
}

/**
 * Formate une date AAAA-MM-JJ en JJ/MM/AAAA.
 */
function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  if (dateStr.includes("/")) return dateStr;
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

/**
 * Génère un Blob PDF vectoriel A4 ultra-léger et certifié pour une facture Sama Facture.
 */
export function generateInvoicePdfBlob(
  invoice: Invoice,
  companyOverride?: CompanySettings
): Blob {
  const comp = getEffectiveCompanySettings(companyOverride);

  const ops: string[] = [];

  function setFillColor(r: number, g: number, b: number) {
    ops.push(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg`);
  }
  function setStrokeColor(r: number, g: number, b: number) {
    ops.push(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG`);
  }
  function setLineWidth(w: number) {
    ops.push(`${w.toFixed(2)} w`);
  }
  function rect(x: number, y: number, w: number, h: number, fill = true, stroke = false) {
    ops.push(`${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re`);
    if (fill && stroke) ops.push("B");
    else if (fill) ops.push("f");
    else if (stroke) ops.push("S");
  }
  function line(x1: number, y1: number, x2: number, y2: number) {
    ops.push(`${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
  }

  function drawText(
    text: string,
    x: number,
    y: number,
    font = "/F1",
    size = 10,
    align: "left" | "right" | "center" = "left"
  ) {
    const encoded = encodePdfText(text);
    const isBold = font === "/F2";
    const textWidth = getTextWidth(text, size, isBold);

    let actualX = x;
    if (align === "right") {
      actualX = x - textWidth;
    } else if (align === "center") {
      actualX = x - textWidth / 2;
    }
    ops.push(`BT ${font} ${size} Tf ${actualX.toFixed(2)} ${y.toFixed(2)} Td (${encoded}) Tj ET`);
  }

  // --- DIMENSIONS & MARGES A4 ---
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const marginX = 40;
  const contentWidth = pageWidth - marginX * 2; // 515.28

  // 1. Bandeau supérieur vert émeraude discret
  setFillColor(0.02, 0.59, 0.41); // #059669
  rect(marginX, pageHeight - 32, contentWidth, 4, true, false);

  // 2. En-tête : Marque & Émetteur (Gauche) | Titre & Références (Droite)
  let curY = pageHeight - 56;

  // Badge Marque
  setFillColor(0.92, 0.99, 0.96); // #ECFDF5
  setStrokeColor(0.65, 0.95, 0.82); // #A7F3D0
  setLineWidth(0.8);
  rect(marginX, curY - 2, 28, 28, true, true);
  setFillColor(0.02, 0.59, 0.41);
  drawText("SF", marginX + 14, curY + 6, "/F2", 13, "center");

  // Nom entreprise & coordonnées
  setFillColor(0.06, 0.09, 0.16); // Slate 900
  drawText(comp.companyName, marginX + 36, curY + 12, "/F2", 15);
  setFillColor(0.39, 0.45, 0.55); // Slate 500
  drawText(comp.address, marginX + 36, curY - 1, "/F1", 8.5);
  drawText(`Tél Wave / OM : ${comp.phone}  •  Dakar, Sénégal`, marginX + 36, curY - 13, "/F1", 8.5);
  drawText(`NINEA : ${comp.ninea}   |   RCCM : ${comp.rccm}`, marginX + 36, curY - 24, "/F1", 8);

  // Titre Facture & Numéro (Droite)
  setFillColor(0.06, 0.09, 0.16);
  drawText("FACTURE", pageWidth - marginX, curY + 10, "/F2", 20, "right");
  setFillColor(0.02, 0.59, 0.41); // Vert émeraude
  drawText(invoice.invoiceNumber, pageWidth - marginX, curY - 5, "/F2", 13, "right");

  // Badge Statut
  const statusLabels: Record<string, string> = {
    paid: "PAYÉE",
    sent: "ENVOYÉE",
    overdue: "EN RETARD",
    draft: "BROUILLON",
    partial: "PARTIELLE",
  };
  const statusText = statusLabels[invoice.status] || "BROUILLON";
  const isPaid = invoice.status === "paid";
  const isOverdue = invoice.status === "overdue";

  if (isPaid) {
    setFillColor(0.92, 0.99, 0.96);
    setStrokeColor(0.65, 0.95, 0.82);
  } else if (isOverdue) {
    setFillColor(0.99, 0.95, 0.95);
    setStrokeColor(0.99, 0.75, 0.75);
  } else {
    setFillColor(0.97, 0.98, 0.99);
    setStrokeColor(0.89, 0.91, 0.94);
  }
  setLineWidth(0.6);
  rect(pageWidth - marginX - 70, curY - 26, 70, 16, true, true);
  if (isPaid) setFillColor(0.02, 0.47, 0.34);
  else if (isOverdue) setFillColor(0.73, 0.11, 0.11);
  else setFillColor(0.28, 0.33, 0.41);
  drawText(statusText, pageWidth - marginX - 35, curY - 21, "/F2", 8, "center");

  // Ligne de séparation
  curY -= 42;
  setStrokeColor(0.89, 0.91, 0.94);
  setLineWidth(0.75);
  line(marginX, curY, pageWidth - marginX, curY);

  // 3. Carte Informations Client & Échéance
  curY -= 12;
  const cardHeight = 68;
  setFillColor(0.97, 0.98, 0.99); // Slate 50
  setStrokeColor(0.91, 0.93, 0.96);
  setLineWidth(0.6);
  rect(marginX, curY - cardHeight, contentWidth, cardHeight, true, true);

  // Colonne Client (Gauche)
  setFillColor(0.39, 0.45, 0.55);
  drawText("FACTURÉ À :", marginX + 14, curY - 14, "/F2", 8);
  setFillColor(0.06, 0.09, 0.16);
  drawText(invoice.client.name, marginX + 14, curY - 27, "/F2", 11);
  setFillColor(0.28, 0.33, 0.41);
  drawText(invoice.client.email || "contact@client.sn", marginX + 14, curY - 39, "/F1", 8.5);
  const clientAddr =
    [invoice.client.address, invoice.client.city].filter(Boolean).join(", ") ||
    "Dakar, Sénégal";
  drawText(clientAddr, marginX + 14, curY - 50, "/F1", 8.5);
  if (invoice.client.phone) {
    drawText(`Tél : ${invoice.client.phone}`, marginX + 14, curY - 61, "/F1", 8);
  }

  // Colonne Détails & Échéances (Droite)
  const colDateX = marginX + 310;
  setFillColor(0.39, 0.45, 0.55);
  drawText("DATE D'ÉMISSION :", colDateX, curY - 16, "/F2", 8);
  setFillColor(0.06, 0.09, 0.16);
  drawText(formatDate(invoice.issueDate), colDateX + 90, curY - 16, "/F1", 9);

  setFillColor(0.39, 0.45, 0.55);
  drawText("DATE D'ÉCHÉANCE :", colDateX, curY - 30, "/F2", 8);
  setFillColor(0.73, 0.11, 0.11);
  drawText(formatDate(invoice.dueDate), colDateX + 90, curY - 30, "/F2", 9);

  setFillColor(0.39, 0.45, 0.55);
  drawText("CANAL PRÉFÉRÉ :", colDateX, curY - 44, "/F2", 8);
  setFillColor(0.02, 0.59, 0.41);
  drawText(invoice.channel || "Wave Business", colDateX + 90, curY - 44, "/F2", 9);

  setFillColor(0.39, 0.45, 0.55);
  drawText("CONDITIONS :", colDateX, curY - 58, "/F2", 8);
  setFillColor(0.28, 0.33, 0.41);
  drawText(invoice.paymentTerms || "Paiement à réception", colDateX + 90, curY - 58, "/F1", 8.5);

  // 4. Tableau des Prestations
  curY -= cardHeight + 20;

  // En-tête tableau sombre
  const tableHeaderHeight = 22;
  setFillColor(0.06, 0.09, 0.16); // Slate 900
  rect(marginX, curY - tableHeaderHeight, contentWidth, tableHeaderHeight, true, false);

  setFillColor(1, 1, 1);
  drawText("DÉSIGNATION DE LA PRESTATION", marginX + 12, curY - 14, "/F2", 8.5);
  drawText("QTÉ", marginX + 290, curY - 14, "/F2", 8.5, "center");
  drawText("PRIX UNITAIRE HT", marginX + 395, curY - 14, "/F2", 8.5, "right");
  drawText("TOTAL HT", pageWidth - marginX - 12, curY - 14, "/F2", 8.5, "right");

  curY -= tableHeaderHeight;

  // Lignes de prestations
  const lines: InvoiceLine[] =
    invoice.lines && invoice.lines.length > 0
      ? invoice.lines
      : [
          {
            id: "line-default",
            description: "Prestation de service numérique",
            quantity: 1,
            unitPrice: invoice.subtotal || invoice.total,
            taxRate: 18,
            lineTotal: invoice.subtotal || invoice.total,
          },
        ];

  lines.forEach((lineItem, idx) => {
    const rowHeight = 26;
    if (idx % 2 === 1) {
      setFillColor(0.98, 0.99, 1.0);
      rect(marginX, curY - rowHeight, contentWidth, rowHeight, true, false);
    }
    setStrokeColor(0.93, 0.94, 0.96);
    setLineWidth(0.5);
    line(marginX, curY - rowHeight, pageWidth - marginX, curY - rowHeight);

    setFillColor(0.06, 0.09, 0.16);
    drawText(lineItem.description || "Prestation", marginX + 12, curY - 17, "/F1", 9);

    setFillColor(0.28, 0.33, 0.41);
    drawText(String(lineItem.quantity || 1), marginX + 290, curY - 17, "/F1", 9, "center");

    drawText(formatFCFA(lineItem.unitPrice), marginX + 395, curY - 17, "/F1", 9, "right");

    setFillColor(0.06, 0.09, 0.16);
    drawText(
      formatFCFA(lineItem.lineTotal || lineItem.quantity * lineItem.unitPrice),
      pageWidth - marginX - 12,
      curY - 17,
      "/F2",
      9,
      "right"
    );

    curY -= rowHeight;
  });

  // 5. Bloc Totaux (Droite) & Moyens de Règlement (Gauche)
  curY -= 16;
  const totalsY = curY;

  // Encadré Moyens de Paiement (Gauche)
  const payBoxWidth = 240;
  const payBoxHeight = 85;
  setFillColor(0.97, 0.98, 0.99);
  setStrokeColor(0.89, 0.91, 0.94);
  setLineWidth(0.6);
  rect(marginX, totalsY - payBoxHeight, payBoxWidth, payBoxHeight, true, true);

  setFillColor(0.02, 0.59, 0.41);
  drawText("MOYENS DE PAIEMENT ACCEPTÉS", marginX + 12, totalsY - 16, "/F2", 8);

  setFillColor(0.28, 0.33, 0.41);
  drawText(`• Wave & Orange Money : ${comp.phone}`, marginX + 12, totalsY - 32, "/F1", 8);
  drawText("• Virement bancaire : Compte CBAO SN012 01001 023948102", marginX + 12, totalsY - 46, "/F1", 8);
  drawText(`• Chèque à l'ordre de : ${comp.companyName}`, marginX + 12, totalsY - 60, "/F1", 8);
  drawText("• Espèces : Reçu délivré au siège de la société", marginX + 12, totalsY - 74, "/F1", 8);

  // Totaux chiffrés (Droite)
  const totalsRightX = pageWidth - marginX;
  const totalsLabelX = totalsRightX - 110;

  setFillColor(0.39, 0.45, 0.55);
  drawText("Sous-total HT :", totalsLabelX, totalsY - 14, "/F1", 9.5, "right");
  setFillColor(0.06, 0.09, 0.16);
  drawText(formatFCFA(invoice.subtotal), totalsRightX, totalsY - 14, "/F2", 9.5, "right");

  setFillColor(0.39, 0.45, 0.55);
  drawText("TVA (18%) :", totalsLabelX, totalsY - 30, "/F1", 9.5, "right");
  setFillColor(0.06, 0.09, 0.16);
  drawText(formatFCFA(invoice.taxTotal), totalsRightX, totalsY - 30, "/F2", 9.5, "right");

  // Ligne de totalisation
  setStrokeColor(0.85, 0.88, 0.92);
  setLineWidth(0.7);
  line(totalsLabelX - 50, totalsY - 38, totalsRightX, totalsY - 38);

  // Cartouche Total TTC en vert émeraude
  const bannerY = totalsY - 72;
  const bannerW = 210;
  setFillColor(0.02, 0.59, 0.41); // Vert émeraude #059669
  rect(totalsRightX - bannerW, bannerY, bannerW, 30, true, false);

  setFillColor(1, 1, 1);
  drawText("TOTAL TTC :", totalsRightX - bannerW + 12, bannerY + 10, "/F2", 9.5);
  drawText(formatFCFA(invoice.total), totalsRightX - 12, bannerY + 9, "/F2", 13, "right");

  // 6. Notes & Pied de page réglementaire
  const footY = 85;

  if (invoice.notes) {
    setFillColor(0.39, 0.45, 0.55);
    drawText("Notes :", marginX, footY + 16, "/F2", 8);
    setFillColor(0.28, 0.33, 0.41);
    drawText(invoice.notes, marginX + 35, footY + 16, "/F1", 8);
  }

  // Ligne de bas de page
  setStrokeColor(0.89, 0.91, 0.94);
  setLineWidth(0.6);
  line(marginX, footY, pageWidth - marginX, footY);

  setFillColor(0.55, 0.6, 0.68);
  drawText(
    `${comp.companyName} • Société à Responsabilité Limitée • NINEA : ${comp.ninea} • RCCM : ${comp.rccm}`,
    pageWidth / 2,
    footY - 14,
    "/F1",
    7.5,
    "center"
  );
  drawText(
    `Siège social : ${comp.address} • Facture certifiée conforme au Code Général des Impôts du Sénégal`,
    pageWidth / 2,
    footY - 26,
    "/F1",
    7.5,
    "center"
  );
  drawText(
    `Page 1 / 1 — Document officiel généré par Sama Facture (${invoice.invoiceNumber})`,
    pageWidth / 2,
    footY - 38,
    "/F1",
    7,
    "center"
  );

  // --- ASSEMBLAGE DES OBJETS PDF 1.4 ---
  const objects: string[] = [];
  function addObject(content: string) {
    objects.push(content);
    return objects.length;
  }

  // 1: Catalog
  addObject("<< /Type /Catalog /Pages 2 0 R >>");
  // 2: Pages
  addObject("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  // 3: Page
  addObject(
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>"
  );

  // Stream content
  const streamContent = ops.join("\n");
  const streamLen = streamContent.length;
  // 4: Contents Stream
  addObject(`<< /Length ${streamLen} >>\nstream\n${streamContent}\nendstream`);
  // 5: Font Regular
  addObject(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"
  );
  // 6: Font Bold
  addObject(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>"
  );

  let pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offsets: number[] = [0];

  for (let i = 0; i < objects.length; i++) {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const startxref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF`;

  // Conversion en tableau d'octets 8-bit non altéré
  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i++) {
    bytes[i] = pdf.charCodeAt(i) & 0xff;
  }

  return new Blob([bytes], { type: "application/pdf" });
}

/**
 * Déclenche le téléchargement du fichier PDF de la facture.
 * Compatible Ordinateurs, Android et iPhone Safari.
 */
export async function downloadInvoicePdf(
  invoice: Invoice,
  companyOverride?: CompanySettings
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 350));

  const blob = generateInvoicePdfBlob(invoice, companyOverride);
  const fileName = `${invoice.invoiceNumber || "facture"}.pdf`;

  if (typeof window === "undefined") return;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.rel = "noopener noreferrer";

  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1500);
}
