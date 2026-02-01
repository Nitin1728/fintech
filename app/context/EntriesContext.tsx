"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

export type Entry = {
  id: string;
  type: "pending" | "promised" | "received" | "sent";
  amount: number;
  person: string;
  date: string;
  paymentMode: string;
  notes: string;
  clientEmail?: string;
  userId: string;
};

type EntriesContextType = {
  entries: Entry[];
  addEntry: (entry: Omit<Entry, "userId">) => Promise<void>;
  markAsReceived: (id: string) => Promise<void>;
  sendReminder: (entry: Entry) => Promise<void>;
};

const EntriesContext =
  createContext<EntriesContextType | null>(null);

export function EntriesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    if (user) {
      fetchEntries(user.id);
    } else {
      setEntries([]);
    }
  }, [user]);

  const fetchEntries = async (userId: string) => {
    const { data, error } = await supabase
      .from("finance_entries")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error || !data) return;

    setEntries(
      data.map((row) => ({
        id: row.id,
        type: row.type,
        amount: row.amount,
        person: row.person,
        date: row.date,
        paymentMode: row.payment_mode,
        notes: row.notes,
        clientEmail: row.client_email,
        userId: row.user_id,
      }))
    );
  };

  const addEntry = async (
    entry: Omit<Entry, "userId">
  ) => {
    if (!user) return;

    const { error } = await supabase
      .from("finance_entries")
      .insert({
        id: entry.id,
        type: entry.type,
        amount: entry.amount,
        person: entry.person,
        date: entry.date,
        payment_mode: entry.paymentMode,
        notes: entry.notes,
        client_email: entry.clientEmail,
        user_id: user.id,
      });

    if (!error) {
      setEntries((prev) => [
        { ...entry, userId: user.id },
        ...prev,
      ]);
    }
  };

  const markAsReceived = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("finance_entries")
      .update({ type: "received" })
      .eq("id", id)
      .eq("user_id", user.id);

    if (!error) {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, type: "received" } : e
        )
      );
    }
  };

  const sendReminder = async (entry: Entry) => {
    if (!entry.clientEmail) return;

    await fetch("/api/send-reminder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: entry.clientEmail,
        client: entry.person,
        amount: entry.amount,
        date: entry.date,
      }),
    });
  };

  return (
    <EntriesContext.Provider
      value={{
        entries,
        addEntry,
        markAsReceived,
        sendReminder,
      }}
    >
      {children}
    </EntriesContext.Provider>
  );
}

export function useEntries() {
  const context = useContext(EntriesContext);
  if (!context) {
    throw new Error(
      "useEntries must be used within EntriesProvider"
    );
  }
  return context;
}
