import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, Roles } from './auth.guard';
import {
  CreateOrderInput,
  ORDER_STATUSES,
  Order,
  OrderMeta,
  OrderStatus,
  sizedImg,
  skuOf,
} from '@xivoo/shared';
import { StoreService } from './store.service';

/** Fields that must be provided to enter a status (enforced server-side). */
const REQUIREMENTS: Partial<Record<OrderStatus, { field: keyof OrderMeta; label: string }[]>> = {
  Shipped: [
    { field: 'courier', label: 'Courier company' },
    { field: 'trackingId', label: 'Tracking / consignment ID' },
  ],
  Cancelled: [{ field: 'cancelReason', label: 'Cancellation reason' }],
  Refunded: [{ field: 'refundRef', label: 'Refund reference (bKash/Nagad TxID)' }],
};

const FORWARD: Record<string, OrderStatus[]> = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Processing', 'Cancelled'],
  Processing: ['Ready for Dispatch', 'Cancelled'],
  'Ready for Dispatch': ['Shipped', 'Cancelled'],
  Shipped: ['Delivered'],
  Delivered: ['Return Requested'],
  'Return Requested': ['Returned'],
  Returned: ['Refunded'],
  Cancelled: [],
  Refunded: [],
};

@Controller('orders')
export class OrdersController {
  constructor(private readonly store: StoreService) {}

  @Get()
  @UseGuards(AuthGuard)
  async list(@Query('status') status?: string, @Query('q') q?: string) {
    await this.store.sync();
    let out = this.store.orders;
    if (status) out = out.filter((o) => o.status === status);
    if (q) {
      const needle = q.toLowerCase();
      out = out.filter(
        (o) =>
          o.no.toLowerCase().includes(needle) ||
          o.customer.name.toLowerCase().includes(needle) ||
          o.customer.phone.includes(needle),
      );
    }
    return out;
  }

  @Get('statuses')
  statuses() {
    return { pipeline: ORDER_STATUSES, transitions: FORWARD, requirements: REQUIREMENTS };
  }

  @Get(':no')
  async get(@Param('no') no: string) {
    await this.store.sync();
    const o = this.store.orders.find((x) => x.no === no);
    if (!o) throw new NotFoundException(`No order ${no}`);
    return o;
  }

  @Patch(':no/status')
  @UseGuards(AuthGuard)
  @Roles('owner', 'manager')
  async setStatus(
    @Param('no') no: string,
    @Body() body: { status?: OrderStatus; meta?: OrderMeta },
  ) {
    await this.store.sync(0);
    const o = await this.store.findOrderFresh(no);
    if (!o) throw new NotFoundException(`No order ${no}`);
    const next = body.status;
    if (!next || !FORWARD[o.status]?.includes(next)) {
      throw new BadRequestException(
        `Cannot move ${o.no} from "${o.status}" to "${next}". Allowed: ${FORWARD[o.status]?.join(', ') || 'none'}.`,
      );
    }
    const merged: OrderMeta = { ...o.meta };
    for (const [k, v] of Object.entries(body.meta ?? {})) {
      if (typeof v === 'string' && v.trim()) merged[k as keyof OrderMeta] = v.trim();
    }
    const missing = (REQUIREMENTS[next] ?? []).filter((r) => !merged[r.field]);
    if (missing.length) {
      throw new BadRequestException({
        message: `"${next}" needs: ${missing.map((m) => m.label).join(', ')}.`,
        errors: Object.fromEntries(missing.map((m) => [m.field, `${m.label} is required.`])),
      });
    }
    o.meta = merged;
    o.status = next;
    await this.store.persist();
    return o;
  }

  @Post()
  async create(@Body() input: CreateOrderInput): Promise<Order> {
    await this.store.sync(0);
    const errors: Record<string, string> = {};
    const name = (input.customer?.name ?? '').trim();
    if (name.length < 2) errors.name = 'Please enter the full name.';

    const phone = (input.customer?.phone ?? '').replace(/[\s-]/g, '').replace(/^\+?88/, '');
    if (!/^01[3-9]\d{8}$/.test(phone)) errors.phone = 'Enter a valid Bangladeshi mobile number.';

    const email = (input.customer?.email ?? '').trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'That email does not look right.';

    const zone = this.store.zones.find((z) => z.key === input.delivery?.zone && !z.disabled);
    if (!zone) errors.zone = 'Choose a delivery zone.';
    if (!(input.delivery?.area ?? '').trim()) errors.area = 'Area or thana is required.';
    if ((input.delivery?.address ?? '').trim().length < 6) errors.address = 'Please enter the full address.';

    if (!input.items?.length) errors.items = 'The cart is empty.';

    if (Object.keys(errors).length) {
      throw new BadRequestException({ message: 'Please fix the highlighted fields.', errors });
    }

    // Validate and decrement stock; roll back on any failure to avoid partial decrements.
    const decremented: { pid: string; variant: string; qty: number }[] = [];
    const items: Order['items'] = [];
    try {
      for (const line of input.items) {
        const p = this.store.findProduct(line.productId);
        if (!p) throw new BadRequestException({ message: `Unknown product ${line.productId}.` });
        const qty = Math.floor(Number(line.qty));
        if (!(qty >= 1)) throw new BadRequestException({ message: `Invalid quantity for ${p.name}.` });
        if (!this.store.tryDecrement(p, line.variant, qty)) {
          throw new BadRequestException({
            message: `Only ${this.store.stockOf(p, line.variant)} left of ${p.name} (${line.variant}).`,
          });
        }
        decremented.push({ pid: p.id, variant: line.variant, qty });
        items.push({
          productId: p.id,
          name: p.name,
          sku: skuOf(p, line.color, line.variant),
          variant: line.variant,
          color: line.color,
          unitPrice: p.price,
          qty,
          lineTotal: p.price * qty,
          img: sizedImg(p, 120, 150),
        });
      }
    } catch (e) {
      for (const d of decremented) {
        const p = this.store.findProduct(d.pid)!;
        this.store.restore(p, d.variant, d.qty);
      }
      throw e;
    }

    const subtotal = items.reduce((a, it) => a + it.lineTotal, 0);
    let discount = 0;
    let couponCode: string | undefined;
    if (input.couponCode) {
      const c = this.store.coupons.find((x) => x.code === input.couponCode!.toUpperCase() && x.active);
      if (c && subtotal >= c.min) {
        discount =
          c.type === 'pct'
            ? Math.min(Math.floor((subtotal * c.value) / 100), c.max ?? Number.MAX_SAFE_INTEGER)
            : c.value;
        couponCode = c.code;
      }
    }

    const at = new Date();
    const order: Order = {
      no: this.store.nextOrderNo(at),
      placedAt: at.toISOString(),
      status: 'Pending',
      customer: { name, phone, email: email || undefined },
      delivery: {
        zone: zone!.key,
        zoneLabel: zone!.label,
        area: input.delivery.area.trim(),
        address: input.delivery.address.trim(),
        note: input.delivery.note?.trim() || undefined,
        fee: zone!.fee!,
      },
      payment: 'Cash on Delivery',
      items,
      subtotal,
      discount,
      couponCode,
      total: subtotal - discount + zone!.fee!,
    };
    this.store.orders.unshift(order);
    await this.store.persist();
    return order;
  }
}
