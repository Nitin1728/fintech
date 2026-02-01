import { NextResponse } from "next/server";
import { Resend } from "resend";

/**
 * Sends a single reminder email
 */

const resend = new Resend(
  process.env.RESEND_API_KEY
);

export async function POST(req: Request) {
  try {
    const { email, client, amount } =
      await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Missing email" },
        { status: 400 }
      );
    }

    const result = await resend.emails.send({
      from: "FinBook <no-reply@resend.dev>",
      to: email,
      subject: `Payment reminder – ₹${amount}`,
      html: `
        <p>Hi ${client},</p>

        <p>
          This is a friendly reminder regarding the payment
          of <strong>₹${amount}</strong>.
        </p>

        <p>
          Please let me know if you need anything from my side.
        </p>

        <p>
          Thanks,<br />
          <strong>FinBook</strong>
        </p>
      `,
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error("SEND REMINDER ERROR", error);

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
