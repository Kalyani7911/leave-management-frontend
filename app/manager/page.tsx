"use client";

import { useEffect, useState } from "react";
import { api, Employee, Leave } from "@/lib/api";
import { Avatar } from "@/components/ui";

const field = "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm";

function formatRange(from: string, to: string) {
  const f = new Date(from + "T00:00:00");
  const t = new Date(to + "T00:00:00");
  const day: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const end = t.toLocaleDateString("en-IN", { ...day, year: "numeric" });
  return from === to ? end : `${f.toLocaleDateString("en-IN", day)} to ${end}`;
}

export default function ManagerPage() {
  const [managers, setManagers] = useState<Employee[]>([]);
  const [managerId, setManagerId] = useState("");
  const [pending, setPending] = useState<Leave[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const current = managers.find((m) => String(m.id) === managerId);

  useEffect(() => {
    api
      .employees()
      .then((all) => setManagers(all.filter((e) => e.role === "MANAGER")))
      .catch((e) => setError(e.message));
  }, []);

  async function load(id: string) {
    if (!id) {
      setPending([]);
      return;
    }
    try {
      setPending(await api.pending(id));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function selectManager(id: string) {
    setManagerId(id);
    setError("");
    setMessage("");
    load(id);
  }

  async function decide(action: "approve" | "reject", leave: Leave) {
    setError("");
    setMessage("");
    try {
      await api[action](leave.id);
      setMessage(
        `${action === "approve" ? "Approved" : "Rejected"}: ${leave.employeeName}, ${leave.leaveType} leave.`
      );
      await load(managerId);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">Approvals</h1>
        <p className="mt-1 text-muted">Review leave requests from your team.</p>
      </section>

      <section className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4">
        {current ? (
          <Avatar name={current.name} />
        ) : (
          <span className="h-11 w-11 rounded-full bg-free" />
        )}
        <div className="flex-1">
          <label htmlFor="manager" className="block text-sm text-muted">
            Viewing as
          </label>
          <select
            id="manager"
            className={`${field} mt-1`}
            value={managerId}
            onChange={(e) => selectManager(e.target.value)}
          >
            <option value="">Choose a manager</option>
            {managers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.department})
              </option>
            ))}
          </select>
        </div>
      </section>

      {error && (
        <p className="rounded-lg bg-rejected-bg p-3 text-sm text-rejected">{error}</p>
      )}
      {message && (
        <p className="rounded-lg bg-approved-bg p-3 text-sm text-approved">{message}</p>
      )}

      {!managerId && (
        <div className="rounded-xl border border-dashed border-line p-10 text-center text-muted">
          Choose a manager above to see the requests waiting for approval.
        </div>
      )}

      {managerId && pending.length === 0 && (
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
                <div className="font-semibold">{l.employeeName}</div>
                <div className="text-sm text-muted">
                  {l.leaveType} leave, {formatRange(l.fromDate, l.toDate)} ({l.days}{" "}
                  {l.days === 1 ? "day" : "days"})
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