interface DashboardHeaderProps {
  userName: string;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-6 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Welcome back, {userName}</h1>
        <p className="text-sm text-gray-500">Here's what's happening in SIPAS today.</p>
      </div>
    </div>
  );
}