import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Database, Monitor, Shield, Zap, TrendingUp, Brain, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

import { LogOut } from "lucide-react";

export default function System() {
  const store = useStore();
  // Safe access to store properties
  const isDemoMode = store?.isDemoMode ?? false;
  const toggleDemoMode = store?.toggleDemoMode ?? (() => {});
  const currentUser = store?.currentUser;
  const logout = store?.logout ?? (() => {});
  const { toast } = useToast();

  const handleDemoToggle = () => {
    toggleDemoMode();
    toast({
      title: isDemoMode ? "DEMO MODE DEACTIVATED" : "DEMO MODE ACTIVATED",
      description: isDemoMode 
        ? "System returned to standard operation." 
        : "Mock data injected. Auth bypassed.",
    });
  };

  const handleLogout = () => {
    if (confirm("End current session?")) {
      logout();
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-12 pb-20">
        <header className="mb-12 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">How Leverage Is Created</h1>
            <p className="text-xl text-muted-foreground font-light">
              From lived experience → behavioral delta → external proof
            </p>
          </div>
          {currentUser && !isDemoMode && (
             <Button variant="outline" onClick={handleLogout} className="font-mono text-xs">
               <LogOut className="mr-2 w-3 h-3" /> END_SESSION
             </Button>
          )}
        </header>

        <section className="space-y-6">
          <div className="border-l-4 border-primary pl-6 py-2">
            <h2 className="text-2xl font-bold mb-4">OperatorOS doesn’t help you think harder.</h2>
            <p className="text-lg text-muted-foreground">It shows you how your behavior is changing—and why that matters.</p>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-muted-foreground">01. The Core Insight</h3>
            <div className="prose dark:prose-invert">
              <p className="font-medium">Most tools capture moments. Leverage comes from patterns across time.</p>
              <p className="text-muted-foreground text-sm">
                The Diff Engine compares your daily inputs across days and weeks to detect:
              </p>
              <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1 mt-2">
                <li>Language shifts</li>
                <li>Decision bias changes</li>
                <li>Movement from effort → constraint → leverage</li>
              </ul>
              <p className="text-sm mt-4 italic border-l-2 border-border pl-4">
                This is how real operators improve: not by ideas, but by pattern correction.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-muted-foreground">02. What the Engine Actually Does</h3>
            <div className="space-y-4">
              <Step number="1" title="Capture reality" desc="Daily entries record friction, decisions, and intent—not goals." />
              <Step number="2" title="Detect delta" desc="The system compares you vs. your past self, not you vs. advice." />
              <Step number="3" title="Synthesize leverage" desc="It outputs: What changed, Why it matters, What you now do differently." />
            </div>
          </div>
        </section>

        <section className="bg-secondary/20 p-8 rounded-xl border border-border">
          <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6">03. Why This Is Different</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="text-xs text-muted-foreground uppercase mb-2">Most productivity tools ask:</div>
              <div className="text-xl font-medium">"What do you want to do?"</div>
            </div>
            <div>
              <div className="text-xs text-primary uppercase mb-2">OperatorOS asks:</div>
              <div className="text-xl font-bold text-primary">"What are you actually becoming?"</div>
            </div>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">The Diff Engine makes growth visible, exportable, and compounding.</p>
        </section>

        <section className="space-y-6">
           <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-muted-foreground">04. The Output</h3>
           <div className="grid md:grid-cols-3 gap-4">
             <OutputCard icon={Brain} title="Decision Rule" />
             <OutputCard icon={TrendingUp} title="Business Move" />
             <OutputCard icon={ArrowRight} title="Proof Post" />
           </div>
           <p className="text-center text-sm text-muted-foreground font-mono">
             If it can’t change behavior or status, it doesn’t ship.
           </p>
        </section>

        <div className="text-center py-12 border-t border-border">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Leverage isn’t motivation.</h2>
          <p className="text-muted-foreground">It’s measurable change over time.</p>
        </div>

        {/* Developer / Demo Controls */}
        <div className="mt-20 pt-10 border-t border-border/50">
          <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg border border-border/50">
            <div>
              <div className="font-mono text-xs font-bold uppercase text-muted-foreground mb-1">Developer Mode</div>
              <div className="text-sm">Inject Demo Data for Presentation</div>
            </div>
            <div className="flex items-center gap-2">
               <span className="font-mono text-xs text-muted-foreground">{isDemoMode ? "ACTIVE" : "INACTIVE"}</span>
               <Switch 
                  checked={isDemoMode} 
                  onCheckedChange={handleDemoToggle}
                />
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

function Step({ number, title, desc }: any) {
  return (
    <div className="flex gap-4">
      <div className="flex-none w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-mono text-xs font-bold">
        {number}
      </div>
      <div>
        <div className="font-bold text-sm">{title}</div>
        <div className="text-sm text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}

function OutputCard({ icon: Icon, title }: any) {
  return (
    <div className="p-6 border border-border bg-card rounded-lg flex flex-col items-center justify-center text-center gap-3">
      <Icon className="w-6 h-6 text-primary" />
      <div className="font-bold text-sm">{title}</div>
    </div>
  );
}
