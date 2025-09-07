'use client'

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  ChevronRight,
  GalleryVerticalEnd,
  LayoutDashboard,
  Mail,
  Send,
  FileText,
  Book,
  BarChart2,
  Users,
  Archive,
} from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Surat Masuk",
      url: "/surat-masuk",
      icon: Mail,
    },
    {
      title: "Surat Keluar",
      url: "/surat-keluar",
      icon: Send,
    },
    {
      title: "Laporan",
      icon: FileText,
      items: [
        {
          title: "Kegiatan",
          url: "/laporan/kegiatan",
        },
        {
          title: "Notulen",
          url: "/laporan/notulen",
        },
        {
          title: "Surat Masuk",
          url: "/laporan/surat-masuk",
        },
        {
          title: "Surat Keluar",
          url: "/laporan/surat-keluar",
        },
      ],
    },
    {
      title: "Referensi",
      icon: Book,
      items: [
        {
          title: "Klasifikasi",
          url: "/referensi/klasifikasi",
        },
        {
          title: "Disposisi",
          url: "/referensi/disposisi",
        },
        {
          title: "Jabatan",
          url: "/referensi/jabatan",
        },
        {
          title: "Penandatanganan Surat",
          url: "/referensi/penandatanganan-surat",
        },
        {
          title: "Jenis Naskah",
          url: "/referensi/jenis-naskah",
        },
      ],
    },
    {
      title: "Rekap Surat",
      url: "/rekap-surat",
      icon: BarChart2,
    },
    {
      title: "Arsip",
      url: "/arsip",
      icon: Archive,
    },
    {
      title: "User",
      url: "/user",
      icon: Users,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { state } = useSidebar()
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({})

  // Function to check if a URL is active
  const isActive = (url: string | undefined) => {
    if (!url) return false
    return pathname === url
  }

  // Function to check if a parent section should be active (has active children)
  const isParentActive = (items: { url: string }[] | undefined) => {
    if (!items) return false
    return items.some(item => isActive(item.url))
  }

  // Close all sections when sidebar collapses
  React.useEffect(() => {
    if (state === "collapsed") {
      setOpenSections({})
    }
  }, [state])

  // Auto-open sections that contain active sub-items
  React.useEffect(() => {
    const sectionsToOpen: Record<string, boolean> = {}
    
    data.navMain.forEach((item) => {
      if (item.items && isParentActive(item.items)) {
        sectionsToOpen[item.title] = true
      }
    })
    
    setOpenSections(prev => ({
      ...prev,
      ...sectionsToOpen
    }))
  }, [pathname])

  const handleSectionToggle = (title: string, isOpen: boolean) => {
    if (state !== "collapsed") {
      setOpenSections(prev => ({
        ...prev,
        [title]: isOpen
      }))
    }
  }

  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#" className="data-[collapsible=icon]:!p-0">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">SIPAS-Next</span>
                  <span className="truncate text-xs">Test Build</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <Collapsible 
                key={item.title}
                open={openSections[item.title] || false}
                onOpenChange={(isOpen) => handleSectionToggle(item.title, isOpen)}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive(item.url) || isParentActive(item.items)}>
                    <a href={item.url}>
                      {item.icon && <item.icon className="size-4" />}
                      <span className="flex-1 font-medium">{item.title}</span>
                      {item.items?.length ? (
                        <CollapsibleTrigger asChild>
                          <button 
                            type="button" 
                            className="ml-auto p-0 opacity-50 hover:opacity-100"
                          >
                            <ChevronRight className="transition-transform group-data-[state=open]/collapsible:rotate-90" />
                          </button>
                        </CollapsibleTrigger>
                      ) : null}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {item.items?.length ? (
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {item.items.map((subItem) => (
                          <SidebarMenuItem key={subItem.title}>
                            <SidebarMenuButton asChild isActive={isActive(subItem.url)}>
                              <a href={subItem.url}>{subItem.title}</a>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                ) : null}
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}