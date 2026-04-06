import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Heart,
  Leaf,
  LogOut,
  Plus,
  MessageCircle,
  MapPin,
  User,
  LayoutDashboard,
  ShieldCheck,
  AlertOctagon,
  Pencil,
  Trash,
  Navigation,
  Map as MapIcon,
  List
} from "lucide-react";
import { APIProvider, Map, AdvancedMarker, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { API_URL } from "@/config";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

type Resource = {
  _id: string;
  resourceType: "blood" | "food";
  bloodType?: string;
  quantity: string;
  description?: string;
  address: string;
  status: string;
  expiresAt?: string;
  createdAt: string;
  user: string;
  location?: { coordinates: number[] };
  distance?: number; // calculated distance
};

type Profile = {
  _id: string;
  fullName: string;
  phone?: string;
  blood_type?: string;
  organization_name?: string;
  email?: string;
  verificationStatus: "none" | "pending" | "verified" | "rejected";
};

// Component to handle Directions
const DirectionsRendererComponent = ({
  origin,
  destination
}: {
  origin: { lat: number; lng: number } | null;
  destination: { lat: number; lng: number } | null;
}) => {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
  }, [routesLibrary, map]);

  useEffect(() => {
    if (!directionsService || !directionsRenderer || !origin || !destination) {
      if (directionsRenderer) directionsRenderer.setDirections(null);
      return;
    }

    directionsService.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          directionsRenderer.setDirections(response);
        } else {
          console.error("Directions request failed due to " + status);
        }
      }
    );

    return () => {
      if (directionsRenderer) directionsRenderer.setDirections(null);
    };
  }, [directionsService, directionsRenderer, origin, destination]);

  return null;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [myResources, setMyResources] = useState<Resource[]>([]);
  const [nearbyResources, setNearbyResources] = useState<Resource[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  // UI State
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedRouteDestination, setSelectedRouteDestination] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // Detect location on mount
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log("Loc error:", err) // fail silently, default nearby will show none or error
      );
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [location]); // reload when location is available

  useEffect(() => {
    const cachedStatus = localStorage.getItem("verificationStatus");
    if (cachedStatus === "pending" && profile) {
      setProfile((prev) => ({ ...prev!, verificationStatus: "pending" }));
      localStorage.removeItem("verificationStatus");
    }
  }, [profile]);

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/auth");

      const res = await fetch(`${API_URL}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setProfile(data.profile);
        setUserRole(data.user.role);
        setMyResources(data.myResources || []);

        // Fetch real nearby resources if location exists
        if (location) {
          const nearbyRes = await fetch(`${API_URL}/api/resources/nearby?lat=${location.lat}&lng=${location.lng}&radius=50`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const nearbyData = await nearbyRes.json();
          if (nearbyRes.ok) {
            setNearbyResources(nearbyData);
          }
        } else {
          // Fallback to empty or previous simple fetch if any
          if (data.nearbyResources) setNearbyResources(data.nearbyResources); // fallback to dashboard provided ones if any
        }

      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }

      // Fetch chats
      const chatRes = await fetch(`${API_URL}/api/chats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const chatData = await chatRes.json();
      setChats(Array.isArray(chatData) ? chatData : []);

      // Fetch requests
      if (data.user.role === "donor") {
        const reqRes = await fetch(`${API_URL}/api/requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const reqData = await reqRes.json();
        setRequests(Array.isArray(reqData) ? reqData : []);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  const handleRequestResource = async (resourceId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ resourceId }),
      });
      const data = await res.json();
      if (res.ok) toast({ title: "Request Sent!", description: "Donor has been notified." });
      else toast({ title: "Error", description: data.message, variant: "destructive" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleRequestResponse = async (requestId: string, status: "accepted" | "declined") => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/api/requests/${requestId}/respond`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status }),
        }
      );

      if (res.ok) {
        toast({ title: `Request ${status}`, description: status === "accepted" ? "Chat created." : "Declined." });
        loadUserData();
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleStatusChange = async (resourceId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/resources/${resourceId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast({ title: "Status Updated", description: `Resource marked as ${newStatus}.` });
        loadUserData();
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/resources/${resourceId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast({ title: "Deleted", description: "Resource removed." });
        loadUserData();
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }

  const handleGetDirections = (resLocation: { coordinates: number[] } | undefined) => {
    if (!location) {
      toast({ title: "Location needed", description: "Enable location to get directions.", variant: "destructive" });
      return;
    }
    if (!resLocation || !resLocation.coordinates || resLocation.coordinates.length < 2) {
      toast({ title: "Invalid destination", description: "This resource does not have valid coordinates.", variant: "destructive" });
      return;
    }

    // GeoJSON is [lng, lat]
    setSelectedRouteDestination({
      lng: resLocation.coordinates[0],
      lat: resLocation.coordinates[1]
    });

    setViewMode("map");
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Heart className="h-12 w-12 text-primary animate-pulse" />
          <p className="text-muted-foreground animate-pulse">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY}>
      <div className="min-h-screen bg-muted/20 flex">
        {/* Sidebar Navigation (Desktop) */}
        <aside className="w-64 bg-background border-r border-border hidden md:flex flex-col p-6 fixed h-full z-10 transition-all duration-300">
          <div className="flex items-center gap-2 mb-10 text-primary">
            <Heart className="h-6 w-6 fill-current" />
            <span className="text-xl font-bold tracking-tight text-foreground">LifeLink</span>
          </div>

          <nav className="space-y-2 flex-1">
            <Button variant="secondary" className="w-full justify-start gap-3 bg-secondary/10 text-secondary-foreground hover:bg-secondary/20 shadow-sm">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-muted" onClick={() => navigate("/resources")}>
              <Plus className="h-4 w-4" /> Add Resource
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-muted">
              <MessageCircle className="h-4 w-4" /> Messages
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-muted" onClick={() => navigate("/verify")}>
              <ShieldCheck className="h-4 w-4" /> Verification
            </Button>
          </nav>

          <div className="pt-6 border-t border-border">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {profile?.fullName?.charAt(0) || "U"}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate text-foreground">{profile?.fullName}</p>
                <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full gap-2 border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20" onClick={handleLogout}>
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between mb-6 pb-4 border-b bg-background/50 backdrop-blur-md sticky top-0 z-20 px-4 -mx-4">
            <div className="flex items-center gap-2 text-primary">
              <Heart className="h-6 w-6 fill-current" />
              <span className="text-lg font-bold text-foreground">LifeLink</span>
            </div>
            <Button size="sm" variant="outline" onClick={handleLogout}>Logout</Button>
          </div>

          <header className="mb-8 animate-fade-in-up">
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Manage your resources and community connections.</p>
            {location && (
              <div className="flex items-center gap-2 mt-2 text-xs text-green-600">
                <Navigation className="h-3 w-3" />
                Using current location for nearby resources
              </div>
            )}
          </header>

          {/* Verification Alert */}
          {profile?.verificationStatus !== "verified" && (
            <div className="mb-8 p-4 rounded-xl bg-orange-50/50 border border-orange-100 flex items-start gap-4 animate-fade-in-up">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <AlertOctagon className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-900">Account Not Verified</h3>
                <p className="text-sm text-orange-800/80 mt-1 mb-3">
                  {profile?.verificationStatus === "pending"
                    ? "Your documents are currently under review by our team."
                    : "Please verify your identity to unlock all features and build trust."}
                </p>
                {profile?.verificationStatus !== "pending" && (
                  <Button size="sm" onClick={() => navigate("/verify")} className="bg-orange-600 hover:bg-orange-700 text-white border-none shadow-sm">
                    Verify Now
                  </Button>
                )}
              </div>
            </div>
          )}

          <Tabs defaultValue="nearby" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <TabsList className="bg-background border border-border p-1 rounded-xl shadow-sm inline-flex">
                <TabsTrigger value="nearby" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Nearby Resources</TabsTrigger>
                <TabsTrigger value="my" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">My Resources</TabsTrigger>
                {userRole === "donor" && <TabsTrigger value="requests" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Requests</TabsTrigger>}
                <TabsTrigger value="chats" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Messages</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="nearby" className="space-y-6 animate-fade-in-up">
              {/* View Toggle */}
              <div className="flex justify-end mb-4">
                <div className="bg-background border border-border rounded-lg p-1 inline-flex shadow-sm">
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={`gap-2 h-8 ${viewMode === 'list' ? 'bg-primary/10 text-primary' : ''}`}
                  >
                    <List className="h-4 w-4" /> List
                  </Button>
                  <Button
                    variant={viewMode === "map" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("map")}
                    className={`gap-2 h-8 ${viewMode === 'map' ? 'bg-primary/10 text-primary' : ''}`}
                  >
                    <MapIcon className="h-4 w-4" /> Map
                  </Button>
                </div>
              </div>

              {viewMode === "list" ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nearbyResources.map((res) => (
                    <Card key={res._id} className="border-border shadow-soft hover:shadow-medium transition-all duration-300 group">
                      <CardHeader className="pb-3 border-b border-border/40 bg-muted/5">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${res.resourceType === 'blood' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                              {res.resourceType === "blood" ? <Heart className="h-4 w-4" /> : <Leaf className="h-4 w-4" />}
                            </div>
                            <span className="font-semibold capitalize text-foreground">{res.resourceType}</span>
                          </div>
                          {res.bloodType && <Badge variant="secondary" className="bg-background border-border">{res.bloodType}</Badge>}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground mb-4 flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary/60" /> {res.address}
                        </p>
                        <div className="flex items-center justify-between mt-4">
                          <Badge variant="outline" className="text-xs font-normal text-muted-foreground">{res.quantity}</Badge>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleGetDirections(res.location)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Navigation className="h-3 w-3 mr-1" /> Route
                            </Button>
                            {userRole === "requester" && (
                              <Button size="sm" onClick={() => handleRequestResource(res._id)} className="opacity-0 group-hover:opacity-100 transition-opacity">Request</Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {nearbyResources.length === 0 && (
                    <div className="col-span-full py-16 text-center text-muted-foreground bg-white border border-dashed border-border rounded-xl">
                      <div className="bg-muted/30 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="h-8 w-8 opacity-40 text-foreground" />
                      </div>
                      <p className="text-lg font-medium text-foreground">No resources found nearby</p>
                      {!location && <p className="text-sm mt-1 text-destructive">Location access needed to find nearby resources.</p>}
                      {location && <p className="text-sm mt-1">Try expanding your search area.</p>}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-[600px] rounded-xl overflow-hidden border border-border shadow-sm">
                  {location ? (
                    <Map
                      defaultZoom={12}
                      center={location}
                      mapId="dashboard_nearby_map"
                      disableDefaultUI={true}
                      zoomControl={true}
                    >
                      {/* User Location Marker */}
                      <AdvancedMarker position={location} zIndex={999}>
                        <div className="bg-blue-500 text-white p-2 rounded-full shadow-lg border-2 border-white">
                          <User className="h-4 w-4" />
                        </div>
                      </AdvancedMarker>

                      {/* Resource Markers */}
                      {nearbyResources.map((res) => {
                        if (!res.location || !res.location.coordinates || res.location.coordinates.length < 2) return null;
                        const pos = { lng: res.location.coordinates[0], lat: res.location.coordinates[1] };
                        const isBlood = res.resourceType === 'blood';
                        return (
                          <AdvancedMarker
                            key={res._id}
                            position={pos}
                            onClick={() => {
                              handleGetDirections(res.location);
                              toast({ title: `Selected ${res.resourceType}`, description: res.address });
                            }}
                          >
                            <div className={`${isBlood ? 'bg-primary' : 'bg-secondary'} text-white p-2 rounded-full shadow-lg border-2 border-white hover:scale-110 transition-transform cursor-pointer`}>
                              {isBlood ? <Heart className="h-4 w-4" /> : <Leaf className="h-4 w-4" />}
                            </div>
                          </AdvancedMarker>
                        );
                      })}

                      {/* Directions Renderer Component */}
                      {selectedRouteDestination && (
                        <DirectionsRendererComponent
                          origin={location}
                          destination={selectedRouteDestination}
                        />
                      )}
                    </Map>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-muted/20">
                      <Navigation className="h-8 w-8 text-muted-foreground mb-2 animate-pulse" />
                      <p className="text-sm text-muted-foreground">Waiting for location access...</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="my" className="space-y-6 animate-fade-in-up">
              {userRole === "donor" && (
                <div className="flex justify-end">
                  <Button onClick={() => navigate("/resources")} className="shadow-lg hover:shadow-xl transition-shadow bg-primary text-white rounded-full px-6">
                    <Plus className="h-4 w-4 mr-2" /> Add Resource
                  </Button>
                </div>
              )}
              <div className="space-y-4">
                {myResources.map((res) => (
                  <Card key={res._id} className="flex flex-col md:flex-row items-center justify-between p-4 gap-4 hover:border-primary/20 transition-colors">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${res.resourceType === 'blood' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                        {res.resourceType === 'blood' ? <Heart className="h-6 w-6" /> : <Leaf className="h-6 w-6" />}
                      </div>
                      <div>
                        <h4 className="font-semibold capitalize text-foreground">{res.resourceType} {res.bloodType && <span className="text-muted-foreground font-normal">({res.bloodType})</span>}</h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" /> {res.address}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto justify-end bg-muted/20 p-2 rounded-lg md:bg-transparent md:p-0">
                      <select
                        className="text-sm border-none bg-transparent focus:ring-0 text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
                        value={res.status}
                        onChange={(e) => handleStatusChange(res._id, e.target.value)}
                      >
                        <option value="available">● Available</option>
                        <option value="unavailable">○ Unavailable</option>
                      </select>
                      <div className="h-4 w-px bg-border mx-2 hidden md:block"></div>
                      <Button size="icon" variant="ghost" onClick={() => navigate(`/resources/${res._id}`)} className="h-8 w-8 hover:text-primary">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteResource(res._id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
                {myResources.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground bg-white border border-dashed border-border rounded-xl">
                    <div className="bg-muted/30 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="h-8 w-8 opacity-40 text-foreground" />
                    </div>
                    <p className="text-lg font-medium text-foreground">No resources added yet</p>
                    <p className="text-sm mt-1 mb-4">Start sharing to help your community.</p>
                    <Button variant="outline" onClick={() => navigate("/resources")}>Add Your First Resource</Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Requests Tab */}
            <TabsContent value="requests" className="animate-fade-in-up">
              <div className="grid gap-4">
                {requests.map((req) => (
                  <Card key={req._id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="bg-primary/5 w-2 bg-gradient-to-b from-primary to-primary/20"></div>
                      <div className="flex-1 p-4 pl-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-foreground">Request from {req.requestor?.fullName || "Anonymous"}</h4>
                            <p className="text-sm text-muted-foreground">For: <span className="font-medium text-foreground">{req.resource?.resourceType}</span></p>
                          </div>
                          <Badge variant="outline" className="text-xs">New</Badge>
                        </div>
                        <div className="flex gap-3 mt-4">
                          <Button size="sm" onClick={() => handleRequestResponse(req._id, "accepted")} className="bg-primary text-white hover:bg-primary/90">Accept Request</Button>
                          <Button size="sm" variant="outline" onClick={() => handleRequestResponse(req._id, "declined")}>Decline</Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                {requests.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg">
                    No pending requests.
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="chats" className="animate-fade-in-up">
              <div className="grid gap-3">
                {chats.map((chat) => (
                  <Card key={chat._id} className="hover:bg-muted/40 cursor-pointer transition-colors border-none shadow-sm hover:shadow-md" onClick={() => navigate(`/chat/${chat._id}`)}>
                    <CardContent className="p-4 flex flex-row items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-foreground font-bold text-lg">
                        {chat.participants?.find((p: any) => p._id !== profile?._id)?.fullName?.charAt(0) || "U"}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-semibold text-foreground">{chat.participants?.find((p: any) => p._id !== profile?._id)?.fullName || "Chat"}</h4>
                          <span className="text-xs text-muted-foreground">Just now</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{chat.messages?.[chat.messages.length - 1]?.text || "No messages yet"}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {chats.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg">
                    No active chats.
                  </div>
                )}
              </div>
            </TabsContent>

          </Tabs>
        </main>
      </div>
    </APIProvider>
  );
};

export default Dashboard;
