"use client";

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

interface RevenueChartProps {
  data: { date: string; amount: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="min-w-0" style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.5} />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }}
            dy={5}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--bg-card)', 
              borderColor: 'var(--border-color)',
              borderRadius: 'var(--radius-md)',
              fontSize: '10px'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="amount" 
            stroke="var(--primary)" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
