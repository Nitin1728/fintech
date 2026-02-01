import { Button } from "./ui";
import { useFinance } from "../context/FinanceContext";
import { supabase } from "../src/lib/supabase";

export const SendReminderButton = ({ entry }: { entry: any }) => {
  const { user } = useFinance();

  /* ❌ BLOCK PENDING OUT */
  if (entry.type !== "income") return null;

  /* ⚠ NO EMAIL */
  if (!entry.clientEmail) {
    return (
      <p className="text-xs text-red-500">
        Client email missing. Add email to send reminder.
      </p>
    );
  }

  const last = entry.last_manual_reminder_sent
    ? new Date(entry.last_manual_reminder_sent).getTime()
    : 0;

  const canSend = Date.now() - last >= 24 * 60 * 60 * 1000;

  const handleSend = async () => {
    const session = await supabase.auth.getSession();

    await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-manual-reminder`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.data.session?.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ entryId: entry.id }),
      }
    );

    alert("Reminder sent successfully");
  };

  return (
    <Button
      size="sm"
      disabled={!canSend}
      onClick={handleSend}
      className="mt-2"
    >
      {canSend ? "Send Reminder" : "Already sent today"}
    </Button>
  );
};
