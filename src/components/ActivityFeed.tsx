import type { Activity } from "@/lib/types";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ActivityFeedProps {
  activities: Activity[];
  limit?: number;
}

const typeIcons: Record<Activity["type"], ReactNode> = {
  call: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  ),
  email: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  meeting: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  task: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

const typeColors: Record<Activity["type"], string> = {
  call: "bg-green-500/15 text-green-400",
  email: "bg-blue-500/15 text-blue-400",
  meeting: "bg-purple-500/15 text-purple-400",
  task: "bg-yellow-500/15 text-yellow-400",
};

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function ActivityFeed({ activities, limit }: ActivityFeedProps) {
  const items = limit ? activities.slice(0, limit) : activities;
  const isCompleted = (a: Activity) => !!a.completed_at;

  return (
    <div className="space-y-1">
      {items.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition hover:bg-white/[0.02]"
        >
          <div
            className={cn(
              "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
              typeColors[activity.type],
              isCompleted(activity) && "opacity-40",
            )}
          >
            {typeIcons[activity.type]}
          </div>

          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "text-sm text-zinc-300",
                isCompleted(activity) && "text-zinc-600 line-through",
              )}
            >
              {activity.description}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-zinc-600">
              <span>{relativeTime(activity.created_at)}</span>
              {activity.contact?.name && (
                <span className="text-zinc-500">{activity.contact.name}</span>
              )}
              {activity.deal?.title && (
                <span className="text-zinc-500">{activity.deal.title}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
