/**
 * Cliente da API do paciente (pacientes-auton-api).
 * Anexa o access token do Supabase como Bearer — a API valida o JWT e escopa
 * tudo pelo paciente do token (segurança no backend).
 */
import { supabase } from "./supabase-client";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3333";

export async function apiGet(path) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) {
    // Sem sessão válida: falha cedo (a API exigiria o Bearer de qualquer forma).
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    let body = {};
    try {
      body = await res.json();
    } catch (_) {
      /* corpo não-JSON */
    }
    throw new Error(body.erro || `Erro ${res.status} ao chamar ${path}`);
  }
  return res.json();
}
