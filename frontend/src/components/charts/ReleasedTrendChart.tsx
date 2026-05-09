"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, CartesianGrid, Tooltip } from "recharts";

const data = [
  { month: "Jan", released: 80000 },
  { month: "Feb", released: 116000 },
  { month: "Mar", released: 92000 },
  { month: "Apr", released: 178000 },
  { month: "May", released: 138000 }
];

export function ReleasedTrendChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorReleased" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="month" stroke="var(--text-muted)" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)'}} dy={10} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', borderRadius: '1rem', color: '#fff' }}
            itemStyle={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}
          />
          <Area type="monotone" dataKey="released" stroke="var(--accent-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorReleased)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
