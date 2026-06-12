import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { User, Mail, Calendar, Trash2, Edit, Plus } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const [players, setPlayers] = useState([]);
  const [sports, setSports] = useState([]);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    email: "",
    sports_ids: []
  });

  useEffect(() => {
    fetchPlayers();
    fetchSports();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await axios.get(`${API}/players`);
      setPlayers(response.data);
    } catch (error) {
      console.error("Error fetching players:", error);
      toast.error("Failed to fetch players");
    }
  };

  const fetchSports = async () => {
    try {
      const response = await axios.get(`${API}/sports`);
      setSports(response.data);
    } catch (error) {
      console.error("Error fetching sports:", error);
      toast.error("Failed to fetch sports");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.age || !formData.email) {
      toast.error("Please fill all required fields");
      return;
    }
    
    if (formData.sports_ids.length === 0) {
      toast.error("Please select at least one sport");
      return;
    }

    try {
      await axios.post(`${API}/players`, {
        name: formData.name,
        age: parseInt(formData.age),
        email: formData.email,
        sports_ids: formData.sports_ids
      });
      toast.success("Player registered successfully!");
      setShowRegisterDialog(false);
      setFormData({ name: "", age: "", email: "", sports_ids: [] });
      fetchPlayers();
    } catch (error) {
      console.error("Error registering player:", error);
      toast.error(error.response?.data?.detail || "Failed to register player");
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.age || !formData.email) {
      toast.error("Please fill all required fields");
      return;
    }
    
    if (formData.sports_ids.length === 0) {
      toast.error("Please select at least one sport");
      return;
    }

    try {
      await axios.put(`${API}/players/${selectedPlayer.player_id}`, {
        name: formData.name,
        age: parseInt(formData.age),
        email: formData.email,
        sports_ids: formData.sports_ids
      });
      toast.success("Player updated successfully!");
      setShowEditDialog(false);
      setSelectedPlayer(null);
      setFormData({ name: "", age: "", email: "", sports_ids: [] });
      fetchPlayers();
    } catch (error) {
      console.error("Error updating player:", error);
      toast.error(error.response?.data?.detail || "Failed to update player");
    }
  };

  const handleDelete = async (player_id) => {
    if (!window.confirm("Are you sure you want to delete this player?")) {
      return;
    }

    try {
      await axios.delete(`${API}/players/${player_id}`);
      toast.success("Player deleted successfully!");
      fetchPlayers();
    } catch (error) {
      console.error("Error deleting player:", error);
      toast.error("Failed to delete player");
    }
  };

  const openEditDialog = (player) => {
    setSelectedPlayer(player);
    setFormData({
      name: player.name,
      age: player.age.toString(),
      email: player.email,
      sports_ids: player.sports.map(s => s.sports_id)
    });
    setShowEditDialog(true);
  };

  const handleSportToggle = (sportId) => {
    setFormData(prev => ({
      ...prev,
      sports_ids: prev.sports_ids.includes(sportId)
        ? prev.sports_ids.filter(id => id !== sportId)
        : [...prev.sports_ids, sportId]
    }));
  };

  const resetForm = () => {
    setFormData({ name: "", age: "", email: "", sports_ids: [] });
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Sports Registration
          </h1>
          <p className="text-lg text-gray-600">Manage player registrations and sports selections</p>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-8">
          <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
            <DialogTrigger asChild>
              <Button 
                data-testid="register-player-btn"
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl"
                onClick={resetForm}
              >
                <Plus className="mr-2 h-5 w-5" />
                Register New Player
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="register-dialog" className="max-w-md">
              <DialogHeader>
                <DialogTitle>Register New Player</DialogTitle>
                <DialogDescription>Enter player details and select sports</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    data-testid="player-name-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    data-testid="player-age-input"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Enter age"
                    required
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    data-testid="player-email-input"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email"
                    required
                  />
                </div>
                <div>
                  <Label>Select Sports *</Label>
                  <div className="space-y-2 mt-2 max-h-48 overflow-y-auto" data-testid="sports-list">
                    {sports.map((sport) => (
                      <div key={sport.sports_id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`sport-${sport.sports_id}`}
                          data-testid={`sport-checkbox-${sport.sports_id}`}
                          checked={formData.sports_ids.includes(sport.sports_id)}
                          onCheckedChange={() => handleSportToggle(sport.sports_id)}
                        />
                        <label
                          htmlFor={`sport-${sport.sports_id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {sport.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <Button 
                  data-testid="submit-registration-btn"
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Register Player
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Button
            data-testid="admin-login-btn"
            variant="outline"
            onClick={() => window.location.href = '/admin'}
            className="px-6 py-3 rounded-full"
          >
            Admin Panel
          </Button>
        </div>

        {/* Players List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {players.map((player) => (
            <Card key={player.player_id} className="hover:shadow-xl transition-shadow duration-300" data-testid={`player-card-${player.player_id}`}>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-xl" data-testid={`player-name-${player.player_id}`}>{player.name}</span>
                  <span className="text-sm font-mono text-gray-500" data-testid={`player-id-${player.player_id}`}>{player.player_id}</span>
                </CardTitle>
                <CardDescription className="flex items-center gap-4">
                  <span className="flex items-center gap-1" data-testid={`player-age-${player.player_id}`}>
                    <Calendar className="h-4 w-4" />
                    {player.age} years
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600" data-testid={`player-email-${player.player_id}`}>
                    <Mail className="h-4 w-4" />
                    {player.email}
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-2">Sports:</p>
                    <div className="flex flex-wrap gap-2">
                      {player.sports.map((sport) => (
                        <span
                          key={sport.sports_id}
                          data-testid={`player-sport-${player.player_id}-${sport.sports_id}`}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                        >
                          {sport.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      data-testid={`edit-player-btn-${player.player_id}`}
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(player)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      data-testid={`delete-player-btn-${player.player_id}`}
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(player.player_id)}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {players.length === 0 && (
          <div className="text-center py-20" data-testid="no-players-message">
            <User className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">No players registered yet</h3>
            <p className="text-gray-500 mt-2">Click "Register New Player" to get started</p>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent data-testid="edit-dialog" className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Player</DialogTitle>
              <DialogDescription>Update player details and sports</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  data-testid="edit-player-name-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-age">Age *</Label>
                <Input
                  id="edit-age"
                  data-testid="edit-player-age-input"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="Enter age"
                  required
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  data-testid="edit-player-email-input"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email"
                  required
                />
              </div>
              <div>
                <Label>Select Sports *</Label>
                <div className="space-y-2 mt-2 max-h-48 overflow-y-auto" data-testid="edit-sports-list">
                  {sports.map((sport) => (
                    <div key={sport.sports_id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-sport-${sport.sports_id}`}
                        data-testid={`edit-sport-checkbox-${sport.sports_id}`}
                        checked={formData.sports_ids.includes(sport.sports_id)}
                        onCheckedChange={() => handleSportToggle(sport.sports_id)}
                      />
                      <label
                        htmlFor={`edit-sport-${sport.sports_id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {sport.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <Button 
                data-testid="submit-edit-btn"
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Update Player
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default HomePage;