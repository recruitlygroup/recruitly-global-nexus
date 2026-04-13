/**
 * AdminInvoicesTab — View invoices (admin or agent-scoped)
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Receipt, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Invoice {
  id: string;
  amount: number | null;
  status: string | null;
  service_type: string | null;
  candidate_id: string | null;
  created_at: string | null;
}

export default function AdminInvoicesTab() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setInvoices(data as Invoice[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchInvoices(); }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#fbbf24]" /></div>;
  }

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2">
          <Receipt className="w-5 h-5 text-[#fbbf24]" /> Invoices
        </CardTitle>
        <Button onClick={fetchInvoices} variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">No invoices yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-white/70">ID</TableHead>
                  <TableHead className="text-white/70">Amount</TableHead>
                  <TableHead className="text-white/70">Service</TableHead>
                  <TableHead className="text-white/70">Status</TableHead>
                  <TableHead className="text-white/70">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map(inv => (
                  <TableRow key={inv.id} className="border-white/10">
                    <TableCell className="text-white/60 text-xs font-mono">{inv.id.slice(0, 8)}</TableCell>
                    <TableCell className="text-white">{inv.amount != null ? `$${inv.amount}` : "—"}</TableCell>
                    <TableCell className="text-white/80">{inv.service_type || "—"}</TableCell>
                    <TableCell>
                      <Badge className={
                        inv.status === "Paid" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                        inv.status === "Pending" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                        "bg-white/10 text-white/60 border-white/20"
                      }>
                        {inv.status || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white/60 text-sm">
                      {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
