import { createClient } from "@supabase/supabase-js";
import { env } from "@/config/env";

/**
 * Cliente admin (service_role) — server-side. Acessa o banco ignorando RLS,
 * assim como o Prisma faria. A segurança por-paciente é garantida no código
 * (middleware autenticarPaciente + escopo por usuario_auth). NUNCA expor esta
 * chave no front.
 */
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
