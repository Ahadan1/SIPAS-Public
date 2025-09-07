"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { fetchMe, ApiUser } from "@/lib/user"

import {
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb"

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSummaryCards } from "@/components/dashboard/dashboard-summary-cards"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { StorageUsage } from "@/components/dashboard/storage-usage"
import { QuickActions } from "@/components/dashboard/quick-actions"

const DashboardBreadcrumb = (
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
    </BreadcrumbItem>
  </BreadcrumbList>
);

export default function Page() {
  const [me, setMe] = useState<ApiUser | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<any>(null)


  useEffect(() => {
    let mounted = true
    async function loadDashboard() {
      try {
        // fetch current user
        const u = await fetchMe()
        if (mounted) setMe(u)
        const res = await apiFetch("/api/v1/dashboard", { auth: true })

        // fetch active users using is_active column
        let activeUsersNow = 0
        try {
          const usersRes: any = await apiFetch("/api/v1/users?is_active=1", { auth: true })
          if (Array.isArray(usersRes)) {
            activeUsersNow = usersRes.length
          } else if (usersRes && typeof usersRes === "object") {
            if (usersRes.meta && typeof usersRes.meta.total === "number") {
              activeUsersNow = usersRes.meta.total
            } else if (Array.isArray(usersRes.data)) {
              activeUsersNow = usersRes.data.length
            }
          }
        } catch (e) {
          // ignore; fallback to backend-provided metrics
        }

        if (!mounted) return
        setMetrics({ ...res, active_users_now: activeUsersNow })
        // Optionally log for debugging during testing
        // eslint-disable-next-line no-console
        console.log("Dashboard metrics:", res)
      } catch (e: any) {
        if (!mounted) return
        setError(e?.message || "Failed to load dashboard")
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }
    loadDashboard()
    return () => { mounted = false }
  }, [])

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <SiteHeader breadcrumbs={DashboardBreadcrumb}/>
        
        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-auto bg-gray-50">
          <DashboardHeader userName={(me?.nama || me?.name || "User") as string} />
          
          <DashboardSummaryCards metrics={metrics} loading={loading} />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-4 lg:px-6">
            <div className="md:col-span-2">
              <RecentActivity />
            </div>
            <div className="md:col-span-1">
              <StorageUsage />
            </div>
          </div>

          <QuickActions />

          {/* Optional debug rendering */}
          {error && (
            <div className="px-6 pb-6 text-sm text-red-600">{error}</div>
          )}
          {loading && (
            <div className="px-6 pb-6 text-sm text-gray-500">Loading dashboard...</div>
          )}
          {!loading && !error && metrics && (
            <div className="px-6 pb-8 text-xs text-gray-500">Dashboard data loaded.</div>
          )}

        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}