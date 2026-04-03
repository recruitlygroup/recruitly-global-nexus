import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, Download, Database } from "lucide-react";
import { format } from "date-fns";

interface AdminDataTabProps {
  title: string;
  action: string;
  dataKey: string;
  columns: string[];
  columnLabels: Record<string, string>;
  fileName: string;
}

const AdminDataTab = ({ title, action, dataKey, columns, columnLabels, fileName }: AdminDataTabProps) => {
  const { toast } = useToast();
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const { data: res, error } = await supabase.functions.invoke("admin-actions", {
        body: { action },
      });
      if (error) throw error;
      setData(res[dataKey] || []);
    } catch {
      toast({ title: "Error", description: `Failed to fetch ${title}`, variant: "destructive" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatCellValue = (value: unknown, col: string): string => {
    if (value === null || value === undefined) return "—";
    if (col === "created_at" || col === "updated_at") {
      try { return format(new Date(value as string), "MMM d, yyyy"); } catch { return String(value); }
    }
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const exportCSV = () => {
    if (data.length === 0) {
      toast({ title: "No data", description: "Nothing to export", variant: "destructive" });
      return;
    }

    // Export ALL fields, not just visible columns
    const allKeys = Array.from(new Set(data.flatMap(row => Object.keys(row))));
    const header = allKeys.join(",");
    const rows = data.map(row =>
      allKeys.map(key => {
        const val = row[key];
        if (val === null || val === undefined) return "";
        const str = typeof val === "object" ? JSON.stringify(val) : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      }).join(",")
    );

    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported!", description: `${data.length} records exported to CSV` });
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#fbbf24]" /></div>;
  }

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
        <CardTitle className="text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-[#fbbf24]" /> {title}
          <span className="text-sm font-normal text-white/50">({data.length} records)</span>
        </CardTitle>
        <div className="flex gap-2">
          <Button onClick={exportCSV} size="sm" className="bg-[#fbbf24] text-[#0a192f] hover:bg-[#f59e0b]">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button onClick={fetchData} variant="outline" size="sm" disabled={refreshing}
            className="border-white/20 text-white hover:bg-white/10">
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-12">
            <Database className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">No records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  {columns.map(col => (
                    <TableHead key={col} className="text-white/70">{columnLabels[col] || col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, i) => (
                  <TableRow key={i} className="border-white/10">
                    {columns.map(col => (
                      <TableCell key={col} className="text-white/80 max-w-[200px] truncate">
                        {formatCellValue(row[col], col)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminDataTab;
