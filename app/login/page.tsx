"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api, saveSession } from "@/lib/api";

const field = "w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm";

const demos = [
  {
    role: "Employee",
    name: "Pravin Patil",
    email: "pravin.patil@example.com",
    style: "bg-sky-50 text-sky-700 hover:bg-sky-100",
  },
  {
    role: "Manager",
    name: "Rahul Joshi",
    email: "rahul.joshi@example.com",
    style: "bg-violet-50 text-violet-700 hover:bg-violet-100",
  },
  {
    role: "HR",
    name: "Anita Deshmukh",
    email: "anita.deshmukh@example.com",
    style: "bg-rose-50 text-rose-700 hover:bg-rose-100",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      const session = await api.login(email, password);
      saveSession(session);
      router.push(session.role === "MANAGER" ? "/manager" : "/");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 pt-6">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1 text-muted">Use your work email to manage your leave.</p>
      </section>

      <form
        onSubmit={submit}
        className="space-y-4 rounded-xl border border-t-4 border-line border-t-brand bg-surface p-6"
      >
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-muted">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="username"
            className={field}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-muted">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            className={field}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p className="rounded-lg bg-rejected-bg p-3 text-sm text-rejected">{error}</p>
        )}

        <button
          disabled={sending}
          className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {sending ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <section className="rounded-xl border border-dashed border-line p-5">
        <h2 className="text-sm font-semibold">Try a demo account</h2>
        <p className="mt-1 text-sm text-muted">
          Pick a role to fill in the form. The demo password is Leave@123.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {demos.map((d) => (
            <button
              key={d.email}
              type="button"
              onClick={() => {
                setEmail(d.email);
                setPassword("Leave@123");
                setError("");
              }}
              className={`rounded-lg px-3 py-2 text-left text-sm font-medium ${d.style}`}
            >
              {d.role}
              <span className="block text-xs font-normal opacity-80">{d.name}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}