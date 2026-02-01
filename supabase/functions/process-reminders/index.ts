import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// =======================
// ENV
// =======================
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase =
  SUPABASE_URL && SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
    : null;

const SEND_EMAIL_URL = SUPABASE_URL
  ? `${SUPABASE_URL}/functions/v1/send-email`
  : null;

// =======================
// HELPERS
// =======================
const daysBetween = (from: Date, to: Date) =>
  Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));

const alreadySent = async (type: string, periodKey: string) => {
  const { data } = await supabase!
    .from("payment_reminders")
    .select("id")
    .eq("type", type)
    .eq("entry_id", periodKey)
    .maybeSingle();
  return !!data;
};

const toCSV = (rows: any[]) => {
  if (rows.length === 0) return "No data";
  const headers = Object.keys(rows[0]).join(",");
  const values = rows.map(r => Object.values(r).join(","));
  return [headers, ...values].join("\n");
};

// =======================
// SERVER
// =======================
serve(async () => {
  try {
    if (!supabase || !SEND_EMAIL_URL) {
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    const now = new Date();

    // =======================
    // OWNER (PRO USERS ONLY)
    // =======================
    const { data: owners } = await supabase
      .from("users")
      .select("id, email")
      .eq("plan", "pro");

    if (!owners || owners.length === 0) {
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    // =======================
    // WEEKLY REPORT (MONDAY)
    // =======================
    const isMonday = now.getUTCDay() === 1;
    if (isMonday) {
      const start = new Date(now);
      start.setUTCDate(start.getUTCDate() - 7);

      const periodKey = `weekly-${start.toISOString().slice(0, 10)}`;

      if (!(await alreadySent("weekly_report", periodKey))) {
        const { data: rows } = await supabase
          .from("entries")
          .select("title, amount, status, created_at")
          .gte("created_at", start.toISOString());

        const csv = toCSV(rows || []);

        for (const owner of owners) {
          await fetch(SEND_EMAIL_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${SERVICE_ROLE_KEY}`
            },
            body: JSON.stringify({
              to: owner.email,
              subject: "📊 Weekly Finance Report",
              html: `<p>Your weekly report is attached.</p>`,
              attachments: [
                {
                  filename: "weekly-report.csv",
                  content: csv
                }
              ]
            })
          });
        }

        await supabase.from("payment_reminders").insert({
          entry_id: periodKey,
          user_id: owners[0].id,
          type: "weekly_report"
        });
      }
    }

    // =======================
    // MONTHLY REPORT (1st)
    // =======================
    const isFirstDay = now.getUTCDate() === 1;
    if (isFirstDay) {
      const start = new Date(now);
      start.setUTCMonth(start.getUTCMonth() - 1);
      start.setUTCDate(1);

      const end = new Date(start);
      end.setUTCMonth(end.getUTCMonth() + 1);

      const periodKey = `monthly-${start.toISOString().slice(0, 7)}`;

      if (!(await alreadySent("monthly_report", periodKey))) {
        const { data: rows } = await supabase
          .from("entries")
          .select("title, amount, status, created_at")
          .gte("created_at", start.toISOString())
          .lt("created_at", end.toISOString());

        const csv = toCSV(rows || []);

        for (const owner of owners) {
          await fetch(SEND_EMAIL_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${SERVICE_ROLE_KEY}`
            },
            body: JSON.stringify({
              to: owner.email,
              subject: "📅 Monthly Finance Report",
              html: `<p>Your monthly report is attached.</p>`,
              attachments: [
                {
                  filename: "monthly-report.csv",
                  content: csv
                }
              ]
            })
          });
        }

        await supabase.from("payment_reminders").insert({
          entry_id: periodKey,
          user_id: owners[0].id,
          type: "monthly_report"
        });
      }
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }
});
