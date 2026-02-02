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

/* ================= DEFAULT USER ================= */

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

/* ================= CONTEXT ================= */

interface FinanceContextType {
  entries: FinanceEntry[];
  currency: CurrencyCode;
  user: User;
  loading: boolean;
  notifications: AppNotification[];
  setCurrency: (code: CurrencyCode) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  formatAmount: (amount: number) => string;
  addEntry: (entry: Omit<FinanceEntry, "id" | "status">) => Promise<void>;
  updateEntry: (entry: FinanceEntry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  getEntry: (id: string) => FinanceEntry | undefined;
  markAsCompleted: (id: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

/* ================= TYPE ↔ DB NORMALIZATION ================= */

const entryToDB = (type: EntryType) => {
  switch (type) {
    case EntryType.PendingIn:
      return { type: "income", status: "pending_in" };

    case EntryType.PendingOut:
      return { type: "expense", status: "pending_out" };

    case EntryType.Received:
      return { type: "income", status: "completed" };

    case EntryType.Sent:
      return { type: "expense", status: "completed" };

    default:
      throw new Error("Invalid entry type");
  }
};

const dbToEntryType = (
  type: "income" | "expense",
  status: "completed" | "pending_in" | "pending_out"
): EntryType => {
  if (type === "income" && status === "pending_in") return EntryType.PendingIn;
  if (type === "expense" && status === "pending_out") return EntryType.PendingOut;
  if (type === "income") return EntryType.Received;
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

  /* ================= MAP DB ENTRY ================= */

  const mapEntryFromDB = (db: any): FinanceEntry => {
    const type = dbToEntryType(db.type, db.status);

    return {
      id: db.id,
      name: db.name,
      amount: db.amount,
      description: db.description || "",
      date: db.date,
      type,
      status:
        type === EntryType.PendingIn || type === EntryType.PendingOut
          ? "Pending"
          : "Completed",
      paymentMode: db.payment_mode,
      clientEmail: db.client_email || undefined,
      dueDate: db.due_date || undefined,
    };
  };

  /* ================= FETCH DATA ================= */

  const fetchData = useCallback(async (userId: string) => {
    const { data: entriesData, error } = await supabase
      .from("entries")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error) {
      console.error("Fetch entries error:", error);
      return;
    }

    setEntries(entriesData.map(mapEntryFromDB));

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (profile) {
      setUser((prev) => ({
        ...prev,
        name: profile.name || prev.name,
        avatar: profile.avatar || prev.avatar,
        plan: profile.plan || prev.plan,
        billingCycle: profile.billing_cycle || prev.billingCycle,
        receivingAccounts: profile.receiving_accounts || [],
        paymentMethods: profile.payment_methods || [],
      }));

      if (profile.currency) setCurrencyState(profile.currency);
    }
  }, []);

  /* ================= AUTH BOOTSTRAP ================= */

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      if (data.session?.user) {
        const u = data.session.user;
        setUser({
          ...EMPTY_USER,
          id: u.id,
          email: u.email || "",
        });
        await fetchData(u.id);
      } else {
        setUser(EMPTY_USER);
        setEntries([]);
      }

      setLoading(false);
    };

    bootstrap();

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        if (!mounted) return;

        if (session?.user) {
          setUser({
            ...EMPTY_USER,
            id: session.user.id,
            email: session.user.email || "",
          });
          await fetchData(session.user.id);
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

  /* ================= USER PREFS ================= */

  const setCurrency = async (code: CurrencyCode) => {
    setCurrencyState(code);
    if (!user.id) return;

    await supabase.from("profiles").upsert({
      id: user.id,
      currency: code,
    });
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

  /* ================= ENTRY ACTIONS ================= */

  const addEntry = async (entry: Omit<FinanceEntry, "id" | "status">) => {
    if (!user.id) throw new Error("User not authenticated");

    if (
      (entry.type === EntryType.PendingIn ||
        entry.type === EntryType.PendingOut) &&
      !entry.dueDate
    ) {
      throw new Error("Due date required for pending entries");
    }

    const db = entryToDB(entry.type);

    const { error } = await supabase.from("entries").insert({
      user_id: user.id,
      name: entry.name,
      amount: entry.amount,
      date: entry.date,
      description: entry.description || null,
      payment_mode: entry.paymentMode,
      client_email: entry.clientEmail || null,
      due_date: entry.dueDate || null,
      type: db.type,
      status: db.status,
    });

    if (error) {
      console.error("Insert error:", error);
      throw error;
    }

    await fetchData(user.id);
  };

  const updateEntry = async (entry: FinanceEntry) => {
    if (!user.id) throw new Error("User not authenticated");

    if (
      (entry.type === EntryType.PendingIn ||
        entry.type === EntryType.PendingOut) &&
      !entry.dueDate
    ) {
      throw new Error("Due date required for pending entries");
    }

    const db = entryToDB(entry.type);

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
        type: db.type,
        status: db.status,
      })
      .eq("id", entry.id);

    if (error) {
      console.error("Update error:", error);
      throw error;
    }

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

  /* ================= CONTEXT VALUE ================= */

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

/* ================= HOOK ================= */

export const useFinance = () => {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider");
  return ctx;
};
