import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { useState, useEffect } from "react";
import { ArrowLeft, Sparkles, TrendingUp, Zap, Copy, Share2, Target, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function LeverageDiff() {
  const { entries } = useStore();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const runAnalysis = async () => {
      try {
        const res = await fetch('/api/synthesize/leverage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error('Failed to fetch analysis');
        const data = await res.json();
        setAnalysis(data);
        setIsAnalyzing(false);
      } catch (error) {
        console.error(error);
        toast({ description: "Analysis failed. Using demo data.", variant: "destructive" });
        // Fallback to demo data logic if needed or show error
        setIsAnalyzing(false);
      }
    };

    runAnalysis();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "COPIED TO BUFFER",
      description: "Proof post ready for LinkedIn/X.",
    });
  };

  const shareWithWatermark = async (text: string) => {
    try {
      const { shareText } = await api.getShareText(text, 'proof');
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "COPIED WITH PROMO",
        description: "Content copied with OperatorOS watermark. Ready to share!",
      });
    } catch (error) {
      navigator.clipboard.writeText(text);
      toast({
        title: "COPIED",
        description: "Proof post copied to clipboard.",
      });
    }
  };

  if (isAnalyzing) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[60vh] space-y-8">
           <div className="relative w-24 h-24">
             <div className="absolute inset-0 rounded-full border-4 border-secondary/30"></div>
             <div 
               className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"
             ></div>
             <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xl">
               {progress}%
             </div>
           </div>
           
           <div className="text-center space-y-2">
             <h2 className="text-2xl font-bold tracking-tight">RUNNING LEVERAGE DIFF ENGINE</h2>
             <p className="text-muted-foreground font-mono text-sm animate-pulse">
               {progress < 30 && "Scanning last 14 days of protocols..."}
               {progress >= 30 && progress < 60 && "Detecting semantic shifts in friction logs..."}
               {progress >= 60 && progress < 90 && "Calculating velocity delta..."}
               {progress >= 90 && "Synthesizing proof of growth..."}
             </p>
           </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => window.location.href = '/'}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                LEVERAGE_DIFF_ENGINE
                <span className="bg-primary/10 text-primary text-[10px] px-2 py-1 rounded-full font-mono">BETA</span>
              </h1>
              <p className="text-muted-foreground font-mono text-xs mt-1">
                ANALYSIS_PERIOD: LAST 14 DAYS
              </p>
            </div>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline" className="font-mono text-xs">
            RUN_AGAIN
          </Button>
        </header>

        {/* 1. Before/After Shift */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-border bg-card rounded-lg overflow-hidden">
          <div className="p-8 border-b md:border-b-0 md:border-r border-border bg-secondary/10">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
              Baseline (Day 1-7)
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed font-light">
              "{analysis.shift.before}"
            </p>
          </div>
          <div className="p-8 bg-primary/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <TrendingUp className="w-24 h-24" />
            </div>
            <div className="font-mono text-xs text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              Current State (Day 8-14)
            </div>
            <p className="text-lg font-medium leading-relaxed">
              "{analysis.shift.after}"
            </p>
          </div>
        </div>

        {/* 2. The Core Transformation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-border bg-card">
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Transformation Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">What Changed</div>
                <p className="text-sm">{analysis.summary.changed}</p>
              </div>
              <div>
                <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">Why It Matters</div>
                <p className="text-sm">{analysis.summary.importance}</p>
              </div>
              <div className="p-4 bg-secondary/30 border-l-2 border-primary">
                <div className="text-xs font-bold text-primary mb-1 uppercase flex items-center gap-2">
                  <Target className="w-3 h-3" /> New Protocol
                </div>
                <p className="text-sm font-medium">{analysis.summary.newProtocol}</p>
              </div>
            </CardContent>
          </Card>

          {/* 3. Compounding Rule */}
          <Card className="border-primary/50 bg-primary/5 flex flex-col justify-center">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto text-primary">
                <Lock className="w-6 h-6" />
              </div>
              <div className="font-mono text-xs text-primary uppercase tracking-widest">
                Compounding Rule
              </div>
              <p className="text-xl font-bold leading-tight">
                {analysis.compoundingRule}
              </p>
              <p className="text-xs text-muted-foreground">
                Lock this in for next week to 2x leverage.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 4. Social Proof Asset */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
               <div className="w-1 h-4 bg-primary" />
               <h2 className="font-mono text-sm font-bold tracking-widest text-muted-foreground">UNDENIABLE_PROOF_ASSET</h2>
             </div>
             <div className="flex gap-2">
               <Button size="sm" variant="outline" onClick={() => copyToClipboard(analysis.proofPost)} className="font-mono text-xs">
                 <Copy className="mr-2 w-3 h-3" /> COPY
               </Button>
               <Button size="sm" onClick={() => shareWithWatermark(analysis.proofPost)} className="font-mono text-xs">
                 <Share2 className="mr-2 w-3 h-3" /> SHARE_WITH_PROMO
               </Button>
             </div>
          </div>
          
          <div className="bg-card border border-border p-8 rounded-lg max-w-2xl mx-auto shadow-2xl relative">
             <div className="absolute top-4 right-4 text-muted-foreground/20">
               <Share2 className="w-8 h-8" />
             </div>
             <div className="font-mono text-xs text-muted-foreground mb-6">Generated Post Draft</div>
             <div className="whitespace-pre-wrap text-lg font-light leading-relaxed font-sans">
               {analysis.proofPost}
             </div>
             <div className="mt-8 pt-6 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-mono">
               <span>Generated by OperatorOS</span>
               <span>{new Date().toLocaleDateString()}</span>
             </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
