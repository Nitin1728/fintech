import React, { useState } from "react";
import { Card, Button, Input } from "../components/ui";
import { APP_NAME } from "../constants";
import { Link } from "react-router-dom";
import { supabase } from "../src/lib/supabase";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  /* ---------------- SUBMIT ---------------- */

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      /* -----------------------------------------
         1️⃣ CHECK IF USER EXISTS
      ----------------------------------------- */
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        setError("No account found with this email address.");
        setLoading(false);
        return;
      }

      /* -----------------------------------------
         2️⃣ SEND RESET EMAIL (HASH ROUTER FIX)
      ----------------------------------------- */
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo:
          window.location.origin + "/#/auth/reset-password",
      });

      if (error) throw error;

      setInfo("Password reset link has been sent to your email.");
    } catch (err: any) {
      setError(err.message || "Unable to send reset email.");
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
          Forgot your password?
        </h2>

        <p className="text-sm text-slate-500 text-center mb-6">
          Enter your email and we’ll send you a reset link.
        </p>

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

        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button className="w-full" size="lg" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link
            to="/auth/signin"
            className="font-medium text-emerald-600 hover:underline"
          >
            Back to Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;
