import { jwtVerify, createRemoteJWKSet, type JWTPayload } from "jose";
import { env } from "@/config/env";

// Cache do JWKS remoto (chaves públicas do Supabase Auth).
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks() {
  if (!env.SUPABASE_URL) return null;
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`));
  }
  return jwks;
}

/**
 * Verifica o access token do Supabase e devolve o payload.
 * Prioriza JWKS (assimétrico); cai para HS256 (segredo compartilhado) se configurado.
 * Lança erro se o token for inválido/expirado ou se nada estiver configurado.
 */
export async function verificarTokenSupabase(token: string): Promise<JWTPayload> {
  const set = getJwks();
  if (set) {
    const { payload } = await jwtVerify(token, set);
    return payload;
  }
  if (env.SUPABASE_JWT_SECRET) {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(env.SUPABASE_JWT_SECRET), {
      algorithms: ["HS256"],
    });
    return payload;
  }
  throw new Error(
    "Auth não configurada: defina SUPABASE_URL (JWKS) ou SUPABASE_JWT_SECRET (HS256) no .env"
  );
}
