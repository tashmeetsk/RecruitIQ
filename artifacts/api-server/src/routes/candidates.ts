import { Router, type IRouter } from "express";
import multer from "multer";
import mammoth from "mammoth";
import { eq, or, ilike, and } from "drizzle-orm";
import {
  db,
  candidatesTable,
  candidatePreferencesTable,
} from "@workspace/db";
import {
  CreateCandidateBody,
  UpdateCandidateBody,
  GetCandidateParams,
  UpdateCandidateParams,
  DeleteCandidateParams,
  GetCandidatePreferencesParams,
  UpsertCandidatePreferencesParams,
  UpsertCandidatePreferencesBody,
  CheckCandidateDuplicateBody,
  ListCandidatesQueryParams,
  GetCandidateJobStatusesParams,
} from "@workspace/api-zod";
import { extractCandidateInfo } from "../lib/gemini";

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// ── Helpers ──────────────────────────────────────────────────────────────

async function getCandidateWithPreferences(id: number) {
  const [candidate] = await db
    .select()
    .from(candidatesTable)
    .where(eq(candidatesTable.id, id));

  if (!candidate) return null;

  const [pref] = await db
    .select()
    .from(candidatePreferencesTable)
    .where(eq(candidatePreferencesTable.candidateId, id));

  return { ...candidate, preferences: pref ?? null };
}

// ── Routes (specific routes BEFORE :id) ──────────────────────────────────

// POST /candidates/check-duplicate
router.post("/candidates/check-duplicate", async (req, res): Promise<void> => {
  const parsed = CheckCandidateDuplicateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, phone } = parsed.data;

  if (!email && !phone) {
    res.json({ isDuplicate: false });
    return;
  }

  const conditions = [];
  if (email) conditions.push(ilike(candidatesTable.email, email));
  if (phone) conditions.push(ilike(candidatesTable.phone, phone));

  const [existing] = await db
    .select()
    .from(candidatesTable)
    .where(or(...conditions))
    .limit(1);

  if (existing) {
    res.json({ isDuplicate: true, existingCandidate: existing });
  } else {
    res.json({ isDuplicate: false });
  }
});

// POST /candidates/extract — multipart file upload → Gemini extraction
router.post(
  "/candidates/extract",
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "notesFile", maxCount: 1 },
    { name: "voice", maxCount: 1 },
  ]),
  async (req, res): Promise<void> => {
    try {
      const parts: Array<{ inlineData: { data: string; mimeType: string } } | { text: string }> = [];

      const files = req.files as Record<string, Express.Multer.File[]> | undefined;

      // Resume — PDF / image: send as inline data; DOCX: extract text first
      const resumeFile = files?.["resume"]?.[0];
      if (resumeFile) {
        const mime = resumeFile.mimetype;
        if (
          mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          mime === "application/msword"
        ) {
          const result = await mammoth.extractRawText({ buffer: resumeFile.buffer });
          if (result.value) {
            parts.push({ text: `[Resume content]:\n${result.value}` });
          }
        } else {
          parts.push({
            inlineData: {
              data: resumeFile.buffer.toString("base64"),
              mimeType: mime,
            },
          });
        }
      }

      // Notes — text pasted directly
      const notesText = req.body?.notes as string | undefined;
      if (notesText?.trim()) {
        parts.push({ text: `[Recruiter notes]:\n${notesText.trim()}` });
      }

      // Notes as image (chat screenshot)
      const notesImageFile = files?.["notesFile"]?.[0];
      if (notesImageFile) {
        parts.push({
          inlineData: {
            data: notesImageFile.buffer.toString("base64"),
            mimeType: notesImageFile.mimetype,
          },
        });
      }

      // Voice note
      const voiceFile = files?.["voice"]?.[0];
      if (voiceFile) {
        parts.push({
          inlineData: {
            data: voiceFile.buffer.toString("base64"),
            mimeType: voiceFile.mimetype,
          },
        });
      }

      if (parts.length === 0) {
        res.status(400).json({ error: "No content provided for extraction" });
        return;
      }

      const extracted = await extractCandidateInfo(parts);
      res.json(extracted);
    } catch (err) {
      req.log.error({ err }, "Extraction failed");
      const message = err instanceof Error ? err.message : "Extraction failed";
      res.status(400).json({ error: message });
    }
  },
);

// GET /candidates
router.get("/candidates", async (req, res): Promise<void> => {
  const params = ListCandidatesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { roleCategoryFilter, statusFilter: _statusFilter, search } = params.data;

  let query = db.select().from(candidatesTable).$dynamic();

  if (search) {
    query = query.where(
      or(
        ilike(candidatesTable.name, `%${search}%`),
        ilike(candidatesTable.email, `%${search}%`),
        ilike(candidatesTable.skills, `%${search}%`),
      ),
    );
  }

  const candidates = await query.orderBy(candidatesTable.createdAt);

  // Join preferences
  const prefs = await db.select().from(candidatePreferencesTable);
  const prefMap = new Map(prefs.map((p) => [p.candidateId, p]));

  let results = candidates.map((c) => ({ ...c, preferences: prefMap.get(c.id) ?? null }));

  // Filter by role category (done in-memory since it's in preferences)
  if (roleCategoryFilter) {
    results = results.filter(
      (r) => r.preferences?.desiredRoleCategory === roleCategoryFilter,
    );
  }

  res.json(results);
});

// POST /candidates
router.post("/candidates", async (req, res): Promise<void> => {
  const parsed = CreateCandidateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { preferences, ...candidateData } = parsed.data as any;

  const [candidate] = await db
    .insert(candidatesTable)
    .values({
      name: candidateData.name,
      email: candidateData.email ?? null,
      phone: candidateData.phone ?? null,
      resumeText: candidateData.resumeText ?? null,
      skills: candidateData.skills ?? null,
      source: candidateData.source ?? null,
    })
    .returning();

  let pref = null;
  if (preferences && candidate) {
    [pref] = await db
      .insert(candidatePreferencesTable)
      .values({ candidateId: candidate.id, ...preferences })
      .returning();
  }

  res.status(201).json({ ...candidate, preferences: pref ?? null });
});

// GET /candidates/:id
router.get("/candidates/:id", async (req, res): Promise<void> => {
  const params = GetCandidateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const result = await getCandidateWithPreferences(params.data.id);
  if (!result) {
    res.status(404).json({ error: "Candidate not found" });
    return;
  }
  res.json(result);
});

// PATCH /candidates/:id
router.patch("/candidates/:id", async (req, res): Promise<void> => {
  const params = UpdateCandidateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCandidateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { preferences, ...candidateData } = parsed.data as any;

  const [updated] = await db
    .update(candidatesTable)
    .set({
      ...(candidateData.name !== undefined && { name: candidateData.name }),
      ...(candidateData.email !== undefined && { email: candidateData.email }),
      ...(candidateData.phone !== undefined && { phone: candidateData.phone }),
      ...(candidateData.resumeText !== undefined && { resumeText: candidateData.resumeText }),
      ...(candidateData.skills !== undefined && { skills: candidateData.skills }),
      ...(candidateData.source !== undefined && { source: candidateData.source }),
      updatedAt: new Date(),
    })
    .where(eq(candidatesTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Candidate not found" });
    return;
  }

  // Update preferences if provided
  if (preferences) {
    const [existing] = await db
      .select()
      .from(candidatePreferencesTable)
      .where(eq(candidatePreferencesTable.candidateId, updated.id));

    if (existing) {
      await db
        .update(candidatePreferencesTable)
        .set({ ...preferences, updatedAt: new Date() })
        .where(eq(candidatePreferencesTable.candidateId, updated.id));
    } else {
      await db
        .insert(candidatePreferencesTable)
        .values({ candidateId: updated.id, ...preferences });
    }
  }

  const result = await getCandidateWithPreferences(updated.id);
  res.json(result);
});

// DELETE /candidates/:id
router.delete("/candidates/:id", async (req, res): Promise<void> => {
  const params = DeleteCandidateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(candidatesTable)
    .where(eq(candidatesTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Candidate not found" });
    return;
  }

  res.sendStatus(204);
});

// GET /candidates/:id/preferences
router.get("/candidates/:id/preferences", async (req, res): Promise<void> => {
  const params = GetCandidatePreferencesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [pref] = await db
    .select()
    .from(candidatePreferencesTable)
    .where(eq(candidatePreferencesTable.candidateId, params.data.id));

  if (!pref) {
    res.status(404).json({ error: "Preferences not found" });
    return;
  }

  res.json(pref);
});

// PUT /candidates/:id/preferences
router.put("/candidates/:id/preferences", async (req, res): Promise<void> => {
  const params = UpsertCandidatePreferencesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpsertCandidatePreferencesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(candidatePreferencesTable)
    .where(eq(candidatePreferencesTable.candidateId, params.data.id));

  let pref;
  if (existing) {
    [pref] = await db
      .update(candidatePreferencesTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(candidatePreferencesTable.candidateId, params.data.id))
      .returning();
  } else {
    [pref] = await db
      .insert(candidatePreferencesTable)
      .values({ candidateId: params.data.id, ...parsed.data })
      .returning();
  }

  res.json(pref);
});

// GET /candidates/:id/job-statuses
router.get("/candidates/:id/job-statuses", async (req, res): Promise<void> => {
  const params = GetCandidateJobStatusesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { candidateJobStatusTable, jobOpeningsTable } = await import("@workspace/db");

  const statuses = await db
    .select()
    .from(candidateJobStatusTable)
    .where(eq(candidateJobStatusTable.candidateId, params.data.id));

  // Attach job info
  const jobIds = [...new Set(statuses.map((s) => s.jobId))];
  const jobs = jobIds.length
    ? await db
        .select()
        .from(jobOpeningsTable)
        .where(or(...jobIds.map((id) => eq(jobOpeningsTable.id, id))))
    : [];
  const jobMap = new Map(jobs.map((j) => [j.id, j]));

  const result = statuses.map((s) => ({ ...s, job: jobMap.get(s.jobId) ?? null }));
  res.json(result);
});

export default router;
