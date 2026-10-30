import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { StoreService, hashPassword, type AdminRole } from './store.service';

export type { AdminRole } from './store.service';

export interface AdminUser {
  email: string;
  name: string;
  role: AdminRole;
}

const TOKEN_TTL_MS = 12 * 3600_000;
/** Demo default — set AUTH_SECRET in any shared deployment. */
const SECRET = process.env.AUTH_SECRET ?? 'xivoo-demo-secret';

const b64url = (s: string) => Buffer.from(s, 'utf8').toString('base64url');
const sign = (payload: string) => createHmac('sha256', SECRET).update(payload).digest('base64url');

/**
 * Stateless HMAC-signed tokens (payload.signature); users live in the durable
 * store, so sign-ups survive restarts and are visible to every instance.
 * Passwords are stored as salted SHA-256 hashes (bcrypt + rate limits for
 * production).
 */
@Injectable()
export class AuthService {
  constructor(private readonly store: StoreService) {}

  private issue(user: AdminUser): { token: string; user: AdminUser } {
    const payload = b64url(JSON.stringify({ ...user, exp: Date.now() + TOKEN_TTL_MS }));
    return { token: `${payload}.${sign(payload)}`, user };
  }

  /** Demo signup: creates a manager account so new team members can try the full panel. */
  async signup(name: string, email: string, password: string): Promise<{ token: string; user: AdminUser }> {
    await this.store.sync(0);
    const errors: Record<string, string> = {};
    const cleanName = (name ?? '').trim();
    const cleanEmail = (email ?? '').trim().toLowerCase();
    if (cleanName.length < 2) errors.name = 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) errors.email = 'Enter a valid email address.';
    else if (this.store.users.some((u) => u.email === cleanEmail)) errors.email = 'That email already has an account.';
    if ((password ?? '').length < 6) errors.password = 'Password needs at least 6 characters.';
    if (Object.keys(errors).length) {
      throw new BadRequestException({ message: 'Please fix the highlighted fields.', errors });
    }
    this.store.users.push({
      name: cleanName,
      email: cleanEmail,
      role: 'manager',
      passHash: hashPassword(password),
    });
    await this.store.persist();
    return this.issue({ email: cleanEmail, name: cleanName, role: 'manager' });
  }

  async login(email: string, password: string): Promise<{ token: string; user: AdminUser }> {
    await this.store.sync(3000);
    const u = this.store.users.find((x) => x.email === (email ?? '').trim().toLowerCase());
    if (!u || u.passHash !== hashPassword(password ?? '')) {
      throw new UnauthorizedException('Wrong email or password.');
    }
    return this.issue({ email: u.email, name: u.name, role: u.role });
  }

  logout(_token: string): void {
    // Stateless tokens: the client discards it; nothing to revoke server-side.
  }

  resolve(token: string | undefined): AdminUser | null {
    if (!token) return null;
    const dot = token.lastIndexOf('.');
    if (dot < 1) return null;
    const payload = token.slice(0, dot);
    const given = Buffer.from(token.slice(dot + 1));
    const expected = Buffer.from(sign(payload));
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
    try {
      const j = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
      if (typeof j.exp !== 'number' || j.exp < Date.now()) return null;
      return { email: j.email, name: j.name, role: j.role };
    } catch {
      return null;
    }
  }
}
