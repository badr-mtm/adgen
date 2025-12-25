import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle, Shield, FileCheck } from "lucide-react";

interface ComplianceItem {
  id: string;
  campaignTitle: string;
  status: "approved" | "pending" | "rejected";
  network: string;
  submittedAt: string;
  notes?: string;
}

interface TVComplianceStatusProps {
  items: ComplianceItem[];
}

export function TVComplianceStatus({ items }: TVComplianceStatusProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <FileCheck className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "pending":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const approvedCount = items.filter(i => i.status === "approved").length;
  const pendingCount = items.filter(i => i.status === "pending").length;
  const rejectedCount = items.filter(i => i.status === "rejected").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg text-foreground">Broadcast Clearance</CardTitle>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle className="h-3 w-3" /> {approvedCount}
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <AlertTriangle className="h-3 w-3" /> {pendingCount}
              </span>
              <span className="flex items-center gap-1 text-red-400">
                <XCircle className="h-3 w-3" /> {rejectedCount}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {items.length > 0 ? (
            <div className="space-y-2">
              {items.slice(0, 4).map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(item.status)}
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.campaignTitle}</p>
                      <p className="text-xs text-muted-foreground">{item.network} • {item.submittedAt}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-xs ${getStatusBadge(item.status)}`}>
                    {item.status}
                  </Badge>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No clearance requests</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
