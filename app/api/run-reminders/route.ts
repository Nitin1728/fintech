import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "../../lib/supabase";

/**
 * Automated reminder runner
 * Used by manual trigger & cron
 */

const resend = new Resend(
  process.env.RESEND_API_KEY
);

const REMINDER_INTERVAL_DAYS = 7;

export async function POST(req: Request) {
  // Security check
  const authHeader =
    req.headers.get("authorization");

  if (
    authHeader !==
    `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const thresholdDate = new Date(
      Date.now() -
        REMINDER_INTERVAL_DAYS *
          24 *
          60 *
          60 *
          1000
    ).toISOString();

    const { data: entries, error } =
      await supabase
        .from("finance_entries")
        .select("*")
        .in("type", ["pending", "promised"])
        .or(
          `last_reminder_sent_at.is.null,last_reminder_sent_at.lt.${thresholdDate}`
        );

    if (error || !entries) {
      return NextResponse.json({
        success: true,
        sent: 0,
        message: "No reminders to send",
      });
    }

    let sentCount = 0;

    for (const entry of entries) {
      if (!entry.client_email) continue;

      await resend.emails.send({
        from: "FinBook <no-reply@resend.dev>",
        to: entry.client_email,
        subject: `Payment reminder – ₹${entry.amount}`,
        html: `
          <p>Hi ${entry.person},</p>

          <p>
            This is a reminder regarding the pending
            payment of <strong>₹${entry.amount}</strong>.
          </p>

          <p>
            Thanks,<br />
            <strong>FinBook</strong>
          </p>
        `,
      });

      await supabase
        .from("finance_entries")
        .update({
          last_reminder_sent_at:
            new Date().toISOString(),
        })
        .eq("id", entry.id);

      sentCount++;
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
    });
  } catch (error: any) {
    console.error("RUN REMINDERS ERROR", error);

    return NextResponse.json(
      { success: false, sent: 0 },
      { status: 500 }
    );
  }
}
