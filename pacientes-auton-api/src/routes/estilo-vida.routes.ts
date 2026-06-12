import type { FastifyInstance } from "fastify";
import { autenticarPaciente } from "@/middlewares/auth";
import { buscarUltimaSolucao, buscarUltimoDiagnostico } from "@/services/paciente.service";
import {
  adaptRefeicao,
  adaptSuplementacao,
  adaptMentalidade,
  adaptTreinos,
  moduloVisivel,
} from "@/lib/adapters";

/**
 * Módulos de estilo de vida — leem a última `solucao` do paciente e respeitam
 * `itens_visiveis` (o médico controla o que aparece no app). Tudo escopado pelo
 * paciente do token (request.paciente.id).
 */
export async function estiloVidaRouter(app: FastifyInstance) {
  app.addHook("preHandler", autenticarPaciente);

  app.get("/alimentacao", async (request) => {
    const solucao = await buscarUltimaSolucao(request.paciente!.id);
    const visivel = moduloVisivel(solucao?.itensVisiveis, "alimentacao");
    return { visivel, refeicao: visivel ? adaptRefeicao(solucao?.refeicao) : null };
  });

  app.get("/suplementos", async (request) => {
    const solucao = await buscarUltimaSolucao(request.paciente!.id);
    const visivel = moduloVisivel(solucao?.itensVisiveis, "suplementacao");
    return { visivel, suplementacao: visivel ? adaptSuplementacao(solucao?.suplementacao) : null };
  });

  app.get("/livro-da-vida", async (request) => {
    const solucao = await buscarUltimaSolucao(request.paciente!.id);
    const visivel = moduloVisivel(solucao?.itensVisiveis, "livro_vida");
    const dados = visivel
      ? adaptMentalidade(solucao?.mentalidade)
      : { resumo_executivo: "", padroes: [], higiene_sono: null };
    return { visivel, ...dados };
  });

  app.get("/exercicio", async (request) => {
    const solucao = await buscarUltimaSolucao(request.paciente!.id);
    const visivel = moduloVisivel(solucao?.itensVisiveis, "treinamentos");
    return { visivel, treinos: visivel ? adaptTreinos(solucao?.treinos) : null };
  });

  // Metas (água/exercício/sono) — diagnostico.habitos_vida.meta_*.
  // null = sem meta (NUNCA 0). Extrai o primeiro número da string.
  app.get("/metas", async (request) => {
    const diag = (await buscarUltimoDiagnostico(request.paciente!.id)) as { habitos_vida?: Record<string, unknown> } | null;
    const h = diag?.habitos_vida ?? {};
    const num = (v: unknown): number | null => {
      if (v === null || v === undefined || v === "") return null;
      const m = String(v).replace(",", ".").match(/[\d.]+/);
      const n = m ? Number(m[0]) : NaN;
      return Number.isFinite(n) ? n : null;
    };
    return {
      meta_agua_ml: num(h.meta_agua_ml),
      meta_exercicio_min: num(h.meta_exercicio_min),
      meta_sono_horas: num(h.meta_sono_horas),
    };
  });
}
