"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

export default function SignupPage() {
  const { signUp } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <main className="auth-root">
      <div className="auth-card">
        {/* LEFT */}
        <div className="auth-left">
          <div className="brand">
            <span className="brand-icon">📘</span>
            <span className="brand-name">FinBook</span>
          </div>

          <h1>Effortless Finance Management.</h1>
          <p>
            Track your payments, promises,
            <br />
            and reminders with ease.
          </p>
        </div>

        {/* RIGHT */}
        <div className="auth-right">
          <h2>Get started with FinBook</h2>
          <p className="subtitle">
            Create your account to manage finances with confidence.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (password !== confirm) return;
              signUp(email, password, name);
            }}
          >
            <label>Full Name</label>
            <div className="input-wrap">
              <span>👤</span>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <label>Email Address</label>
            <div className="input-wrap">
              <span>✉️</span>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <label>Password</label>
            <div className="input-wrap">
              <span>🔒</span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <label>Confirm Password</label>
            <div className="input-wrap">
              <span>🔒</span>
              <input
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary full">
              Create account
            </button>
          </form>

          <p className="signup">
            Already have an account?{" "}
            <Link href="/auth">Sign in</Link>
          </p>

          <p className="secure">
            🔐 Your data is encrypted and private
          </p>
        </div>
      </div>
    </main>
  );
}
