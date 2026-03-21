"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface SalesOverviewProps {
  data?: Array<{
    month: string;
    total: number;
    commission: number;
  }>;
}

const defaultData = [
  { month: "Out", total: 8500, commission: 850 },
  { month: "Nov", total: 12000, commission: 1200 },
  { month: "Dez", total: 18000, commission: 1800 },
  { month: "Jan", total: 15000, commission: 1500 },
  { month: "Fev", total: 22000, commission: 2200 },
  { month: "Mar", total: 28000, commission: 2800 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#E8E8E8] rounded-xl p-3 shadow-card">
        <p className="text-xs text-[#666666] mb-2">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-sm font-semibold" style={{ color: entry.fill }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function SalesOverview({ data = defaultData }: SalesOverviewProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        barGap={4}
      >
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
          tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
          width={55}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: "12px", color: "#666666", paddingTop: "12px" }}
        />
        <Bar
          dataKey="total"
          name="Total Vendas"
          fill="#3B3BFF"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
        <Bar
          dataKey="commission"
          name="Comissão"
          fill="#E85A00"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
