import type { FastifyInstance } from "fastify";
import { supabaseAdmin } from "@/lib";

export async function healthRouter(app: FastifyInstance) {
  // Liveness simples.
  app.get("/", async () => ({ status: "ok", service: "pacientes-auton-api" }));

  // Readiness: confirma que o Supabase responde.
  app.get("/db", async () => {
    const { error } = await supabaseAdmin.from("pacientes").select("id").limit(1);
    if (error) throw new Error(error.message);
    return { status: "ok", db: "reachable" };
  });
}
