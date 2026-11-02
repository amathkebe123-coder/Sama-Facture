import { NextResponse, type NextRequest } from "next/server";
import { validateAllowedEmail } from "@/lib/email-validator";

interface RateLimitRecord {
  attempts: number;
  lockedUntil: number | null; // Timestamp en millisecondes
}

// Mémoire serveur partagée pour les tentatives d'authentification
const rateLimitStore = new Map<string, RateLimitRecord>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 1 minute de blocage

function getClientIdentifier(request: NextRequest, email?: string): string {
  const normalizedEmail = email ? email.trim().toLowerCase() : "";
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "client-ip";
  return normalizedEmail ? `auth:${normalizedEmail}` : `ip:${ip}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, validateEmailOnly } = body;

    // 1. Validation de l'email côté serveur si demandé
    if (validateEmailOnly && email) {
      const emailResult = validateAllowedEmail(email);
      return NextResponse.json(emailResult);
    }

    const key = getClientIdentifier(request, email);
    const now = Date.now();
    let record = rateLimitStore.get(key) || { attempts: 0, lockedUntil: null };

    // Si le temps de blocage est expiré, réinitialiser
    if (record.lockedUntil && now > record.lockedUntil) {
      record = { attempts: 0, lockedUntil: null };
      rateLimitStore.set(key, record);
    }

    // A. Action 'check' : vérifier si l'utilisateur est actuellement bloqué
    if (action === "check") {
      const isLocked = Boolean(record.lockedUntil && now < record.lockedUntil);
      const remainingSeconds = isLocked
        ? Math.ceil((record.lockedUntil! - now) / 1000)
        : 0;

      return NextResponse.json({
        isLocked,
        remainingSeconds,
        attempts: record.attempts,
        maxAttempts: MAX_ATTEMPTS,
      });
    }

    // B. Action 'record_failure' : enregistrer un échec (mauvais mot de passe ou mauvais code)
    if (action === "record_failure") {
      record.attempts += 1;

      if (record.attempts >= MAX_ATTEMPTS) {
        record.lockedUntil = now + LOCKOUT_DURATION_MS;
      }

      rateLimitStore.set(key, record);

      const isLocked = Boolean(record.lockedUntil && now < record.lockedUntil);
      const remainingSeconds = isLocked
        ? Math.ceil((record.lockedUntil! - now) / 1000)
        : 0;

      return NextResponse.json({
        isLocked,
        remainingSeconds,
        attempts: record.attempts,
        maxAttempts: MAX_ATTEMPTS,
      });
    }

    // C. Action 'reset' : réinitialiser après une connexion / validation réussie
    if (action === "reset") {
      rateLimitStore.delete(key);
      return NextResponse.json({
        isLocked: false,
        remainingSeconds: 0,
        attempts: 0,
      });
    }

    return NextResponse.json({ error: "Action non reconnue." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Erreur serveur de rate limit." },
      { status: 500 }
    );
  }
}

