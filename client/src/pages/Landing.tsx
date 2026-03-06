import { Button } from "@/components/ui/button";
import { Terminal, Zap, TrendingUp, Brain, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" />
            <span className="font-bold font-mono">OPERATOR_OS</span>
          </div>
          <Button 
            asChild
            size="sm"
            className="font-mono"
          >
            <a href="/api/login" data-testid="button-login">
              INITIALIZE <ArrowRight className="ml-2 w-4 h-4" />
            </a>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container pt-32 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Hero Content */}
          <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono uppercase tracking-wider text-primary">
                Behavioral Operating System
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                Track Friction.{" "}
                <span className="text-primary">Create Leverage.</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                OperatorOS is a behavioral tracking tool that identifies patterns in your daily decisions and synthesizes them into actionable leverage.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                asChild
                size="lg"
                className="font-mono group"
              >
                <a href="/api/login" data-testid="button-get-started">
                  GET_STARTED <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 pt-4 text-sm text-muted-foreground font-mono">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span>Secure Auth</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span>Track Growth</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                <span>AI Insights</span>
              </div>
            </div>
          </div>

          {/* Right: Feature Preview */}
          <div className="relative animate-in fade-in slide-in-from-right duration-700 delay-150">
            <div className="relative rounded-xl border border-border bg-card/50 backdrop-blur p-8 shadow-2xl">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Daily Protocol
                  </div>
                  <div className="h-3 bg-primary/20 rounded w-3/4"></div>
                  <div className="h-3 bg-primary/10 rounded w-full"></div>
                  <div className="h-3 bg-primary/10 rounded w-5/6"></div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Decision Engine
                  </div>
                  <div className="h-3 bg-primary/20 rounded w-2/3"></div>
                  <div className="h-3 bg-primary/10 rounded w-4/5"></div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Leverage Diff
                  </div>
                  <div className="flex gap-2">
                    <div className="h-16 bg-destructive/20 rounded flex-1"></div>
                    <div className="h-16 bg-primary/20 rounded flex-1"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Accent decoration */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl -z-10"></div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container py-24">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Three core modules to transform behavioral patterns into business leverage
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="group p-6 rounded-lg border border-border bg-card/30 hover:bg-card/50 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Terminal className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Daily Protocol</h3>
            <p className="text-muted-foreground">
              Log daily friction, decisions, and assumptions. The system identifies behavioral patterns you can't see.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group p-6 rounded-lg border border-border bg-card/30 hover:bg-card/50 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Decision Engine</h3>
            <p className="text-muted-foreground">
              Track high-stakes decisions with context, options, and mitigation strategies for future reference.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group p-6 rounded-lg border border-border bg-card/30 hover:bg-card/50 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Leverage Diff</h3>
            <p className="text-muted-foreground">
              Compare behavioral deltas over time. See proof of growth through side-by-side pattern analysis.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container py-24">
        <div className="rounded-2xl border border-border bg-card/50 backdrop-blur p-12 text-center space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent -z-10"></div>
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Build Leverage?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Start tracking your behavioral patterns today and turn friction into systematic growth.
          </p>
          <Button 
            asChild
            size="lg"
            className="font-mono"
          >
            <a href="/api/login" data-testid="button-cta-start">
              START_NOW <ArrowRight className="ml-2 w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 mt-24">
        <div className="container text-center text-sm text-muted-foreground font-mono">
          <p>OPERATOR_OS // V1.0.0 // Built on Replit</p>
        </div>
      </footer>
    </div>
  );
}
