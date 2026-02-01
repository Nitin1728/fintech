"use client";

import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useEntries } from "../../context/EntriesContext";
import "../dashboard.css";
import "./settings.css";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { entries } = useEntries();

  const exportCSV = () => {
    if (!entries.length) {
      alert("No data to export");
      return;
    }

    const headers = Object.keys(entries[0]).join(",");
    const rows = entries.map((e) =>
      Object.values(e).join(",")
    );

    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "finbook-data.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetPassword = () => {
    alert("Password reset link will be sent to your email.");
  };

  return (
    <div className="dashboard-root">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo">📘 FinBook</div>
        <nav>
          <Link href="/app">Dashboard</Link>
          <Link href="/app/add">Add Entry</Link>
          <Link href="/app/entries">Entries</Link>
          <Link href="/app/settings" className="active">
            Settings
          </Link>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="main">
        {/* TOP BAR */}
        <header className="topbar">
          <h3>Settings</h3>
          <div className="user">
            <span className="avatar">
              {user?.email?.[0]?.toUpperCase() ?? "U"}
            </span>
            <span>{user?.email}</span>
          </div>
        </header>

        {/* HEADER */}
        <section className="page-header">
          <h1>Settings</h1>
          <p>Manage your account and preferences</p>
        </section>

        {/* PROFILE */}
        <section className="settings-card">
          <h4>Profile Information</h4>

          <div className="field">
            <label>Email</label>
            <input value={user?.email ?? ""} disabled />
            <small>Your email is used for login and notifications.</small>
          </div>

          <button className="btn primary">Save changes</button>
        </section>

        {/* SECURITY */}
        <section className="settings-card">
          <h4>Security</h4>

          <div className="row">
            <span>Change password</span>
            <button className="link-btn" onClick={resetPassword}>
              Reset password →
            </button>
          </div>
        </section>

        {/* GRID */}
        <div className="settings-grid">
          {/* NOTIFICATIONS */}
          <section className="settings-card">
            <h4>Notifications</h4>

            <div className="toggle-row">
              <span>Email reminders for pending payments</span>
              <input type="checkbox" defaultChecked />
            </div>

            <div className="toggle-row">
              <span>Weekly summary</span>
              <input type="checkbox" />
            </div>
          </section>

          {/* DATA */}
          <section className="settings-card">
            <h4>Data & Privacy</h4>
            <p>Your data is private and encrypted.</p>
            <button className="btn" onClick={exportCSV}>
              Export Data (CSV)
            </button>
          </section>

          {/* ACCOUNT */}
          <section className="settings-card danger">
            <h4>Account Actions</h4>
            <p>
              Permanently remove your account access on this device.
            </p>
            <button className="btn danger" onClick={signOut}>
              Log out
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
