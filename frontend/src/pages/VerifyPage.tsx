import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, ArrowLeft, ShieldCheck, FileCheck } from "lucide-react";
import { API_URL } from "@/config";

const VerifyPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      const validTypes = ["application/pdf", "image/jpeg", "image/png"];
      if (!validTypes.includes(uploadedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Only PDF, JPG, or PNG files are allowed.",
          variant: "destructive",
        });
        return;
      }
      setFile(uploadedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload a verification document before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("document", file);

      const res = await fetch(`${API_URL}/api/verify/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Uploaded successfully",
          description: "Your document is under review.",
        });
        localStorage.setItem("verificationStatus", "pending");
        setTimeout(() => navigate("/dashboard"), 1000);
      } else {
        toast({
          title: "Upload failed",
          description: data.message || "Something went wrong.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4">
      {/* Back Button */}
      <div className="w-full max-w-md mb-6">
        <Button variant="ghost" className="pl-0 hover:pl-2 transition-all" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </div>

      <Card className="w-full max-w-md shadow-lg border-none overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary" />

        <CardHeader className="flex flex-col items-center text-center pb-8 pt-10">
          <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <ShieldCheck className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Account Verification</CardTitle>
          <CardDescription className="max-w-xs mx-auto mt-2">
            Upload a valid ID or organization proof to verify your identity and build trust.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 hover:bg-muted/30 transition-colors text-center cursor-pointer relative group">
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-muted rounded-full group-hover:scale-110 transition-transform duration-300">
                  {file ? <FileCheck className="h-6 w-6 text-green-600" /> : <Upload className="h-6 w-6 text-muted-foreground" />}
                </div>
                <div className="space-y-1">
                  {file ? (
                    <p className="font-medium text-green-700 truncate max-w-[200px]">{file.name}</p>
                  ) : (
                    <p className="font-medium text-foreground">Click to upload document</p>
                  )}
                  <p className="text-xs text-muted-foreground">PDF, JPG, or PNG (Max 5MB)</p>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !file}
              className="w-full h-12 text-lg shadow-md bg-primary hover:bg-primary/90"
            >
              {loading ? "Uploading..." : "Submit Document"}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-2">
              Your documents are securely stored and only visible to admins.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyPage;
