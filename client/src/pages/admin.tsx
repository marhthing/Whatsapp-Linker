import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, Shield, LogOut, Users, Activity, PauseCircle, XCircle, Search } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { adminLogin, getAllSessions } from "@/lib/api";
import SessionTable from "@/components/session-table";
import { Link } from "wouter";
import type { SessionsResponse } from "@shared/schema";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: adminLogin,
    onSuccess: () => {
      setIsAuthenticated(true);
      toast({
        title: "Login Successful",
        description: "Welcome to the admin panel",
      });
    },
    onError: (error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { data: sessionsData, isLoading } = useQuery<SessionsResponse>({
    queryKey: ["/api/admin/sessions"],
    enabled: isAuthenticated,
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast({
        title: "Password Required",
        description: "Please enter the admin password",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate({ password });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword("");
    queryClient.clear();
  };

  const filteredSessions = sessionsData?.sessions?.filter((session) => {
    const matchesSearch = !searchTerm || 
      session.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.whatsappName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || session.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-xl font-semibold text-gray-900">WhatsApp Bridge</h1>
                </div>
              </div>
              <nav className="flex items-center space-x-6">
                <Link href="/">
                  <Button variant="ghost" size="sm">
                    Link WhatsApp
                  </Button>
                </Link>
                <span className="px-4 py-2 text-sm font-medium text-primary border-b-2 border-primary">
                  Admin Panel
                </span>
              </nav>
            </div>
          </div>
        </header>

        {/* Login Form */}
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Admin Access</h2>
                <p className="text-gray-600 mt-2">Enter admin password to manage sessions</p>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="adminPassword">Password</Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? "Authenticating..." : "Access Admin Panel"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">WhatsApp Bridge</h1>
              </div>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  Link WhatsApp
                </Button>
              </Link>
              <span className="px-4 py-2 text-sm font-medium text-primary border-b-2 border-primary">
                Admin Panel
              </span>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h2>
            <p className="text-gray-600 mt-1">Manage all WhatsApp sessions and bot configurations</p>
          </div>
          <Button onClick={handleLogout} variant="destructive">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        {sessionsData?.stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                    <p className="text-2xl font-semibold text-gray-900">{sessionsData.stats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                    <p className="text-2xl font-semibold text-green-600">{sessionsData.stats.active}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Inactive Sessions</p>
                    <p className="text-2xl font-semibold text-orange-600">{sessionsData.stats.inactive}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <PauseCircle className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Failed Sessions</p>
                    <p className="text-2xl font-semibold text-red-600">{sessionsData.stats.failed}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sessions Management */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Sessions Management</h3>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <Input
                    placeholder="Search sessions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="failed">Failed</option>
                  <option value="connecting">Connecting</option>
                </select>
              </div>
            </div>
          </div>

          <SessionTable sessions={filteredSessions} isLoading={isLoading} />
        </Card>
      </div>
    </div>
  );
}
