import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { Resend } from "npm:resend";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

serve(async (req) => {
  try {
    const { entryId } = await req.json();

    const {
      data: { user },
    } = await supabase.auth.getUser(req.headers.get("Authorization")!);

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { data: entry, error } = await supabase
      .from("entries")
      .select("*")
      .eq("id", entryId)
      .eq("user_id", user.id)
      .single();

    if (error || !entry) {
      return new Response("Entry not found", { status: 404 });
    }

    /* 🚫 HARD BLOCK — PENDING OUT */
    if (entry.type === "expense") {
      return new Response("Manual reminders not allowed for Pending OUT", {
        status: 403,
      });
    }

    if (!entry.client_email) {
      return new Response("Client email missing", { status: 400 });
    }

    /* ⏱ ONCE PER 24 HOURS */
    if (entry.last_manual_reminder_sent) {
      const last = new Date(entry.last_manual_reminder_sent).getTime();
      if (Date.now() - last < 24 * 60 * 60 * 1000) {
        return new Response("Reminder already sent today", { status: 429 });
      }
    }

    await resend.emails.send({
      from: "FinBook <reminder@resend.dev>",
      to: entry.client_email,
      subject: `Payment Reminder – ${entry.name}`,
      html: `
        <p>Hello,</p>
        <p>This is a reminder for the pending payment:</p>
        <ul>
          <li><strong>Amount:</strong> ${entry.amount}</li>
          <li><strong>Due Date:</strong> ${entry.due_date}</li>
        </ul>
        <p>Please arrange payment at the earliest.</p>
        <p>– ${user.email}</p>
      `,
    });

    await supabase
      .from("entries")
      .update({ last_manual_reminder_sent: new Date().toISOString() })
      .eq("id", entry.id);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response("Server error", { status: 500 });
  }
});
