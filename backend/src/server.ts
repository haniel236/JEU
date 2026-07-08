import { createServer } from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';
import { initSocket } from './socket/io.js';

async function main() {
  const app = createApp();
  const server = createServer(app);
  initSocket(server);

  server.listen(env.port, () => {
    console.log(`🟢 API prête sur http://localhost:${env.port} (${env.nodeEnv})`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} reçu — arrêt en cours...`);
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('Échec du démarrage du serveur', err);
  process.exit(1);
});
