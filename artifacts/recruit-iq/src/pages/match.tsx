import { useState } from "react";
import { Link } from "wouter";
import { AppLayout } from "@/components/layout";
import { useListCandidates, useListJobOpenings, useListCandidateJobStatuses } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLE_CATEGORIES } from "@/lib/constants";
import { StatusBadge } from "@/components/ui/status-badge";
import { GitMerge, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Match() {
  const [roleCategory, setRoleCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: candidates, isLoading: candidatesLoading } = useListCandidates({
    roleCategoryFilter: roleCategory !== "all" ? roleCategory : undefined
  });
  
  const { data: allStatuses, isLoading: statusesLoading } = useListCandidateJobStatuses();
  const { data: jobs } = useListJobOpenings();

  // Create a fast lookup map for statuses
  const statusMap = new Map();
  if (allStatuses) {
    allStatuses.forEach(s => {
      if (!statusMap.has(s.candidateId)) statusMap.set(s.candidateId, []);
      statusMap.get(s.candidateId).push(s);
    });
  }

  const jobMap = new Map();
  if (jobs) {
    jobs.forEach(j => jobMap.set(j.id, j));
  }

  // Filter candidates locally if statusFilter is active
  const filteredCandidates = candidates?.filter(c => {
    if (statusFilter === "all") return true;
    const cStatuses = statusMap.get(c.id) || [];
    if (statusFilter === "unmatched") return cStatuses.length === 0;
    return cStatuses.some((s: any) => s.status === statusFilter);
  });

  const clearFilters = () => {
    setRoleCategory("all");
    setStatusFilter("all");
  };

  const isLoading = candidatesLoading || statusesLoading;

  return (
    <AppLayout>
      <div className="p-8 max-w-6xl mx-auto flex flex-col h-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
            <GitMerge className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Cross-Job Match</h1>
            <p className="text-muted-foreground text-sm">Discover candidates across the entire pool.</p>
          </div>
        </div>

        <div className="bg-card border rounded-lg shadow-sm flex flex-col flex-1 overflow-hidden">
          <div className="p-4 border-b flex gap-4 items-center bg-muted/20 flex-wrap">
            <div className="w-[200px]">
              <div className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Role Category</div>
              <Select value={roleCategory} onValueChange={setRoleCategory}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {ROLE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-[200px]">
              <div className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Pipeline Status</div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Status</SelectItem>
                  <SelectItem value="unmatched">No Job Assigned</SelectItem>
                  <SelectItem value="matched">Matched</SelectItem>
                  <SelectItem value="interested">Interested</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="open_for_future">Open for future</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(roleCategory !== "all" || statusFilter !== "all") && (
              <div className="mt-5">
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                  <FilterX className="w-4 h-4 mr-2" /> Clear
                </Button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 z-10">
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Desired Role</TableHead>
                  <TableHead>Active Pipelines</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="h-32 text-center text-muted-foreground">Loading pool...</TableCell></TableRow>
                ) : filteredCandidates?.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="h-32 text-center text-muted-foreground">No candidates match these filters.</TableCell></TableRow>
                ) : (
                  filteredCandidates?.map(candidate => {
                    const cStatuses = statusMap.get(candidate.id) || [];
                    return (
                      <TableRow key={candidate.id}>
                        <TableCell>
                          <Link href={`/candidates/${candidate.id}`} className="font-medium hover:underline block text-foreground">
                            {candidate.name}
                          </Link>
                          <div className="text-xs text-muted-foreground">{candidate.email || candidate.phone}</div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                            {candidate.preferences?.desiredRoleCategory || 'Unknown'}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {candidate.preferences?.desiredRole || '-'}
                        </TableCell>
                        <TableCell>
                          {cStatuses.length === 0 ? (
                            <span className="text-xs text-muted-foreground italic">None</span>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {cStatuses.map((s: any) => {
                                const job = jobMap.get(s.jobId);
                                return (
                                  <div key={s.id} className="flex items-center gap-1.5 border rounded-full pl-2 pr-1 py-0.5 text-xs bg-background shadow-sm">
                                    <span className="font-medium truncate max-w-[120px]" title={job?.title}>{job?.title || `#${s.jobId}`}</span>
                                    <StatusBadge status={s.status} className="border-0 px-1.5 py-0 h-4 text-[10px]" />
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
