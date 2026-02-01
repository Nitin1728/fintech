"use client";

import { useEntries } from "../../context/EntriesContext";


export default function EntryCard({ entry }: any) {
  const { markAsReceived, sendReminder } = useEntries();

  const statusClass =
    entry.type === "received"
      ? "badge-received"
      : entry.type === "pending"
      ? "badge-pending"
      : entry.type === "promised"
      ? "badge-promised"
      : "badge";

  return (
    <div className="card">
      <div className="card-body">

        {/* ================= TOP ================= */}
        <div className="flex justify-between items-start mb-4">
          <div>
            {/* Amount */}
            <p className="text-3xl font-extrabold tracking-tight">
              ₹{entry.amount.toLocaleString()}
            </p>

            {/* Person */}
            <p className="text-muted mt-1">
              {entry.person}
            </p>
          </div>

          {/* Status */}
          <span className={`badge ${statusClass}`}>
            {entry.type.toUpperCase()}
          </span>
        </div>

        {/* ================= NOTES ================= */}
        {entry.notes && (
          <div className="bg-slate-50 rounded-lg px-4 py-3 mb-4">
            <p className="text-sm text-slate-700">
              {entry.notes}
            </p>
          </div>
        )}

        {/* ================= FOOTER ================= */}
        <div className="flex justify-between items-center pt-3 border-t">

          {/* Meta */}
          <div className="text-small text-muted">
            Payment mode:{" "}
            <span className="font-semibold text-slate-700">
              {entry.paymentMode.toUpperCase()}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            {entry.type !== "received" && (
              <button
                onClick={() => markAsReceived(entry.id)}
                className="text-sm font-semibold text-green-600 hover:underline"
              >
                Mark received
              </button>
            )}

            {entry.clientEmail && (
              <button
                onClick={() => sendReminder(entry)}
                className="text-sm font-semibold text-indigo-600 hover:underline"
              >
                Send reminder
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
