import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import styles from "./BarChart.module.css";

export default function BarChartComponent({ data, title = "Top Expenses" }) {
  return (
    <div className={styles.expenseChart}>
      <h2>{title}</h2>
      <div className={styles.barWrapper}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ddd" />
            <XAxis type="number" axisLine={false} tickLine={false} />
            <YAxis type="category" width={110} dataKey="name" axisLine={false} tickLine={false} />
            <Tooltip formatter={(val) => `₹${Number(val).toFixed(2)}`} />
            <Bar dataKey="value" fill="#A000FF" barSize={22} radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
