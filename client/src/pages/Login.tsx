import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { Terminal, Zap, ArrowRight, Shield } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login, toggleDemoMode } = useStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && !isLoggingIn) {
      setIsLoggingIn(true);
      try {
        await login(username.trim());
      } catch (error) {
        console.error('Login failed:', error);
        setIsLoggingIn(false);
      }
    }
  };

  const handleDemo = () => {
    toggleDemoMode();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Noise/Grid */}
      <div className="absolute inset-0 bg-[url('/grid-noise.png')] opacity-5 pointer-events-none" />
      
      <Card className="w-full max-w-md border-primary/20 bg-card/50 backdrop-blur-sm shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-4 pt-10">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Terminal className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold tracking-tight">OPERATOR_OS</CardTitle>
            <CardDescription className="font-mono text-xs uppercase tracking-widest">
              Identify Pattern // Create Leverage
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 pb-10">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Operator ID</label>
              <Input 
                placeholder="ENTER_NAME..." 
                className="font-mono text-lg py-6 bg-secondary/50 border-primary/20 focus-visible:ring-primary"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full font-mono font-bold py-6 group text-base" disabled={!username.trim() || isLoggingIn}>
              {isLoggingIn ? 'CONNECTING...' : 'INITIALIZE_SESSION'} {!isLoggingIn && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground font-mono">Or Bypass Auth</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full font-mono text-xs border-dashed border-primary/30 hover:bg-primary/5 hover:border-primary/50"
            onClick={handleDemo}
          >
            <Zap className="mr-2 w-3 h-3 text-primary" /> ENTER_DEMO_MODE
          </Button>

          <div className="flex justify-center items-center gap-2 text-[10px] text-muted-foreground font-mono opacity-50 pt-4">
            <Shield className="w-3 h-3" />
            SECURE_LOCAL_STORAGE // V1.0.4
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
