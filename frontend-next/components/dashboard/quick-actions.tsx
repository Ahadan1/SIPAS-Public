import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Archive } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  return (
    <div className="px-4 py-4 lg:px-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-800">Quick Actions</CardTitle>
          <p className="text-sm text-gray-500">Common tasks for your title</p>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button variant="outline" className="flex items-center gap-2" asChild>
            <Link href="/arsip?tab=upload">
              <Upload className="h-4 w-4" />
              Upload Document
            </Link>
          </Button>
          <Button variant="outline" className="flex items-center gap-2" asChild>
            <Link href="/arsip?tab=masuk">
              <Archive className="h-4 w-4" />
              Browse Archives
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}