import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Heart, ArrowLeft, Leaf, MapPin, Navigation } from "lucide-react";
import { APIProvider, Map, AdvancedMarker, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { API_URL } from "@/config";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

// Helper component for Places Autocomplete
const PlaceAutocomplete = ({
  onPlaceSelect
}: {
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void
}) => {
  const [placeAutocomplete, setPlaceAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary("places");

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ["geometry", "name", "formatted_address"],
    };

    setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
  }, [places]);

  useEffect(() => {
    if (!placeAutocomplete) return;

    placeAutocomplete.addListener("place_changed", () => {
      onPlaceSelect(placeAutocomplete.getPlace());
    });
  }, [onPlaceSelect, placeAutocomplete]);

  return (
    <Input ref={inputRef} placeholder="Search for a location or address" className="w-full" required />
  );
};

const Resources = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form state
  const [postType, setPostType] = useState<"offer" | "need">("offer");
  const [resourceType, setResourceType] = useState<"blood" | "food">("blood");
  const [bloodType, setBloodType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Check user login (JWT)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/auth");
  }, [navigate]);

  useEffect(() => {
    if (isEditMode) {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth");
        return;
      }
      setLoading(true);
      fetch(`${API_URL}/api/resources/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed to load resource");
          return res.json();
        })
        .then((data) => {
          setPostType(data.postType || "offer");
          setResourceType(data.resourceType || "blood");
          setBloodType(data.bloodType || "");
          setQuantity(data.quantity || "");
          setDescription(data.description || "");
          setAddress(data.address || "");
          setExpiresAt(data.expiresAt ? data.expiresAt.split("T")[0] : "");
          if (data.location && data.location.coordinates) {
            setLocation({
              lng: data.location.coordinates[0],
              lat: data.location.coordinates[1],
            });
          }
        })
        .catch((err: any) => {
          toast({ title: "Error", description: err.message, variant: "destructive" });
          navigate("/dashboard");
        })
        .finally(() => setLoading(false));
    } else {
      // New resource: Auto-detect location
      detectLocation();
    }
  }, [id, isEditMode, navigate, toast]);

  const detectLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          toast({ title: "Location Detected", description: "Your current location will be used as the starting point." });
        },
        (error) => {
          console.error("Location error:", error);
          // Default to a central point if detection fails (e.g. New York)
          setLocation({ lat: 40.7128, lng: -74.0060 });
          toast({ title: "Default Location Used", description: "Could not detect location. Using default map center.", variant: "destructive" });
        }
      );
    } else {
      setLocation({ lat: 40.7128, lng: -74.0060 });
    }
  }

  const handlePlaceSelect = (place: google.maps.places.PlaceResult | null) => {
    if (!place || !place.geometry || !place.geometry.location) {
      toast({ title: "Invalid Location", description: "Please select a valid address from the dropdown.", variant: "destructive" });
      return;
    }

    setAddress(place.formatted_address || place.name || "");
    setLocation({
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    });
  };

  const handleMapClick = (e: any) => {
    if (e.detail.latLng) {
      setLocation(e.detail.latLng);
      // Optional: Could do reverse geocoding here to update address text
      setAddress(`${e.detail.latLng.lat.toFixed(4)}, ${e.detail.latLng.lng.toFixed(4)} (Custom Pin)`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return navigate("/auth");

    if (!quantity || !address) {
      toast({ title: "Missing info", description: "Fill required fields.", variant: "destructive" });
      return;
    }

    if (!location) {
      toast({ title: "Location Missing", description: "Please provide a valid location for the resource.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const url = isEditMode
        ? `${API_URL}/api/resources/${id}`
        : `${API_URL}/api/resources`;
      const method = isEditMode ? "PATCH" : "POST";

      const body: any = {
        postType,
        resourceType,
        bloodType: resourceType === "blood" ? bloodType : null,
        quantity,
        description,
        address,
        expiresAt: resourceType === "food" ? expiresAt : null,
      };

      if (location) {
        body.latitude = location.lat;
        body.longitude = location.lng;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");

      toast({ title: "Success!", description: isEditMode ? "Resource updated." : "Resource posted." });
      navigate("/dashboard");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <APIProvider apiKey={API_KEY}>
      <div className="min-h-screen bg-muted/20 flex flex-col items-center py-10 px-4">
        <div className="w-full max-w-2xl">
          <Button variant="ghost" className="mb-6 pl-0 hover:pl-2 transition-all" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>

          <Card className="shadow-lg border-none">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                {resourceType === "blood" ? <Heart className="h-6 w-6 text-primary" /> : <Leaf className="h-6 w-6 text-secondary" />}
                <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">{isEditMode ? "Update" : "New"} Listing</span>
              </div>
              <CardTitle className="text-2xl font-bold">{isEditMode ? "Edit Resource" : "Share a Resource"}</CardTitle>
              <CardDescription>
                Details help connects you with those in need faster.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Resource Type</Label>
                    <Select value={resourceType} onValueChange={(v: "blood" | "food") => setResourceType(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blood">Blood Donation</SelectItem>
                        <SelectItem value="food">Food Donation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Post Type (Offer / Need)</Label>
                    <Select value={postType} onValueChange={(v: "offer" | "need") => setPostType(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="offer">Offering a Resource</SelectItem>
                        <SelectItem value="need">Requesting a Resource</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {resourceType === "blood" && (
                    <div className="space-y-2">
                      <Label>Blood Type</Label>
                      <Select value={bloodType} onValueChange={setBloodType}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          {BLOOD_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Quantity / Amount</Label>
                  <Input
                    placeholder={resourceType === "blood" ? "e.g. 1 Pint, 450ml" : "e.g. 10 Meals, 5kg Rice"}
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Pickup Address</Label>
                  <PlaceAutocomplete onPlaceSelect={handlePlaceSelect} />
                  {address && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Selected: {address}
                    </p>
                  )}
                </div>

                {/* Map Display */}
                {location && (
                  <div className="w-full h-64 rounded-xl overflow-hidden border border-border mt-2 relative">
                    <Map
                      defaultZoom={15}
                      center={location}
                      mapId="resource_creation_map"
                      disableDefaultUI={true}
                      onClick={handleMapClick}
                    >
                      <AdvancedMarker position={location}>
                        <div className="bg-primary text-white p-2 rounded-full shadow-lg border-2 border-white animate-bounce-short">
                          <MapPin className="h-5 w-5" />
                        </div>
                      </AdvancedMarker>
                    </Map>
                    <div className="absolute top-2 left-2 bg-background/90 backdrop-blur text-xs px-2 py-1 rounded-md shadow-sm pointer-events-none">
                      Drag map or click to adjust pin
                    </div>
                  </div>
                )}

                {!location && (
                  <div className="w-full h-64 rounded-xl border border-dashed border-border flex flex-col items-center justify-center bg-muted/20 mt-2">
                    <Navigation className="h-8 w-8 text-muted-foreground mb-2 animate-pulse" />
                    <p className="text-sm text-muted-foreground">Loading Map...</p>
                  </div>
                )}

                {resourceType === "food" && (
                  <div className="space-y-2">
                    <Label>Expires Before</Label>
                    <Input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} min={new Date().toISOString().split("T")[0]} />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Description <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                  <Textarea
                    placeholder="Add any specific instructions or details..."
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="outline" onClick={() => navigate("/dashboard")} className="flex-1">Cancel</Button>
                  <Button type="submit" disabled={loading} className="flex-1">{loading ? "Saving..." : "Save Resource"}</Button>
                </div>

              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </APIProvider>
  );
};

export default Resources;