import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Heart, Leaf, AlertCircle, ArrowLeft } from "lucide-react";
import { API_URL } from "@/config";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const ROLES = [
  { value: "donor", label: "Donor", icon: Heart },
  { value: "requester", label: "Requester", icon: AlertCircle },
];

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("donor");
  const [bloodType, setBloodType] = useState("");

  // Google Auth specific state
  const [promptGoogleRole, setPromptGoogleRole] = useState(false);
  const [googleToken, setGoogleToken] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        if (decoded.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } catch {
        localStorage.removeItem("token");
      }
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("token", data.token);
      toast({ title: "Welcome back!", description: "Successfully logged in." });

      try {
        const decoded: any = jwtDecode(data.token);
        if (decoded.role === "admin") navigate("/admin");
        else navigate("/dashboard");
      } catch {
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !role) {
      toast({ title: "Missing info", description: "Required fields missing.", variant: "destructive" });
      return;
    }
    if (role === "donor" && !bloodType) {
      toast({ title: "Blood type required", description: "Please select blood type.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email: signupEmail,
          password: signupPassword,
          phone,
          role,
          bloodType: role === "donor" ? bloodType : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      toast({ title: "Account created!", description: "Redirecting..." });
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (error: any) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any, submitRole?: boolean) => {
    setLoading(true);
    const tokenToUse = credentialResponse?.credential || googleToken;

    if (!tokenToUse) {
      setLoading(false);
      return;
    }

    if (submitRole && role === "donor" && !bloodType) {
      toast({ title: "Blood type required", description: "Please select blood type.", variant: "destructive" });
      setLoading(false);
      return;
    }

    try {
      const bodyPayload: any = { token: tokenToUse };

      // If we are submitting the extra role selection form, append the fields
      if (submitRole) {
        bodyPayload.role = role;
        bodyPayload.phone = phone;
        if (role === 'donor') bodyPayload.bloodType = bloodType;
      }

      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Google authentication failed");

      // Check if backend needs us to pick a role
      if (data.requiresRoleSelection) {
        setGoogleToken(tokenToUse);
        setPromptGoogleRole(true);
        setLoading(false);
        return; // Wait for user to submit the role form
      }

      localStorage.setItem("token", data.token);
      toast({ title: "Welcome!", description: "Successfully authenticated with Google." });

      try {
        const decoded: any = jwtDecode(data.token);
        if (decoded.role === "admin") navigate("/admin");
        else navigate("/dashboard");
      } catch {
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message,
        variant: "destructive",
      });
      setGoogleToken("");
      setPromptGoogleRole(false);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGoogleSuccess(null, true);
  };

  const handleGoogleError = () => {
    toast({ title: "Google Auth Failed", description: "Failed to authenticate with Google.", variant: "destructive" });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Visual Side */}
      <div className="hidden lg:flex flex-col justify-between bg-zinc-900 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 opacity-20" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <Heart className="h-6 w-6 text-primary filled" />
            <span className="text-xl font-bold">LifeLink</span>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Join the community <br /> saving lives every day.
          </h2>
          <p className="text-zinc-400 text-lg max-w-md">
            Connect with donors and requesters in a unified platform built for rapid response and trust.
          </p>
        </div>
        <div className="relative z-10 text-sm text-zinc-500">
          &copy; {new Date().getFullYear()} Nexus LifeLink
        </div>
      </div>

      {/* Form Side */}
      <div className="flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm space-y-6">
          <Button variant="ghost" className="pl-0 hover:pl-2 transition-all" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>

          {promptGoogleRole ? (
            <div className="space-y-6 animate-fade-in-up">
              <div className="space-y-2 text-center lg:text-left">
                <h1 className="text-2xl font-bold tracking-tight">Complete Profile</h1>
                <p className="text-muted-foreground">
                  Choose your role to finish signing up with Google.
                </p>
              </div>

              <form onSubmit={handleGoogleRoleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Phone (Optional)</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>

                {role === "donor" && (
                  <div className="space-y-2">
                    <Label>Blood Type</Label>
                    <Select value={bloodType} onValueChange={setBloodType}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {BLOOD_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" type="button" className="flex-1" onClick={() => {
                    setPromptGoogleRole(false);
                    setGoogleToken("");
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "Saving..." : "Complete Setup"}
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <div className="space-y-2 text-center lg:text-left">
                <h1 className="text-2xl font-bold tracking-tight">Welcome</h1>
                <p className="text-muted-foreground">
                  Enter your details to access your account.
                </p>
              </div>

              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="name@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password">Password</Label>
                      </div>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    <Button type="submit" className="w-full h-11" disabled={loading}>
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>

                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                      />
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={role} onValueChange={setRole}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {ROLES.map((r) => (
                              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
                    </div>

                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required minLength={6} />
                    </div>

                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>

                    {role === "donor" && (
                      <div className="space-y-2">
                        <Label>Blood Type</Label>
                        <Select value={bloodType} onValueChange={setBloodType}>
                          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                          <SelectContent>
                            {BLOOD_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <Button type="submit" className="w-full h-11 mt-2" disabled={loading}>
                      {loading ? "Creating account..." : "Create Account"}
                    </Button>

                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or sign up with
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        text="signup_with"
                      />
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
