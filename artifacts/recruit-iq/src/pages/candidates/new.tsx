import { useState } from "react";
import { Link, useLocation } from "wouter";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateCandidate, useCheckCandidateDuplicate, ExtractedCandidateInfo } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ROLE_CATEGORIES } from "@/lib/constants";
import { Upload, FileText, Check, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function NewCandidate() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [isExtracting, setIsExtracting] = useState(false);
  
  // Step 1 data
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [notesText, setNotesText] = useState("");
  const [notesImage, setNotesImage] = useState<File | null>(null);
  
  // Step 2 data (form)
  const [formData, setFormData] = useState<Partial<ExtractedCandidateInfo>>({});
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [existingCandidateId, setExistingCandidateId] = useState<number | null>(null);

  const checkDuplicateMutation = useCheckCandidateDuplicate();
  const createCandidateMutation = useCreateCandidate();

  const handleExtract = async () => {
    if (!resumeFile && !notesText && !notesImage) {
      toast({ title: "Provide source material", description: "Please upload a resume or provide notes.", variant: "destructive" });
      return;
    }

    setIsExtracting(true);
    try {
      const data = new FormData();
      if (resumeFile) data.append('resume', resumeFile);
      if (notesText) data.append('notes', notesText);
      if (notesImage) data.append('notesFile', notesImage);
      
      const res = await fetch(import.meta.env.BASE_URL + 'api/candidates/extract', { 
        method: 'POST', 
        body: data,
        // no content-type header, fetch handles boundary automatically for FormData
      });
      
      if (!res.ok) throw new Error("Extraction failed");
      const extracted: ExtractedCandidateInfo = await res.json();
      
      setFormData(extracted);
      setStep(2);
      
      // Check duplicate
      if (extracted.email || extracted.phone) {
        checkDuplicateMutation.mutate({ data: { email: extracted.email || undefined, phone: extracted.phone || undefined } }, {
          onSuccess: (res) => {
            setIsDuplicate(res.isDuplicate);
            if (res.existingCandidate) setExistingCandidateId(res.existingCandidate.id);
          }
        });
      }
      
    } catch (err: any) {
      toast({ title: "Extraction Error", description: err.message, variant: "destructive" });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = () => {
    if (!formData.name) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }

    // Determine source
    let source = 'resume';
    if (notesText || notesImage) source = resumeFile ? 'mixed' : 'chat';

    createCandidateMutation.mutate({
      data: {
        name: formData.name!,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        skills: formData.skills || undefined,
        source: source,
        preferences: {
          desiredRole: formData.desiredRole || undefined,
          desiredRoleCategory: formData.desiredRoleCategory || undefined,
          salaryExpectation: formData.salaryExpectation || undefined,
          noticePeriod: formData.noticePeriod || undefined,
          wfhPreference: formData.wfhPreference || undefined,
          shiftPreference: formData.shiftPreference || undefined,
          careerInterests: formData.careerInterests || undefined,
          relocationWillingness: formData.relocationWillingness ?? undefined,
        }
      }
    }, {
      onSuccess: (candidate) => {
        toast({ title: "Candidate created" });
        queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
        setLocation(`/candidates/${candidate.id}`);
      },
      onError: (err) => {
        toast({ title: "Error saving", description: err?.error || "Unknown error", variant: "destructive" });
      }
    });
  };

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Candidate</h1>
          <p className="text-muted-foreground text-sm mt-1">Upload materials and let AI extract the details.</p>
        </div>

        <div className="flex gap-4 border-b pb-4 mb-6">
          <div className={`flex items-center gap-2 text-sm font-medium ${step === 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>1</div>
            Source Material
          </div>
          <div className="w-12 border-t mt-3" />
          <div className={`flex items-center gap-2 text-sm font-medium ${step === 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 2 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>2</div>
            Review & Edit
          </div>
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Provide candidate data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4 border rounded-lg p-6 bg-muted/10">
                  <div className="flex items-center gap-3 font-semibold mb-4">
                    <FileText className="w-5 h-5 text-blue-500" /> Resume File
                  </div>
                  <Label>Upload PDF/Word</Label>
                  <Input 
                    type="file" 
                    accept=".pdf,.doc,.docx" 
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                    className="bg-white"
                  />
                  {resumeFile && <div className="text-xs text-green-600 font-medium flex items-center gap-1"><Check className="w-3 h-3"/> Selected: {resumeFile.name}</div>}
                </div>

                <div className="space-y-4 border rounded-lg p-6 bg-muted/10">
                  <div className="flex items-center gap-3 font-semibold mb-4">
                    <Upload className="w-5 h-5 text-purple-500" /> Chat / Voice Notes
                  </div>
                  <Label>Raw text or notes</Label>
                  <Textarea 
                    placeholder="Paste chat history, interview notes..." 
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    className="h-24 bg-white"
                  />
                  <Label>Or screenshot</Label>
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setNotesImage(e.target.files?.[0] || null)}
                    className="bg-white"
                  />
                  {notesImage && <div className="text-xs text-green-600 font-medium flex items-center gap-1"><Check className="w-3 h-3"/> Selected image</div>}
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/20 border-t justify-end p-4">
              <Button onClick={handleExtract} disabled={isExtracting || (!resumeFile && !notesText && !notesImage)}>
                {isExtracting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</> : "Extract Data"}
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {isDuplicate && (
              <div className="bg-destructive/10 border-destructive/30 border text-destructive p-4 rounded-md flex items-start gap-3 shadow-sm">
                <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">Potential Duplicate Found</h4>
                  <p className="text-xs mt-1">A candidate with this email or phone already exists.</p>
                  {existingCandidateId && (
                    <Link href={`/candidates/${existingCandidateId}`} className="text-xs underline font-medium mt-2 inline-block">
                      View Existing Candidate
                    </Link>
                  )}
                </div>
              </div>
            )}

            <Card>
              <CardHeader className="border-b bg-muted/20 pb-4">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Basic Info</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                <div className="space-y-2">
                  <Label>Full Name <span className="text-destructive">*</span></Label>
                  <Input value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Skills (extracted)</Label>
                  <Textarea value={formData.skills || ''} onChange={e => setFormData({...formData, skills: e.target.value})} className="h-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b bg-muted/20 pb-4">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Preferences & Interests</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                <div className="space-y-2">
                  <Label>Role Category</Label>
                  <Select value={formData.desiredRoleCategory || undefined} onValueChange={v => setFormData({...formData, desiredRoleCategory: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Specific Role Title</Label>
                  <Input value={formData.desiredRole || ''} onChange={e => setFormData({...formData, desiredRole: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Salary Expectation</Label>
                  <Input value={formData.salaryExpectation || ''} onChange={e => setFormData({...formData, salaryExpectation: e.target.value})} placeholder="e.g. 120k USD" />
                </div>
                <div className="space-y-2">
                  <Label>Notice Period</Label>
                  <Input value={formData.noticePeriod || ''} onChange={e => setFormData({...formData, noticePeriod: e.target.value})} placeholder="e.g. 2 weeks" />
                </div>
                <div className="space-y-2">
                  <Label>WFH Preference</Label>
                  <Select value={formData.wfhPreference || undefined} onValueChange={v => setFormData({...formData, wfhPreference: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select WFH..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                      <SelectItem value="no_preference">No preference</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Shift Preference</Label>
                  <Input value={formData.shiftPreference || ''} onChange={e => setFormData({...formData, shiftPreference: e.target.value})} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Career Interests</Label>
                  <Input value={formData.careerInterests || ''} onChange={e => setFormData({...formData, careerInterests: e.target.value})} />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/20 border-t justify-end p-4 gap-3">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={handleSave} disabled={createCandidateMutation.isPending}>
                  {createCandidateMutation.isPending ? "Saving..." : "Save Candidate"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
