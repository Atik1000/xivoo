import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';

export type AdminRole = 'owner' | 'manager' | 'support';

export interface AdminUser {
  email: string;
  name: string;
  role: AdminRole;
}

interface SeedUser extends AdminUser {
  password: string;
}

/**
 * Demo credentials for the in-memory build — see the root README ("Admin access").
 * Production replaces this with hashed passwords in the database; the token
 * contract (Bearer) stays the same.
 */
const SEED_USERS: SeedUser[] = [
  { email: 'owner@xivoo.test', name: 'Rifat Hossain', role: 'owner', password: 'xivoo-owner' },
  { email: 'manager@xivoo.test', name: 'Nadia Karim', role: 'manager', password: 'xivoo-manager' },
  { email: 'support@xivoo.test', name: 'Sabbir Ahmed', role: 'support', password: 'xivoo-support' },
];

const TOKEN_TTL_MS = 12 * 3600_000;
/** Demo default — set AUTH_SECRET in any shared deployment. */
const SECRET = process.env.AUTH_SECRET ?? 'xivoo-demo-secret';

const b64url = (s: string) => Buffer.from(s, 'utf8').toString('base64url');
const sign = (payload: string) => createHmac('sha256', SECRET).update(payload).digest('base64url');

/**
 * Stateless HMAC-signed tokens (payload.signature) so sign-ins survive restarts
 * and serverless instances — no session store needed for the demo.
 */
@Injectable()
export class AuthService {
  /** Mutable in-memory user list; starts with the demo accounts. */
  private readonly users: SeedUser[] = SEED_USERS.map((u) => ({ ...u }));

  /**
   * Demo signup: creates a manager account so new team members can try the
   * full panel. Production would hash the password and queue role approval.
   */
  signup(name: string, email: string, password: string): { token: string; user: AdminUser } {
    const errors: Record<string, string> = {};
    const cleanName = (name ?? '').trim();
    const cleanEmail = (email ?? '').trim().toLowerCase();
    if (cleanName.length < 2) errors.name = 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) errors.email = 'Enter a valid email address.';
    else if (this.users.some((u) => u.email === cleanEmail)) errors.email = 'That email already has an account.';
    if ((password ?? '').length < 6) errors.password = 'Password needs at least 6 characters.';
    if (Object.keys(errors).length) {
      throw new BadRequestException({ message: 'Please fix the highlighted fields.', errors });
    }
    this.users.push({ name: cleanName, email: cleanEmail, password, role: 'manager' });
    return this.login(cleanEmail, password);
  }

  login(email: string, password: string): { token: string; user: AdminUser } {
    const u = this.users.find((x) => x.email === (email ?? '').trim().toLowerCase());
    if (!u || u.password !== password) {
      throw new UnauthorizedException('Wrong email or password.');
    }
    const user: AdminUser = { email: u.email, name: u.name, role: u.role };
    const payload = b64url(JSON.stringify({ ...user, exp: Date.now() + TOKEN_TTL_MS }));
    return { token: `${payload}.${sign(payload)}`, user };
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
