import "fastify";
import type { PacienteAutenticado } from "./index";

declare module "fastify" {
  interface FastifyRequest {
    /** Preenchido pelo hook autenticarPaciente. Indefinido em rotas públicas. */
    paciente?: PacienteAutenticado;
  }
}
