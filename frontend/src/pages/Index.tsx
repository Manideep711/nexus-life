import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Heart,
  Leaf,
  MapPin,
  Clock,
  Users,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import heroImage from "@/assets/hero-community.jpg";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Heart,
      title: "Blood Donation",
      description: "Connect urgent requests with donors in seconds.",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Leaf,
      title: "Food Sharing",
      description: "Reduce waste by sharing surplus food locally.",
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      icon: MapPin,
      title: "Geo-Location",
      description: "Find the closest help with smart mapping.",
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      icon: Clock,
      title: "Real-Time",
      description: "Live updates for time-sensitive emergencies.",
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      icon: Users,
      title: "Community",
      description: "A unified network of donors, NGOs, and hospitals.",
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
    {
      icon: ShieldCheck,
      title: "Verified",
      description: "Trust and safety with verified profiles.",
      color: "text-teal-500",
      bg: "bg-teal-50",
    },
  ];

  const stats = [
    { value: "1000+", label: "Active Donors" },
    { value: "500+", label: "Lives Saved" },
    { value: "10K+", label: "Meals Shared" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Navbar Placeholder - Minimal */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary fill-current" />
            <span className="text-xl font-bold tracking-tight">LifeLink</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button onClick={() => navigate("/auth")} className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 shadow-glow">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="max-w-2xl space-y-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Live Network Active
              </div>

              <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight">
                Save a life <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-rose-400">
                  in seconds.
                </span>
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                The modern platform for rapid blood donation and food rescue.
                Connecting communities when it matters most.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" onClick={() => navigate("/auth")} className="h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 shadow-glow hover:shadow-lg transition-all">
                  Join Network <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="h-14 px-8 text-lg rounded-full border-2 hover:bg-secondary/5">
                  Learn More
                </Button>
              </div>

              <div className="pt-8 flex items-center gap-8 text-muted-foreground">
                {stats.map((stat, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                    <span className="text-sm">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative lg:h-[600px] w-full flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-secondary/20 rounded-full blur-[100px] opacity-60" />
              <div className="relative z-10 w-full h-full rounded-[2rem] overflow-hidden shadow-2xl border border-white/20 bg-muted/10 backdrop-blur-sm">
                <img
                  src={heroImage}
                  alt="Community Impact"
                  className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How LifeLink Works</h2>
            <p className="text-muted-foreground text-lg">
              Smart technology meeting human kindness. A complete ecosystem for community resilience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <Card key={idx} className="group border-none shadow-soft hover:shadow-medium transition-all duration-300 bg-background/50 hover:bg-background backdrop-blur-sm">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${feature.bg} ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Modern CTA */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="relative rounded-[2.5rem] bg-foreground text-background overflow-hidden px-8 py-20 md:p-24 text-center">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <Heart className="w-64 h-64" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                Ready to make a difference?
              </h2>
              <p className="text-xl text-white/80">
                Join thousands of verified donors and volunteers. Your contribution, no matter how small, saves lives on LifeLink.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" onClick={() => navigate("/auth")} className="h-14 px-8 text-lg rounded-full bg-white text-black hover:bg-white/90">
                  Get Started Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">LifeLink</span>
          </div>
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Nexus LifeLink. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
