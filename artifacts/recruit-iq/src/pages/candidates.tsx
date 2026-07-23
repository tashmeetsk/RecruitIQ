import { useState } from "react";
import { Link } from "wouter";
import { useListCandidates } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ROLE_CATEGORIES } from "@/lib/constants";
import { Search, Plus, FileText, MessageSquare, Mic, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";

function SourceIcon({ source }: { source?: string | null }) {
  if (!source) return <span className="text-muted-foreground">-</span>;
  switch (source) {
    case 'resume': return <FileText className="w-4 h-4 text-blue-500" aria-label="Resume" />;
    case 'chat': return <MessageSquare className="w-4 h-4 text-green-500" aria-label="Chat" />;
    case 'voice': return <Mic className="w-4 h-4 text-purple-500" aria-label="Voice Note" />;
    case 'mixed': return <Layers className="w-4 h-4 text-orange-500" aria-label="Mixed Sources" />;
    default: return <span className="text-xs">{source}</span>;
  }
}

export default function Candidates() {
  const [search, setSearch] = useState("");
  const [roleCategory, setRoleCategory] = useState<string>("all");
  const debouncedSearch = useDebounce(search, 300);

  const { data: candidates, isLoading } = useListCandidates({
    search: debouncedSearch || undefined,
    roleCategoryFilter: roleCategory !== "all" ? roleCategory : undefined
  });

  return (
    <AppLayout>
      <div className="p-8 max-w-6xl mx-auto flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Candidates</h1>
          <Link href="/candidates/new">
            <Button size="sm" className="font-semibold shadow-sm">
              <Plus className="w-4 h-4 mr-2" /> Add Candidate
            </Button>
          </Link>
        </div>

        <div className="bg-card border rounded-lg shadow-sm flex flex-col flex-1 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b flex gap-4 items-center bg-muted/20">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, skills..."
                className="pl-9 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-[200px]">
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
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 z-10">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Desired Role</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="w-[80px] text-center">Source</TableHead>
                  <TableHead className="text-right">Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">Loading...</TableCell>
                  </TableRow>
                ) : candidates?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No candidates found.</TableCell>
                  </TableRow>
                ) : (
                  candidates?.map((candidate) => (
                    <TableRow key={candidate.id} className="cursor-pointer hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <Link href={`/candidates/${candidate.id}`} className="block">
                          <div className="font-semibold text-foreground">{candidate.name}</div>
                          <div className="text-xs text-muted-foreground">{candidate.email || candidate.phone || '-'}</div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/candidates/${candidate.id}`} className="block h-full w-full">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                            {candidate.preferences?.desiredRoleCategory || 'Unknown'}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        <Link href={`/candidates/${candidate.id}`} className="block h-full w-full">
                          {candidate.preferences?.desiredRole || '-'}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        <Link href={`/candidates/${candidate.id}`} className="block h-full w-full">
                          {candidate.preferences?.wfhPreference || 'Unknown'}
                          {candidate.preferences?.relocationWillingness && ' (Open to reloc)'}
                        </Link>
                      </TableCell>
                      <TableCell className="text-center">
                        <Link href={`/candidates/${candidate.id}`} className="block h-full w-full flex justify-center items-center">
                          <SourceIcon source={candidate.source} />
                        </Link>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        <Link href={`/candidates/${candidate.id}`} className="block h-full w-full">
                          {new Date(candidate.createdAt).toLocaleDateString()}
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
