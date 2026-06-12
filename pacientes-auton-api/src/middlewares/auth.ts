import type { FastifyReply, FastifyRequest } from "fastify";
import { supabaseAdmin, logger } from "@/lib";
import { verificarTokenSupabase } from "@/lib/jwt";
import { env } from "@/config/env";

/**
 * GSD — camada de segurança do app do paciente.
 *
 * Regra: a identidade do paciente vem SEMPRE do JWT verificado (claim `sub` =
 * usuario_auth). Nunca confiamos em paciente_id/usuario_auth enviado pelo cliente.
 * Como o cliente admin (service_role) ignora RLS, é AQUI que garantimos que cada
 * requisição só enxergue o paciente dono do token.
 */
export async function autenticarPaciente(request: FastifyRequest, reply: FastifyReply) {
  let usuarioAuth: string | undefined;

  if (env.DEV_AUTH_BYPASS) {
    usuarioAuth = (request.headers["x-dev-usuario-auth"] as string | undefined)?.trim();
    logger.warn("⚠️  DEV_AUTH_BYPASS ativo — autenticação NÃO segura. Use só em dev.");
    if (!usuarioAuth) {
      return reply.code(401).send({ erro: "DEV_AUTH_BYPASS: envie o header x-dev-usuario-auth" });
    }
  } else {
    const header = request.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return reply.code(401).send({ erro: "Token de autenticação ausente" });
    }
    try {
      const payload = await verificarTokenSupabase(header.slice(7));
      usuarioAuth = payload.sub;
    } catch (err) {
      logger.warn({ err }, "JWT inválido/expirado");
      return reply.code(401).send({ erro: "Token inválido ou expirado" });
    }
  }

  if (!usuarioAuth) {
    return reply.code(401).send({ erro: "Token sem identidade (sub)" });
  }

  const { data: paciente, error } = await supabaseAdmin
    .from("pacientes")
    .select(
      "id, nome, email, telefone, dataNascimento:data_nascimento, cpf, genero, cidade, estado, fotoPerfil:foto_perfil, usuarioAuth:usuario_auth, deletado"
    )
    .eq("usuario_auth", usuarioAuth)
    .or("deletado.is.null,deletado.eq.false")
    .limit(1)
    .maybeSingle();

  if (error) {
    logger.error({ err: error }, "Erro ao buscar paciente");
    return reply.code(500).send({ erro: "Erro ao carregar paciente" });
  }
  if (!paciente) {
    return reply.code(403).send({ erro: "Nenhum paciente vinculado a este usuário" });
  }

  const { deletado, ...dados } = paciente as Record<string, unknown>;
  void deletado;
  request.paciente = dados as unknown as import("@/types").PacienteAutenticado;
}
