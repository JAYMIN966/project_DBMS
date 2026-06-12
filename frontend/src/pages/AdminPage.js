import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, ArrowLeft, LogIn } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [sports, setSports] = useState([]);
  const [newSport, setNewSport] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("admin_token");
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
      fetchSports(savedToken);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/admin/login`, loginData);
      const { token } = response.data;
      setToken(token);
      setIsAuthenticated(true);
      localStorage.setItem("admin_token", token);
      toast.success("Logged in successfully!");
      fetchSports(token);
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.detail || "Invalid credentials");
    }
  };

  const handleLogout = () => {
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem("admin_token");
    toast.success("Logged out successfully");
  };

  const fetchSports = async (authToken) => {
    try {
      const response = await axios.get(`${API}/sports`);
      setSports(response.data);
    } catch (error) {
      console.error("Error fetching sports:", error);
      toast.error("Failed to fetch sports");
    }
  };

  const handleAddSport = async (e) => {
    e.preventDefault();
    if (!newSport.trim()) {
      toast.error("Please enter a sport name");
      return;
    }

    try {
      await axios.post(
        `${API}/admin/sports`,
        { name: newSport },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Sport added successfully!");
      setNewSport("");
      setShowAddDialog(false);
      fetchSports(token);
    } catch (error) {
      console.error("Error adding sport:", error);
      toast.error(error.response?.data?.detail || "Failed to add sport");
    }
  };

  const handleDeleteSport = async (sports_id) => {
    if (!window.confirm("Are you sure you want to delete this sport?")) {
      return;
    }

    try {
      await axios.delete(`${API}/admin/sports/${sports_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Sport deleted successfully!");
      fetchSports(token);
    } catch (error) {
      console.error("Error deleting sport:", error);
      toast.error("Failed to delete sport");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              Admin Login
            </CardTitle>
            <CardDescription>Enter your credentials to access admin panel</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  data-testid="admin-username-input"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  placeholder="Enter username"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  data-testid="admin-password-input"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="Enter password"
                  required
                />
              </div>
              <Button 
                data-testid="admin-login-submit-btn"
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Login
              </Button>
            </form>
            <Button
              data-testid="back-to-home-btn"
              variant="ghost"
              onClick={() => window.location.href = '/'}
              className="w-full mt-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-lg text-gray-600">Manage sports and system settings</p>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-8">
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button 
                data-testid="add-sport-btn"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Sport
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="add-sport-dialog" className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Sport</DialogTitle>
                <DialogDescription>Enter the name of the sport to add</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddSport} className="space-y-4">
                <div>
                  <Label htmlFor="sport-name">Sport Name</Label>
                  <Input
                    id="sport-name"
                    data-testid="sport-name-input"
                    value={newSport}
                    onChange={(e) => setNewSport(e.target.value)}
                    placeholder="Enter sport name"
                    required
                  />
                </div>
                <Button 
                  data-testid="submit-sport-btn"
                  type="submit" 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Add Sport
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <div className="flex gap-2">
            <Button
              data-testid="home-btn"
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 rounded-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Home
            </Button>
            <Button
              data-testid="logout-btn"
              variant="outline"
              onClick={handleLogout}
              className="px-6 py-3 rounded-full"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Sports List */}
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle>Sports Management</CardTitle>
            <CardDescription>View and manage all sports</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3" data-testid="sports-list">
              {sports.map((sport) => (
                <div
                  key={sport.sports_id}
                  data-testid={`sport-item-${sport.sports_id}`}
                  className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div>
                    <p className="font-semibold text-lg" data-testid={`sport-name-${sport.sports_id}`}>{sport.name}</p>
                    <p className="text-sm text-gray-500" data-testid={`sport-id-${sport.sports_id}`}>ID: {sport.sports_id}</p>
                  </div>
                  <Button
                    data-testid={`delete-sport-btn-${sport.sports_id}`}
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteSport(sport.sports_id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              ))}
            </div>
            {sports.length === 0 && (
              <div className="text-center py-12" data-testid="no-sports-message">
                <p className="text-gray-500">No sports available. Add one to get started!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;