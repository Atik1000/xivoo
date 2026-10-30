import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { type Request, type Response } from 'express';
import { AppModule } from '../src/app.module';

/**
 * Vercel serverless entry: boots Nest once per instance onto an Express server
 * and hands every request to it. Note: the in-memory store (orders, stock) is
 * per-instance and resets on cold starts — fine for the demo, swap in a real
 * database for anything shared.
 */
const server = express();
let ready: Promise<void> | null = null;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: ['error', 'warn'],
  });
  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: true });
  await app.init();
}

export default async function handler(req: Request, res: Response): Promise<void> {
  ready ??= bootstrap();
  await ready;
  server(req, res);
}
