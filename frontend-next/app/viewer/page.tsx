"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getApiBaseUrl } from "@/lib/api";
import { toast } from "sonner";

export default function ViewerPage() {
  const params = useSearchParams();
  const router = useRouter();
  const path = params.get("path");
  const filename = params.get("name") || "dokumen";

  useEffect(() => {
    let cancelled = false;
    async function openFile() {
      if (!path) {
        toast.error("Path file tidak ditemukan");
        return;
      }
      try {
        const base = getApiBaseUrl();
        const url = `${base}/storage/${path}`;
        // attach Authorization header if token exists
        const headers: HeadersInit = { Accept: "*/*" };
        if (typeof window !== "undefined") {
          const token = window.localStorage.getItem("authToken");
          if (token) (headers as any).Authorization = `Bearer ${token}`;
        }
        const res = await fetch(url, { headers, credentials: "include" });
        if (!res.ok) {
          throw new Error(`Gagal mengambil file (HTTP ${res.status})`);
        }
        const blob = await res.blob();
        if (cancelled) return;
        const objectUrl = URL.createObjectURL(blob);
        const newWin = window.open(objectUrl, "_blank");
        if (!newWin) {
          toast.error("Popup diblokir. Izinkan popup untuk melihat file.");
        } else {
          // Try to set filename via download if cannot render
          newWin.document.title = filename;
        }
        // optional: cleanup later
        setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
        // Return back to previous page after opening
        router.back();
      } catch (e: any) {
        toast.error(e?.message || "Gagal membuka file");
      }
    }
    openFile();
    return () => { cancelled = true };
  }, [path]);

  return (
    <div className="p-6 text-sm text-muted-foreground">Membuka file...</div>
  );
}
