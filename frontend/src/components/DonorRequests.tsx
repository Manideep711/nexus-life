import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Clock, Heart } from "lucide-react";
import { API_URL } from "@/config";

type Request = {
  _id: string;
  status: string;
  resource: { resourceType: string; bloodType?: string; quantity: string };
  requester: { fullName: string; email: string; phone?: string };
  createdAt: string;
};

const DonorRequests = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const { toast } = useToast();

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_URL}/api/requests/donor`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setRequests(data);
    } catch (error) {
      toast({
        title: "Error loading requests",
        description: "Could not fetch donor requests.",
        variant: "destructive",
      });
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`${API_URL}/api/requests/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ status }),
    });
    toast({
      title: `Request ${status}`,
      description: `Request marked as ${status}.`,
    });
    fetchRequests();
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return requests.length === 0 ? (
    <Card className="p-8 text-center">
      <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <p className="text-muted-foreground">No requests yet.</p>
    </Card>
  ) : (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {requests.map((req) => (
        <Card key={req._id}>
          <CardHeader>
            <CardTitle>{req.resource.resourceType}</CardTitle>
            {req.resource.bloodType && (
              <Badge variant="secondary">{req.resource.bloodType}</Badge>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              <strong>Requester:</strong> {req.requester.fullName}
            </p>
            <p className="text-sm">
              <strong>Email:</strong> {req.requester.email}
            </p>
            <p className="text-sm">
              <strong>Quantity:</strong> {req.resource.quantity}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <Clock className="h-4 w-4" />
              {new Date(req.createdAt).toLocaleString()}
            </div>
            {req.status === "pending" ? (
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => updateStatus(req._id, "accepted")}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-2" /> Accept
                </Button>
                <Button
                  onClick={() => updateStatus(req._id, "declined")}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  <X className="h-4 w-4 mr-2" /> Decline
                </Button>
              </div>
            ) : (
              <Badge
                variant={
                  req.status === "accepted" ? "default" : "destructive"
                }
                className="mt-4"
              >
                {req.status.toUpperCase()}
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DonorRequests;
