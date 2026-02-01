"use client";

import Link from "next/link";
import "./dashboard.css";
import { useEntries } from "../context/EntriesContext";
import { useAuth } from "../context/AuthContext";
import { useMemo, useState } from "react";

type Range = "7d" | "month" | "3m" | "6m" | "1y" | "all";

export default function DashboardPage() {
  const { entries } = useEntries();
  const { user, signOut } = useAuth();
  const [range, setRange] = useState<Range>("month");

  const filteredEntries = useMemo(() => {
    if (range === "all") return entries;

    const now = new Date();
    let start: Date;

    switch (range) {
      case "7d":
        start = new Date();
        start.setDate(now.getDate() - 6);
        break;
      case "month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "3m":
        start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        break;
      case "6m":
        start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        break;
      case "1y":
        start = new Date(
          now.getFullYear() - 1,
          now.getMonth(),
          now.getDate()
        );
        break;
      default:
        return entries;
    }

    return entries.filter(
      (e) => new Date(e.date) >= start && new Date(e.date) <= now
    );
  }, [entries, range]);

  // ✅ CORRECT LOGIC (NO status, NO expense)
  const totalReceived = filteredEntries
    .filter((e) => e.type === "received")
    .reduce((s, e) => s + e.amount, 0);

  const totalPending = filteredEntries
    .filter(
      (e) => e.type === "pending" || e.type === "promised"
    )
    .reduce((s, e) => s + e.amount, 0);

  const totalExpense = filteredEntries
    .filter((e) => e.type === "sent")
    .reduce((s, e) => s + e.amount, 0);

  const totalBalance = totalReceived - totalExpense;

  return (
    <div className="dashboard-root">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo">📘 FinBook</div>
        <nav>
          <Link href="/app" className="active">Dashboard</Link>
          <Link href="/app/add">Add Entry</Link>
          <Link href="/app/entries">Entries</Link>
          <Link href="/app/settings">Settings</Link>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="main">
        <header className="topbar">
          <h3>Dashboard</h3>

          <div className="user-menu">
            <span className="avatar">
              {user?.email?.[0]?.toUpperCase() ?? "U"}
            </span>
            <div className="user-dropdown">
              <span>{user?.email}</span>
              <button onClick={signOut}>Log out</button>
            </div>
          </div>
        </header>

        <section className="page-header">
          <h1>Dashboard</h1>
          <p>Your financial overview</p>
        </section>

        {/* RANGE FILTER */}
        <div className="range-tabs">
          <button onClick={() => setRange("7d")}>7 Days</button>
          <button onClick={() => setRange("month")}>This Month</button>
          <button onClick={() => setRange("3m")}>3 Months</button>
          <button onClick={() => setRange("6m")}>6 Months</button>
          <button onClick={() => setRange("1y")}>1 Year</button>
          <button onClick={() => setRange("all")}>All Time</button>
        </div>

        <section className="stats">
          <Stat title="Total Balance" value={`₹${totalBalance}`} />
          <Stat title="Pending Amount" value={`₹${totalPending}`} orange />
          <Stat title="Received Amount" value={`₹${totalReceived}`} green />
          <Stat title="Total Expense" value={`₹${totalExpense}`} />
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Recent Activity</h2>
            <Link href="/app/add" className="btn">Add Entry</Link>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Type</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries
                .slice()
                .reverse()
                .slice(0, 5)
                .map((e) => (
                  <tr key={e.id}>
                    <td>{new Date(e.date).toLocaleDateString()}</td>
                    <td>{e.person}</td>
                    <td>
                      <span className={`tag ${e.type}`}>{e.type}</span>
                    </td>
                    <td>₹ {e.amount}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

function Stat({
  title,
  value,
  green,
  orange,
}: {
  title: string;
  value: string;
  green?: boolean;
  orange?: boolean;
}) {
  return (
    <div className={`stat ${green ? "green" : ""} ${orange ? "orange" : ""}`}>
      <h4>{value}</h4>
      <p>{title}</p>
    </div>
  );
}
