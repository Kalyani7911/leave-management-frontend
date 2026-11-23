"use client";

import { useEffect, useState } from "react";
import { api, Leave, Session, getSession } from "@/lib/api";
import { Avatar, leaveTone } from "@/components/ui";

function formatRange(from: string, to: string) {
  const f = new Date(from + "T00:00:00");
  const t = new Date(to + "T00:00:00");
  const day: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const end = t.toLocaleDateString("en-IN", { ...day, year: "numeric" });
  return from === to ? end : `${f.toLocaleDateString("en-IN", day)} to ${end}`;
}

export default function ManagerPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [pending, setPending] = useState<Leave[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load(id: number) {
    try {
      setPending(await api.pending(id));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => {
    const current = getSession();
    if (!current) return;
    setSession(current);
    if (current.role === "MANAGER" || current.role === "HR") {
      load(current.employeeId);
    }
  }, []);

  async function decide(action: "approve" | "reject", leave: Leave) {
    if (!session) return;
    setError("");
    setMessage("");
    try {
      await api[action](leave.id);
      setMessage(
        `${action === "approve" ? "Approved" : "Rejected"}: ${leave.employeeName}, ${leave.leaveType} leave.`
      );
      await load(session.employeeId);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (!session) {
    return <p className="text-muted">Loading...</p>;
  }

  if (session.role !== "MANAGER" && session.role !== "HR") {
    return (
      <div className="rounded-xl border border-dashed border-line p-10 text-center text-muted">
        Approvals are only available to managers and HR.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">Approvals</h1>
        <p className="mt-1 text-muted">Review leave requests from your team.</p>
      </section>

      {error && (
        <p className="rounded-lg bg-rejected-bg p-3 text-sm text-rejected">{error}</p>
      )}
      {message && (
        <p className="rounded-lg bg-approved-bg p-3 text-sm text-approved">{message}</p>
      )}

      {pending.length === 0 && (
        <div className="rounded-xl border border-dashed border-line p-10 text-center text-muted">
          You are all caught up. No requests are waiting for approval.
        </div>
      )}

      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            {pending.length} {pending.length === 1 ? "request" : "requests"} waiting
          </h2>
          {pending.map((l) => (
            <div
              key={l.id}
              className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-5 sm:flex-row sm:items-center"
            >
              <Avatar name={l.employeeName} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{l.employeeName}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${leaveTone(l.leaveType).soft} ${leaveTone(l.leaveType).text}`}
                  >
                    {l.leaveType}
                  </span>
                </div>
                <div className="text-sm text-muted">
                  {formatRange(l.fromDate, l.toDate)} ({l.days} {l.days === 1 ? "day" : "days"})
                </div>
                {l.reason && <div className="mt-1 text-sm">{l.reason}</div>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => decide("approve", l)}
                  className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
                >
                  Approve
                </button>
                <button
                  onClick={() => decide("reject", l)}
                  className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-rejected hover:bg-rejected-bg"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}