"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import "./auth.css";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setLoading(true);
      await signIn(email, password);
      router.push("/app");
    } catch (err: any) {
      alert(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

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
          <h2>Sign in to FinBook</h2>
          <p className="subtitle">
            Welcome back! Enter your account details to continue.
          </p>

          <form onSubmit={handleLogin}>
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

            <div className="forgot-row">
              <span className="forgot">Forgot password?</span>
            </div>

            <button
              type="submit"
              className="btn-primary full"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="signup">
            Don’t have an account?{" "}
            <Link href="/auth/signup">Create an account</Link>
          </p>

          <p className="secure">🔐 Your data is encrypted and private</p>
        </div>
      </div>
    </main>
  );
}
