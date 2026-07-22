import { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLE_CATEGORIES } from "@/lib/constants";
import { useCreateJobOpening } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Briefcase } from "lucide-react";

export default function NewJob() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createJobMutation = useCreateJobOpening();

  const [title, setTitle] = useState("");
  const [roleCategory, setRoleCategory] = useState<string>("");
  const [requirements, setRequirements] = useState("");

  const handleSave = () => {
    if (!title || !roleCategory) {
      toast({ title: "Required fields missing", description: "Title and role category are required.", variant: "destructive" });
      return;
    }

    createJobMutation.mutate({
      data: {
        title,
        roleCategory,
        requirements: requirements || undefined
      }
    }, {
      onSuccess: (job) => {
        toast({ title: "Job created" });
        queryClient.invalidateQueries({ queryKey: ["/api/job-openings"] });
        setLocation(`/jobs/${job.id}`);
      },
      onError: (err) => {
        toast({ title: "Error creating job", description: err?.error || "Unknown error", variant: "destructive" });
      }
    });
  };

  return (
    <AppLayout>
      <div className="p-8 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create Job Opening</h1>
            <p className="text-muted-foreground text-sm">Define a new opening to start matching candidates.</p>
          </div>
        </div>

        <Card>
          <CardHeader className="border-b bg-muted/20 pb-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <Label>Job Title <span className="text-destructive">*</span></Label>
              <Input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="e.g. Senior Frontend Engineer" 
              />
            </div>
            <div className="space-y-2">
              <Label>Role Category <span className="text-destructive">*</span></Label>
              <Select value={roleCategory} onValueChange={setRoleCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Requirements / Notes</Label>
              <Textarea 
                value={requirements} 
                onChange={e => setRequirements(e.target.value)} 
                placeholder="Must have 5+ years React experience..."
                className="h-32"
              />
            </div>
          </CardContent>
          <CardFooter className="bg-muted/20 border-t justify-end p-4 gap-3">
            <Button variant="ghost" onClick={() => setLocation("/jobs")}>Cancel</Button>
            <Button onClick={handleSave} disabled={createJobMutation.isPending}>
              {createJobMutation.isPending ? "Saving..." : "Create Job"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}
