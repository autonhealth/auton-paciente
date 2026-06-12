import { buildApp } from "@/app";
import { env } from "@/config/env";
import { logger } from "@/lib";

const app = buildApp();

process.on("uncaughtException", (error) => {
  logger.fatal(error, "Uncaught exception — process will exit");
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error(reason, "Unhandled promise rejection");
});

app.listen(
  {
    host: env.isDev ? "0.0.0.0" : "127.0.0.1",
    port: env.SERVER_PORT,
  },
  (err, address) => {
    if (err) {
      logger.fatal(err, "Failed to start server");
      process.exit(1);
    }
    logger.info(`🚀 pacientes-auton-api ouvindo em ${address}`);
  }
);

const shutdown = async () => {
  logger.info("Encerrando servidor...");
  try {
    await app.close();
    logger.info("Servidor encerrado. Bye.");
    process.exit(0);
  } catch (error) {
    logger.error(error, "Erro durante shutdown");
    process.exit(1);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
