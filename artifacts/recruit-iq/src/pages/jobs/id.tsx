import { useParams, Link } from "wouter";
import { AppLayout } from "@/components/layout";
import { useGetJobOpening, useGetJobMatches, useUpdateCandidateJobStatus, useUpsertCandidateJobStatus } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, Calendar, ChevronLeft, GitMerge } from "lucide-react";

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const jobId = parseInt(id || "0", 10);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: job, isLoading: jobLoading } = useGetJobOpening(jobId, { query: { enabled: !!jobId } });
  const { data: matches, isLoading: matchesLoading } = useGetJobMatches(jobId, { query: { enabled: !!jobId } });
  
  const updateStatusMutation = useUpdateCandidateJobStatus();
  const upsertStatusMutation = useUpsertCandidateJobStatus();

  const handleStatusChange = (candidateId: number, currentStatusId: number | undefined, newStatus: string) => {
    // Cast to expected strict type. In reality these types match CandidateJobStatusUpdateStatus.
    const statusVal = newStatus as any; 
    const updatedBy = user?.name || "System";

    if (currentStatusId) {
      updateStatusMutation.mutate({ id: currentStatusId, data: { status: statusVal, updatedBy } }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/job-openings", jobId, "matches"] }); // Custom match endpoint isn't fully mapped in query keys standard way, we invalidate specific if we knew it or just invalidate matches
          queryClient.invalidateQueries({ queryKey: [`/api/job-openings/${jobId}/matches`] }); 
          // The actual key from orval is likely `getGetJobMatchesQueryKey(jobId)`
          toast({ title: "Status updated" });
        }
      });
    } else {
      upsertStatusMutation.mutate({ data: { candidateId, jobId, status: statusVal, updatedBy } }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [`/api/job-openings/${jobId}/matches`] }); 
          toast({ title: "Status recorded" });
        }
      });
    }
  };

  if (jobLoading) return <AppLayout><div className="p-8"><Skeleton className="h-40 w-full" /></div></AppLayout>;
  if (!job) return <AppLayout><div className="p-8">Job not found</div></AppLayout>;

  return (
    <AppLayout>
      <div className="p-8 max-w-6xl mx-auto space-y-6 flex flex-col h-full">
        <div>
          <Link href="/jobs" className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center mb-4">
            <ChevronLeft className="w-3 h-3 mr-1" /> Back to Jobs
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs font-medium">{job.roleCategory}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Opened {new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {job.requirements && (
          <Card>
            <CardHeader className="py-4 border-b bg-muted/10">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Requirements</CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-sm whitespace-pre-wrap">
              {job.requirements}
            </CardContent>
          </Card>
        )}

        <div className="flex-1 flex flex-col min-h-0 bg-card border rounded-lg shadow-sm">
          <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <GitMerge className="w-4 h-4 text-primary" /> Matched Pipeline
            </h3>
            <span className="text-xs text-muted-foreground">{matches?.length || 0} candidates in category</span>
          </div>
          
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0">
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Desired Role</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead className="w-[180px]">Pipeline Status</TableHead>
                  <TableHead className="w-[140px]">Last Updated By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matchesLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center h-24">Loading pipeline...</TableCell></TableRow>
                ) : matches?.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No candidates match this role category.</TableCell></TableRow>
                ) : (
                  matches?.map((match) => (
                    <TableRow key={match.candidate.id}>
                      <TableCell>
                        <Link href={`/candidates/${match.candidate.id}`} className="font-medium text-foreground hover:underline">
                          {match.candidate.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {match.candidate.preferences?.desiredRole || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {match.candidate.preferences?.lastVerifiedAt ? new Date(match.candidate.preferences.lastVerifiedAt).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={match.jobStatus?.status || "none"} 
                          onValueChange={(val) => handleStatusChange(match.candidate.id, match.jobStatus?.id, val)}
                        >
                          <SelectTrigger className="h-8 text-xs font-medium">
                            <SelectValue placeholder="Set status..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none" disabled className="text-muted-foreground italic">No status</SelectItem>
                            <SelectItem value="matched">Matched</SelectItem>
                            <SelectItem value="interested">Interested</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="open_for_future">Open for future</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {match.jobStatus?.updatedBy || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
