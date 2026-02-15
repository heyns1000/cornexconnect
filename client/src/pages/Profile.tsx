import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageTransition } from "@/components/PageTransition";
import { useQuery } from "@tanstack/react-query";
import { User, Mail, Building2, Shield, Phone, Globe, Calendar } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();

  // Fetch company settings for company info
  const { data: companySettings } = useQuery<any>({
    queryKey: ["/api/company-settings"],
    retry: false,
  });

  const roleLabels: Record<string, string> = {
    admin: "Administrator",
    manager: "Operations Manager",
    staff: "Staff Member",
    viewer: "Viewer",
    user: "Team Member",
  };

  const providerLabels: Record<string, string> = {
    local: "Email & Password",
    google: "Google",
    microsoft: "Microsoft",
    github: "GitHub",
    facebook: "Facebook",
  };

  return (
    <PageTransition>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            User Profile
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Information */}
          <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user?.profileImageUrl || ""} />
                  <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-lg">
                    {(user?.firstName?.[0] || "").toUpperCase()}{(user?.lastName?.[0] || "").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {user?.firstName || ""} {user?.lastName || ""}
                  </h3>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <Badge className="mt-1 capitalize">{roleLabels[user?.role || "viewer"] || user?.role}</Badge>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{user?.email}</span>
                  {user?.emailVerified && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700">Verified</Badge>
                  )}
                </div>
                {user?.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span>Signed in via {providerLabels[user?.authProvider || "local"] || user?.authProvider}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Company Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Company Name</p>
                <p className="text-lg font-bold">{companySettings?.companyName || "Not configured"}</p>
              </div>
              {companySettings?.companyRegistration && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Registration Number</p>
                  <p>{companySettings.companyRegistration}</p>
                </div>
              )}
              {companySettings?.contactEmail && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Contact Email</p>
                  <p>{companySettings.contactEmail}</p>
                </div>
              )}
              {user?.department && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Department</p>
                  <p className="capitalize">{user.department}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Account Status</span>
                <Badge className="bg-green-100 text-green-700">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Access Level</span>
                <Badge variant="outline" className="capitalize">{roleLabels[user?.role || "viewer"] || user?.role}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Last Login</span>
                <span className="text-sm text-muted-foreground">
                  {user?.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Member Since</span>
                <span className="text-sm text-muted-foreground">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => window.location.href = '/company-settings'}
              >
                <Building2 className="w-4 h-4 mr-2" />
                Company Settings
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => window.location.href = '/audit-trail'}
              >
                <Shield className="w-4 h-4 mr-2" />
                Audit Trail
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => window.location.href = '/user-management'}
              >
                <User className="w-4 h-4 mr-2" />
                User Management
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
