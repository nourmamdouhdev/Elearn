"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";

interface StudentGrowthChartProps {
  data: { month: string; count: number }[];
}

export function StudentGrowthChart({ data }: StudentGrowthChartProps) {
  const colors = ["var(--secondary)", "var(--primary)", "var(--accent)", "var(--warning)", "var(--error)"];

  return (
    <div className="min-w-0" style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.5} />
          <XAxis 
            dataKey="month" 
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
            cursor={{ fill: 'var(--bg-secondary)', opacity: 0.3 }}
            contentStyle={{ 
              backgroundColor: 'var(--bg-card)', 
              borderColor: 'var(--border-color)',
              borderRadius: 'var(--radius-md)',
              fontSize: '10px'
            }}
          />
          <Bar 
            dataKey="count" 
            radius={[4, 4, 0, 0]} 
            animationDuration={1000}
            barSize={30}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
