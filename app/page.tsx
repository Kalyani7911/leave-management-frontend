"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { api, Balance, Leave, LeaveType, Session, getSession } from "@/lib/api";
import { Avatar, DayBlocks, StatusBadge, leaveTone } from "@/components/ui";

const REASONS = ["Family function", "Medical", "Personal work", "Travel", "Other"];
const emptyForm = { leaveTypeId: "", fromDate: "", toDate: "", reason: "", otherReason: "" };
const field = "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm";

function formatRange(from: string, to: string) {
  const f = new Date(from + "T00:00:00");
  const t = new Date(to + "T00:00:00");
  const day: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const end = t.toLocaleDateString("en-IN", { ...day, year: "numeric" });
  return from === to ? end : `${f.toLocaleDateString("en-IN", day)} to ${end}`;
}

export default function DashboardPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sending, setSending] = useState(false);

  async function load(id: number) {
    try {
      setBalances(await api.balance(id));
      setLeaves(await api.myLeaves(id));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => {
    const current = getSession();
    if (!current) return;
    setSession(current);
    api.leaveTypes().then(setTypes).catch((e) => setError(e.message));
    load(current.employeeId);
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!session) return;
    setError("");
    setSuccess("");

    const reason = form.reason === "Other" ? form.otherReason.trim() : form.reason;
    if (!reason) {
      setError("Please choose a reason for your leave.");
      return;
    }

    setSending(true);
    try {
      await api.apply({
        employeeId: session.employeeId,
        leaveTypeId: Number(form.leaveTypeId),
        fromDate: form.fromDate,
        toDate: form.toDate,
        reason,
      });
      setForm(emptyForm);
      setSuccess("Request submitted. Your manager will review it.");
      await load(session.employeeId);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  }

  if (!session) {
    return <p className="text-muted">Loading...</p>;
  }

  const firstName = session.name.split(" ")[0];

  return (
    <div className="space-y-8">
      <section className="flex items-center gap-4">
        <Avatar name={session.name} />
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Hello, {firstName}</h1>
          <p className="text-muted">
            {session.employeeCode} · {session.department} department
          </p>
        </div>
      </section>

      {error && (
        <p className="rounded-lg bg-rejected-bg p-3 text-sm text-rejected">{error}</p>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">Your leave balance</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {balances.map((b) => {
            const tone = leaveTone(b.leaveType);
            return (
              <Link
                key={b.leaveType}
                href={`/my-leave?type=${encodeURIComponent(b.leaveType)}`}
                className={`block rounded-xl border border-t-4 border-line ${tone.edge} ${tone.soft} p-5 transition hover:-translate-y-0.5 hover:shadow-md`}
              >
                <div className={`text-sm font-semibold ${tone.text}`}>{b.leaveType}</div>

                {b.quota === null || b.remaining === null ? (
                  <>
                    <div className="mt-2 text-3xl font-semibold">Unlimited</div>
                    <div className="mt-4 text-xs text-muted">
                      {b.used} {b.used === 1 ? "day" : "days"} taken this year
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mt-2 text-3xl font-semibold">
                      {b.remaining}
                      <span className="ml-1 text-base font-normal text-muted">left</span>
                    </div>
                    <div className="mt-4">
                      <DayBlocks quota={b.quota} used={b.used} tone={tone} />
                    </div>
                    <div className="mt-2 text-xs text-muted">
                      {b.used} of {b.quota} days used
                    </div>
                  </>
                )}

                <div className={`mt-3 text-xs font-medium ${tone.text}`}>View records →</div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-5">
        <form
          onSubmit={submit}
          className="space-y-4 rounded-xl border border-t-4 border-line border-t-brand bg-surface p-5 md:col-span-2"
        >
          <h2 className="text-lg font-semibold">Request leave</h2>

          <div>
            <label className="mb-1 block text-sm text-muted">Leave type</label>
            <select
              required
              className={field}
              value={form.leaveTypeId}
              onChange={(e) => setForm({ ...form, leaveTypeId: e.target.value })}
            >
              <option value="">Choose a type</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-muted">From</label>
              <input
                required
                type="date"
                className={field}
                value={form.fromDate}
                onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted">To</label>
              <input
                required
                type="date"
                className={field}
                value={form.toDate}
                onChange={(e) => setForm({ ...form, toDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted">Reason</label>
            <select
              required
              className={field}
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value, otherReason: "" })}
            >
              <option value="">Choose a reason</option>
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {form.reason === "Other" && (
            <div>
              <label className="mb-1 block text-sm text-muted">Please specify</label>
              <input
                required
                maxLength={200}
                className={field}
                placeholder="Write your reason"
                value={form.otherReason}
                onChange={(e) => setForm({ ...form, otherReason: e.target.value })}
              />
            </div>
          )}

          {success && (
            <p className="rounded-lg bg-approved-bg p-3 text-sm text-approved">{success}</p>
          )}

          <button
            disabled={sending}
            className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {sending ? "Submitting..." : "Submit request"}
          </button>
        </form>

        <div className="rounded-xl border border-line bg-surface p-5 md:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent requests</h2>
            <Link href="/my-leave" className="text-sm font-medium text-brand hover:underline">
              View all
            </Link>
          </div>
          {leaves.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No leave requests yet.</p>
          ) : (
            <ul className="mt-2 divide-y divide-line">
              {leaves.slice(0, 5).map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`h-8 w-1.5 rounded-full ${leaveTone(l.leaveType).bar}`} />
                    <div>
                      <div className="font-medium">{l.leaveType}</div>
                      <div className="text-sm text-muted">
                        {formatRange(l.fromDate, l.toDate)} ({l.days}{" "}
                        {l.days === 1 ? "day" : "days"})
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={l.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}