import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#A000FF', '#FF9304', '#FDE006', '#00C49F', '#FF6B6B', '#4FC3F7', '#81C784', '#FFB74D'];

const RADIAN = Math.PI / 180;
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null; // skip tiny slices
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function PieChartComponent({ data }) {
  const filtered = data.filter(d => d.value > 0);
  if (filtered.length === 0) return <p style={{ color: '#888', textAlign: 'center' }}>No data</p>;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={filtered}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={85}
          dataKey="value"
        >
          {filtered.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(val) => `₹${Number(val).toFixed(2)}`} />
        <Legend iconType="rect" verticalAlign="bottom" />
      </PieChart>
    </ResponsiveContainer>
  );
}
