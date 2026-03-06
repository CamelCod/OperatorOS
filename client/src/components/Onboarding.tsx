import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { Terminal, Brain, ArrowRight, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function Onboarding() {
  const { hasOnboarded, setHasOnboarded } = useStore();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Only show onboarding when hasOnboarded is explicitly false (not null/loading)
    if (hasOnboarded === false) {
      const timer = setTimeout(() => setOpen(true), 500);
      return () => clearTimeout(timer);
    } else if (hasOnboarded === true) {
      // User has already onboarded, ensure dialog stays closed
      setOpen(false);
    }
    // When hasOnboarded is null (loading), do nothing
  }, [hasOnboarded]);

  const handleComplete = async () => {
    setOpen(false);
    setHasOnboarded(true);
    
    try {
      await api.updateStats({ hasOnboarded: true });
      toast({
        title: "SYSTEM_INITIALIZED",
        description: "Your OperatorOS environment is ready.",
      });
    } catch (error) {
      console.error('Failed to save onboarding state:', error);
    }
  };

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const steps = [
    {
      title: "SYSTEM_ONLINE",
      icon: Terminal,
      desc: "OperatorOS is not a journal. It is an execution system designed to convert daily friction into business leverage.",
      content: (
        <div className="space-y-2 text-sm text-muted-foreground mt-4 font-mono border-l-2 border-primary/20 pl-4">
          <p>&gt; Initialize Daily Protocol</p>
          <p>&gt; Detect Patterns</p>
          <p>&gt; Synthesize Leverage</p>
        </div>
      )
    },
    {
      title: "DECISION_ENGINE",
      icon: Brain,
      desc: "Stop overthinking. Use the pre-mortem analysis tool to stress-test high-stakes decisions before you make them.",
      content: (
        <div className="grid grid-cols-3 gap-2 mt-4 opacity-80">
          <div className="bg-secondary/50 p-2 text-[10px] font-mono border border-border">CONTEXT</div>
          <div className="bg-secondary/50 p-2 text-[10px] font-mono border border-border">OPTIONS</div>
          <div className="bg-destructive/10 p-2 text-[10px] font-mono border border-destructive/20 text-destructive">RISK</div>
        </div>
      )
    },
    {
      title: "READY_TO_OPERATE",
      icon: CheckCircle2,
      desc: "Your data is local. Your insights are yours. Begin your first protocol to calibrate the system.",
      content: (
        <div className="mt-6 flex justify-center">
           <div className="text-4xl font-bold tracking-tighter animate-pulse">GO</div>
        </div>
      )
    }
  ];

  const CurrentStep = steps[step];
  const Icon = CurrentStep.icon;

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) {
         handleComplete();
      }
    }}>
      <DialogContent className="sm:max-w-md bg-card border-primary/20 p-0 overflow-hidden gap-0">
        <VisuallyHidden>
          <DialogTitle>OperatorOS Onboarding</DialogTitle>
        </VisuallyHidden>
        <div className="p-6 pb-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-sm">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold tracking-tight font-mono">{CurrentStep.title}</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {CurrentStep.desc}
          </p>
          {CurrentStep.content}
        </div>

        <div className="p-6 flex items-center justify-between mt-4 bg-secondary/20 border-t border-border">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "w-2 h-2 rounded-full transition-colors", 
                  i === step ? "bg-primary" : "bg-primary/20"
                )} 
              />
            ))}
          </div>
          <Button onClick={handleNext} className="font-mono group">
            {step === 2 ? "ENTER_SYSTEM" : "NEXT"} 
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
