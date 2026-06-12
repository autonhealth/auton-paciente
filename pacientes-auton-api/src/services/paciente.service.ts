import { supabaseAdmin } from "@/lib";

/**
 * Acesso a dados do paciente via supabase-js (service_role). TODAS as funções
 * recebem o pacienteId já resolvido a partir do token (ver autenticarPaciente).
 * O alias `itensVisiveis:itens_visiveis` devolve o campo em camelCase para os adaptadores.
 */

/** Última solução (plano de tratamento) — fonte dos 4 módulos de estilo de vida. */
export async function buscarUltimaSolucao(pacienteId: string) {
  const { data, error } = await supabaseAdmin
    .from("solucao")
    .select("refeicao, suplementacao, mentalidade, treinos, itensVisiveis:itens_visiveis, criado_em")
    .eq("paciente_id", pacienteId)
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Erro ao buscar solucao: ${error.message}`);
  return data;
}

/** Último diagnóstico do paciente — fonte das metas (habitos_vida.meta_*). */
export async function buscarUltimoDiagnostico(pacienteId: string) {
  const { data, error } = await supabaseAdmin
    .from("diagnostico")
    .select("habitos_vida, criado_em")
    .eq("paciente_id", pacienteId)
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Erro ao buscar diagnostico: ${error.message}`);
  return data;
}

/** Protocolos alimentares ativos emitidos para o paciente (snapshots). */
export async function buscarProtocolosAlimentares(pacienteId: string) {
  const { data, error } = await supabaseAdmin
    .from("protocolos_alimentares_paciente")
    .select("*")
    .eq("paciente_id", pacienteId)
    .eq("ativo", true)
    .order("criado_em", { ascending: false });
  if (error) throw new Error(`Erro ao buscar protocolos: ${error.message}`);
  return data ?? [];
}

/** Prescrições emitidas para o paciente (snapshots). */
export async function buscarPrescricoes(pacienteId: string) {
  const { data, error } = await supabaseAdmin
    .from("prescricoes_paciente")
    .select("*")
    .eq("paciente_id", pacienteId)
    .order("criado_em", { ascending: false });
  if (error) throw new Error(`Erro ao buscar prescricoes: ${error.message}`);
  return data ?? [];
}
