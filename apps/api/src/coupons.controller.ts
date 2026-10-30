import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { COUPONS, fmt } from '@xivoo/shared';

@Controller('coupons')
export class CouponsController {
  @Get()
  list() {
    return COUPONS;
  }

  /** One coupon per order, no stacking. Discount = floor(subtotal × pct), capped. */
  @Post('validate')
  @HttpCode(200)
  validate(@Body() body: { code?: string; subtotal?: number }) {
    const code = (body.code ?? '').trim().toUpperCase();
    const subtotal = Math.max(0, Math.floor(Number(body.subtotal ?? 0)));
    const c = COUPONS.find((x) => x.code === code && x.active);
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
}
