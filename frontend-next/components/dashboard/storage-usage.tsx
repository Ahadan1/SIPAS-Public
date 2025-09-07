import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StorageUsage() {
  return (
    <Card className="h-full shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-gray-800">Storage Usage</CardTitle>
        <p className="text-sm text-gray-500">Archive capacity utilization</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Used Space</p>
            <div className="relative w-full h-2 bg-gray-200 rounded-full">
              <div className="absolute top-0 left-0 h-full bg-blue-500 rounded-full" style={{ width: "75%" }}></div>
            </div>
            <p className="text-sm font-semibold text-gray-700">75%</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div>
              <p>Documents</p>
              <p>Available</p>
              <p>Total</p>
            </div>
            <div className="text-right">
              <p>2.4 TB</p>
              <p>0.8 TB</p>
              <p>3.2 TB</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}