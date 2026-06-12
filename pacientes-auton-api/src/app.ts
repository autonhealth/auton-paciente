import fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { randomUUID } from "node:crypto";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";

import { env } from "@/config/env";
import { logger } from "@/lib";
import { healthRouter, pacienteRouter, estiloVidaRouter } from "@/routes";

export function buildApp() {
  const app = fastify({
    genReqId: () => randomUUID(),
    loggerInstance: logger,
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.register(helmet);
  app.register(cors, {
    origin: env.CORS_ORIGIN ? env.CORS_ORIGIN.split(",").map((o) => o.trim()) : true,
  });

  app.register(healthRouter, { prefix: "/health" });
  app.register(pacienteRouter, { prefix: "/v1/paciente" });
  app.register(estiloVidaRouter, { prefix: "/v1" });

  return app;
}
