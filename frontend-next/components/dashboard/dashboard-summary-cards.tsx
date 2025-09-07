import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleCheck, Clock, FileText, Users } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconColor: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, subtitle, icon, iconColor }) => (
  <Card className="flex-1 shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className={`rounded-full p-2 ${iconColor}`}>{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </CardContent>
  </Card>
);

type DashboardSummaryCardsProps = {
  metrics?: any | null;
  loading?: boolean;
};

export function DashboardSummaryCards({ metrics, loading }: DashboardSummaryCardsProps) {
  const totalDocuments = metrics?.total_documents ?? metrics?.documents_total ?? 0;
  const pendingApprovals = metrics?.pending_approvals ?? metrics?.approvals_pending ?? 0;
  const approvedToday = metrics?.approved_today ?? metrics?.approvals_today ?? 0;
  const activeUsers =
    metrics?.active_users_now ??
    metrics?.active_users_current ??
    metrics?.online_users ??
    metrics?.currently_active ??
    metrics?.active_users_live ??
    metrics?.active_users_5m ??
    metrics?.active_users ??
    metrics?.active_users_24h ??
    0;
  const docDelta = metrics?.documents_delta_desc ?? "+";
  const pendingSub = metrics?.pending_subtitle ?? "Requires director review";
  const approvedSub = metrics?.approved_subtitle ?? "";
  const activeSub = metrics?.active_users_subtitle ?? "Online now";

  const formatNumber = (n: any) => {
    const num = Number(n);
    if (!isFinite(num)) return String(n ?? 0);
    return new Intl.NumberFormat('id-ID').format(num);
  };

  return (
    <div className="grid gap-4 px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        title="Total Documents"
        value={loading ? "…" : formatNumber(totalDocuments)}
        subtitle={typeof docDelta === 'string' ? docDelta : String(docDelta)}
        icon={<FileText className="h-4 w-4 text-gray-500" />}
        iconColor="bg-gray-100"
      />
      <SummaryCard
        title="Pending Approvals"
        value={loading ? "…" : formatNumber(pendingApprovals)}
        subtitle={pendingSub}
        icon={<Clock className="h-4 w-4 text-orange-500" />}
        iconColor="bg-orange-100"
      />
      <SummaryCard
        title="Approved Today"
        value={loading ? "…" : formatNumber(approvedToday)}
        subtitle={approvedSub}
        icon={<CircleCheck className="h-4 w-4 text-green-500" />}
        iconColor="bg-green-100"
      />
      <SummaryCard
        title="Active Users"
        value={loading ? "…" : formatNumber(activeUsers)}
        subtitle={activeSub}
        icon={<Users className="h-4 w-4 text-blue-500" />}
        iconColor="bg-blue-100"
      />
    </div>
  );
}