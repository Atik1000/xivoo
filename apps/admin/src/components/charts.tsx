'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fmt } from '@xivoo/shared';

const GREEN = '#FF6A00';
const GRID = '#ECECEC';
const AXIS = '#9AA0A6';

const tooltipStyle = {
  borderRadius: 14,
  border: '1px solid #E4E4E4',
  background: '#ffffff',
  boxShadow: '0 18px 40px -16px rgba(17,19,21,.25)',
  fontSize: 13,
  fontFamily: 'var(--font-body)',
};

const shortDay = (d: string) => {
  const date = new Date(d + 'T00:00:00');
  return `${date.getDate()}/${date.getMonth() + 1}`;
};

export function RevenueChart({ data }: { data: { date: string; revenue: number; orders: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GREEN} stopOpacity={0.22} />
            <stop offset="100%" stopColor={GREEN} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={shortDay}
          tick={{ fontSize: 12, fill: AXIS }}
          tickLine={false}
          axisLine={{ stroke: GRID }}
          minTickGap={28}
        />
        <YAxis
          tick={{ fontSize: 12, fill: AXIS }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => (v >= 1000 ? `৳${Math.round(v / 1000)}k` : `৳${v}`)}
          width={48}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelFormatter={(d) => new Date(String(d) + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          formatter={(value: number | string | (number | string)[], name: string | number) =>
            name === 'revenue' ? [fmt(Number(value ?? 0)), 'Revenue'] : [String(value ?? 0), 'Orders']
          }
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke={GREEN}
          strokeWidth={2}
          fill="url(#rev)"
          dot={false}
          activeDot={{ r: 4.5, strokeWidth: 2, stroke: '#fff' }}
          animationDuration={900}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CategoryBars({ data }: { data: { title: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }} barCategoryGap="34%">
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="title" tick={{ fontSize: 12, fill: AXIS }} tickLine={false} axisLine={{ stroke: GRID }} />
        <YAxis
          tick={{ fontSize: 12, fill: AXIS }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => (v >= 1000 ? `৳${Math.round(v / 1000)}k` : `৳${v}`)}
          width={48}
        />
        <Tooltip
          cursor={{ fill: 'rgba(17,19,21,0.04)' }}
          contentStyle={tooltipStyle}
          formatter={(value: number | string | (number | string)[]) => [fmt(Number(value ?? 0)), 'Revenue']}
        />
        <Bar dataKey="revenue" radius={[4, 4, 0, 0]} animationDuration={900}>
          {data.map((d) => (
            <Cell key={d.title} fill={GREEN} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
