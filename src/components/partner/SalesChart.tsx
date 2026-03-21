"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface SalesChartProps {
  data?: Array<{ month: string; sales: number; orders: number }>;
}

const defaultData = [
  { month: "Set", sales: 1200, orders: 8 },
  { month: "Out", sales: 1800, orders: 12 },
  { month: "Nov", sales: 2400, orders: 18 },
  { month: "Dez", sales: 3200, orders: 24 },
  { month: "Jan", sales: 2800, orders: 20 },
  { month: "Fev", sales: 3600, orders: 28 },
  { month: "Mar", sales: 4200, orders: 32 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#E8E8E8] rounded-xl p-3 shadow-card">
        <p className="text-xs text-[#666666] mb-1">{label}</p>
        <p className="text-sm font-semibold text-[#1A1A1A]">
          {formatCurrency(payload[0].value)}
        </p>
        {payload[1] && (
          <p className="text-xs text-[#666666]">{payload[1].value} pedidos</p>
        )}
      </div>
    );
  }
  return null;
};

export function SalesChart({ data = defaultData }: SalesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B3BFF" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#3B3BFF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: "#666666", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#666666", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => `R$${(value / 1000).toFixed(1)}k`}
          width={55}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="sales"
          stroke="#3B3BFF"
          strokeWidth={2}
          fill="url(#salesGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
