import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageTransition } from "@/components/PageTransition";
import { AnimatedCard, FadeIn } from "@/components/AnimatedComponents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Shield,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  User,
  Clock,
  LogIn,
  LogOut,
  Globe,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Matches the actual backend userAuditTrail schema
interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  sessionId: string | null;
  timestamp: string;
}

interface UserInfo {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
}

export default function AuditTrail() {
  const { toast } = useToast();

  const [filters, setFilters] = useState({
    action: '',
    userId: '',
    dateFrom: '',
    dateTo: '',
  });

  // Build query params from filters
  const queryParams = new URLSearchParams();
  if (filters.action && filters.action !== 'all') queryParams.set('action', filters.action);
  if (filters.userId && filters.userId !== 'all') queryParams.set('userId', filters.userId);
  queryParams.set('limit', '200');

  const { data: auditLogs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ["/api/audit-logs", filters.action, filters.userId],
    queryFn: async () => {
      const res = await fetch(`/api/audit-logs?${queryParams.toString()}`, { credentials: "include" });
      if (!res.ok) return [];
      return await res.json();
    },
  });

  const { data: users = [] } = useQuery<UserInfo[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await fetch("/api/users", { credentials: "include" });
      if (!res.ok) return [];
      return await res.json();
    },
  });

  // Map userId to display name
  const getUserName = (userId: string | null) => {
    if (!userId) return "System";
    const user = users.find(u => u.id === userId);
    if (user) {
      if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
      return user.email || userId;
    }
    return userId.substring(0, 8) + "...";
  };

  const getActionIcon = (action: string) => {
    if (action.includes('login')) return <LogIn className="h-4 w-4 text-emerald-600" />;
    if (action.includes('logout')) return <LogOut className="h-4 w-4 text-gray-600" />;
    if (action.includes('register')) return <Plus className="h-4 w-4 text-blue-600" />;
    if (action.includes('page_visit')) return <Eye className="h-4 w-4 text-blue-600" />;
    if (action.includes('api_access')) return <Globe className="h-4 w-4 text-purple-600" />;
    if (action.includes('update') || action.includes('edit')) return <Edit className="h-4 w-4 text-yellow-600" />;
    if (action.includes('delete')) return <Trash2 className="h-4 w-4 text-red-600" />;
    if (action.includes('create')) return <Plus className="h-4 w-4 text-green-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('login') && !action.includes('failed')) return 'bg-emerald-100 text-emerald-800';
    if (action.includes('failed')) return 'bg-red-100 text-red-800';
    if (action.includes('logout')) return 'bg-gray-100 text-gray-800';
    if (action.includes('register')) return 'bg-blue-100 text-blue-800';
    if (action.includes('page_visit')) return 'bg-sky-100 text-sky-800';
    if (action.includes('api_access')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const clearFilters = () => {
    setFilters({ action: '', userId: '', dateFrom: '', dateTo: '' });
    toast({
      title: "Filters Cleared",
      description: "All filters have been reset.",
    });
  };

  const exportToCSV = () => {
    if (auditLogs.length === 0) {
      toast({ title: "No Data", description: "No audit logs to export.", variant: "destructive" });
      return;
    }

    const csvContent = "data:text/csv;charset=utf-8,"
      + "Timestamp,User,Action,Details,IP Address,User Agent\n"
      + auditLogs.map(log =>
          `"${log.timestamp}","${getUserName(log.userId)}","${log.action}","${(log.details || '').replace(/"/g, '""')}","${log.ipAddress || ''}","${(log.userAgent || '').substring(0, 50)}"`
        ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit_log_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Export Complete", description: `Exported ${auditLogs.length} audit log entries.` });
  };

  return (
    <PageTransition>
      <div className="p-8 space-y-8">
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Audit Trail</h1>
              <p className="text-gray-600 mt-2">Monitor all user activities, logins, and system changes</p>
            </div>
            <Button onClick={exportToCSV} className="bg-emerald-600 hover:bg-emerald-700">
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </FadeIn>

        <AnimatedCard className="backdrop-blur-sm bg-white/80">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2 text-emerald-600" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Action Type</Label>
                <Select value={filters.action} onValueChange={(value) => setFilters(prev => ({ ...prev, action: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="logout">Logout</SelectItem>
                    <SelectItem value="register">Register</SelectItem>
                    <SelectItem value="login_failed">Failed Login</SelectItem>
                    <SelectItem value="page_visit">Page Visit</SelectItem>
                    <SelectItem value="api_access">API Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>User</Label>
                <Select value={filters.userId} onValueChange={(value) => setFilters(prev => ({ ...prev, userId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {users.map((user: UserInfo) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user.email || user.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Date From</Label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                />
              </div>

              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard className="backdrop-blur-sm bg-white/80">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-emerald-600" />
              Audit Logs ({auditLogs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {auditLogs.map((log, index) => (
                  <FadeIn key={log.id} delay={index * 0.02}>
                    <div className="flex items-start justify-between p-4 rounded-lg border bg-white/50 hover:bg-white/80 transition-colors">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          {getActionIcon(log.action)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1 flex-wrap gap-1">
                            <Badge className={getActionColor(log.action)}>
                              {log.action.replace(/_/g, " ").toUpperCase()}
                            </Badge>
                          </div>
                          {log.details && (
                            <p className="text-gray-900 text-sm mb-1">{log.details}</p>
                          )}
                          <div className="flex items-center space-x-4 text-xs text-gray-500 flex-wrap gap-y-1">
                            <span className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {getUserName(log.userId)}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {log.timestamp ? format(new Date(log.timestamp), "PPpp") : "Unknown"}
                            </span>
                            {log.ipAddress && (
                              <span>IP: {log.ipAddress}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </FadeIn>
                ))}
                {auditLogs.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No audit logs yet</h3>
                    <p className="text-gray-500">
                      User activities will appear here as users sign in and interact with the platform.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </AnimatedCard>
      </div>
    </PageTransition>
  );
}
