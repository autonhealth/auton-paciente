import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase-client";
import { apiGet } from "../lib/api";

const PacienteContext = createContext(null);

// Visível por padrão; o médico oculta marcando false em solucao.itens_visiveis.
const VISIBILIDADE_DEFAULT = { livro_vida: true, alimentacao: true, suplementacao: true, treinamentos: true };

/**
 * Normaliza o paciente vindo da API (camelCase / pt-BR) e expõe também os
 * aliases que algumas telas usam (Dashboard usa name/birth_date; Perfil usa
 * nome/telefone/data_nascimento). Assim nenhuma página precisa mudar.
 */
function normalizar(p) {
  if (!p) return null;
  const nome = p.nome ?? p.name ?? "";
  const telefone = p.telefone ?? p.phone ?? "";
  const nascimento = p.dataNascimento ?? p.data_nascimento ?? p.birth_date ?? null;
  const userAuth = p.usuarioAuth ?? p.usuario_auth ?? p.user_auth ?? null;
  return {
    ...p,
    id: p.id,
    email: p.email ?? "",
    nome,
    name: nome,
    telefone,
    phone: telefone,
    data_nascimento: nascimento,
    birth_date: nascimento,
    user_auth: userAuth,
    usuario_auth: userAuth,
    cpf: p.cpf ?? "",
  };
}

export function PacienteProvider({ children }) {
  const [paciente, setPaciente] = useState(null);
  const [visibilidade, setVisibilidade] = useState(VISIBILIDADE_DEFAULT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setPaciente(null);
        setVisibilidade(VISIBILIDADE_DEFAULT);
        return;
      }
      const { paciente: p, visibilidade: vis } = await apiGet("/v1/paciente/me");
      setPaciente(normalizar(p));
      setVisibilidade(vis ?? VISIBILIDADE_DEFAULT);
    } catch (e) {
      setError(e.message || "Erro ao carregar paciente");
      setPaciente(null);
      setVisibilidade(VISIBILIDADE_DEFAULT);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) carregar();
      else setPaciente(null);
    });
    return () => subscription?.unsubscribe();
  }, [carregar]);

  return (
    <PacienteContext.Provider value={{ paciente, visibilidade, loading, error, refetchPaciente: carregar }}>
      {children}
    </PacienteContext.Provider>
  );
}

export function usePaciente() {
  const ctx = useContext(PacienteContext);
  if (!ctx) {
    throw new Error("usePaciente deve ser usado dentro de PacienteProvider");
  }
  return ctx;
}
