import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { TrendingUp, Plus, Wand2, Copy, Loader2, Share2, Twitter, Linkedin, FileText, History, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { GeneratedContent } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ContentIdea {
  id: string;
  title: string;
  status: 'draft' | 'polished' | 'published';
  body: string;
}

type TabType = 'editor' | 'library';

export default function ContentLab() {
  const [activeTab, setActiveTab] = useState<TabType>('library');
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [savedContent, setSavedContent] = useState<GeneratedContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSavedContent();
  }, []);

  const loadSavedContent = async () => {
    try {
      const content = await api.getGeneratedContent();
      setSavedContent(content);
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    const newIdea: ContentIdea = {
      id: Date.now().toString(),
      title: "Untitled Draft",
      status: 'draft',
      body: ""
    };
    setIdeas([newIdea, ...ideas]);
    setActiveId(newIdea.id);
    setActiveTab('editor');
  };

  const activeIdea = ideas.find(i => i.id === activeId) || ideas[0];

  const updateIdea = (id: string, updates: Partial<ContentIdea>) => {
    setIdeas(ideas.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "COPIED",
      description: "Content copied to clipboard.",
    });
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

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'twitter_thread': return Twitter;
      case 'linkedin_post': return Linkedin;
      case 'article_outline': return FileText;
      default: return FileText;
    }
  };

  const getContentLabel = (type: string) => {
    switch (type) {
      case 'twitter_thread': return 'Twitter Thread';
      case 'linkedin_post': return 'LinkedIn Post';
      case 'article_outline': return 'Article Outline';
      default: return 'Content';
    }
  };

  const parseContent = (content: GeneratedContent) => {
    if (content.contentType === 'twitter_thread') {
      try {
        return JSON.parse(content.content);
      } catch {
        return [content.content];
      }
    }
    return content.content;
  };

  const groupContentByIdea = () => {
    const grouped: Record<string, GeneratedContent[]> = {};
    savedContent.forEach(item => {
      const key = item.sourceIdea || item.title;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });
    return grouped;
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <TrendingUp className="w-6 h-6" /> CONTENT_LAB
            </h1>
            <p className="text-muted-foreground font-mono text-xs mt-1">
              YOUR GENERATED CONTENT LIBRARY
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={activeTab === 'library' ? 'default' : 'outline'} 
              onClick={() => setActiveTab('library')} 
              className="font-mono"
            >
              <History className="mr-2 w-4 h-4" /> LIBRARY
            </Button>
            <Button 
              variant={activeTab === 'editor' ? 'default' : 'outline'} 
              onClick={handleCreate} 
              className="font-mono"
            >
              <Plus className="mr-2 w-4 h-4" /> NEW_DRAFT
            </Button>
          </div>
        </header>

        {activeTab === 'library' ? (
          <div className="flex-1 overflow-y-auto space-y-6 pb-8">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : savedContent.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Sparkles className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-bold mb-2">No Content Yet</h3>
                <p className="text-muted-foreground text-sm max-w-md">
                  Complete a Daily Protocol to generate content ideas, then click "GENERATE" on any idea to create shareable content.
                </p>
                <Button className="mt-4" onClick={() => window.location.href = '/daily'}>
                  START DAILY PROTOCOL
                </Button>
              </div>
            ) : (
              Object.entries(groupContentByIdea()).map(([idea, items]) => (
                <Card key={idea} className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-mono flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      {idea}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Generated {new Date(items[0].createdAt).toLocaleDateString()}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {items.map(item => {
                      const Icon = getContentIcon(item.contentType);
                      const content = parseContent(item);
                      
                      return (
                        <div key={item.id} className="border border-border rounded-lg p-4 bg-secondary/10">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase">
                              <Icon className="w-4 h-4" />
                              {getContentLabel(item.contentType)}
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 text-xs font-mono"
                                onClick={() => copyToClipboard(
                                  Array.isArray(content) ? content.join('\n\n') : content
                                )}
                              >
                                <Copy className="w-3 h-3 mr-1" /> COPY
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 text-xs font-mono"
                                onClick={() => shareWithWatermark(
                                  Array.isArray(content) ? content.join('\n\n') : content,
                                  item.contentType
                                )}
                              >
                                <Share2 className="w-3 h-3 mr-1" /> SHARE
                              </Button>
                            </div>
                          </div>
                          
                          {item.contentType === 'twitter_thread' && Array.isArray(content) ? (
                            <div className="space-y-2">
                              {content.map((tweet: string, idx: number) => (
                                <div key={idx} className="bg-background/50 p-3 rounded border border-border/50 text-sm">
                                  <span className="text-muted-foreground text-xs font-mono mr-2">{idx + 1}/</span>
                                  {tweet}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="bg-background/50 p-4 rounded border border-border/50 text-sm whitespace-pre-wrap">
                              {content}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
            <div className="col-span-4 flex flex-col gap-4 overflow-y-auto pr-2">
              {ideas.map(idea => (
                <Card 
                  key={idea.id} 
                  className={cn(
                    "cursor-pointer transition-all hover:border-primary/50",
                    activeIdea?.id === idea.id && 'border-primary ring-1 ring-primary/20 bg-secondary/10'
                  )}
                  onClick={() => setActiveId(idea.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-sm line-clamp-1">{idea.title}</div>
                      <span className={cn(
                        "text-[10px] font-mono px-1.5 py-0.5 rounded border",
                        idea.status === 'polished' 
                          ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                          : 'bg-secondary text-muted-foreground border-transparent'
                      )}>
                        {idea.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 font-mono">
                      {idea.body || "No content yet..."}
                    </p>
                  </CardContent>
                </Card>
              ))}
              {ideas.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  Click NEW_DRAFT to create content
                </div>
              )}
            </div>

            <div className="col-span-8 flex flex-col h-full bg-card border border-border rounded-xl overflow-hidden">
              {activeIdea ? (
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b border-border space-y-4">
                    <Input 
                      value={activeIdea.title}
                      onChange={(e) => updateIdea(activeIdea.id, { title: e.target.value })}
                      className="text-xl font-bold border-none shadow-none px-0 focus-visible:ring-0 bg-transparent"
                      placeholder="Enter title..."
                    />
                    <div className="flex gap-2">
                       <Button 
                         variant="outline" 
                         size="sm" 
                         className="font-mono text-xs" 
                         disabled={isEnhancing}
                         onClick={async () => {
                           if (!activeIdea.title && !activeIdea.body) {
                             toast({ description: "Please enter a title or body to enhance", variant: "destructive" });
                             return;
                           }
                           
                           setIsEnhancing(true);
                           try {
                             const res = await fetch('/api/synthesize/content-enhance', {
                               method: 'POST',
                               headers: { 'Content-Type': 'application/json' },
                               credentials: 'include',
                               body: JSON.stringify({ title: activeIdea.title, body: activeIdea.body })
                             });
                             
                             if (!res.ok) throw new Error('Failed to enhance');
                             
                             const data = await res.json();
                             updateIdea(activeIdea.id, { 
                               title: data.title || activeIdea.title,
                               body: data.body || activeIdea.body 
                             });
                             
                             toast({ description: "AI Enhancement complete" });
                           } catch (error) {
                             console.error(error);
                             toast({ description: "Enhancement failed", variant: "destructive" });
                           } finally {
                             setIsEnhancing(false);
                           }
                         }}
                       >
                         {isEnhancing ? <Loader2 className="mr-2 w-3 h-3 animate-spin" /> : <Wand2 className="mr-2 w-3 h-3" />}
                         ENHANCE
                       </Button>
                       <Button variant="outline" size="sm" className="font-mono text-xs" onClick={() => {
                          updateIdea(activeIdea.id, { status: activeIdea.status === 'draft' ? 'polished' : 'draft' });
                       }}>
                         {activeIdea.status === 'draft' ? 'MARK_POLISHED' : 'MARK_DRAFT'}
                       </Button>
                       <Button 
                         variant="outline" 
                         size="sm" 
                         className="font-mono text-xs ml-auto"
                         onClick={() => shareWithWatermark(activeIdea.body, 'custom')}
                       >
                         <Share2 className="mr-2 w-3 h-3" /> SHARE
                       </Button>
                    </div>
                  </div>
                  <div className="flex-1 p-6">
                    <Textarea 
                      value={activeIdea.body}
                      onChange={(e) => updateIdea(activeIdea.id, { body: e.target.value })}
                      className="w-full h-full resize-none border-none shadow-none focus-visible:ring-0 p-0 text-base leading-relaxed bg-transparent font-mono"
                      placeholder="Start writing..."
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Select a draft to begin editing or create a new one
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
