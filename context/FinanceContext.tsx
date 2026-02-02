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
        name: p.name ?? prev.name,
        avatar: p.avatar ?? prev.avatar,
        plan: p.plan ?? prev.plan,
        billingCycle: p.billing_cycle ?? prev.billingCycle,
        receivingAccounts: p.receiving_accounts ?? [],
        paymentMethods: p.payment_methods ?? [],
        email: prev.email,
      }));
      if (p.currency) setCurrencyState(p.currency);
    }
  }, []);

  /* ---------------- AUTH ---------------- */

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!mounted) return;

      if (session?.user) {
        setUser((u) => ({
          ...u,
          id: session.user.id,
          email: session.user.email || "",
        }));
        await fetchData(session.user.id);
      }

      setLoading(false);
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        if (!mounted) return;

        if (session?.user) {
          setUser((u) => ({
            ...u,
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

  /* ---------------- ENTRIES ---------------- */

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
    await supabase.from("entries").delete().eq("id", id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const markAsCompleted = async (id: string) => {
    await supabase.from("entries").update({ status: "completed" }).eq("id", id);
    await fetchData(user.id);
  };

  /* ---------------- PROFILE ---------------- */

  const updateUser = async (updates: Partial<User>) => {
    if (!user.id) return;

    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.avatar !== undefined) payload.avatar = updates.avatar;
    if (updates.receivingAccounts !== undefined)
      payload.receiving_accounts = updates.receivingAccounts;
    if (updates.paymentMethods !== undefined)
      payload.payment_methods = updates.paymentMethods;

    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, ...payload });

    if (error) throw error;

    setUser((prev) => ({ ...prev, ...updates }));
  };

  const setCurrency = async (code: CurrencyCode) => {
    setCurrencyState(code);
    if (user.id) {
      await supabase.from("profiles").upsert({ id: user.id, currency: code });
    }
  };

  const formatAmount = (amount: number) =>
    `${CURRENCIES[currency].symbol}${amount.toFixed(2)}`;

  /* ---------------- CONTEXT ---------------- */

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
