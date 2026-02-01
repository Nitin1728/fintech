import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { SIDEBAR_ITEMS, APP_NAME } from "../constants";
import { useFinance } from "../context/FinanceContext";
import { LogOut, Bell, Menu } from "lucide-react";
import { supabase } from "../src/lib/supabase";

/* ================= SIDEBAR ================= */

const Sidebar = ({
  mobileOpen,
  setMobileOpen,
}: {
  mobileOpen: boolean;
  setMobileOpen: (o: boolean) => void;
}) => {
  const { user } = useFinance();
  const navigate = useNavigate();

  /* --------- FIXED SIGN OUT --------- */
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut(); // ✅ destroy session
      navigate("/", { replace: true }); // ✅ hard redirect
    } catch (err) {
      console.error("Sign out failed", err);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200
        transform transition-transform duration-200 ease-in-out
        lg:translate-x-0 lg:static lg:inset-auto lg:flex lg:flex-col
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex items-center h-16 px-6 border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-xl text-emerald-700">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
              <span className="text-lg">F</span>
            </div>
            {APP_NAME}
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `
                flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }
              `
              }
              onClick={() => setMobileOpen(false)}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img
              src={user.avatar || ""}
              alt={user.name}
              className="w-8 h-8 rounded-full bg-slate-200 object-cover"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user.email}
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium
                       text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-600
                       transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

/* ================= TOPBAR ================= */

const Topbar = ({ setMobileOpen }: { setMobileOpen: (o: boolean) => void }) => {
  const { user, notifications } = useFinance();
  const unreadCount = notifications.filter((n) => n.unread).length;
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <button
          className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button
          className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
          onClick={() => navigate("/app/notifications")}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          )}
        </button>

        <div className="h-8 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700 hidden sm:block">
            {user.name}
          </span>
          <img
            src={user.avatar || ""}
            alt={user.name}
            className="w-8 h-8 rounded-full bg-slate-200 object-cover border cursor-pointer"
            onClick={() => navigate("/app/settings")}
          />
        </div>
      </div>
    </header>
  );
};

/* ================= LAYOUT ================= */

export const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar setMobileOpen={setMobileOpen} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
