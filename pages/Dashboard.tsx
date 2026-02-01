import React, { useMemo } from 'react';
import { Card, Button } from '../components/ui';
import { useFinance } from '../context/FinanceContext';
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Wallet,
  AlertCircle,
  Minus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { EntryType } from '../types';

/* -------------------- Stat Card -------------------- */
const StatCard = ({
  title,
  amount,
  icon,
  trend,
  positive,
  neutral,
}: {
  title: string;
  amount: string;
  icon: React.ReactNode;
  trend?: string;
  positive?: boolean;
  neutral?: boolean;
}) => (
  <Card className="p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{amount}</h3>
      </div>

      <div
        className={`p-2 rounded-lg ${
          neutral
            ? 'bg-slate-100 text-slate-600'
            : positive
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-red-50 text-red-600'
        }`}
      >
        {icon}
      </div>
    </div>

    {trend && (
      <div className="mt-4 flex items-center text-xs font-medium">
        <span
          className={
            neutral
              ? 'text-slate-500 flex items-center'
              : positive
              ? 'text-emerald-600 flex items-center'
              : 'text-red-600 flex items-center'
          }
        >
          {neutral ? (
            <Minus className="w-3 h-3 mr-1" />
          ) : positive ? (
            <ArrowUpRight className="w-3 h-3 mr-1" />
          ) : (
            <ArrowDownRight className="w-3 h-3 mr-1" />
          )}
          {trend}
        </span>
        <span className="text-slate-400 ml-2">vs last month</span>
      </div>
    )}
  </Card>
);

/* -------------------- Dashboard -------------------- */
const Dashboard: React.FC = () => {
  const { entries, formatAmount, user } = useFinance();
  const now = new Date();

  /* ---------- Totals ---------- */
  const totalReceived = entries
    .filter(e => e.type === EntryType.Received)
    .reduce((a, b) => a + b.amount, 0);

  const totalExpenses = entries
    .filter(e => e.type === EntryType.Sent)
    .reduce((a, b) => a + b.amount, 0);

  const totalPendingIn = entries
    .filter(e => e.type === EntryType.PendingIn)
    .reduce((a, b) => a + b.amount, 0);

  const balance = totalReceived - totalExpenses;

  /* ---------- Trend ---------- */
  const getMonthEntries = (offset: number) => {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    return entries.filter(e => {
      const ed = new Date(e.date);
      return (
        ed.getMonth() === d.getMonth() &&
        ed.getFullYear() === d.getFullYear()
      );
    });
  };

  const thisMonth = getMonthEntries(0);
  const lastMonth = getMonthEntries(1);

  const incomeThis = thisMonth
    .filter(e => e.type === EntryType.Received)
    .reduce((a, b) => a + b.amount, 0);

  const incomeLast = lastMonth
    .filter(e => e.type === EntryType.Received)
    .reduce((a, b) => a + b.amount, 0);

  const expenseThis = thisMonth
    .filter(e => e.type === EntryType.Sent)
    .reduce((a, b) => a + b.amount, 0);

  const expenseLast = lastMonth
    .filter(e => e.type === EntryType.Sent)
    .reduce((a, b) => a + b.amount, 0);

  const pendingThis = thisMonth
    .filter(e => e.type === EntryType.PendingIn)
    .reduce((a, b) => a + b.amount, 0);

  const pendingLast = lastMonth
    .filter(e => e.type === EntryType.PendingIn)
    .reduce((a, b) => a + b.amount, 0);

  const netThis = incomeThis - expenseThis;
  const netLast = incomeLast - expenseLast;

  const calcTrend = (c: number, p: number) =>
    p === 0 ? (c === 0 ? '0%' : '100%') : `${Math.abs(((c - p) / p) * 100).toFixed(1)}%`;

  /* ---------- Chart Data ---------- */
  const chartData = useMemo(() => {
    const data: any[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'short' });

      const monthEntries = entries.filter(e => {
        const ed = new Date(e.date);
        return (
          ed.getMonth() === d.getMonth() &&
          ed.getFullYear() === d.getFullYear()
        );
      });

      data.push({
        name: label,
        income: monthEntries
          .filter(e => e.type === EntryType.Received)
          .reduce((a, b) => a + b.amount, 0),
        expense: monthEntries
          .filter(e => e.type === EntryType.Sent)
          .reduce((a, b) => a + b.amount, 0),
      });
    }

    return data;
  }, [entries, now]);

  /* ---------- Recent Activity ---------- */
  const isPro = user.plan === 'Pro' || user.plan === 'Enterprise';

  const sixMonthsAgo = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const recentEntries = useMemo(() => {
    let visible = entries;
    if (!isPro) {
      visible = entries.filter(e => new Date(e.date) >= sixMonthsAgo);
    }
    return visible.slice(0, 5);
  }, [entries, isPro, sixMonthsAgo]);

  /* ---------- UI ---------- */
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <Link to="/app/add-entry">
          <Button>+ Add Entry</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Current Balance"
          amount={formatAmount(balance)}
          icon={<Wallet />}
          trend={calcTrend(netThis, netLast)}
          positive={netThis >= netLast}
        />
        <StatCard
          title="Total Received"
          amount={formatAmount(totalReceived)}
          icon={<DollarSign />}
          trend={calcTrend(incomeThis, incomeLast)}
          positive={incomeThis >= incomeLast}
        />
        <StatCard
          title="Pending Receivables"
          amount={formatAmount(totalPendingIn)}
          icon={<AlertCircle />}
          trend={calcTrend(pendingThis, pendingLast)}
          neutral
        />
        <StatCard
          title="Total Expenses"
          amount={formatAmount(totalExpenses)}
          icon={<ArrowDownRight />}
          trend={calcTrend(expenseThis, expenseLast)}
          positive={expenseThis <= expenseLast}
        />
      </div>

      {/* Charts + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900">
              Cash Flow (Last 7 Months)
            </h3>

            <div className="flex items-center gap-4">
              <span className="flex items-center text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                Income
              </span>
              <span className="flex items-center text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                Expense
              </span>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => formatAmount(v)} />
                <Bar
                  dataKey="income"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  animationDuration={800}
                />
                <Bar
                  dataKey="expense"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-0 overflow-hidden">
          <div className="p-6 border-b flex justify-between">
            <h3 className="font-semibold">Recent Activity</h3>
            <Link to="/app/entries" className="text-xs text-emerald-600">
              View All
            </Link>
          </div>

          <div className="divide-y max-h-[300px] overflow-y-auto">
            {recentEntries.length ? (
              recentEntries.map(e => (
                <div key={e.id} className="p-4 flex justify-between">
                  <div>
                    <p className="text-sm font-medium">{e.name}</p>
                    <p className="text-xs text-slate-500">{e.date}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        e.type === EntryType.Received
                          ? 'text-emerald-600'
                          : 'text-red-600'
                      }`}
                    >
                      {e.type === EntryType.Sent ? '-' : '+'}
                      {formatAmount(e.amount)}
                    </p>
                    <span className="text-xs text-slate-400">{e.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400">
                No recent activity
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
