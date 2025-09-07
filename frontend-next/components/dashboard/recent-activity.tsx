"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";

type ActivityStatus = "Pending" | "Approved" | "Rejected" | string;

export interface ActivityItemProps {
  id?: string | number;
  title: string;
  description: string;
  user: string;
  time: string; // humanized string
  status: ActivityStatus;
}

const statusColors: Record<string, string> = {
  Pending: "bg-orange-100 text-orange-600",
  Approved: "bg-green-100 text-green-600",
  Rejected: "bg-red-100 text-red-600",
};

const ActivityItem: React.FC<ActivityItemProps> = ({ title, description, user, time, status }) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex flex-col">
      <h4 className="text-sm font-medium">{title}</h4>
      <p className="text-xs text-gray-500">{description}</p>
      <p className="text-xs text-gray-400">by {user} - {time}</p>
    </div>
    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusColors[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  </div>
);

type RecentActivityProps = {
  activities?: ActivityItemProps[] | null;
  endpoint?: string; // allow override
  limit?: number;
};

export function RecentActivity({ activities: activitiesProp, endpoint = "/api/v1/dashboard/activity", limit = 10 }: RecentActivityProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ActivityItemProps[] | null>(null);

  const demoItems: ActivityItemProps[] = useMemo(() => ([
    { title: "Document uploaded", description: "Research Report Q3 2024.pdf", user: "John Smith", time: "2 minutes ago", status: "Pending" },
    { title: "Document approved", description: "Budget Analysis 2024.pdf", user: "Dr. Sarah Wilson", time: "15 minutes ago", status: "Approved" },
    { title: "User created", description: "New staff member Alice Brown", user: "Admin User", time: "1 hour ago", status: "Approved" },
    { title: "Document rejected", description: "Draft Proposal.pdf", user: "Dr. Sarah Wilson", time: "2 hours ago", status: "Rejected" },
  ]), []);

  useEffect(() => {
    let mounted = true;
    if (activitiesProp && activitiesProp.length) {
      setItems(activitiesProp);
      return;
    }
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const q = new URLSearchParams();
        if (limit) q.set("limit", String(limit));
        // Attempt to fetch backend activity; if 404 or error, we silently fallback
        const res = await apiFetch(`${endpoint}?${q.toString()}`, { auth: true });
        if (!mounted) return;
        // normalize a variety of potential shapes
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : [];
        const mapped: ActivityItemProps[] = list.slice(0, limit).map((a: any) => ({
          id: a.id ?? a.activity_id ?? a.log_id,
          title: a.title ?? a.action ?? a.type ?? "Activity",
          description: a.description ?? a.detail ?? a.resource_name ?? "",
          user: a.user?.nama ?? a.user?.name ?? a.user_name ?? a.user ?? "-",
          time: a.time_human ?? a.timeAgo ?? a.created_at_human ?? a.created_at ?? "",
          status: a.status ?? a.result ?? "",
        }));
        setItems(mapped);
      } catch (e: any) {
        // Fail silently to demo items unless needed
        if (!mounted) return;
        setError(e?.message || null);
        setItems(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false };
  }, [activitiesProp, endpoint, limit]);

  const rows = items && items.length ? items : demoItems;

  return (
    <Card className="h-full shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-gray-800">Recent Activity</CardTitle>
        <p className="text-sm text-gray-500">Latest actions in the archive system</p>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start justify-between py-1">
                <div className="flex-1 pr-3 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        )}
        {!loading && rows.map((it, idx) => (
          <ActivityItem key={it.id ?? idx} {...it} />
        ))}
        {error && (
          <div className="mt-2 text-xs text-gray-400">Backend unavailable, showing sample activity.</div>
        )}
      </CardContent>
    </Card>
  );
}