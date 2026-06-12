/**
 * Cliente Supabase real — usado SÓ para autenticação (login, sessão, troca de senha).
 * Os dados de prescrição vêm da API (pacientes-auton-api), não direto do Supabase,
 * porque a RLS do banco é para médico/admin, não para o paciente.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.REACT_APP_SUPABASE_URL;
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.error("⚠️ REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY ausentes no .env");
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/** Compat: usada por telas que verificam a sessão ativa. */
export async function verificarERenovarSessao() {
  const { data, error } = await supabase.auth.getSession();
  return { session: data?.session ?? null, error };
}
