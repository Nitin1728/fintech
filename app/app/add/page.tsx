"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./add-entry.css";
import { useEntries } from "../../context/EntriesContext";
import { useAuth } from "../../context/AuthContext";

type EntryType = "received" | "pending" | "promised" | "sent";

export default function AddEntryPage() {
  const router = useRouter();
  const { addEntry } = useEntries();
  const { user } = useAuth();

  const [type, setType] = useState<EntryType>("received");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const handleSubmit = async () => {
    if (!amount || !description) return;

    await addEntry({
      id: Date.now().toString(),
      type,
      amount: Number(amount),
      person: description,
      status: type === "received" ? "received" : "pending",
      paymentMode,
      date,
    });

    router.push("/app");
  };

  return (
    <div className="dashboard-root">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo">📘 FinBook</div>
        <nav>
          <Link href="/app">Dashboard</Link>
          <a className="active">Add Entry</a>
          <Link href="/app">Entries</Link>
          <Link href="/app/settings">Settings</Link>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="main">
        {/* TOP BAR */}
        <header className="topbar">
          <h3>Add Entry</h3>
          <div className="user">
            <span className="avatar">
              {user?.email?.[0]?.toUpperCase() ?? "U"}
            </span>
            <span>{user?.email}</span>
          </div>
        </header>

        {/* PAGE HEADER */}
        <section className="page-header">
          <h1>Add Entry</h1>
          <p>Record a new transaction</p>
        </section>

        {/* FORM */}
        <section className="form-wrapper">
          <section className="form-card">
            {/* ENTRY TYPE */}
            <div className="field">
              <label>Entry Type</label>
              <div className="type-switch">
                {["received", "pending", "promised", "sent"].map((t) => (
                  <button
                    key={t}
                    className={type === t ? "active" : ""}
                    onClick={() => setType(t as EntryType)}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* NAME */}
            <div className="field">
              <label>Name</label>
              <input
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* AMOUNT */}
            <div className="field">
              <label>Amount</label>
              <div className="amount-input">
                <span>₹</span>
                <input
                  placeholder="Enter amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="field">
              <label>Person / Description</label>
              <input
                placeholder="Office rent / Payment from client"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* MODE + DATE */}
            <div className="row">
              <div className="field">
                <label>Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                >
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Bank Transfer</option>
                  <option>Card</option>
                </select>
              </div>

              <div className="field">
                <label>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            {/* ACTIONS */}
            <button className="primary" onClick={handleSubmit}>
              Save Entry
            </button>

            <Link href="/app" className="cancel">
              Cancel
            </Link>
          </section>
        </section>
      </main>
    </div>
  );
}
