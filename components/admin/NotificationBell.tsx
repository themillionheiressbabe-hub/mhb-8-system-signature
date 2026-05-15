"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

const EYEBROW =
  "font-sans uppercase text-[10.5px] tracking-[0.35em] text-gold font-semibold";

const DOT_COLOR: Record<string, string> = {
  new_order: "#B51E5A",
  intake_received: "#C9A96E",
  report_delivered: "#2D9B6E",
  report_due: "#C9A96E",
  new_client: "#A78BFA",
};

function dotColor(type: string): string {
  return DOT_COLOR[type] ?? "#C9A96E";
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchOnce() {
      try {
        const res = await fetch("/api/admin/notifications", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          notifications?: Notification[];
          unreadCount?: number;
        };
        if (!active) return;
        setNotifications(data.notifications ?? []);
        setUnreadCount(data.unreadCount ?? 0);
      } catch {
        // ignore network errors
      }
    }

    fetchOnce();
    const interval = window.setInterval(fetchOnce, 60_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest('[data-notif-bell="true"]')) return;
      setOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [open]);

  async function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch {
      // ignore network errors
    }
  }

  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
    } catch {
      // ignore network errors
    }
  }

  function handleClick(n: Notification) {
    if (!n.is_read) {
      void markRead(n.id);
    }
    if (n.link) {
      setOpen(false);
      router.push(n.link);
    }
  }

  const badgeLabel = unreadCount > 9 ? "9+" : `${unreadCount}`;

  return (
    <div data-notif-bell="true" className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative inline-flex items-center justify-center w-9 h-9 rounded-full text-gold hover:bg-gold/10 transition-colors"
      >
        <BellIcon />
        {unreadCount > 0 ? (
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center bg-magenta text-white rounded-full"
            style={{
              minWidth: 16,
              height: 16,
              padding: "0 4px",
              fontFamily: "var(--font-sans)",
              fontSize: "10px",
              fontWeight: 600,
              lineHeight: 1,
            }}
          >
            {badgeLabel}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          data-notif-bell="true"
          className="absolute top-full mt-2 right-0 w-[380px] max-h-[480px] overflow-y-auto bg-[#151B33] border border-[rgba(201,169,110,0.15)] rounded-2xl z-[60]"
          style={{
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            fontFamily: "var(--font-sans)",
          }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gold/10 sticky top-0 bg-[#151B33] z-10">
            <p className={EYEBROW}>Notifications</p>
            {notifications.some((n) => !n.is_read) ? (
              <button
                type="button"
                onClick={markAllRead}
                className="text-gold hover:text-gold-bright transition-colors"
                style={{ fontSize: "12px", fontWeight: 500 }}
              >
                Mark all read
              </button>
            ) : null}
          </div>

          {notifications.length === 0 ? (
            <div className="px-5 py-16 flex items-center justify-center">
              <p
                className="text-gold text-center"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: "20px",
                }}
              >
                All clear.
              </p>
            </div>
          ) : (
            <ul>
              {notifications.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => handleClick(n)}
                    className="w-full text-left px-5 py-3 border-b border-gold/10 hover:bg-gold/5 transition-colors flex items-start gap-3"
                    style={{
                      backgroundColor: n.is_read
                        ? "transparent"
                        : "rgba(181,30,90,0.04)",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className="inline-block rounded-full shrink-0 mt-1.5"
                      style={{
                        width: 8,
                        height: 8,
                        backgroundColor: dotColor(n.type),
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-white"
                        style={{
                          fontSize: "14px",
                          fontWeight: n.is_read ? 400 : 500,
                          lineHeight: 1.4,
                        }}
                      >
                        {n.title}
                      </p>
                      <p
                        className="text-white/45 mt-1"
                        style={{ fontSize: "11px" }}
                      >
                        {formatRelative(n.created_at)}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

function BellIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
