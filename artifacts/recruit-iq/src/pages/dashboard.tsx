import { Link } from "wouter";
import { useGetDashboardStats } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Users, Briefcase, ChevronRight, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ROLE_CATEGORIES } from "@/lib/constants";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-96 w-full rounded-xl" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </AppLayout>
    );
  }

  const roleData = ROLE_CATEGORIES.map(cat => {
    const found = stats?.byCandidateRoleCategory?.find(c => c.roleCategory === cat);
    return { name: cat, count: found?.count || 0 };
  }).filter(c => c.count > 0).sort((a, b) => b.count - a.count);

  return (
    <AppLayout>
      <div className="p-8 space-y-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
          <div className="flex items-center gap-3">
            <Link href="/candidates/new" className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 shadow-sm transition-colors">
              Add Candidate
            </Link>
            <Link href="/jobs/new" className="text-sm font-medium bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 border transition-colors">
              New Job
            </Link>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4" /> Total Candidates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalCandidates || 0}</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Active Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalJobs || 0}</div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4" /> Placements (Matched)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#15803d]">
                {stats?.byCandidateStatus?.find(s => s.status === 'matched')?.count || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Candidates by Role */}
          <Card className="shadow-sm col-span-1 lg:col-span-1">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <CardTitle className="text-sm font-semibold">Talent Pool by Role</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y text-sm">
                {roleData.length > 0 ? roleData.map((role) => (
                  <div key={role.name} className="flex justify-between items-center p-4 hover:bg-muted/10 transition-colors">
                    <span className="font-medium">{role.name}</span>
                    <span className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full font-semibold min-w-[2rem] text-center">
                      {role.count}
                    </span>
                  </div>
                )) : (
                  <div className="p-6 text-center text-muted-foreground">No roles recorded yet.</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Candidates */}
          <Card className="shadow-sm col-span-1 lg:col-span-2">
            <CardHeader className="border-b bg-muted/20 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Recent Candidates</CardTitle>
              <Link href="/candidates" className="text-xs font-medium text-primary hover:underline flex items-center">
                View all <ChevronRight className="w-3 h-3 ml-1" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y text-sm">
                {stats?.recentCandidates && stats.recentCandidates.length > 0 ? (
                  stats.recentCandidates.slice(0, 5).map(candidate => (
                    <Link key={candidate.id} href={`/candidates/${candidate.id}`} className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors block">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-foreground">{candidate.name}</span>
                        <span className="text-xs text-muted-foreground">{candidate.preferences?.desiredRoleCategory || 'Uncategorized'} • {candidate.preferences?.desiredRole || 'No specific role'}</span>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-4">
                        <span>{new Date(candidate.createdAt).toLocaleDateString()}</span>
                        <ChevronRight className="w-4 h-4 opacity-50" />
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p>No candidates in the system yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </AppLayout>
  );
}
