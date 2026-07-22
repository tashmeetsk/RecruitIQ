import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Briefcase, GitMerge, LogOut } from "lucide-react";
import { useLogout } from "@workspace/api-client-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const logout = useLogout();

  const nav = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/candidates", label: "Candidates", icon: Users },
    { href: "/jobs", label: "Jobs", icon: Briefcase },
    { href: "/match", label: "Match", icon: GitMerge },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans">
      <div className="w-64 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
        <div className="p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-sidebar-primary flex items-center justify-center font-bold text-white shadow-sm">
              RQ
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight text-white leading-tight">RecruitIQ</h1>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-sidebar-foreground/60 leading-tight">Ops Terminal</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all duration-200", isActive ? "bg-sidebar-primary text-white font-medium shadow-sm" : "hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-white")}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/30">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">{user?.name || 'Recruiter'}</span>
              <span className="text-xs text-sidebar-foreground/70">{user?.email}</span>
            </div>
            <button 
              onClick={() => logout.mutate(undefined, { onSuccess: () => setLocation('/login') })}
              className="text-sidebar-foreground/60 hover:text-white transition-colors p-1 rounded hover:bg-sidebar-accent"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
