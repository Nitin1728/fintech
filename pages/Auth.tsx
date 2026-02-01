import React, { useState } from "react";
import { Card, Button, Input } from "../components/ui";
import { APP_NAME } from "../constants";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { supabase } from "../src/lib/supabase";

export const AuthPage: React.FC = () => {
  const { pathname } = useLocation();
  const isSignup = pathname.includes("signup");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  /* ---------------- VALIDATIONS ---------------- */

  const validateName = (value: string) => {
    if (value.trim().length < 3)
      return "Name must be at least 3 characters.";
    if (/\d/.test(value))
      return "Name cannot contain numbers.";
    return null;
  };

  const validatePassword = (value: string) => {
    if (value.length < 6 || value.length > 20)
      return "Password must be between 6 and 20 characters.";
    if (!/[A-Za-z]/.test(value))
      return "Password must include at least one letter.";
    if (!/[0-9]/.test(value))
      return "Password must include at least one number.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value))
      return "Password must include at least one special character.";
    return null;
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (isSignup) {
      const nameError = validateName(name);
      if (nameError) return setError(nameError);

      const passwordError = validatePassword(password);
      if (passwordError) return setError(passwordError);
    }

    setLoading(true);

    try {
      /* ---------- SIGN UP ---------- */
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
          },
        });

        if (error) throw error;

        // email already exists
        if (data.user && data.user.identities?.length === 0) {
          setError("An account with this email already exists. Please sign in.");
          setLoading(false);
          return;
        }

        setInfo("Account created successfully. Please sign in.");
        navigate("/auth/signin", { replace: true });
        return;
      }

      /* ---------- SIGN IN ---------- */
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      navigate("/app/dashboard", { replace: true });
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <Link
        to="/"
        className="mb-8 flex items-center gap-2 font-bold text-2xl text-emerald-700"
      >
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
          <span className="text-xl">F</span>
        </div>
        {APP_NAME}
      </Link>

      <Card className="w-full max-w-md p-8 shadow-xl border-t-4 border-t-emerald-600">
        <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">
          {isSignup ? "Create your free account" : "Welcome back"}
        </h2>

        {error && (
          <div className="mb-4 text-sm text-red-600 text-center">
            {error}
          </div>
        )}

        {info && (
          <div className="mb-4 text-sm text-emerald-600 text-center">
            {info}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="text-sm font-medium text-slate-700">
                Full Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-slate-700">
              Email Address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {isSignup && (
              <ul className="mt-2 text-xs text-slate-500 space-y-1">
                <li>• 6–20 characters</li>
                <li>• At least 1 letter (A–Z)</li>
                <li>• At least 1 number (0–9)</li>
                <li>• At least 1 special character</li>
              </ul>
            )}
          </div>

          <Button className="w-full" disabled={loading}>
            {loading
              ? "Processing..."
              : isSignup
              ? "Create Account"
              : "Sign In"}
          </Button>
        </form>

        {!isSignup && (
          <div className="mt-4 text-center">
            <Link
              to="/auth/forgot-password"
              className="text-sm text-emerald-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        )}

        {isSignup && (
          <div className="mt-4 p-3 bg-slate-50 rounded text-xs text-slate-500 flex gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Your data is encrypted and secure.</span>
          </div>
        )}

        <div className="mt-6 text-center text-sm">
          <span className="text-slate-500">
            {isSignup ? "Already have an account? " : "Don't have an account? "}
          </span>
          <Link
            to={isSignup ? "/auth/signin" : "/auth/signup"}
            className="font-medium text-emerald-600 hover:underline"
          >
            {isSignup ? "Sign in" : "Sign up for free"}
          </Link>
        </div>
      </Card>
    </div>
  );
};
