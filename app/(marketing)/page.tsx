import {
  LogoIcon,
  DiaryIcon,
  PaymentIcon,
  MailIcon,
  UserIcon,
  LockIcon,
} from "../landing/Icons";

import Link from "next/link";


export default function LandingPage() {
  return (
    <main className="landing-root">
      {/* NAVBAR */}
      <header className="landing-nav">
        <div className="container nav-inner">
          <div className="nav-logo">
            <span className="logo-icon">📘</span>
            <span className="logo-text">FinBook</span>
          </div>

          <nav className="nav-links">
            <span>Features</span>
            <span>Pricing</span>
            <span>Testimonials</span>
            <Link href="/auth">
              <button className="btn-primary">Get Started</button>
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-left">
            <h1>
              Manage Your Finances
              <br />
              with Confidence.
            </h1>

            <p>
              Track payments, promises, and reminders with ease.
            </p>

            <Link href="/auth">
              <button className="btn-primary large">
                Start Free
              </button>
            </Link>
          </div>

          <div className="hero-right">
            <div className="example-card">
              <div className="amount">₹12,000</div>
              <div className="example-row">
                <span className="check">✔</span>
                <span>Client: Rajesh Kumar</span>
                <span className="badge pending">Pending</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES STRIP */}
      <section className="features-strip">
        <div className="container">
          <h2>Struggling to Keep Track of Your Money?</h2>
          <p className="subtitle">
            Missed payments? Forgotten follow-ups? Unclear promises? FinBook has you covered.
          </p>

          <div className="features-grid">
            <Feature title="Finance Diary" desc="Organize your income & expenses" />
            <Feature title="Payment Tracking" desc="Monitor pending & received payments" />
            <Feature title="Email Reminders" desc="Automatic follow-up notifications" />
            <Feature title="Beginner Friendly" desc="Simple and easy to use" />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
<section className="how-it-works">
  <div className="container text-center">
    <h2 className="section-title">How FinBook works</h2>
    <p className="section-subtitle">
      A simple flow designed to keep money clear and stress-free.
    </p>

    <div className="steps-clean">
      <CleanStep
        title="Add entries"
        desc="Log payments, promises, or money sent in seconds."
      />
      <CleanStep
        title="Track status"
        desc="See what’s pending, promised, or received at a glance."
      />
      <CleanStep
        title="Send reminders"
        desc="Politely follow up without awkward conversations."
      />
    </div>
  </div>
</section>


      {/* TRUST STRIP */}
      <section className="trust-strip">
        <div className="container trust-items">
          <span>🔒 Secure & Encrypted</span>
          <span>▶ Your Data is Private</span>
          <span>💳 No Credit Card Required</span>
        </div>
      </section>

      {/* CTA */}
      <section className="final-cta">
        <div className="container">
          <h2>Take Control of Your Finances Today</h2>
          <p>Join FinBook and simplify your financial management.</p>
          <Link href="/auth">
            <button className="btn-primary large">
              Start Free
            </button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        © 2024 FinBook. All rights reserved. · Privacy Policy · Terms of Service
      </footer>
    </main>
  );
}

/* ---------- Components ---------- */

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="feature-card">
      <strong>{title}</strong>
      <p>{desc}</p>
    </div>
  );
}

function Step({
  number,
  title,
  desc,
}: {
  number: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="step">
      <div className="step-circle">{number}</div>
      <strong>{title}</strong>
      <p>{desc}</p>
    </div>
  );
}

function Arrow() {
  return <span className="arrow">›</span>;
}

function CleanStep({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="clean-step-card">
      <strong>{title}</strong>
      <p>{desc}</p>
    </div>
  );
}
