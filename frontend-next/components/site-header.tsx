"use client"

import { SidebarIcon, LogOut } from "lucide-react"
import { ReactNode, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { logout as clearToken } from "@/lib/auth"
import { fetchMe, ApiUser } from "@/lib/user"

import { Breadcrumb } from "@/components/ui/breadcrumb"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"

export function SiteHeader({ breadcrumbs }: { breadcrumbs: ReactNode }) {
  const { toggleSidebar } = useSidebar();
  const router = useRouter();

  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [me, setMe] = useState<ApiUser | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    let mounted = true
    async function loadMe() {
      try {
        const u = await fetchMe()
        if (!mounted) return
        setMe(u)
      } catch (_) {
        // ignore; user might not be logged in
      }
    }
    loadMe()
    return () => { mounted = false }
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await apiFetch("/api/logout", { method: "POST", auth: true })
      toast.success("Logout berhasil")
    } catch (e) {
      toast.error("Logout gagal di server, token akan dibersihkan lokal")
    } finally {
      // Add a short delay to allow UI feedback (toasts/animation) to be seen
      await new Promise((r) => setTimeout(r, 1000))
      clearToken()
      setIsLogoutDialogOpen(false)
      setIsLoggingOut(false)
      router.replace('/login')
    }
  };

  return (
    <>
    <header className="sticky top-0 z-50 flex w-full items-center border-b backdrop-blur-md bg-background/80">
      <div className="flex h-[--header-height] w-full items-center gap-2 px-4">
        {/* Sidebar button with high z-index to stay on top */}
        <div className="z-20">
          <Button
            className="h-8 w-8"
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
          >
            <SidebarIcon />
          </Button>
        </div>
        <Separator orientation="vertical" className="mr-2 h-4" />
        
        {/* Render the breadcrumbs prop here */}
        <Breadcrumb className="z-10 hidden sm:block">
            {breadcrumbs}
        </Breadcrumb>

        {/* User Profile Dropdown */}
        <div className="ml-auto flex items-center z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={(me as any)?.avatar || undefined} alt={(me?.nama || me?.name || "U") as string} />
                  <AvatarFallback>{(me?.nama || me?.name || "U").toString().charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{me?.nama || me?.name || "User"}</p>
                  { (me?.email) && (
                    <p className="text-xs leading-none text-muted-foreground">
                      {me.email}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* This is the corrected section */}
              <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
                <DropdownMenuItem onSelect={(e) => {
                  e.preventDefault(); // Prevents the dropdown from closing immediately
                  setIsLogoutDialogOpen(true);
                }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You will need to re-enter your credentials to access the dashboard again.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout} disabled={isLoggingOut}>
                      {isLoggingOut ? 'Logging out…' : 'Continue'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
    {isLoggingOut && (
      <div className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-background/90 shadow-lg border">
          <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Logging out…</p>
        </div>
      </div>
    )}
    </>
  )
}