import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useFinance } from "../context/FinanceContext";
import { EntryType } from "../types";

interface MonthlyRow {
  month: string;
  total_income: number;
  total_expense: number;
}

const formatMonth = (year: number, month: number) =>
  new Date(year, month).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });

const MonthlyAnalyticsChart: React.FC = () => {
  const { entries } = useFinance();

  const data: MonthlyRow[] = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();

    entries.forEach((e) => {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;

      if (!map.has(key)) {
        map.set(key, { income: 0, expense: 0 });
      }

      const bucket = map.get(key)!;

      if (e.type === EntryType.Received || e.type === EntryType.PendingIn) {
        bucket.income += e.amount;
      } else {
        bucket.expense += e.amount;
      }
    });

    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, value]) => {
        const [year, month] = key.split("-").map(Number);
        return {
          month: formatMonth(year, month),
          total_income: value.income,
          total_expense: value.expense,
        };
      });
  }, [entries]); // 🔥 THIS MAKES IT LIVE

  if (!data.length) {
    return (
      <div className="text-sm text-slate-500 text-center py-8">
        No analytics yet. Add some entries to see trends.
      </div>
    );
  }

  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="total_income"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            name="Income"
          />
          <Line
            type="monotone"
            dataKey="total_expense"
            stroke="#f87171"
            strokeWidth={2}
            dot={false}
            name="Expense"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyAnalyticsChart;
