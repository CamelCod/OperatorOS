import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { useUserData } from "@/hooks/use-user-data";
import { api } from "@/lib/api";
import { useState } from "react";
import { Loader2, Copy, Check, ArrowRight, RefreshCw, Sparkles, Brain, Zap, Share2, ChevronDown, ChevronUp, Twitter, Linkedin, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type GeneratedContent = {
  twitterThread: string[];
  linkedinPost: string;
  articleOutline: string;
};

export default function DailyProtocol() {
  useUserData();
  
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    friction: "",
    decisions: "",
    assumptions: ""
  });
  const [synthesis, setSynthesis] = useState<any>(null);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [expandedIdea, setExpandedIdea] = useState<number | null>(null);
  const [generatedContent, setGeneratedContent] = useState<Record<number, GeneratedContent>>({});
  const [generatingContent, setGeneratingContent] = useState<number | null>(null);
  const { addEntry, setStats, stats } = useStore();
  const { toast } = useToast();

  const handleGenerateContent = async (idea: string, index: number) => {
    if (generatedContent[index]) {
      setExpandedIdea(expandedIdea === index ? null : index);
      return;
    }
    
    setGeneratingContent(index);
    setExpandedIdea(index);
    
    try {
      const content = await api.generateAndSaveContent(
        idea, 
        {
          friction: formData.friction,
          decisions: formData.decisions,
          assumptions: formData.assumptions
        },
        currentEntryId || undefined
      );
      setGeneratedContent(prev => ({ ...prev, [index]: content }));
      toast({
        title: "CONTENT_GENERATED",
        description: "Your content is ready and saved to your library.",
      });
    } catch (error) {
      console.error('Failed to generate content:', error);
      toast({
        title: "ERROR",
        description: "Failed to generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGeneratingContent(null);
    }
  };

  const shareWithWatermark = async (content: string, type: string) => {
    try {
      const { shareText } = await api.getShareText(content, type);
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "COPIED WITH PROMO",
        description: "Content copied with OperatorOS watermark. Ready to share!",
      });
    } catch (error) {
      navigator.clipboard.writeText(content);
      toast({
        title: "COPIED",
        description: "Content copied to clipboard.",
      });
    }
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else runSynthesis();
  };

  const runSynthesis = async () => {
    setIsProcessing(true);
    
    try {
      // Call AI synthesis API
      const result = await api.synthesizeDaily({
        friction: formData.friction,
        decisions: formData.decisions,
        assumptions: formData.assumptions
      });
      
      setSynthesis(result);
      
      // Save to API
      const newEntry = await api.createEntry({
        date: new Date().toISOString().split('T')[0],
        ...formData,
        outputs: result
      });
      
      // Save the entry ID for linking generated content
      setCurrentEntryId(newEntry.id);
      
      // Update local store
      addEntry(newEntry);
      
      // Update stats
      const updatedStats = await api.getStats();
      setStats({
        streak: updatedStats.streak,
        decisionsTracked: updatedStats.decisionsTracked,
        contentPieces: updatedStats.contentPieces
      });
      
      setIsProcessing(false);
      setStep(4);
      
      toast({
        title: "ENTRY_LOGGED",
        description: "Protocol complete. Pattern extracted.",
      });
    } catch (error) {
      console.error('Failed to save entry:', error);
      setIsProcessing(false);
      toast({
        title: "ERROR",
        description: "Failed to save entry. Please try again.",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "COPIED TO BUFFER",
      description: `${label} ready for extraction.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">DAILY_PROTOCOL</h1>
            <p className="text-muted-foreground font-mono text-xs mt-1">
              SESSION_ID: {new Date().toISOString().split('T')[0].replace(/-/g, '')}
            </p>
          </div>
          {step < 4 && (
            <div className="flex gap-2">
              {[1, 2, 3].map(s => (
                <div 
                  key={s} 
                  className={cn(
                    "w-3 h-3 border border-primary/20 transition-colors",
                    step >= s ? "bg-primary" : "bg-transparent",
                    step === s && "animate-pulse"
                  )} 
                />
              ))}
            </div>
          )}
        </header>

        {step < 4 ? (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-card border border-border p-8 relative overflow-hidden min-h-[400px] flex flex-col">
               <div className="absolute top-0 right-0 p-4 text-[100px] leading-none opacity-5 font-bold font-mono select-none pointer-events-none">
                 0{step}
               </div>

               <div className="flex-1">
                 {step === 1 && (
                   <InputSection 
                     label="01. IDENTIFY FRICTION"
                     question="Where did you get stuck yesterday? What felt heavy?"
                     placeholder="e.g., Spent 2 hours debating the color scheme instead of shipping..."
                     value={formData.friction}
                     onChange={(v: string) => setFormData({...formData, friction: v})}
                   />
                 )}
                 {step === 2 && (
                   <InputSection 
                     label="02. KEY DECISIONS"
                     question="What irreversible decisions did you make? What are you postponing?"
                     placeholder="e.g., Decided to switch to Postgres. Postponing the marketing launch..."
                     value={formData.decisions}
                     onChange={(v: string) => setFormData({...formData, decisions: v})}
                   />
                 )}
                 {step === 3 && (
                   <InputSection 
                     label="03. CHECK ASSUMPTIONS"
                     question="What are you assuming to be true that might be false?"
                     placeholder="e.g., Assuming users want a dark mode first..."
                     value={formData.assumptions}
                     onChange={(v: string) => setFormData({...formData, assumptions: v})}
                   />
                 )}
               </div>

              <div className="mt-8 flex justify-between items-center border-t border-border pt-6">
                <div className="text-xs text-muted-foreground font-mono">
                  {formData.friction.length + formData.decisions.length + formData.assumptions.length} CHARS LOGGED
                </div>
                <div className="flex gap-4">
                  {step > 1 && (
                    <Button variant="ghost" onClick={() => setStep(step - 1)}>BACK</Button>
                  )}
                  <Button 
                    onClick={handleNext} 
                    className="font-mono font-bold min-w-[140px]"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        SYNTHESIZING...
                      </>
                    ) : (
                      <>
                        {step === 3 ? "RUN SYNTHESIS" : "NEXT_STEP"} <ArrowRight className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-700 pb-20">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-primary">
                 <Sparkles className="w-5 h-5" />
                 <span className="font-mono font-bold tracking-widest">SYNTHESIS COMPLETE</span>
               </div>
               <div className="flex gap-2">
                 <Button variant="outline" size="sm" onClick={() => window.print()}>
                   <Share2 className="w-4 h-4 mr-2" /> EXPORT
                 </Button>
                 <Button onClick={() => window.location.href = '/'} className="font-mono">
                   COMPLETE <Check className="ml-2 w-4 h-4" />
                 </Button>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <ResultCard 
                 icon={Brain}
                 title="PERSONAL PATTERN" 
                 content={synthesis.personalPattern} 
                 delay={0}
                 onCopy={() => copyToClipboard(synthesis.personalPattern, "Personal Pattern")}
               />
               <ResultCard 
                 icon={Zap}
                 title="BUSINESS LEVERAGE" 
                 content={synthesis.businessLeverage} 
                 delay={100}
                 onCopy={() => copyToClipboard(synthesis.businessLeverage, "Business Leverage")}
               />
             </div>
             
             <div className="border border-border bg-card p-0 animate-in slide-in-from-bottom-4 fill-mode-backwards overflow-hidden" style={{ animationDelay: '200ms' }}>
               <div className="p-4 border-b border-border bg-secondary/10 flex justify-between items-center">
                 <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                   <Sparkles className="w-3 h-3" /> Content Ideas
                 </div>
                 <div className="text-[10px] text-muted-foreground">CLICK_TO_GENERATE</div>
               </div>
               <div className="divide-y divide-border/50">
                 {synthesis.contentIdeas.map((idea: string, i: number) => (
                   <div key={i} className="flex flex-col">
                     <div 
                       className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors group cursor-pointer"
                       onClick={() => handleGenerateContent(idea, i)}
                     >
                       <span className="font-medium text-sm leading-relaxed flex-1">{idea}</span>
                       <div className="flex items-center gap-2">
                         {generatingContent === i ? (
                           <Loader2 className="w-4 h-4 animate-spin text-primary" />
                         ) : generatedContent[i] ? (
                           <Button 
                             variant="ghost" 
                             size="sm" 
                             className="font-mono text-xs"
                             onClick={(e) => { e.stopPropagation(); setExpandedIdea(expandedIdea === i ? null : i); }}
                           >
                             {expandedIdea === i ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                           </Button>
                         ) : (
                           <Button 
                             variant="outline" 
                             size="sm" 
                             className="font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                             GENERATE <Sparkles className="w-3 h-3 ml-1" />
                           </Button>
                         )}
                       </div>
                     </div>
                     
                     {expandedIdea === i && generatedContent[i] && (
                       <div className="bg-secondary/20 border-t border-border p-4 space-y-6 animate-in slide-in-from-top-2 duration-300">
                         <ContentSection 
                           icon={Twitter}
                           title="TWITTER/X THREAD"
                           onCopy={() => copyToClipboard(generatedContent[i].twitterThread.join('\n\n'), "Twitter Thread")}
                           onShare={() => shareWithWatermark(generatedContent[i].twitterThread.join('\n\n'), "twitter")}
                         >
                           <div className="space-y-3">
                             {generatedContent[i].twitterThread.map((tweet, tweetIndex) => (
                               <div key={tweetIndex} className="bg-background/50 p-3 rounded border border-border/50 text-sm">
                                 <span className="text-muted-foreground text-xs font-mono mr-2">{tweetIndex + 1}/</span>
                                 {tweet}
                               </div>
                             ))}
                           </div>
                         </ContentSection>
                         
                         <ContentSection 
                           icon={Linkedin}
                           title="LINKEDIN POST"
                           onCopy={() => copyToClipboard(generatedContent[i].linkedinPost, "LinkedIn Post")}
                           onShare={() => shareWithWatermark(generatedContent[i].linkedinPost, "linkedin")}
                         >
                           <div className="bg-background/50 p-4 rounded border border-border/50 text-sm whitespace-pre-wrap">
                             {generatedContent[i].linkedinPost}
                           </div>
                         </ContentSection>
                         
                         <ContentSection 
                           icon={FileText}
                           title="ARTICLE OUTLINE"
                           onCopy={() => copyToClipboard(generatedContent[i].articleOutline, "Article Outline")}
                           onShare={() => shareWithWatermark(generatedContent[i].articleOutline, "article")}
                         >
                           <div className="bg-background/50 p-4 rounded border border-border/50 text-sm whitespace-pre-wrap">
                             {generatedContent[i].articleOutline}
                           </div>
                         </ContentSection>
                       </div>
                     )}
                   </div>
                 ))}
               </div>
             </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function InputSection({ label, question, placeholder, value, onChange }: any) {
  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300 h-full flex flex-col">
      <h2 className="font-mono text-primary font-bold tracking-widest mb-4 opacity-70">{label}</h2>
      <p className="text-2xl font-medium mb-6 leading-relaxed tracking-tight">{question}</p>
      <Textarea 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-background/50 border-border focus:border-primary text-lg font-light resize-none p-6"
        autoFocus
      />
    </div>
  );
}

function ResultCard({ title, content, delay, icon: Icon, onCopy }: any) {
  return (
    <div 
      className="border border-border bg-card p-6 animate-in slide-in-from-bottom-4 fill-mode-backwards hover:border-primary/30 transition-colors relative group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          {Icon && <Icon className="w-3 h-3" />}
          {title}
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={onCopy}>
          <Copy className="w-3 h-3" />
        </Button>
      </div>
      <p className="text-lg leading-relaxed border-l-2 border-primary/20 pl-4">{content}</p>
    </div>
  );
}

function ContentSection({ icon: Icon, title, children, onCopy, onShare }: { icon: any; title: string; children: React.ReactNode; onCopy: () => void; onShare?: () => void }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
          <Icon className="w-3 h-3" />
          {title}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="h-6 text-xs font-mono" onClick={onCopy}>
            <Copy className="w-3 h-3 mr-1" /> COPY
          </Button>
          {onShare && (
            <Button variant="outline" size="sm" className="h-6 text-xs font-mono" onClick={onShare}>
              <Share2 className="w-3 h-3 mr-1" /> SHARE
            </Button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
