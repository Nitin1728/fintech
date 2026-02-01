import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Button } from './ui';
import { APP_NAME } from '../constants';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export const PublicLayout: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-emerald-700">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                <span className="text-lg">F</span>
              </div>
              {APP_NAME}
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/features" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Features</Link>
              <Link to="/pricing" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Pricing</Link>
              <Link to="/about" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">About</Link>
              <div className="flex items-center gap-4 ml-4">
                <Link to="/auth/signin">
                    <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link to="/auth/signup">
                    <Button variant="primary" size="sm">Start Free</Button>
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setMenuOpen(!menuOpen)} className="text-slate-600 hover:text-slate-900">
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-4 shadow-lg">
            <Link to="/features" className="block text-sm font-medium text-slate-700 hover:text-emerald-600">Features</Link>
            <Link to="/pricing" className="block text-sm font-medium text-slate-700 hover:text-emerald-600">Pricing</Link>
            <Link to="/about" className="block text-sm font-medium text-slate-700 hover:text-emerald-600">About</Link>
            <div className="pt-4 flex flex-col gap-2">
                <Link to="/auth/signin" className="w-full">
                    <Button variant="secondary" className="w-full">Log in</Button>
                </Link>
                <Link to="/auth/signup" className="w-full">
                    <Button variant="primary" className="w-full">Start Free</Button>
                </Link>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      <footer className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 font-bold text-lg text-emerald-700 mb-4">
               <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center text-white">
                <span className="text-xs">F</span>
              </div>
              {APP_NAME}
            </div>
            <p className="text-sm text-slate-500">
              Professional finance tracking for freelancers and small businesses. Secure, fast, and simple.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link to="/features" className="hover:text-emerald-600">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-emerald-600">Pricing</Link></li>
              <li><Link to="/security" className="hover:text-emerald-600">Security</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link to="/about" className="hover:text-emerald-600">About</Link></li>
              <li><Link to="/blog" className="hover:text-emerald-600">Blog</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-600">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link to="/privacy" className="hover:text-emerald-600">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-emerald-600">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-200 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
