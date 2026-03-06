import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import DailyProtocol from "@/pages/Daily";
import DecisionEngine from "@/pages/DecisionEngine";
import LeverageDiff from "@/pages/LeverageDiff";
import ContentLab from "@/pages/ContentLab";
import System from "@/pages/System";
import Landing from "@/pages/Landing";

function Router() {
  const { user, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground font-mono">INITIALIZING...</div>
      </div>
    );
  }

  // Show landing page if not authenticated
  if (!user) {
    return <Landing />;
  }

  // Authenticated user routes
  return (
    <Switch>
      <Route path="/" component={Dashboard}/>
      <Route path="/daily" component={DailyProtocol}/>
      <Route path="/decisions" component={DecisionEngine}/>
      <Route path="/leverage" component={LeverageDiff}/>
      <Route path="/content" component={ContentLab}/>
      <Route path="/settings" component={System}/>
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
