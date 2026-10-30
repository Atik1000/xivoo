import { Injectable, Logger } from '@nestjs/common';
import { get, put } from '@vercel/blob';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

const BLOB_PATH = 'state/xivoo-state.json';
const LOCAL_PATH = join(process.cwd(), '.data', 'xivoo-state.json');

/**
 * Durable JSON state: Vercel Blob in deployment (BLOB_READ_WRITE_TOKEN present),
 * a local file during development. This is what makes admin CRUD survive
 * serverless instances and restarts.
 */
@Injectable()
export class PersistenceService {
  private readonly log = new Logger('Persistence');
  readonly mode: 'blob' | 'file' = process.env.BLOB_READ_WRITE_TOKEN ? 'blob' : 'file';

  async load<T>(): Promise<T | null> {
    try {
      if (this.mode === 'blob') {
        // A missing blob throws BlobNotFoundError (handled below).
        const res = await get(BLOB_PATH, { access: 'private' });
        if (!res?.stream) return null;
        return JSON.parse(await new Response(res.stream as ReadableStream).text()) as T;
      }
      return JSON.parse(readFileSync(LOCAL_PATH, 'utf8')) as T;
    } catch (e) {
      const name = (e as Error)?.constructor?.name;
      if ((e as NodeJS.ErrnoException)?.code !== 'ENOENT' && name !== 'BlobNotFoundError') {
        this.log.warn(`state load failed: ${e}`);
      }
      return null;
    }
  }

  async save(state: unknown): Promise<void> {
    const json = JSON.stringify(state);
    try {
      if (this.mode === 'blob') {
        await put(BLOB_PATH, json, {
          access: 'private',
          addRandomSuffix: false,
          allowOverwrite: true,
          contentType: 'application/json',
          cacheControlMaxAge: 0,
        });
        return;
      }
      mkdirSync(dirname(LOCAL_PATH), { recursive: true });
      writeFileSync(LOCAL_PATH, json);
    } catch (e) {
      this.log.warn(`state save failed: ${e}`);
    }
  }
}
