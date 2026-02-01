"use client";

import { useParams } from "next/navigation";
import { useEntries } from "../../context/EntriesContext";
import EntryCard from "../../components/EntryCard";

export default function ClientHistory() {
  const params = useParams();
  const clientName = decodeURIComponent(params.name as string);

  const { entries, markAsReceived } = useEntries();

  const clientEntries = entries.filter(
    (e) => e.person === clientName
  );

  const pendingCount = clientEntries.filter(
    (e) => e.type === "pending" || e.type === "promised"
  ).length;

  const receivedCount = clientEntries.filter(
    (e) => e.type === "received"
  ).length;

  let reliability = "New client";
  let reliabilityStyle = "bg-slate-200 text-slate-700";

  if (pendingCount >= 2) {
    reliability = "Risky – often delays payment";
    reliabilityStyle = "bg-red-100 text-red-700";
  } else if (receivedCount >= pendingCount && receivedCount > 0) {
    reliability = "Reliable – usually pays";
    reliabilityStyle = "bg-green-100 text-green-700";
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <p className="text-slate-500 text-sm">
            Client history
          </p>
          <h1 className="text-4xl font-bold">
            {clientName}
          </h1>

          <div
            className={`inline-block mt-3 px-4 py-2 rounded-full text-sm font-semibold ${reliabilityStyle}`}
          >
            {reliability}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <p className="text-slate-500 text-sm">
              Total entries
            </p>
            <p className="text-2xl font-bold">
              {clientEntries.length}
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <p className="text-slate-500 text-sm">
              Pending / Promised
            </p>
            <p className="text-2xl font-bold text-red-600">
              {pendingCount}
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-6">
          {clientEntries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onMarkReceived={markAsReceived}
            />
          ))}

          {clientEntries.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center text-slate-500 border">
              No entries for this client yet.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
