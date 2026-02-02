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

/* ================= PROVIDER ================= */

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");
  const [user, setUser] = useState<User>(EMPTY_USER);
  const [notifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

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
    const { data, error } = await supabase
      .from("entries")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error) {
      console.error("Fetch entries failed:", error);
      return;
    }

    setEntries(data.map(mapEntryFromDB));
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
        const u = session.user;
        setUser((prev) => ({ ...prev, id: u.id, email: u.email || "" }));
        await fetchData(u.id);
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

  /* ---------------- ACTIONS ---------------- */

  const addEntry = async (entry: Omit<FinanceEntry, "id">) => {
    if (!user.id) throw new Error("Not authenticated");

    const { error } = await supabase.from("entries").insert({
      user_id: user.id,
      name: entry.name,
      amount: entry.amount,
      date: entry.date,
      description: entry.description,
      payment_mode: entry.paymentMode,
      client_email: entry.clientEmail,
      due_date: entry.dueDate,
      type: mapTypeToDB(entry.type),
      status:
        entry.type === EntryType.PendingIn ||
        entry.type === EntryType.PendingOut
          ? "pending"
          : "completed",
    });

    if (error) throw error;

    await fetchData(user.id);
  };

  const updateEntry = async (entry: FinanceEntry) => {
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
        type: mapTypeToDB(entry.type),
        status:
          entry.type === EntryType.PendingIn ||
          entry.type === EntryType.PendingOut
            ? "pending"
            : "completed",
      })
      .eq("id", entry.id);

    if (error) throw error;

    await fetchData(user.id);
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from("entries").delete().eq("id", id);
    if (error) throw error;
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const markAsCompleted = async (id: string) => {
    const { error } = await supabase
      .from("entries")
      .update({ status: "completed" })
      .eq("id", id);

    if (error) throw error;
    await fetchData(user.id);
  };

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
