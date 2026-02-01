import React, { useEffect, useState } from "react";
import { Card, Button, Input } from "../components/ui";
import { APP_NAME } from "../constants";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../src/lib/supabase";

/* ---------------- PASSWORD VALIDATION ---------------- */

const validatePassword = (password: string) => {
  if (password.length < 6 || password.length > 20)
    return "Password must be 6–20 characters long.";
  if (!/[A-Za-z]/.test(password))
    return "Password must contain at least one letter.";
  if (!/[0-9]/.test(password))
    return "Password must contain at least one number.";
  if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password))
    return "Password must contain at least one special character.";
  return null;
};

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /* -------------------------------------------------
     🔒 HARD GATE — BLOCK DIRECT ACCESS
     ------------------------------------------------- */
  useEffect(() => {
    const hash = window.location.hash;

    // Must come from Supabase recovery link
    if (!hash.includes("access_token") || !hash.includes("type=recovery")) {
      navigate("/auth/signin", { replace: true });
      return;
    }

    // Ensure Supabase session exists
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate("/auth/signin", { replace: true });
      }
    });
  }, [navigate]);

  /* ---------------- SUBMIT ---------------- */

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setSuccess("Password updated successfully. Please sign in again.");

      // 🔐 Force logout after reset
      await supabase.auth.signOut();

      setTimeout(() => {
        navigate("/auth/signin", { replace: true });
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Unable to reset password.");
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
        <h2 className="text-2xl font-bold text-center mb-2">
          Reset Password
        </h2>

        <p className="text-sm text-slate-500 text-center mb-4">
          Create a new secure password for your account.
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-600 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 text-sm text-emerald-600 text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="text-sm font-medium">New Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <ul className="mt-2 text-xs text-slate-500 space-y-1">
              <li>• 6–20 characters</li>
              <li>• At least 1 letter</li>
              <li>• At least 1 number</li>
              <li>• At least 1 special character</li>
            </ul>
          </div>

          <div>
            <label className="text-sm font-medium">Confirm Password</label>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          <Button className="w-full" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link
            to="/auth/signin"
            className="text-emerald-600 hover:underline"
          >
            Back to Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ResetPassword;
