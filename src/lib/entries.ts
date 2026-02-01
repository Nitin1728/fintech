import { supabase } from "./supabase";

/**
 * Fetch all entries for the logged-in user
 */
export async function getEntries() {
  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .order("date", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Add a new entry
 */
export async function addEntry(entry: {
  type: "income" | "expense";
  title: string;
  amount: number;
  category?: string;
  date: string;
  notes?: string;
}) {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase.from("entries").insert([
    {
      ...entry,
      user_id: user.id,
    },
  ]);

  if (error) throw error;
  return data;
}

/**
 * Update an existing entry
 */
export async function updateEntry(
  id: string,
  updates: Partial<{
    type: "income" | "expense";
    title: string;
    amount: number;
    category: string;
    date: string;
    notes: string;
  }>
) {
  const { error } = await supabase
    .from("entries")
    .update(updates)
    .eq("id", id);

  if (error) throw error;
}

/**
 * Delete an entry
 */
export async function deleteEntry(id: string) {
  const { error } = await supabase
    .from("entries")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
