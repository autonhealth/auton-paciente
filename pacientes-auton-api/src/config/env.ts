import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  // Conexão com o banco via API do Supabase (service_role, server-side).
  SUPABASE_URL: z.string().url("SUPABASE_URL inválida"),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY é obrigatório (Settings → API → service_role)"),

  // Segurança (GSD): validação do JWT do paciente. JWKS usa SUPABASE_URL;
  // SUPABASE_JWT_SECRET é fallback opcional (HS256).
  SUPABASE_JWT_SECRET: z.string().optional(),

  SERVER_PORT: z.coerce.number().default(3333),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Bypass de auth SOMENTE para dev (identidade via header x-dev-usuario-auth).
  DEV_AUTH_BYPASS: z
    .string()
    .optional()
    .transform((v) => v === "true"),

  // Origens permitidas no CORS (vírgula). Vazio = libera todas (dev).
  CORS_ORIGIN: z.string().optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Variáveis de ambiente inválidas:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  isDev: parsed.data.NODE_ENV === "development",
  isProd: parsed.data.NODE_ENV === "production",
};
