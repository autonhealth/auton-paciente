import { apiGet } from "./api";

const VAZIO = { suplementos: [], fitoterapicos: [], homeopatia: [], florais_bach: [] };

/**
 * Suplementos. Fonte: solucao.suplementacao (via API /v1/suplementos).
 * O backend já devolve as 4 categorias como arrays de itens estruturados
 * ({ nome, objetivo, dosagem, horario, data_inicio, data_fim, alertas_criticos }).
 */
export async function buscarSuplementacao(pacienteId) {
  const { suplementacao } = await apiGet("/v1/suplementos");
  return suplementacao ?? VAZIO;
}

export async function buscarSuplementacaoPorConsulta() {
  return buscarSuplementacao();
}
