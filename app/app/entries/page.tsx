"use client";

import { useState } from "react";
import Link from "next/link";
import "./entries.css";
import { useEntries } from "../../context/EntriesContext";
import { useAuth } from "../../context/AuthContext";

export default function EntriesPage() {
  const { entries, markAsReceived, sendReminder, deleteEntry } = useEntries();
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filteredEntries = entries.filter((e) => {
    const matchesSearch =
      e.person.toLowerCase().includes(search.toLowerCase());

    const matchesType =
      typeFilter === "all" || e.type === typeFilter;

    const matchesMode =
      modeFilter === "all" || e.paymentMode === modeFilter;

    return matchesSearch && matchesType && matchesMode;
  });

  return (
    <div className="dashboard-root">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo">📘 FinBook</div>
        <nav>
  <Link href="/app">Dashboard</Link>
  <Link href="/app/add">Add Entry</Link>
  <Link href="/app/entries" className="active">Entries</Link>
  <Link href="/app/settings">Settings</Link>
</nav>

      </aside>

      {/* MAIN */}
      <main className="main">
        {/* TOP BAR */}
        <header className="topbar">
          <h3>Entries</h3>
          <div className="user">
            <span className="avatar">
              {user?.email?.[0]?.toUpperCase() ?? "U"}
            </span>
            <span>{user?.email}</span>
          </div>
        </header>

        {/* PAGE HEADER */}
        <section className="page-header">
          <h1>Entries</h1>
          <p>All your transactions in one place</p>
        </section>

        {/* CONTROLS */}
        <section className="controls">
          <input
            placeholder="Search by name or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Type: All</option>
            <option value="received">Received</option>
            <option value="pending">Pending</option>
            <option value="promised">Promised</option>
            <option value="sent">Sent</option>
            <option value="expense">Expense</option>
          </select>

          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
          >
            <option value="all">Payment Mode: All</option>
            <option>Cash</option>
            <option>UPI</option>
            <option>Bank Transfer</option>
            <option>Card</option>
          </select>

          <Link href="/app/add" className="btn">
            Add Entry
          </Link>
        </section>

        {/* TABLE */}
        <section className="card">
          {filteredEntries.length === 0 ? (
            <div className="empty-state">
              <p>No entries yet. Start by adding your first transaction.</p>
              <Link href="/app/add" className="btn">
                Add Entry
              </Link>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name / Description</th>
                  <th>Type</th>
                  <th>Payment Mode</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((e) => (
                  <tr key={e.id}>
                    <td>{new Date(e.date).toLocaleDateString()}</td>
                    <td>
                      <strong>{e.person}</strong>
                    </td>
                    <td>
                      <span className={`tag ${e.type}`}>{e.type}</span>
                    </td>
                    <td>{e.paymentMode}</td>
                    <td>₹ {e.amount}</td>
                    <td>
                      <span className={`status ${e.status}`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="menu-cell">
                      <button
                        className="dots"
                        onClick={() =>
                          setOpenMenu(openMenu === e.id ? null : e.id)
                        }
                      >
                        ⋯
                      </button>

                      {openMenu === e.id && (
                        <div className="menu">
                          <button>View / Edit</button>

                          {e.status === "pending" && (
                            <>
                              <button
                                onClick={() => markAsReceived(e.id)}
                              >
                                Mark as received
                              </button>
                              <button
                                onClick={() => sendReminder(e.id)}
                              >
                                Send reminder
                              </button>
                            </>
                          )}

                          <button
                            className="danger"
                            onClick={() => deleteEntry(e.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}
