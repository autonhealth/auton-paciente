import { apiGet } from "./api";

/**
 * Exercício físico. Fonte: solucao.treinos (via API /v1/exercicio).
 * O backend devolve um envelope { status, mensagem, exercicios[], nome_treino, ... }.
 * Aqui agrupamos por treino no shape que a tela espera: Record<treino, Exercicio[]>.
 */
export async function buscarExerciciosAgrupados(pacienteId) {
  const { treinos } = await apiGet("/v1/exercicio");
  return agruparTreinos(treinos);
}

/** Agrupa o array de exercicios do envelope `treinos` por nome de treino. */
export function agruparTreinos(treinos) {
  if (!treinos || !Array.isArray(treinos.exercicios) || treinos.exercicios.length === 0) {
    return {};
  }

  const nomePadrao = treinos.nome_treino || "Treino";
  const grupos = {};

  treinos.exercicios.forEach((ex) => {
    const grupo = ex.nome_treino || ex.treino || nomePadrao || "Sem Tipo";
    if (!grupos[grupo]) grupos[grupo] = [];
    grupos[grupo].push({
      id: ex.id ?? `${grupo}-${grupos[grupo].length}`,
      nome: ex.nome ?? ex.nome_exercicio ?? ex.exercicio ?? "",
      grupoMuscular: ex.grupo_muscular ?? ex.grupoMuscular ?? "",
      series: ex.series ?? "",
      repeticoes: ex.repeticoes ?? ex.reps ?? "",
      descanso: ex.descanso ?? ex.descanso_segundos ?? "",
      observacoes: ex.observacoes ?? ex.obs ?? "",
    });
  });

  return grupos;
}
