import { useParams, Link } from "wouter";
import { AppLayout } from "@/components/layout";
import { useGetCandidate, useGetCandidatePreferences, useGetCandidateJobStatuses, getGetCandidateQueryKey, getGetCandidatePreferencesQueryKey, getGetCandidateJobStatusesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, UserCircle2, Mail, Phone, MapPin, Briefcase, FileText } from "lucide-react";

export default function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const candidateId = parseInt(id || "0", 10);

  const { data: candidate, isLoading: candidateLoading } = useGetCandidate(candidateId, { query: { queryKey: getGetCandidateQueryKey(candidateId), enabled: !!candidateId } });
  const { data: preferences, isLoading: prefLoading } = useGetCandidatePreferences(candidateId, { query: { queryKey: getGetCandidatePreferencesQueryKey(candidateId), enabled: !!candidateId } });
  const { data: statuses, isLoading: statusLoading } = useGetCandidateJobStatuses(candidateId, { query: { queryKey: getGetCandidateJobStatusesQueryKey(candidateId), enabled: !!candidateId } });

  if (candidateLoading) return <AppLayout><div className="p-8"><Skeleton className="h-64 w-full" /></div></AppLayout>;
  if (!candidate) return <AppLayout><div className="p-8">Candidate not found</div></AppLayout>;

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <div>
          <Link href="/candidates" className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center mb-4">
            <ChevronLeft className="w-3 h-3 mr-1" /> Back to Candidates
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <UserCircle2 className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{candidate.name}</h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  {candidate.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {candidate.email}</span>}
                  {candidate.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {candidate.phone}</span>}
                  <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs font-medium">{preferences?.desiredRoleCategory || 'Uncategorized'}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground mb-1">Source</div>
              <div className="text-sm font-medium capitalize">{candidate.source || 'Unknown'}</div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline Activity</TabsTrigger>
            <TabsTrigger value="raw">Raw Notes/Resume</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3 border-b bg-muted/10">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Preferences</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y text-sm">
                    <div className="flex justify-between p-4">
                      <span className="text-muted-foreground">Desired Role</span>
                      <span className="font-medium text-right">{preferences?.desiredRole || '-'}</span>
                    </div>
                    <div className="flex justify-between p-4">
                      <span className="text-muted-foreground">Salary Expectation</span>
                      <span className="font-medium text-right">{preferences?.salaryExpectation || '-'}</span>
                    </div>
                    <div className="flex justify-between p-4">
                      <span className="text-muted-foreground">Notice Period</span>
                      <span className="font-medium text-right">{preferences?.noticePeriod || '-'}</span>
                    </div>
                    <div className="flex justify-between p-4">
                      <span className="text-muted-foreground">Work Arrangement</span>
                      <span className="font-medium text-right capitalize">{preferences?.wfhPreference?.replace('_', ' ') || '-'}</span>
                    </div>
                    <div className="flex justify-between p-4">
                      <span className="text-muted-foreground">Relocation</span>
                      <span className="font-medium text-right">{preferences?.relocationWillingness ? 'Open to relocation' : 'Not willing'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3 border-b bg-muted/10">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Skills & Interests</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-6">
                  <div>
                    <div className="text-xs text-muted-foreground font-medium mb-2">Extracted Skills</div>
                    <div className="text-sm whitespace-pre-wrap">{candidate.skills || 'No skills extracted.'}</div>
                  </div>
                  {preferences?.careerInterests && (
                    <div>
                      <div className="text-xs text-muted-foreground font-medium mb-2">Career Interests</div>
                      <div className="text-sm whitespace-pre-wrap">{preferences.careerInterests}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="pipeline" className="mt-6">
            <Card>
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Job Opening</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated By</TableHead>
                    <TableHead className="text-right">Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statusLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center h-24">Loading...</TableCell></TableRow>
                  ) : statuses?.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No pipeline activity.</TableCell></TableRow>
                  ) : (
                    statuses?.map(status => (
                      <TableRow key={status.id}>
                        <TableCell>
                          <Link href={`/jobs/${status.jobId}`} className="font-medium hover:underline flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-muted-foreground" />
                            {status.job?.title || `Job #${status.jobId}`}
                          </Link>
                        </TableCell>
                        <TableCell><StatusBadge status={status.status} /></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{status.updatedBy || '-'}</TableCell>
                        <TableCell className="text-sm text-right text-muted-foreground">{new Date(status.updatedAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="raw" className="mt-6">
            <Card>
              <CardHeader className="border-b bg-muted/10">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Raw Source Text
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-muted/30 p-4 rounded-md text-sm font-mono whitespace-pre-wrap text-muted-foreground min-h-[300px]">
                  {candidate.resumeText || "No raw text available."}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </AppLayout>
  );
}
