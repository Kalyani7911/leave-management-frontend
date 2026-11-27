export type Tone = {
  bar: string;
  track: string;
  soft: string;
  text: string;
  edge: string;
};

const tones: Record<string, Tone> = {
  Casual: {
    bar: "bg-sky-500",
    track: "bg-sky-100",
    soft: "bg-sky-50",
    text: "text-sky-700",
    edge: "border-t-sky-500",
  },
    "Government Holiday": {
    bar: "bg-violet-500",
    track: "bg-violet-100",
    soft: "bg-violet-50",
    text: "text-violet-700",
    edge: "border-t-violet-500",
  },
  "Loss of Pay": {
    bar: "bg-amber-500",
    track: "bg-amber-100",
    soft: "bg-amber-50",
    text: "text-amber-700",
    edge: "border-t-amber-500",
  },
  Sick: {
    bar: "bg-rose-500",
    track: "bg-rose-100",
    soft: "bg-rose-50",
    text: "text-rose-700",
    edge: "border-t-rose-500",
  },
};

const fallbackTone: Tone = {
  bar: "bg-brand",
  track: "bg-free",
  soft: "bg-bg",
  text: "text-brand",
  edge: "border-t-brand",
};

export function leaveTone(name: string): Tone {
  return tones[name] ?? fallbackTone;
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-pending-bg text-pending",
    APPROVED: "bg-approved-bg text-approved",
    REJECTED: "bg-rejected-bg text-rejected",
    CANCELLED: "bg-line text-muted",
  };
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] ?? "bg-line text-muted"
      }`}
    >
      {label}
    </span>
  );
}

export function DayBlocks({
  quota,
  used,
  tone = fallbackTone,
}: {
  quota: number;
  used: number;
  tone?: Tone;
}) {
  const filled = Math.min(used, quota);
  return (
    <div className="flex flex-wrap gap-1" aria-label={`${used} of ${quota} days used`}>
      {Array.from({ length: quota }, (_, i) => (
        <span
          key={i}
          className={`h-3 w-3 rounded-sm ${i < filled ? tone.bar : tone.track}`}
        />
      ))}
    </div>
  );
}

const avatarColors = [
  "bg-teal-600",
  "bg-sky-600",
  "bg-violet-600",
  "bg-rose-500",
  "bg-amber-600",
  "bg-emerald-600",
  "bg-indigo-600",
];

export function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
  const sum = Array.from(name).reduce((total, ch) => total + ch.charCodeAt(0), 0);
  return (
    <span
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${
        avatarColors[sum % avatarColors.length]
      }`}
    >
      {initials}
    </span>
  );
}