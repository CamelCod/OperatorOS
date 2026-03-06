import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Terminal, Activity, PenTool, LayoutDashboard, Settings, ChevronRight } from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();

  const links = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/daily", icon: Terminal, label: "Daily Protocol" },
    { href: "/decisions", icon: Activity, label: "Decision Engine" },
    { href: "/content", icon: PenTool, label: "Content Gen" },
    { href: "/settings", icon: Settings, label: "How Leverage Is Created" },
  ];

  return (
    <div className="w-64 border-r border-border h-screen bg-sidebar flex flex-col font-mono text-sm fixed left-0 top-0">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary animate-pulse" />
          <span className="font-bold tracking-tighter text-lg">OPERATOR_OS</span>
        </div>
        <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">
          v1.0.4 • SYSTEM ONLINE
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const isActive = location === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-sm cursor-pointer transition-all group",
                  isActive 
                    ? "bg-secondary text-primary border-l-2 border-primary" 
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground border-l-2 border-transparent"
                )}
              >
                <link.icon className="w-4 h-4" />
                <span className="flex-1">{link.label}</span>
                {isActive && <ChevronRight className="w-3 h-3" />}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="bg-secondary/30 p-3 rounded-sm border border-border/50">
          <div className="text-[10px] uppercase text-muted-foreground mb-1">Weekly Momentum</div>
          <div className="flex gap-1 h-8 items-end">
             {[40, 60, 30, 80, 50, 90, 20].map((h, i) => (
               <div key={i} className="flex-1 bg-primary/20 hover:bg-primary transition-colors cursor-help" style={{ height: `${h}%` }} />
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground pl-64">
      <Sidebar />
      <main className="p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
        {children}
      </main>
    </div>
  );
}
