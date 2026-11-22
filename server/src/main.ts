import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('ViDoBootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend Vite dev server (port 5173) and any local client
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`\x1b[32m[ViDo NestJS]\x1b[0m Server running at http://localhost:${port}`);
  logger.log(`\x1b[36m[ViDo SSE]\x1b[0m Real-time event stream active on http://localhost:${port}/api/events/stream`);
}

bootstrap();
