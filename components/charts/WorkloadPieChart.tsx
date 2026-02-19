"use client";

import { useTheme } from "next-themes";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const RADIAN = Math.PI / 180;

type Props = {
  data: {
    name: string;
    value: number;
  }[];
};

const chartColors = [
  "#61a5c2", // Soft Indigo
  "#6EE7B7", // Mint Green
  "#7DD3FC", // Soft Sky Blue
  "#a0d4d4", // Soft Violet
  "#67E8F9", // Soft Cyan
  "#0099e5",
];



const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
}: any) => {
  const radius = outerRadius + 22;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill='hsl(var(--foreground))'
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline='central'
      style={{
        fontSize: "13px",
        fontWeight: 500,
      }}
    >
      {(percent * 100).toFixed(0)}%
    </text>
  );
};

export default function WorkloadPieChart({ data }: Props) {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <ResponsiveContainer width='100%' height={340}>
      <PieChart>
        <Pie
          data={data}
          cx='45%' // Slight left shift for better balance
          cy='50%'
          outerRadius={120} // ✅ MUCH BIGGER PIE
          dataKey='value'
          labelLine={true}
          label={renderCustomizedLabel}
        >
          {data.map((entry, index) => (
            <Cell
              key={`${entry.name}-${index}`}
              fill={chartColors[index % chartColors.length]}
            />
          ))}
        </Pie>

        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "10px",
            color: "white", // ✅ DARK MODE FIX
          }}
          itemStyle={{
            color: resolvedTheme === "dark" ? "white" : "black",
          }}
          labelStyle={{
            color: "white", // ✅ LABEL TEXT FIX
          }}
        />

        <Legend
          layout='vertical'
          verticalAlign='middle'
          align='right'
          wrapperStyle={{
            fontSize: "13px",
            paddingLeft: "20px",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
