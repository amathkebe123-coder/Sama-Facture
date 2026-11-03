import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Récupérer l'utilisateur de manière sécurisée côté serveur
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Pages publiques : landing page ("/"), authentification et routes API
  const isPublicRoute =
    pathname === "/" ||
    pathname === "/connexion" ||
    pathname === "/inscription" ||
    pathname === "/verification-email" ||
    pathname === "/mot-de-passe-oublie" ||
    pathname === "/reinitialisation-mot-de-passe" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api");

  // 1. Rediriger les utilisateurs non connectés vers la page de connexion pour toute page protégée
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    return NextResponse.redirect(url);
  }

  // 2. Rediriger un utilisateur déjà connecté qui ouvre la landing page ("/") ou les pages d'auth vers le dashboard
  if (
    user &&
    (pathname === "/" || pathname === "/connexion" || pathname === "/inscription")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Exclure explicitement de l'exécution du middleware :
     * - _next/static (fichiers compilés statiques : JS, CSS, media)
     * - _next/image (optimisation d'images Next.js)
     * - favicon.ico et icônes
     * - tous les fichiers avec extension statique (*.css, *.js, *.svg, *.png, *.jpg, *.jpeg, *.gif, *.webp, *.ico, *.woff, *.woff2)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:css|js|svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)",
  ],
};

