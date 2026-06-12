import { apiGet } from "./api";

/**
 * Livro da Vida. Fonte: solucao.mentalidade (via API /v1/livro-da-vida).
 * O backend adapta padrao_01..10 para o shape da tela
 * ({ nome, prioridade, manifestacoes, origens, orientacoes }) + resumo_executivo.
 */
export async function buscarLivroDaVida(pacienteId) {
  const data = await apiGet("/v1/livro-da-vida");
  return {
    resumo_executivo: data.resumo_executivo ?? "",
    padroes: data.padroes ?? [],
    higiene_sono: data.higiene_sono ?? null,
  };
}

export async function buscarLivroDaVidaPorConsulta() {
  return buscarLivroDaVida();
}
