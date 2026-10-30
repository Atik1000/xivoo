import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { fmt, type Coupon } from '@xivoo/shared';
import { AuthGuard, Roles } from './auth.guard';
import { StoreService } from './store.service';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly store: StoreService) {}

  @Get()
  async list() {
    await this.store.sync();
    return this.store.coupons;
  }

  /** One coupon per order, no stacking. Discount = floor(subtotal × pct), capped. */
  @Post('validate')
  @HttpCode(200)
  async validate(@Body() body: { code?: string; subtotal?: number }) {
    await this.store.sync(2000);
    const code = (body.code ?? '').trim().toUpperCase();
    const subtotal = Math.max(0, Math.floor(Number(body.subtotal ?? 0)));
    const c = this.store.coupons.find((x) => x.code === code && x.active);
    if (!c) return { valid: false, discount: 0, message: `Code ${code || '—'} is not valid.` };
    if (subtotal < c.min) {
      return {
        valid: false,
        discount: 0,
        message: `Add ${fmt(c.min - subtotal)} more to use ${c.code}.`,
      };
    }
    const discount =
      c.type === 'pct'
        ? Math.min(Math.floor((subtotal * c.value) / 100), c.max ?? Number.MAX_SAFE_INTEGER)
        : c.value;
    return { valid: true, code: c.code, discount, message: `${c.code} applied — ${c.label}.` };
  }

  @Post()
  @UseGuards(AuthGuard)
  @Roles('owner', 'manager')
  async create(@Body() body: Partial<Coupon>) {
    await this.store.sync(0);
    const code = (body.code ?? '').trim().toUpperCase().replace(/\s+/g, '');
    const errors: Record<string, string> = {};
    if (!/^[A-Z0-9]{4,16}$/.test(code)) errors.code = 'Code: 4–16 letters/numbers.';
    if (this.store.coupons.some((c) => c.code === code)) errors.code = 'That code already exists.';
    const type = body.type === 'fixed' ? 'fixed' : body.type === 'pct' ? 'pct' : undefined;
    if (!type) errors.type = 'Type must be pct or fixed.';
    const value = Math.floor(Number(body.value));
    if (!(value > 0)) errors.value = 'Value must be positive.';
    else if (type === 'pct' && value > 90) errors.value = 'Percentage cannot exceed 90.';
    const min = Math.floor(Number(body.min ?? 0));
    if (!(min >= 0)) errors.min = 'Minimum must be 0 or more.';
    let max: number | undefined;
    if (type === 'pct') {
      max = Math.floor(Number(body.max));
      if (!(max! > 0)) errors.max = 'Percentage coupons need a cap.';
    }
    const until = (body.until ?? '').trim();
    if (!until) errors.until = 'Set a validity label (e.g. 31 Dec 2027).';
    if (Object.keys(errors).length) {
      throw new BadRequestException({ message: 'Please fix the highlighted fields.', errors });
    }
    const label =
      type === 'pct'
        ? `${value}% off orders over ${fmt(min)}, up to ${fmt(max!)}`
        : `${fmt(value)} off orders over ${fmt(min)}`;
    const coupon: Coupon = { code, type: type!, value, min, max, label, until, active: body.active !== false };
    this.store.coupons.push(coupon);
    await this.store.persist();
    return coupon;
  }

  @Patch(':code')
  @UseGuards(AuthGuard)
  @Roles('owner', 'manager')
  async patch(@Param('code') codeParam: string, @Body() body: { active?: boolean }) {
    await this.store.sync(0);
    const c = this.store.coupons.find((x) => x.code === codeParam.toUpperCase());
    if (!c) throw new NotFoundException(`No coupon ${codeParam}`);
    if (typeof body.active === 'boolean') c.active = body.active;
    await this.store.persist();
    return c;
  }

  @Delete(':code')
  @UseGuards(AuthGuard)
  @Roles('owner', 'manager')
  async remove(@Param('code') codeParam: string) {
    await this.store.sync(0);
    const idx = this.store.coupons.findIndex((x) => x.code === codeParam.toUpperCase());
    if (idx < 0) throw new NotFoundException(`No coupon ${codeParam}`);
    this.store.coupons.splice(idx, 1);
    await this.store.persist();
    return { ok: true };
  }
}
