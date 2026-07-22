import { Router, type IRouter } from "express";
import { eq, and, or } from "drizzle-orm";
import { db, candidateJobStatusTable, candidatePreferencesTable } from "@workspace/db";
import {
  UpsertCandidateJobStatusBody,
  UpdateCandidateJobStatusBody,
  UpdateCandidateJobStatusParams,
  ListCandidateJobStatusesQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

// GET /candidate-job-status
router.get("/candidate-job-status", async (req, res): Promise<void> => {
  const params = ListCandidateJobStatusesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { jobId, candidateId, statusFilter } = params.data;

  const conditions = [];
  if (jobId) conditions.push(eq(candidateJobStatusTable.jobId, jobId));
  if (candidateId) conditions.push(eq(candidateJobStatusTable.candidateId, candidateId));
  if (statusFilter) conditions.push(eq(candidateJobStatusTable.status, statusFilter));

  const statuses =
    conditions.length > 0
      ? await db
          .select()
          .from(candidateJobStatusTable)
          .where(and(...conditions))
      : await db.select().from(candidateJobStatusTable);

  res.json(statuses);
});

// POST /candidate-job-status (upsert)
router.post("/candidate-job-status", async (req, res): Promise<void> => {
  const parsed = UpsertCandidateJobStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { candidateId, jobId, status, updatedBy } = parsed.data;

  // Upsert
  const [upserted] = await db
    .insert(candidateJobStatusTable)
    .values({ candidateId, jobId, status, updatedBy: updatedBy ?? null, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [candidateJobStatusTable.candidateId, candidateJobStatusTable.jobId],
      set: { status, updatedBy: updatedBy ?? null, updatedAt: new Date() },
    })
    .returning();

  // Update lastVerifiedAt on the candidate's preferences whenever status changes
  // (implies someone just checked in on them)
  await db
    .update(candidatePreferencesTable)
    .set({ lastVerifiedAt: new Date(), updatedAt: new Date() })
    .where(eq(candidatePreferencesTable.candidateId, candidateId));

  res.json(upserted);
});

// PATCH /candidate-job-status/:id
router.patch("/candidate-job-status/:id", async (req, res): Promise<void> => {
  const params = UpdateCandidateJobStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCandidateJobStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(candidateJobStatusTable)
    .where(eq(candidateJobStatusTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Status entry not found" });
    return;
  }

  const [updated] = await db
    .update(candidateJobStatusTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(candidateJobStatusTable.id, params.data.id))
    .returning();

  // Update lastVerifiedAt on preferences
  await db
    .update(candidatePreferencesTable)
    .set({ lastVerifiedAt: new Date(), updatedAt: new Date() })
    .where(eq(candidatePreferencesTable.candidateId, existing.candidateId));

  res.json(updated);
});

export default router;
