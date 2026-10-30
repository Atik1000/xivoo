'use client';

/* eslint-disable @next/next/no-img-element */
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { AnimatePresence, motion } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import { useMemo, useState } from 'react';
import { fmt, type Order, type OrderMeta, type OrderStatus } from '@xivoo/shared';
import { useAuth } from '@/components/auth';
import Modal, { Field, inputCls } from '@/components/modal';
import { ApiDown, PageHead, Skeleton, StatusPill, STATUS_STYLE } from '@/components/ui';
import { ApiError, patch, useApi } from '@/lib/api';

type Requirement = { field: keyof OrderMeta; label: string };
interface StatusInfo {
  transitions: Record<string, OrderStatus[]>;
  requirements: Partial<Record<OrderStatus, Requirement[]>>;
}

const RETURN_STATES: OrderStatus[] = ['Return Requested', 'Returned', 'Refunded'];
const COLUMNS: { key: string; title: string; statuses: OrderStatus[] }[] = [
  { key: 'Pending', title: 'Pending', statuses: ['Pending'] },
  { key: 'Confirmed', title: 'Confirmed', statuses: ['Confirmed'] },
  { key: 'Processing', title: 'Processing', statuses: ['Processing'] },
  { key: 'Ready for Dispatch', title: 'Ready', statuses: ['Ready for Dispatch'] },
  { key: 'Shipped', title: 'Shipped', statuses: ['Shipped'] },
  { key: 'Delivered', title: 'Delivered', statuses: ['Delivered'] },
  { key: 'Cancelled', title: 'Cancelled', statuses: ['Cancelled'] },
  { key: 'Returns', title: 'Returns', statuses: RETURN_STATES },
];

/** Which single status a drop on this column means for the dragged order. */
function dropTarget(colKey: string, order: Order, transitions: Record<string, OrderStatus[]>): OrderStatus | null {
  const allowed = transitions[order.status] ?? [];
  if (colKey === 'Returns') return RETURN_STATES.find((s) => allowed.includes(s)) ?? null;
  return allowed.includes(colKey as OrderStatus) ? (colKey as OrderStatus) : null;
}

const COURIERS = ['Pathao Courier', 'Steadfast', 'RedX', 'Sundarban', 'SA Paribahan'];

function OrderCard({ order, canDrag, onOpen }: { order: Order; canDrag: boolean; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: order.no,
    data: { order },
    disabled: !canDrag,
  });
  return (
    <div
      ref={setNodeRef}
      style={transform ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 50 } : undefined}
      className={`relative rounded-2xl border bg-white p-3.5 shadow-sm transition-shadow ${isDragging ? 'opacity-40' : 'hover:shadow-md'} border-line`}
    >
      <div className="flex items-start justify-between gap-2">
        <button onClick={onOpen} className="min-w-0 text-left">
          <p className="font-mono text-[12px] font-bold text-ink">{order.no}</p>
          <p className="truncate text-[13px] font-semibold">{order.customer.name}</p>
        </button>
        {canDrag && (
          <span
            {...listeners}
            {...attributes}
            aria-label={`Drag ${order.no}`}
            className="grid h-8 w-8 shrink-0 cursor-grab place-items-center rounded-lg text-muted-2 hover:bg-surface-2 hover:text-ink active:cursor-grabbing"
          >
            <GripVertical size={15} />
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between text-[12px] text-muted">
        <span>{order.items.reduce((a, i) => a + i.qty, 0)} items · {order.delivery.zoneLabel}</span>
        <span className="font-bold text-ink">{fmt(order.total)}</span>
      </div>
      {order.meta?.trackingId && (
        <p className="mt-1.5 truncate rounded-md bg-surface-2 px-2 py-1 font-mono text-[11px] text-ink-2">
          {order.meta.courier}: {order.meta.trackingId}
        </p>
      )}
      {RETURN_STATES.includes(order.status) && (
        <div className="mt-1.5"><StatusPill status={order.status} /></div>
      )}
    </div>
  );
}

function Column({
  col,
  orders,
  validTarget,
  dragging,
  canDrag,
  onOpen,
}: {
  col: (typeof COLUMNS)[number];
  orders: Order[];
  validTarget: boolean;
  dragging: boolean;
  canDrag: boolean;
  onOpen: (o: Order) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.key, disabled: !validTarget });
  const style = STATUS_STYLE[col.statuses[0]] ?? { bg: '#EFEFEF', fg: '#6B7076' };
  return (
    <div
      ref={setNodeRef}
      className={`flex w-[250px] shrink-0 flex-col rounded-2xl border p-2.5 transition-all ${
        dragging
          ? validTarget
            ? isOver
              ? 'border-brand bg-brand-25 ring-2 ring-brand'
              : 'border-brand/50 bg-brand-25/50'
            : 'border-line bg-surface-2/60 opacity-45'
          : 'border-line bg-surface-2/60'
      }`}
    >
      <div className="flex items-center justify-between px-1.5 pb-2 pt-1">
        <span className="flex items-center gap-2 text-[12.5px] font-bold">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: style.fg === '#ffffff' ? style.bg : style.fg }} />
          {col.title}
        </span>
        <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-muted">{orders.length}</span>
      </div>
      <div className="flex min-h-[70px] flex-1 flex-col gap-2 overflow-y-auto">
        <AnimatePresence initial={false}>
          {orders.map((o) => (
            <motion.div
              key={o.no}
              layoutId={o.no}
              layout
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            >
              <OrderCard order={o} canDrag={canDrag} onOpen={() => onOpen(o)} />
            </motion.div>
          ))}
        </AnimatePresence>
        {!orders.length && (
          <p className="grid flex-1 place-items-center rounded-xl border border-dashed border-line py-5 text-[11px] font-semibold text-muted-2">
            {dragging && validTarget ? 'Drop here' : 'Empty'}
          </p>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'owner' || user?.role === 'manager';
  const orders = useApi<Order[]>('/orders');
  const info = useApi<StatusInfo>('/orders/statuses');
  const [q, setQ] = useState('');
  const [notice, setNotice] = useState('');
  const [active, setActive] = useState<Order | null>(null);
  const [detail, setDetail] = useState<Order | null>(null);
  const [move, setMove] = useState<{ order: Order; target: OrderStatus; fields: Requirement[] } | null>(null);
  const [moveVals, setMoveVals] = useState<Record<string, string>>({});
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [optimistic, setOptimistic] = useState<Record<string, OrderStatus>>({});
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const filtered = useMemo(() => {
    let out = orders.data ?? [];
    if (q.trim()) {
      const n = q.toLowerCase();
      out = out.filter(
        (o) => o.no.toLowerCase().includes(n) || o.customer.name.toLowerCase().includes(n) || o.customer.phone.includes(n),
      );
    }
    return out;
  }, [orders.data, q]);

  const transitions = info.data?.transitions ?? {};
  const requirements = info.data?.requirements ?? {};

  const doMove = async (order: Order, target: OrderStatus, meta: OrderMeta) => {
    setBusy(true);
    setFieldErr({});
    setOptimistic((m) => ({ ...m, [order.no]: target })); // card jumps instantly
    try {
      await patch(`/orders/${order.no}/status`, { status: target, meta });
      orders.reload();
      setNotice(`${order.no} → ${target}`);
      setMove(null);
    } catch (e) {
      setOptimistic((m) => {
        const { [order.no]: _, ...rest } = m;
        return rest;
      });
      if (e instanceof ApiError && e.errors) setFieldErr(e.errors);
      else setNotice(e instanceof Error ? e.message : 'Could not move the order.');
      if (!(e instanceof ApiError && e.errors)) setMove(null);
    } finally {
      setBusy(false);
    }
  };

  const onDragStart = (e: DragStartEvent) => setActive((e.active.data.current as { order: Order }).order);
  const onDragEnd = (e: DragEndEvent) => {
    const order = active;
    setActive(null);
    if (!order || !e.over) return;
    const col = COLUMNS.find((c) => c.key === e.over!.id);
    if (!col) return;
    const target = dropTarget(col.key, order, transitions);
    if (!target) return;
    const fields = requirements[target] ?? [];
    if (fields.length) {
      setMoveVals({});
      setFieldErr({});
      setMove({ order, target, fields });
    } else {
      void doMove(order, target, {});
    }
  };

  if (orders.error) {
    return (
      <>
        <PageHead title="Orders" />
        <div className="mt-8"><ApiDown error={orders.error} /></div>
      </>
    );
  }

  return (
    <>
      <PageHead title="Orders board" blurb={canEdit ? 'Drag a card to its next status — phases that need details ask for them.' : 'Read-only view — a manager or the owner moves orders.'}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Order no, name or phone…"
          aria-label="Search orders"
          className="w-[240px] max-w-full rounded-full border border-input bg-white px-4 py-2 text-sm outline-none focus:border-brand"
        />
      </PageHead>

      <AnimatePresence>
        {notice && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 rounded-xl bg-brand-50 px-4 py-2.5 text-sm font-semibold text-ink"
          >
            {notice}
          </motion.p>
        )}
      </AnimatePresence>

      {!orders.data ? (
        <div className="mt-6 flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[380px] w-[250px] shrink-0" />
          ))}
        </div>
      ) : (
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="no-scrollbar -mx-6 mt-6 flex items-stretch gap-3 overflow-x-auto px-6 pb-4">
            {COLUMNS.map((col) => (
              <Column
                key={col.key}
                col={col}
                orders={filtered.filter((o) => col.statuses.includes(optimistic[o.no] ?? o.status))}
                validTarget={!!active && dropTarget(col.key, active, transitions) !== null}
                dragging={!!active}
                canDrag={canEdit}
                onOpen={(o) => setDetail(o)}
              />
            ))}
          </div>
          <DragOverlay dropAnimation={{ duration: 220, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }}>
            {active && (
              <motion.div
                initial={{ scale: 0.96, rotate: 0 }}
                animate={{ scale: 1.05, rotate: 2.5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className="w-[230px] cursor-grabbing rounded-2xl border border-brand bg-white p-3.5 shadow-[0_24px_50px_-20px_rgba(255,106,0,.5)]">
                <p className="font-mono text-[12px] font-bold">{active.no}</p>
                <p className="truncate text-[13px] font-semibold">{active.customer.name}</p>
                <p className="mt-1 text-[12px] font-bold">{fmt(active.total)}</p>
              </motion.div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      {/* Required-fields modal for the next phase */}
      <Modal open={!!move} onClose={() => setMove(null)} title={move ? `${move.order.no} → ${move.target}` : ''}>
        {move && (
          <>
            <p className="text-sm text-ink-2">
              Moving to <StatusPill status={move.target} /> needs a few details:
            </p>
            <div className="mt-4 grid gap-4">
              {move.fields.map((f) => (
                <Field key={f.field} label={f.label} error={fieldErr[f.field]}>
                  {f.field === 'courier' ? (
                    <>
                      <input
                        className={inputCls}
                        list="couriers"
                        value={moveVals[f.field] ?? ''}
                        onChange={(e) => setMoveVals({ ...moveVals, [f.field]: e.target.value })}
                      />
                      <datalist id="couriers">
                        {COURIERS.map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    </>
                  ) : f.field === 'cancelReason' ? (
                    <textarea
                      className={inputCls}
                      rows={2}
                      value={moveVals[f.field] ?? ''}
                      onChange={(e) => setMoveVals({ ...moveVals, [f.field]: e.target.value })}
                    />
                  ) : (
                    <input
                      className={inputCls}
                      value={moveVals[f.field] ?? ''}
                      onChange={(e) => setMoveVals({ ...moveVals, [f.field]: e.target.value })}
                    />
                  )}
                </Field>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setMove(null)} className="rounded-full border border-line px-5 py-2.5 text-sm font-bold text-ink-2 hover:border-ink">
                Cancel
              </button>
              <button
                onClick={() => doMove(move.order, move.target, moveVals as OrderMeta)}
                disabled={busy}
                className="rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-dark disabled:cursor-wait disabled:opacity-70"
              >
                {busy ? 'Moving…' : `Move to ${move.target}`}
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Order detail modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail ? detail.no : ''} wide>
        {detail && (
          <div className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
            <div>
              <h3 className="text-[12px] font-bold uppercase tracking-[0.06em] text-muted">Items</h3>
              <ul className="mt-3 space-y-2.5">
                {detail.items.map((it) => (
                  <li key={it.sku} className="flex items-center gap-3">
                    <img src={it.img} alt="" className="h-11 w-9 rounded-lg object-cover" loading="lazy" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold">{it.name}</span>
                      <span className="block font-mono text-[11px] text-muted">{it.sku} · {it.variant}</span>
                    </span>
                    <span className="text-[13px] text-muted">×{it.qty}</span>
                    <span className="w-20 text-right text-[13px] font-bold">{fmt(it.lineTotal)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-line pt-3 text-sm text-ink-2">
                Subtotal {fmt(detail.subtotal)}
                {detail.discount > 0 && <> · {detail.couponCode} −{fmt(detail.discount)}</>}
                {' · '}Delivery {fmt(detail.delivery.fee)}
                <br />
                <strong>Due on delivery: {fmt(detail.total)}</strong>
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-[12px] font-bold uppercase tracking-[0.06em] text-muted">Status</h3>
                <p className="mt-2"><StatusPill status={detail.status} /></p>
              </div>
              <div>
                <h3 className="text-[12px] font-bold uppercase tracking-[0.06em] text-muted">Customer</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-2">
                  {detail.customer.name}
                  <br />
                  {detail.customer.phone}
                  <br />
                  {detail.delivery.address}, {detail.delivery.area}
                  <br />
                  {detail.delivery.zoneLabel}
                </p>
              </div>
              {(detail.meta?.trackingId || detail.meta?.cancelReason || detail.meta?.refundRef) && (
                <div>
                  <h3 className="text-[12px] font-bold uppercase tracking-[0.06em] text-muted">Fulfilment</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-2">
                    {detail.meta.courier && <>Courier: <strong>{detail.meta.courier}</strong><br /></>}
                    {detail.meta.trackingId && <>Tracking: <span className="font-mono">{detail.meta.trackingId}</span><br /></>}
                    {detail.meta.cancelReason && <>Cancelled: {detail.meta.cancelReason}<br /></>}
                    {detail.meta.refundRef && <>Refund ref: <span className="font-mono">{detail.meta.refundRef}</span></>}
                  </p>
                </div>
              )}
              {canEdit && (transitions[detail.status] ?? []).length > 0 && (
                <div>
                  <h3 className="text-[12px] font-bold uppercase tracking-[0.06em] text-muted">Move to</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(transitions[detail.status] ?? []).map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setDetail(null);
                          const fields = requirements[t] ?? [];
                          if (fields.length) {
                            setMoveVals({});
                            setFieldErr({});
                            setMove({ order: detail, target: t, fields });
                          } else void doMove(detail, t, {});
                        }}
                        className={`rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${
                          t === 'Cancelled' ? 'border border-sale text-sale hover:bg-sale-tint' : 'bg-brand text-white hover:bg-dark'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
