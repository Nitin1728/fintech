import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import { AppLayout } from "./components/Layout";
import { PublicLayout } from "./components/PublicLayout";

import Dashboard from "./pages/Dashboard";
import Entries from "./pages/Entries";
import AddEntry from "./pages/AddEntry";
import EditEntry from "./pages/EditEntry";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import TestEmail from "./pages/TestEmail";

import Landing from "./pages/Landing";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Security from "./pages/Security";
import Blog from "./pages/Blog";
import Services from "./pages/Services";

import { AuthPage } from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import { FinanceProvider, useFinance } from "./context/FinanceContext";

/* ---------------- STATIC PAGES ---------------- */

const About = () => (
  <div className="p-8 text-center max-w-2xl mx-auto py-24">
    <h1 className="text-4xl font-bold mb-6 text-slate-900">
      About FinBook
    </h1>
    <p className="text-lg text-slate-600 leading-relaxed">
      FinBook helps freelancers and small businesses manage finances professionally.
    </p>
  </div>
);

const Features = () => (
  <div className="p-8 text-center max-w-2xl mx-auto py-24">
    <h1 className="text-4xl font-bold mb-6 text-slate-900">
      Features
    </h1>
    <p className="text-lg text-slate-600">
      Visit the home page to explore all features.
    </p>
  </div>
);

/* ---------------- AUTH GUARD ---------------- */

const ProtectedApp = () => {
  const { user, loading } = useFinance();

  if (loading) return null;

  if (!user.id) {
    return <Navigate to="/auth/signin" replace />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};

/* ---------------- APP CONTENT ---------------- */

const AppContent = () => {
  const { loading } = useFinance();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* ================= PUBLIC ================= */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/security" element={<Security />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/services" element={<Services />} />
        </Route>

        {/* ================= AUTH ================= */}
        <Route
          path="/auth/signin"
          element={<AuthPage />}
        />
        <Route
          path="/auth/signup"
          element={<AuthPage />}
        />
        <Route
          path="/auth/forgot-password"
          element={<ForgotPassword />}
        />
        <Route
          path="/auth/reset-password"
          element={<ResetPassword />}
        />

        {/* ================= PRIVATE ================= */}
        <Route path="/app" element={<ProtectedApp />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="entries" element={<Entries />} />
          <Route path="add-entry" element={<AddEntry />} />
          <Route path="edit-entry/:id" element={<EditEntry />} />
          <Route path="settings" element={<Settings />} />
          <Route path="notifications" element={<Notifications />} />

          {/* ✅ TEST EMAIL (AUTH REQUIRED) */}
          <Route path="test-email" element={<TestEmail />} />
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

/* ---------------- ROOT ---------------- */

export default function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}
