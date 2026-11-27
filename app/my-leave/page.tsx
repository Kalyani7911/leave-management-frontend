"use client";

import { useEffect, useState } from "react";
import { api, Leave, LeaveType, Session, getSession } from "@/lib/api";
import { StatusBadge, leaveTone } from "@/components/ui";

const field = "rounded-lg border border-line bg-surface px-3 py-2 text-sm";
const thisYear = new Date().getFullYear();
const years = Array.from({ length: 7 }, (_, i) => thisYear + 1 - i);

function formatRange(from: string, to: string) {
  const f = new Date(from + "T00:00:00");
  const t = new Date(to + "T00:00:00");
  const day: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const end = t.toLocaleDateString("en-IN", { ...day, year: "numeric" });
  return from === to ? end : `${f.toLocaleDateString("en-IN", day)} to ${end}`;
}

export default function MyLeavePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [year, setYear] = useState(thisYear);
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const current = getSession();
    if (!current) return;
    setSession(current);
    const wanted = new URLSearchParams(window.location.search).get("type");
    if (wanted) setTypeFilter(wanted);
    api.leaveTypes().then(setTypes).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    setError("");
    api
      .myLeaves(session.employeeId, year)
      .then(setLeaves)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [session, year]);

  if (!session) {
    return <p className="text-muted">Loading...</p>;
  }

  const shown = typeFilter ? leaves.filter((l) => l.leaveType === typeFilter) : leaves;
  const totalDays = shown
    .filter((l) => l.status === "APPROVED")
    .reduce((sum, l) => sum + l.days, 0);

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">My leave records</h1>
          <p className="mt-1 text-muted">All your leave requests, year by year.</p>
        </div>
        <div>
          <label htmlFor="year" className="mb-1 block text-sm text-muted">
            Year
          </label>
          <select
            id="year"
            className={field}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        <button
          onClick={() => setTypeFilter("")}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
            typeFilter === ""
              ? "border-brand bg-brand text-white"
              : "border-line bg-surface hover:bg-bg"
          }`}
        >
          All leaves
        </button>
        {types.map((t) => {
          const tone = leaveTone(t.name);
          const active = typeFilter === t.name;
          return (
            <button
              key={t.id}
              onClick={() => setTypeFilter(t.name)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                active
                  ? `border-transparent ${tone.bar} text-white`
                  : `border-line ${tone.soft} ${tone.text} hover:opacity-80`
              }`}
            >
              {t.name}
            </button>
          );
        })}
      </section>

      {error && (
        <p className="rounded-lg bg-rejected-bg p-3 text-sm text-rejected">{error}</p>
      )}

      <section className="rounded-xl border border-line bg-surface p-5">
        <div className="flex items-center justify-between text-sm text-muted">
          <span>
            {shown.length} {shown.length === 1 ? "request" : "requests"} in {year}
            {typeFilter && ` · ${typeFilter}`}
          </span>
          <span>{totalDays} approved days</span>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-muted">Loading...</p>
        ) : shown.length === 0 ? (
          <p className="mt-6 rounded-lg border border-dashed border-line p-8 text-center text-sm text-muted">
            No leave records for {year}
            {typeFilter && ` in ${typeFilter}`}.
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-line">
            {shown.map((l) => (
              <li
                key={l.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div className="flex items-center gap-3">
                  <span className={`h-10 w-1.5 rounded-full ${leaveTone(l.leaveType).bar}`} />
                  <div>
                    <div className="font-medium">{l.leaveType}</div>
                    <div className="text-sm text-muted">
                      {formatRange(l.fromDate, l.toDate)} ({l.days}{" "}
                      {l.days === 1 ? "day" : "days"})
                    </div>
                    <div className="text-sm">{l.reason}</div>
                  </div>
                </div>
                <StatusBadge status={l.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}