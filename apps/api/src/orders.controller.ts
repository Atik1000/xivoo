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
  COUPONS,
  CreateOrderInput,
  ORDER_STATUSES,
  Order,
  OrderStatus,
  PRODUCTS,
  ZONES,
  productImg,
  skuOf,
} from '@xivoo/shared';
import { StoreService } from './store.service';

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
  list(@Query('status') status?: string, @Query('q') q?: string) {
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
    return { pipeline: ORDER_STATUSES, transitions: FORWARD };
  }

  @Get(':no')
  get(@Param('no') no: string) {
    const o = this.store.orders.find((x) => x.no === no);
    if (!o) throw new NotFoundException(`No order ${no}`);
    return o;
  }

  @Patch(':no/status')
  @UseGuards(AuthGuard)
  @Roles('owner', 'manager')
  setStatus(@Param('no') no: string, @Body() body: { status?: OrderStatus }) {
    const o = this.store.orders.find((x) => x.no === no);
    if (!o) throw new NotFoundException(`No order ${no}`);
    const next = body.status;
    if (!next || !FORWARD[o.status]?.includes(next)) {
      throw new BadRequestException(
        `Cannot move ${o.no} from "${o.status}" to "${next}". Allowed: ${FORWARD[o.status]?.join(', ') || 'none'}.`,
      );
    }
    o.status = next;
    return o;
  }

  @Post()
  create(@Body() input: CreateOrderInput): Order {
    const errors: Record<string, string> = {};
    const name = (input.customer?.name ?? '').trim();
    if (name.length < 2) errors.name = 'Please enter the full name.';

    const phone = (input.customer?.phone ?? '').replace(/[\s-]/g, '').replace(/^\+?88/, '');
    if (!/^01[3-9]\d{8}$/.test(phone)) errors.phone = 'Enter a valid Bangladeshi mobile number.';

    const email = (input.customer?.email ?? '').trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'That email does not look right.';

    const zone = ZONES.find((z) => z.key === input.delivery?.zone && !z.disabled);
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
        const p = PRODUCTS.find((x) => x.id === line.productId);
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
          img: productImg(p.id, 120, 150),
        });
      }
    } catch (e) {
      for (const d of decremented) {
        const p = PRODUCTS.find((x) => x.id === d.pid)!;
        this.store.restore(p, d.variant, d.qty);
      }
      throw e;
    }

    const subtotal = items.reduce((a, it) => a + it.lineTotal, 0);
    let discount = 0;
    let couponCode: string | undefined;
    if (input.couponCode) {
      const c = COUPONS.find((x) => x.code === input.couponCode!.toUpperCase() && x.active);
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
    return order;
  }
}
