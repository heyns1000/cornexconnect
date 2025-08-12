import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { PageTransition } from "@/components/PageTransition";
import { AnimatedCard, FadeIn } from "@/components/AnimatedComponents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, UserPlus, Edit, Trash2, Shield, Mail, Phone } from "lucide-react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'staff' | 'viewer';
  department: string;
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
}

export default function UserManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const createUserMutation = useMutation({
    mutationFn: (userData: Partial<User>) => apiRequest("/api/users", "POST", userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsCreateOpen(false);
      toast({
        title: "User Created",
        description: "New user has been created successfully.",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, ...userData }: Partial<User> & { id: string }) =>
      apiRequest(`/api/users/${id}`, "PATCH", userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setEditingUser(null);
      toast({
        title: "User Updated",
        description: "User information has been updated successfully.",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/users/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "User Deleted",
        description: "User has been removed from the system.",
      });
    },
  });

  const handleCreateUser = (formData: FormData) => {
    const userData = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      role: formData.get("role") as User["role"],
      department: formData.get("department") as string,
      status: "active" as const,
    };
    createUserMutation.mutate(userData);
  };

  const handleUpdateUser = (formData: FormData) => {
    if (!editingUser) return;
    const userData = {
      id: editingUser.id,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      role: formData.get("role") as User["role"],
      department: formData.get("department") as string,
      status: formData.get("status") as User["status"],
    };
    updateUserMutation.mutate(userData);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'staff': return 'bg-green-100 text-green-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PageTransition>
      <div className="p-8 space-y-8">
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-2">Manage company users, staff, and permissions</p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateUser(new FormData(e.currentTarget));
                }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" name="firstName" required />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" name="lastName" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" type="tel" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select name="role" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Select name="department" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="administration">Administration</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="production">Production</SelectItem>
                          <SelectItem value="logistics">Logistics</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="it">IT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createUserMutation.isPending}>
                      {createUserMutation.isPending ? "Creating..." : "Create User"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </FadeIn>

        <AnimatedCard className="backdrop-blur-sm bg-white/80">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-emerald-600" />
              Company Users ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user, index) => (
                  <FadeIn key={user.id} delay={index * 0.1}>
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-white/50 hover:bg-white/80 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          <span className="text-emerald-800 font-semibold">
                            {user.firstName[0]}{user.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {user.firstName} {user.lastName}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {user.email}
                            </span>
                            {user.phone && (
                              <span className="flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {user.phone}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getRoleColor(user.role)}>
                              <Shield className="h-3 w-3 mr-1" />
                              {user.role.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">
                              {user.department}
                            </Badge>
                            <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                              {user.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteUserMutation.mutate(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </FadeIn>
                ))}
                {users.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                    <p className="text-gray-500">Get started by adding your first user.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </AnimatedCard>

        {/* Edit User Dialog */}
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            {editingUser && (
              <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdateUser(new FormData(e.currentTarget));
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editFirstName">First Name</Label>
                    <Input 
                      id="editFirstName" 
                      name="firstName" 
                      defaultValue={editingUser.firstName} 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="editLastName">Last Name</Label>
                    <Input 
                      id="editLastName" 
                      name="lastName" 
                      defaultValue={editingUser.lastName} 
                      required 
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="editEmail">Email</Label>
                  <Input 
                    id="editEmail" 
                    name="email" 
                    type="email" 
                    defaultValue={editingUser.email} 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="editPhone">Phone</Label>
                  <Input 
                    id="editPhone" 
                    name="phone" 
                    type="tel" 
                    defaultValue={editingUser.phone || ''} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editRole">Role</Label>
                    <Select name="role" defaultValue={editingUser.role}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editDepartment">Department</Label>
                    <Select name="department" defaultValue={editingUser.department}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="administration">Administration</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                        <SelectItem value="logistics">Logistics</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="it">IT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="editStatus">Status</Label>
                  <Select name="status" defaultValue={editingUser.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateUserMutation.isPending}>
                    {updateUserMutation.isPending ? "Updating..." : "Update User"}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}