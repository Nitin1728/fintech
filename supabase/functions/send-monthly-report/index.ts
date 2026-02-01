import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { Resend } from "npm:resend";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

/* -------- CSV HELPER -------- */
const toCSV = (rows: any[]) => {
  const header = [
    "Date",
    "Name",
    "Type",
    "Status",
    "Amount",
    "Client Email",
    "Due Date",
  ];

  const body = rows.map((r) => [
    r.date,
    r.name,
    r.type,
    r.status,
    r.amount,
    r.client_email || "",
    r.due_date || "",
  ]);

  return [header, ...body]
    .map((row) => row.map((v) => `"${v}"`).join(","))
    .join("\n");
};

serve(async (req) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser(req.headers.get("Authorization")!);

    if (!user) return new Response("Unauthorized", { status: 401 });

    /* -------- LAST MONTH RANGE -------- */
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);

    const { data: entries, error } = await supabase
      .from("entries")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", start.toISOString())
      .lte("date", end.toISOString())
      .order("date");

    if (error) throw error;

    if (!entries || entries.length === 0) {
      return new Response("No data for last month", { status: 400 });
    }

    const csv = toCSV(entries);

    await resend.emails.send({
      from: "FinBook <reports@resend.dev>",
      to: user.email!,
      subject: "Your Monthly Finance Report",
      html: `
        <p>Hello,</p>
        <p>Your monthly finance report is attached.</p>
        <p>Period: ${start.toDateString()} – ${end.toDateString()}</p>
        <p>– FinBook</p>
      `,
      attachments: [
        {
          filename: "monthly-report.csv",
          content: csv,
        },
      ],
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response("Failed to send report", { status: 500 });
  }
});
