import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  FinanceEntry,
  CurrencyCode,
  CURRENCIES,
  User,
  AppNotification,
  EntryType,
} from "../types";
import { supabase } from "../src/lib/supabase";

/* ---------------- DEFAULT USER ---------------- */

const EMPTY_USER: User = {
  id: "",
  name: "Guest",
  email: "",
  avatar: "",
  plan: "Free",
  billingCycle: "Monthly",
  receivingAccounts: [],
  paymentMethods: [],
};

/* ---------------- CONTEXT ---------------- */

interface FinanceContextType {
  entries: FinanceEntry[];
  currency: CurrencyCode;
  user: User;
  loading: boolean; // ⬅️ true ONLY until auth is resolved once
  notifications: AppNotification[];
  setCurrency: (code: CurrencyCode) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  formatAmount: (amount: number) => string;
  addEntry: (entry: Omit<FinanceEntry, "id">) => Promise<void>;
  updateEntry: (entry: FinanceEntry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  getEntry: (id: string) => FinanceEntry | undefined;
  markAsCompleted: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  upgradeToPro: () => void;
  deleteAccount: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

/* ================= PROVIDER ================= */

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");
  const [user, setUser] = useState<User>(EMPTY_USER);
  const [notifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true); // ⬅️ AUTH BOOTSTRAP ONLY

  /* ---------------- HELPERS ---------------- */

  const mapTypeToDB = (type: EntryType): "income" | "expense" =>
    type === EntryType.Received || type === EntryType.PendingIn
      ? "income"
      : "expense";

  const mapTypeFromDB = (
    dbType: "income" | "expense",
    status: "pending" | "completed"
  ): EntryType => {
    if (dbType === "income") {
      return status === "pending"
        ? EntryType.PendingIn
        : EntryType.Received;
    }
    return status === "pending"
      ? EntryType.PendingOut
      : EntryType.Sent;
  };

  const mapEntryFromDB = (db: any): FinanceEntry => {
    const type = mapTypeFromDB(db.type, db.status);
    return {
      id: db.id,
      name: db.name,
      amount: db.amount,
      description: db.description,
      date: db.date,
      type,
      status:
        type === EntryType.PendingIn || type === EntryType.PendingOut
          ? "Pending"
          : "Completed",
      paymentMode: db.payment_mode,
      clientEmail: db.client_email,
      dueDate: db.due_date,
    };
  };

  /* ---------------- DATA LOAD ---------------- */

  const fetchData = useCallback(async (userId: string) => {
    const [entriesRes, profileRes] = await Promise.all([
      supabase
        .from("entries")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false }),
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    ]);

    if (entriesRes.data) {
      setEntries(entriesRes.data.map(mapEntryFromDB));
    }

    if (profileRes.data) {
      const p = profileRes.data;
      setUser((prev) => ({
        ...prev,
        id: userId,
        name: p.name || prev.name,
        avatar: p.avatar || prev.avatar,
        plan: p.plan || prev.plan,
        billingCycle: p.billing_cycle || prev.billingCycle,
        receivingAccounts: p.receiving_accounts || [],
        paymentMethods: p.payment_methods || [],
      }));
      if (p.currency) setCurrencyState(p.currency);
    }
  }, []);

  /* ---------------- AUTH BOOTSTRAP (ONCE) ---------------- */

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session?.user) {
        const u = session.user;
        setUser((prev) => ({ ...prev, id: u.id, email: u.email || "" }));
        await fetchData(u.id);
      } else {
        setUser(EMPTY_USER);
        setEntries([]);
      }

      setLoading(false); // ✅ AUTH IS NOW FINAL
    };

    bootstrap();

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === "SIGNED_IN" && session?.user) {
          const u = session.user;
          setUser((prev) => ({ ...prev, id: u.id, email: u.email || "" }));
          fetchData(u.id); // background
        }

        if (event === "SIGNED_OUT") {
          setUser(EMPTY_USER);
          setEntries([]);
        }
      }
    );

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [fetchData]);

  /* ---------------- PREFS ---------------- */

  const setCurrency = async (code: CurrencyCode) => {
    setCurrencyState(code);
    if (user.id) {
      await supabase.from("profiles").upsert({ id: user.id, currency: code });
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const formatAmount = (amount: number) =>
    `${CURRENCIES[currency].symbol}${amount.toFixed(2)}`;

  /* ---------------- CONTEXT VALUE ---------------- */

  const value = useMemo(
    () => ({
      entries,
      currency,
      user,
      loading,
      notifications,
      setCurrency,
      updateUser,
      formatAmount,
      addEntry: async () => {},
      updateEntry: async () => {},
      deleteEntry: async () => {},
      getEntry: (id: string) => entries.find((e) => e.id === id),
      markAsCompleted: async () => {},
      markAllNotificationsRead: async () => {},
      upgradeToPro: () => {},
      deleteAccount: async () => {
        await supabase.auth.signOut();
      },
    }),
    [entries, currency, user, loading]
  );

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};

/* ---------------- HOOK ---------------- */

export const useFinance = () => {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider");
  return ctx;
};
