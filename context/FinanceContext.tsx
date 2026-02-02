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
  loading: boolean;
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

/* ================= 🔑 ENTRY TYPE NORMALIZATION ================= */
/* THIS IS THE CORE FIX */

const entryToDB = (rawType: EntryType) => {
  const type = rawType.toLowerCase();

  if (type.includes("pending") && type.includes("in")) {
    return { type: "income", status: "pending" };
  }

  if (type.includes("pending") && type.includes("out")) {
    return { type: "expense", status: "pending" };
  }

  if (type === "received") {
    return { type: "income", status: "completed" };
  }

  if (type === "sent") {
    return { type: "expense", status: "completed" };
  }

  throw new Error("Invalid entry type");
};

const dbToEntryType = (
  dbType: "income" | "expense",
  status: "pending" | "completed"
): EntryType => {
  if (dbType === "income" && status === "pending") return EntryType.PendingIn;
  if (dbType === "expense" && status === "pending") return EntryType.PendingOut;
  if (dbType === "income") return EntryType.Received;
  return EntryType.Sent;
};

/* ================= PROVIDER ================= */

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
      async (event, session) => {
        if (!mounted) return;

        if (event === "SIGNED_IN" && session?.user) {
          setUser((prev) => ({
            ...prev,
            id: session.user.id,
            email: session.user.email || "",
          }));
          fetchData(session.user.id);
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

  const formatAmount = (amount: number) =>
    `${CURRENCIES[currency].symbol}${amount.toFixed(2)}`;

  /* ---------------- ENTRY ACTIONS ---------------- */

  const addEntry = async (entry: Omit<FinanceEntry, "id">) => {
    if (!user.id) throw new Error("Not authenticated");

    const db = entryToDB(entry.type);

    const { error } = await supabase.from("entries").insert({
      user_id: user.id,
      name: entry.name,
      amount: entry.amount,
      date: entry.date,
      description: entry.description,
      payment_mode: entry.paymentMode,
      client_email: entry.clientEmail,
      due_date: entry.dueDate,
      type: db.type,
      status: db.status,
    });

    if (error) throw error;
    await fetchData(user.id);
  };

  const updateEntry = async (entry: FinanceEntry) => {
    const db = entryToDB(entry.type);

    const { error } = await supabase
      .from("entries")
      .update({
        name: entry.name,
        amount: entry.amount,
        date: entry.date,
        description: entry.description,
        payment_mode: entry.paymentMode,
        client_email: entry.clientEmail,
        due_date: entry.dueDate,
        type: db.type,
        status: db.status,
      })
      .eq("id", entry.id);

    if (error) throw error;
    await fetchData(user.id);
  };

  const deleteEntry = async (id: string) => {
    await supabase.from("entries").delete().eq("id", id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const markAsCompleted = async (id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;

    const newType =
      entry.type === EntryType.PendingIn
        ? EntryType.Received
        : EntryType.Sent;

    await updateEntry({ ...entry, type: newType });
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
      formatAmount,
      addEntry,
      updateEntry,
      deleteEntry,
      getEntry: (id: string) => entries.find((e) => e.id === id),
      markAsCompleted,
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
