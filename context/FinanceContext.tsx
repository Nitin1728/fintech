import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
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
  loading: boolean;
  notifications: AppNotification[];
  setCurrency: (code: CurrencyCode) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  upgradeToPro: () => Promise<void>;
  formatAmount: (amount: number) => string;
  addEntry: (entry: Omit<FinanceEntry, "id" | "status">) => Promise<void>;
  updateEntry: (entry: FinanceEntry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  getEntry: (id: string) => FinanceEntry | undefined;
  markAsCompleted: (id: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

/* =====================================================
   🔑 SINGLE SOURCE OF TRUTH (UI ↔ DB)
===================================================== */

const entryToDB = (entryType: EntryType) => {
  switch (entryType) {
    case EntryType.PendingIn:
      return { type: "income", status: "pending" };

    case EntryType.PendingOut:
      return { type: "expense", status: "pending" };

    case EntryType.Received:
      return { type: "income", status: "completed" };

    case EntryType.Sent:
      return { type: "expense", status: "completed" };

    default:
      throw new Error("Invalid EntryType");
  }
};

const dbToEntryType = (
  type: "income" | "expense",
  status: "pending" | "completed"
): EntryType => {
  if (status === "pending" && type === "income") return EntryType.PendingIn;
  if (status === "pending" && type === "expense") return EntryType.PendingOut;
  if (status === "completed" && type === "income") return EntryType.Received;
  return EntryType.Sent;
};

/* =====================================================
   PROVIDER
===================================================== */

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");
  const [user, setUser] = useState<User>(EMPTY_USER);
  const [notifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- MAP DB ENTRY ---------------- */

  const mapEntryFromDB = (db: any): FinanceEntry => {
    const type = dbToEntryType(db.type, db.status);

    return {
      id: db.id,
      name: db.name,
      amount: db.amount,
      description: db.description || "",
      date: db.date,
      paymentMode: db.payment_mode,
      clientEmail: db.client_email || undefined,
      dueDate: db.due_date || undefined,
      type,
      status:
        type === EntryType.PendingIn || type === EntryType.PendingOut
          ? "Pending"
          : "Completed",
    };
  };

  /* ---------------- FETCH DATA ---------------- */

  const fetchData = useCallback(async (userId: string) => {
    const [entriesRes, profileRes] = await Promise.all([
      supabase
        .from("entries")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false }),
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    ]);

    if (entriesRes.error) {
      console.error(entriesRes.error);
      return;
    }

    setEntries(entriesRes.data.map(mapEntryFromDB));

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

  /* ---------------- AUTH BOOTSTRAP ---------------- */

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session?.user) {
        setUser((prev) => ({
          ...prev,
          id: session.user.id,
          email: session.user.email || "",
        }));
        await fetchData(session.user.id);
      } else {
        setUser(EMPTY_USER);
        setEntries([]);
      }

      setLoading(false);
    };

    bootstrap();

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;

        if (session?.user) {
          setUser((prev) => ({
            ...prev,
            id: session.user.id,
            email: session.user.email || "",
          }));
          fetchData(session.user.id);
        } else {
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

  /* ---------------- USER PREFS ---------------- */

  const setCurrency = async (code: CurrencyCode) => {
    setCurrencyState(code);
    if (user.id) {
      await supabase.from("profiles").upsert({ id: user.id, currency: code });
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user.id) return;

    setUser((prev) => ({ ...prev, ...updates }));

    await supabase.from("profiles").upsert({
      id: user.id,
      name: updates.name,
      avatar: updates.avatar,
      receiving_accounts: updates.receivingAccounts,
      payment_methods: updates.paymentMethods,
      plan: updates.plan,
      billing_cycle: updates.billingCycle,
    });
  };

  /* ---------------- PRO UPGRADE ---------------- */

  const upgradeToPro = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) throw new Error("Not authenticated");

    await supabase
      .from("profiles")
      .update({
        plan: "Pro",
        plan_started_at: new Date().toISOString(),
      })
      .eq("id", session.user.id);

    setUser((prev) => ({ ...prev, plan: "Pro" }));
  };

  const formatAmount = (amount: number) =>
    `${CURRENCIES[currency].symbol}${amount.toFixed(2)}`;

  /* ---------------- ENTRY ACTIONS ---------------- */

  const addEntry = async (entry: Omit<FinanceEntry, "id" | "status">) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) throw new Error("Not authenticated");

    const { type, status } = entryToDB(entry.type);

    if (status === "pending" && !entry.dueDate) {
      throw new Error("Due date is required for pending entries");
    }

    const { error } = await supabase.from("entries").insert({
      user_id: session.user.id,
      name: entry.name,
      amount: entry.amount,
      date: entry.date,
      description: entry.description || null,
      payment_mode: entry.paymentMode,
      client_email: entry.clientEmail || null,
      due_date: entry.dueDate || null,
      type,
      status,
    });

    if (error) throw error;

    await fetchData(session.user.id);
  };

  const updateEntry = async (entry: FinanceEntry) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) throw new Error("Not authenticated");

    const { type, status } = entryToDB(entry.type);

    if (status === "pending" && !entry.dueDate) {
      throw new Error("Due date is required for pending entries");
    }

    const { error } = await supabase
      .from("entries")
      .update({
        name: entry.name,
        amount: entry.amount,
        date: entry.date,
        description: entry.description || null,
        payment_mode: entry.paymentMode,
        client_email: entry.clientEmail || null,
        due_date: entry.dueDate || null,
        type,
        status,
      })
      .eq("id", entry.id);

    if (error) throw error;

    await fetchData(session.user.id);
  };

  const deleteEntry = async (id: string) => {
    await supabase.from("entries").delete().eq("id", id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const markAsCompleted = async (id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;

    const nextType =
      entry.type === EntryType.PendingIn
        ? EntryType.Received
        : EntryType.Sent;

    await updateEntry({ ...entry, type: nextType });
  };

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
      upgradeToPro,
      formatAmount,
      addEntry,
      updateEntry,
      deleteEntry,
      getEntry: (id: string) => entries.find((e) => e.id === id),
      markAsCompleted,
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
