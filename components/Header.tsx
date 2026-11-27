"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Session, clearSession, getSession } from "@/lib/api";
import { Avatar } from "@/components/ui";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const current = getSession();
    setSession(current);
    if (!current && pathname !== "/login") {
      router.replace("/login");
    }
  }, [pathname, router]);

  function signOut() {
    clearSession();
    setSession(null);
    router.push("/login");
  }

  //const links = [{ href: "/", label: "My leave" }];
    const links = [
    { href: "/", label: "Dashboard" },
    { href: "/my-leave", label: "My leave" },
  ];
  if (session && (session.role === "MANAGER" || session.role === "HR")) {
    links.push({ href: "/manager", label: "Approvals" });
  }

  return (
    <header className="bg-brand text-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-3 text-lg font-semibold tracking-tight">
          <span className="flex gap-1" aria-hidden="true">
            <span className="h-3.5 w-3.5 rounded-sm bg-sky-300" />
            <span className="h-3.5 w-3.5 rounded-sm bg-violet-300" />
            <span className="h-3.5 w-3.5 rounded-sm bg-rose-300" />
          </span>
          Leave Desk
        </Link>

        {session && (
          <div className="flex items-center gap-4">
            <nav className="flex gap-1 text-sm font-medium">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-full px-4 py-2 hover:bg-white/15 ${
                    pathname === l.href ? "bg-white/20" : ""
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-3 border-l border-white/25 pl-4">
              <Avatar name={session.name} />
              <div className="hidden text-sm leading-tight sm:block">
                <div className="font-semibold">{session.name}</div>
                <div className="text-white/75">{session.role.charAt(0) + session.role.slice(1).toLowerCase()}</div>
              </div>
              <button
                onClick={signOut}
                className="rounded-full border border-white/40 px-4 py-2 text-sm font-medium hover:bg-white/15"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}