import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from '../components/ui';
import { LANDING_FEATURES } from '../constants';
import { CheckCircle2, ArrowRight, Shield, Zap, TrendingUp } from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium mb-8 animate-fade-in-up">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            New: Yearly Savings Plan Live
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl mx-auto leading-tight">
            Professional Finance Management for <span className="text-emerald-600">Individuals & Small Businesses</span>
          </h1>
          <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Track income, expenses, receivables, and payables in one secure, high-performance financial dashboard. No spreadsheets, no confusion.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto px-8 py-4 text-lg shadow-emerald-200 shadow-xl">Start Free</Button>
            </Link>
            <Link to="/pricing">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8 py-4 text-lg">View Pricing</Button>
            </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              Secure & Encrypted
            </div>
            <div className="hidden sm:block w-1 h-1 bg-slate-300 rounded-full"></div>
            <div className="flex items-center gap-2">
              <CreditCardIcon className="w-4 h-4 text-emerald-600" />
              No Credit Card Required
            </div>
            <div className="hidden sm:block w-1 h-1 bg-slate-300 rounded-full"></div>
             <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Trusted by professionals
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-xl bg-slate-900/5 p-2 ring-1 ring-inset ring-slate-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-slate-200">
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                        </div>
                    </div>
                    {/* Abstract Representation of Dashboard */}
                    <div className="p-8 grid grid-cols-4 gap-6 bg-slate-50/50">
                        <div className="col-span-1 h-32 bg-white rounded-lg shadow-sm border border-slate-100 animate-pulse"></div>
                        <div className="col-span-1 h-32 bg-white rounded-lg shadow-sm border border-slate-100 animate-pulse delay-75"></div>
                        <div className="col-span-1 h-32 bg-white rounded-lg shadow-sm border border-slate-100 animate-pulse delay-100"></div>
                        <div className="col-span-1 h-32 bg-white rounded-lg shadow-sm border border-slate-100 animate-pulse delay-150"></div>
                        <div className="col-span-3 h-64 bg-white rounded-lg shadow-sm border border-slate-100 mt-4"></div>
                        <div className="col-span-1 h-64 bg-white rounded-lg shadow-sm border border-slate-100 mt-4"></div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to master your cash flow</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Powerful tools designed for simplicity and speed.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {LANDING_FEATURES.map((feature, idx) => (
              <Card key={idx} className="p-6 hover:shadow-lg transition-all duration-300 border-t-4 border-t-emerald-500">
                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">How It Works</h2>
                <p className="text-lg text-slate-500">Get started in minutes, not hours.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-2xl font-bold text-emerald-600 shadow-sm mb-6">1</div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Add Entries</h3>
                    <p className="text-slate-500">Log your income, expenses, and pending payments quickly.</p>
                </div>
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-2xl font-bold text-emerald-600 shadow-sm mb-6">2</div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Set Reminders</h3>
                    <p className="text-slate-500">Let FinBook nudge you (or your clients) when payments are due.</p>
                </div>
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-2xl font-bold text-emerald-600 shadow-sm mb-6">3</div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Get Paid</h3>
                    <p className="text-slate-500">Watch your cash flow improve and pending amounts drop.</p>
                </div>
            </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-emerald-900 text-white relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
         <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Take control of your finances today</h2>
            <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of freelancers and small businesses who trust FinBook.
                Stop losing money to forgotten payments.
            </p>
            <Link to="/auth/signup">
                <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50 border-none px-8">Start Free Now</Button>
            </Link>
            <p className="mt-4 text-sm text-emerald-300">No credit card required. Cancel anytime.</p>
         </div>
      </section>
    </div>
  );
};

// Helper component for icon
const CreditCardIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
);

export default Landing;
