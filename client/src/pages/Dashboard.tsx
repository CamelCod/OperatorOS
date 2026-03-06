import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useStore } from "@/lib/store";
import { useUserData } from "@/hooks/use-user-data";
import { ArrowRight, Brain, TrendingUp, Zap, CheckCircle2, Sparkles, X, Copy, Loader2, ChevronDown, ChevronUp, Share2, Twitter, Linkedin, FileText } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Onboarding } from "@/components/Onboarding";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { DailyEntry, DecisionEntry } from "@shared/schema";

type GeneratedContent = {
  twitterThread: string[];
  linkedinPost: string;
  articleOutline: string;
};

type ActivityItem = {
  type: 'entry' | 'decision';
  date: string;
  title: string;
  desc: string;
  entry?: DailyEntry;
  decision?: DecisionEntry;
};

export default function Dashboard() {
  useUserData();
  const { toast } = useToast();
  const [selectedEntry, setSelectedEntry] = useState<DailyEntry | null>(null);
  const [generatedContent, setGeneratedContent] = useState<Record<number, GeneratedContent>>({});
  const [generatingContent, setGeneratingContent] = useState<number | null>(null);
  const [expandedIdea, setExpandedIdea] = useState<number | null>(null);
  
  const store = useStore();
  const stats = store?.stats ?? { streak: 0, decisionsTracked: 0, contentPieces: 0 };
  const entries = store?.entries ?? [];
  const decisions = store?.decisions ?? [];

  const recentActivity: ActivityItem[] = [
    ...entries.map(e => ({
      type: 'entry' as const,
      date: e.date,
      title: 'Daily Protocol',
      desc: e.outputs?.personalPattern || 'Analysis complete',
      entry: e
    })),
    ...decisions.map(d => ({
      type: 'decision' as const,
      date: d.date,
      title: 'Decision Logged',
      desc: d.title,
      decision: d
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "COPIED", description: `${label} copied to clipboard.` });
  };

  const shareWithWatermark = async (content: string, type: string) => {
    try {
      const { shareText } = await api.getShareText(content, type);
      await navigator.clipboard.writeText(shareText);
      toast({ title: "COPIED_WITH_PROMO", description: "Content copied with promotional link." });
    } catch (error) {
      toast({ title: "ERROR", description: "Failed to copy with watermark.", variant: "destructive" });
    }
  };

  const handleGenerateContent = async (idea: string, index: number) => {
    if (!selectedEntry) return;
    
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
          friction: selectedEntry.friction,
          decisions: selectedEntry.decisions,
          assumptions: selectedEntry.assumptions
        },
        selectedEntry.id
      );
      setGeneratedContent(prev => ({ ...prev, [index]: content }));
      toast({ title: "CONTENT_GENERATED", description: "Your content is ready and saved." });
    } catch (error) {
      console.error('Failed to generate content:', error);
      toast({ title: "ERROR", description: "Failed to generate content.", variant: "destructive" });
    } finally {
      setGeneratingContent(null);
    }
  };

  const handleCloseModal = () => {
    setSelectedEntry(null);
    setGeneratedContent({});
    setExpandedIdea(null);
  };

  return (
    <DashboardLayout>
      <Onboarding />
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">COMMAND_CENTER</h1>
          <p className="text-muted-foreground font-mono text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
          </p>
        </div>
        
        <Link href="/leverage">
          <Button size="lg" className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xl shadow-primary/20 group font-mono text-lg py-8 px-12">
            <Sparkles className="mr-3 w-6 h-6 group-hover:animate-pulse" />
            <div className="flex flex-col items-start">
              <span>SHOW_MY_LEVERAGE</span>
              <span className="text-[10px] font-normal opacity-80 tracking-normal normal-case">See how your decisions and behavior have changed</span>
            </div>
          </Button>
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard 
          label="OPERATOR STREAK" 
          value={`${stats.streak} DAYS`} 
          icon={Zap} 
          trend="Keep momentum"
        />
        <StatCard 
          label="DECISIONS LOGGED" 
          value={stats.decisionsTracked} 
          icon={Brain} 
          trend="Awaiting review"
        />
        <StatCard 
          label="CONTENT VELOCITY" 
          value={stats.contentPieces} 
          icon={TrendingUp} 
          trend="High leverage"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <SectionHeader title="ACTIVE_PROTOCOLS" />
          
          <Link href="/daily">
            <div className="group border border-border bg-card p-6 cursor-pointer hover:border-primary/50 transition-all hover:bg-secondary/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Brain className="w-24 h-24" />
              </div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">Daily Synthesis</h3>
                  <p className="text-muted-foreground text-sm max-w-md">
                    Execute daily check-in: Identify friction, log decisions, and generate leverage.
                  </p>
                </div>
                <Button variant="outline" className="font-mono group-hover:bg-primary group-hover:text-primary-foreground">
                  INITIATE <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2 mt-6">
                <Badge variant="outline">EST. 5 MIN</Badge>
              </div>
            </div>
          </Link>

          <div className="grid grid-cols-2 gap-4">
             <Link href="/decisions">
               <ActionCard title="Decision Engine" icon={Brain} desc="Pre-mortem analysis" />
             </Link>
             <Link href="/content">
               <ActionCard title="Content Lab" icon={TrendingUp} desc="Draft & Refine" />
             </Link>
          </div>
        </div>

        <div className="space-y-8">
          <SectionHeader title="SYSTEM_FEED" />
          <div className="border border-border bg-card/50 p-0 min-h-[300px]">
            <div className="p-4 border-b border-border/50 text-xs font-mono text-muted-foreground uppercase flex justify-between">
              <span>Recent Output</span>
              <span>LIVE</span>
            </div>
            <div className="divide-y divide-border/50">
              {recentActivity.length > 0 ? (
                recentActivity.map((item, i) => (
                  <FeedItem 
                    key={i}
                    date={item.date} 
                    title={item.title} 
                    desc={item.desc}
                    onClick={() => {
                      if (item.type === 'entry' && item.entry) {
                        setSelectedEntry(item.entry);
                      }
                    }}
                    clickable={item.type === 'entry'}
                  />
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  <div className="w-8 h-8 bg-secondary rounded-full mx-auto mb-3 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 opacity-50" />
                  </div>
                  System idle. Initiate protocol to generate data.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedEntry} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <VisuallyHidden>
            <DialogTitle>Entry Details</DialogTitle>
          </VisuallyHidden>
          {selectedEntry && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold font-mono">DAILY_PROTOCOL</h2>
                  <p className="text-sm text-muted-foreground font-mono">{selectedEntry.date}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleCloseModal}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <EntrySection 
                  label="FRICTION" 
                  content={selectedEntry.friction} 
                  onCopy={() => copyToClipboard(selectedEntry.friction, "Friction")}
                />
                <EntrySection 
                  label="DECISIONS" 
                  content={selectedEntry.decisions} 
                  onCopy={() => copyToClipboard(selectedEntry.decisions, "Decisions")}
                />
                <EntrySection 
                  label="ASSUMPTIONS" 
                  content={selectedEntry.assumptions} 
                  onCopy={() => copyToClipboard(selectedEntry.assumptions, "Assumptions")}
                />
              </div>

              {selectedEntry.outputs && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="font-mono text-sm text-muted-foreground uppercase tracking-wider">AI Synthesis</h3>
                  <EntrySection 
                    label="PERSONAL PATTERN" 
                    content={selectedEntry.outputs.personalPattern} 
                    onCopy={() => copyToClipboard(selectedEntry.outputs?.personalPattern || '', "Personal Pattern")}
                    highlight
                  />
                  <EntrySection 
                    label="BUSINESS LEVERAGE" 
                    content={selectedEntry.outputs.businessLeverage} 
                    onCopy={() => copyToClipboard(selectedEntry.outputs?.businessLeverage || '', "Business Leverage")}
                    highlight
                  />
                  {selectedEntry.outputs.contentIdeas && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Content Ideas</div>
                        <span className="text-[10px] text-muted-foreground">CLICK_TO_GENERATE</span>
                      </div>
                      <div className="border border-border rounded overflow-hidden divide-y divide-border/50">
                        {selectedEntry.outputs.contentIdeas.map((idea: string, i: number) => (
                          <div key={i} className="flex flex-col">
                            <div 
                              className="flex items-center justify-between p-3 hover:bg-secondary/30 transition-colors cursor-pointer group"
                              onClick={() => handleGenerateContent(idea, i)}
                            >
                              <span className="text-sm flex items-center gap-2">
                                <Sparkles className="w-3 h-3 text-primary" />
                                {idea}
                              </span>
                              <div className="flex items-center gap-2">
                                {generatingContent === i ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                ) : generatedContent[i] ? (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6"
                                    onClick={(e) => { e.stopPropagation(); setExpandedIdea(expandedIdea === i ? null : i); }}
                                  >
                                    {expandedIdea === i ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-6 text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    GENERATE <Sparkles className="w-3 h-3 ml-1" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            
                            {expandedIdea === i && generatedContent[i] && (
                              <div className="bg-secondary/20 border-t border-border p-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                <ContentSection 
                                  icon={Twitter}
                                  title="TWITTER/X THREAD"
                                  onCopy={() => copyToClipboard(generatedContent[i].twitterThread.join('\n\n'), "Twitter Thread")}
                                  onShare={() => shareWithWatermark(generatedContent[i].twitterThread.join('\n\n'), "twitter")}
                                >
                                  <div className="space-y-2">
                                    {generatedContent[i].twitterThread.map((tweet, tweetIndex) => (
                                      <div key={tweetIndex} className="bg-background/50 p-2 rounded border border-border/50 text-xs">
                                        <span className="text-muted-foreground font-mono mr-1">{tweetIndex + 1}/</span>
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
                                  <div className="bg-background/50 p-3 rounded border border-border/50 text-xs whitespace-pre-wrap">
                                    {generatedContent[i].linkedinPost}
                                  </div>
                                </ContentSection>
                                
                                <ContentSection 
                                  icon={FileText}
                                  title="ARTICLE OUTLINE"
                                  onCopy={() => copyToClipboard(generatedContent[i].articleOutline, "Article Outline")}
                                  onShare={() => shareWithWatermark(generatedContent[i].articleOutline, "article")}
                                >
                                  <div className="bg-background/50 p-3 rounded border border-border/50 text-xs whitespace-pre-wrap">
                                    {generatedContent[i].articleOutline}
                                  </div>
                                </ContentSection>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function StatCard({ label, value, icon: Icon, trend }: any) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="text-3xl font-bold font-mono mb-1">{value}</div>
        <div className="text-xs text-primary/80 font-mono">{trend}</div>
      </CardContent>
    </Card>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1 h-4 bg-primary" />
      <h2 className="font-mono text-sm font-bold tracking-widest text-muted-foreground">{title}</h2>
    </div>
  );
}

function ActionCard({ title, icon: Icon, desc }: any) {
  return (
    <div className="border border-border bg-card p-6 hover:bg-secondary/50 cursor-pointer transition-colors flex flex-col gap-4 h-full justify-center group">
      <div className="flex justify-between items-start">
        <div className="p-2 bg-secondary rounded-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
      </div>
      <div>
        <div className="font-bold mb-1">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}

function Badge({ children, variant = "default" }: any) {
  return (
    <span className={cn(
      "px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-sm",
      variant === "default" ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground border border-border"
    )}>
      {children}
    </span>
  );
}

function FeedItem({ date, title, desc, onClick, clickable }: { date: string; title: string; desc: string; onClick?: () => void; clickable?: boolean }) {
  return (
    <div 
      className={cn(
        "p-4 hover:bg-secondary/30 transition-colors animate-in fade-in",
        clickable ? "cursor-pointer" : "cursor-default"
      )}
      onClick={onClick}
      data-testid={`feed-item-${date}`}
    >
      <div className="flex justify-between mb-1">
        <span className="font-bold text-sm">{title}</span>
        <span className="text-[10px] font-mono text-muted-foreground">{date}</span>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{desc}</p>
      {clickable && (
        <span className="text-[10px] text-primary font-mono mt-2 inline-block">CLICK_TO_VIEW</span>
      )}
    </div>
  );
}

function EntrySection({ label, content, onCopy, highlight }: { label: string; content: string; onCopy: () => void; highlight?: boolean }) {
  return (
    <div className="space-y-2 group">
      <div className="flex justify-between items-center">
        <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onCopy}
        >
          <Copy className="w-3 h-3 mr-1" /> COPY
        </Button>
      </div>
      <p className={cn(
        "text-sm leading-relaxed",
        highlight && "border-l-2 border-primary/30 pl-3"
      )}>{content}</p>
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
