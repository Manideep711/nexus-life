import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, FileText, LayoutDashboard, Search, Filter, Trash2, Edit, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_URL } from "@/config";

interface User {
  _id: string;
  fullName: string;
  phone?: string;
  email: string;
  verificationStatus: "none" | "pending" | "verified" | "rejected";
  verificationDoc?: string;
  isVerified: boolean;
  role: string;
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleReview = async (userId: string, status: "verified" | "rejected") => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/verify/${userId}/review`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: `User ${status}`,
          description: `${data.user.fullName} marked as ${status}.`,
        });
        fetchUsers();
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast({ title: "User Deleted", description: "The user has been permanently removed." });
        setUsers(users.filter((user) => user._id !== userId));
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleEditSave = async () => {
    if (!editingUser) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/users/${editingUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingUser),
      });

      const data = await res.json();
      if (res.ok) {
        toast({ title: "User Updated", description: "User details have been saved." });
        setUsers(users.map((u) => (u._id === editingUser._id ? data : u)));
        setIsEditDialogOpen(false);
        setEditingUser(null);
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <div className="animate-pulse flex flex-col items-center">
          <LayoutDashboard className="h-10 w-10 text-primary mb-2" />
          <p className="text-muted-foreground">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users, roles, and verification requests.</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-background p-1 rounded-lg border shadow-sm flex-1 md:flex-none">
              <Search className="h-4 w-4 ml-2 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="border-none shadow-none focus-visible:ring-0 w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2 border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20" onClick={handleLogout}>
              <LogOut className="h-4 w-4" /> <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{users.filter(u => u.verificationStatus === 'pending').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Verified Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{users.filter(u => u.verificationStatus === 'verified').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{users.filter(u => u.verificationStatus === 'rejected').length}</div>
            </CardContent>
          </Card>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-20 bg-background rounded-xl border border-dashed text-muted-foreground">
            <Filter className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No users found matching your filter.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <Card key={user._id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
                <div className={`h-2 w-full ${user.verificationStatus === "verified" ? "bg-green-500" :
                  user.verificationStatus === "rejected" ? "bg-red-500" :
                    user.verificationStatus === "pending" ? "bg-yellow-500" : "bg-gray-300"
                  }`} />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{user.fullName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">{user.role}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Verification:</span>
                    <Badge
                      className={
                        user.verificationStatus === "verified"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : user.verificationStatus === "rejected"
                            ? "bg-red-100 text-red-800 hover:bg-red-100"
                            : user.verificationStatus === "pending"
                              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                              : "bg-gray-100 text-gray-800"
                      }
                    >
                      {user.verificationStatus}
                    </Badge>
                  </div>

                  {user.phone && (
                    <p className="text-sm text-muted-foreground">📞 {user.phone}</p>
                  )}

                  {user.verificationDoc && (
                    <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
                      <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Document</p>
                      <a
                        href={`${API_URL}/${user.verificationDoc}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline hover:text-primary/80 transition-colors"
                      >
                        <FileText className="h-4 w-4" /> View Submitted File
                      </a>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setEditingUser(user);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDelete(user._id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                  </div>

                  {/* Quick Verify Actions (only if pending) */}
                  {user.verificationStatus === 'pending' && (
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleReview(user._id, "verified")}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReview(user._id, "rejected")}
                      >
                        <XCircle className="h-3 w-3 mr-1" /> Reject
                      </Button>
                    </div>
                  )}

                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            {editingUser && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={editingUser.fullName}
                    onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Role
                  </Label>
                  <Select
                    value={editingUser.role}
                    onValueChange={(val) => setEditingUser({ ...editingUser, role: val })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="donor">Donor</SelectItem>
                      <SelectItem value="requester">Requester</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="ngo">NGO</SelectItem>
                      <SelectItem value="hospital">Hospital</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={editingUser.verificationStatus}
                    onValueChange={(val: any) => setEditingUser({ ...editingUser, verificationStatus: val, isVerified: val === 'verified' })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={handleEditSave}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;
