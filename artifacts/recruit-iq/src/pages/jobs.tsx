import { Link } from "wouter";
import { AppLayout } from "@/components/layout";
import { useListJobOpenings } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase } from "lucide-react";

export default function Jobs() {
  const { data: jobs, isLoading } = useListJobOpenings();

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl mx-auto flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Job Openings</h1>
          <Link href="/jobs/new">
            <Button size="sm" className="font-semibold shadow-sm">
              <Plus className="w-4 h-4 mr-2" /> New Job
            </Button>
          </Link>
        </div>

        <div className="bg-card border rounded-lg shadow-sm flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 z-10">
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Role Category</TableHead>
                  <TableHead className="text-right">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">Loading...</TableCell>
                  </TableRow>
                ) : jobs?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-32 text-center text-muted-foreground flex flex-col items-center justify-center">
                      <Briefcase className="w-8 h-8 opacity-20 mb-3" />
                      No job openings yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  jobs?.map((job) => (
                    <TableRow key={job.id} className="cursor-pointer hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <Link href={`/jobs/${job.id}`} className="block">
                          <div className="font-semibold text-foreground">{job.title}</div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/jobs/${job.id}`} className="block">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                            {job.roleCategory || 'Unknown'}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        <Link href={`/jobs/${job.id}`} className="block">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </Link>
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
