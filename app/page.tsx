"use client";

import { FormEvent, useEffect, useState } from "react";
import { api, Balance, Employee, Leave, LeaveType } from "@/lib/api";
import { Avatar, DayBlocks, StatusBadge, leaveTone } from "@/components/ui";

const emptyForm = { leaveTypeId: "", fromDate: "", toDate: "", reason: "" };
const field = "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm";

function formatRange(from: string, to: string) {
  const f = new Date(from + "T00:00:00");
  const t = new Date(to + "T00:00:00");
  const day: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const end = t.toLocaleDateString("en-IN", { ...day, year: "numeric" });
  return from === to ? end : `${f.toLocaleDateString("en-IN", day)} to ${end}`;
}

export default function EmployeePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [empId, setEmpId] = useState("");
  const [balances, setBalances] = useState<Balance[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sending, setSending] = useState(false);

  const current = employees.find((e) => String(e.id) === empId);

  useEffect(() => {
    api.employees().then(setEmployees).catch((e) => setError(e.message));
    api.leaveTypes().then(setTypes).catch((e) => setError(e.message));
  }, []);

  async function load(id: string) {
    if (!id) {
      setBalances([]);
      setLeaves([]);
      return;
    }
    try {
      setBalances(await api.balance(id));
      setLeaves(await api.myLeaves(id));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function selectEmployee(id: string) {
    setEmpId(id);
    setError("");
    setSuccess("");
    load(id);
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSending(true);
    try {
      await api.apply({
        employeeId: Number(empId),
        leaveTypeId: Number(form.leaveTypeId),
        fromDate: form.fromDate,
        toDate: form.toDate,
        reason: form.reason,
      });
      setForm(emptyForm);
      setSuccess("Request submitted. Your manager will review it.");
      await load(empId);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">My leave</h1>
        <p className="mt-1 text-muted">
          Check your balance, request time off and follow your requests.
        </p>
      </section>

      <section className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4">
        {current ? (
          <Avatar name={current.name} />
        ) : (
          <span className="h-11 w-11 rounded-full bg-free" />
        )}
        <div className="flex-1">
          <label htmlFor="employee" className="block text-sm text-muted">
            Viewing as
          </label>
          <select
            id="employee"
            className={`${field} mt-1`}
            value={empId}
            onChange={(e) => selectEmployee(e.target.value)}
          >
            <option value="">Choose an employee</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.department})
              </option>
            ))}
          </select>
        </div>
      </section>

      {error && (
        <p className="rounded-lg bg-rejected-bg p-3 text-sm text-rejected">{error}</p>
      )}

      {!empId && (
        <div className="rounded-xl border border-dashed border-line p-10 text-center text-muted">
          Choose an employee above to see their leave balance and requests.
        </div>
      )}

      {empId && (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            {balances.map((b) => {
              const tone = leaveTone(b.leaveType);
              return (
                <div
                  key={b.leaveType}
                  className={`rounded-xl border border-t-4 border-line ${tone.edge} ${tone.soft} p-5`}
                >
                  <div className={`text-sm font-semibold ${tone.text}`}>{b.leaveType} leave</div>
                  <div className="mt-2 text-3xl font-semibold">
                    {b.remaining}
                    <span className="ml-1 text-base font-normal text-muted">days left</span>
                  </div>
                  <div className="mt-4">
                    <DayBlocks quota={b.quota} used={b.used} tone={tone} />
                  </div>
                  <div className="mt-2 text-xs text-muted">
                    {b.used} of {b.quota} days used
                  </div>
                </div>
              );
            })}
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
                <label className="mb-1 block text-sm text-muted">Reason (optional)</label>
                <input
                  className={field}
                  placeholder="For example: family function"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                />
              </div>

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
              <h2 className="text-lg font-semibold">My requests</h2>
              {leaves.length === 0 ? (
                <p className="mt-4 text-sm text-muted">No leave requests yet.</p>
              ) : (
                <ul className="mt-2 divide-y divide-line">
                  {leaves.map((l) => (
                    <li key={l.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="flex items-center gap-3">
                        <span className={`h-8 w-1.5 rounded-full ${leaveTone(l.leaveType).bar}`} />
                        <div>
                          <div className="font-medium">{l.leaveType} leave</div>
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
        </>
      )}
    </div>
  );
}