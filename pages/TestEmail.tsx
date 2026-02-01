import React, { useState } from "react";
import { Button, Card } from "../components/ui";
import { useFinance } from "../context/FinanceContext";

const TestEmail: React.FC = () => {
  const { user } = useFinance();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const sendEmail = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(
        "https://lvoapuuklfefvmkfftde.functions.supabase.co/send-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: user.email,
            subject: "FinBook Test Email",
            html: `<p>Hello <strong>${user.name}</strong>,<br/>Email system is working ✅</p>`,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }

      setResult("✅ Email sent (check Resend dashboard)");
    } catch (err: any) {
      setResult("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-bold">Email Test</h2>

        <Button onClick={sendEmail} disabled={loading}>
          {loading ? "Sending..." : "Send Test Email"}
        </Button>

        {result && <p className="text-sm">{result}</p>}
      </Card>
    </div>
  );
};

export default TestEmail;
