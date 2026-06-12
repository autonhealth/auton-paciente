import type { FastifyInstance } from "fastify";
import { autenticarPaciente } from "@/middlewares/auth";
import { buscarUltimaSolucao } from "@/services/paciente.service";
import { moduloVisivel } from "@/lib/adapters";

export async function pacienteRouter(app: FastifyInstance) {
  // Todas as rotas exigem paciente autenticado (GSD).
  app.addHook("preHandler", autenticarPaciente);

  // Perfil do paciente logado + visibilidade dos módulos (itens_visiveis do médico).
  app.get("/me", async (request) => {
    const solucao = await buscarUltimaSolucao(request.paciente!.id);
    const iv = solucao?.itensVisiveis;
    return {
      paciente: request.paciente,
      visibilidade: {
        livro_vida: moduloVisivel(iv, "livro_vida"),
        alimentacao: moduloVisivel(iv, "alimentacao"),
        suplementacao: moduloVisivel(iv, "suplementacao"),
        treinamentos: moduloVisivel(iv, "treinamentos"),
      },
    };
  });
}
