import { Router, type IRouter } from "express";
import { eq, or } from "drizzle-orm";
import {
  db,
  jobOpeningsTable,
  candidatesTable,
  candidatePreferencesTable,
  candidateJobStatusTable,
} from "@workspace/db";
import {
  CreateJobOpeningBody,
  UpdateJobOpeningBody,
  GetJobOpeningParams,
  UpdateJobOpeningParams,
  DeleteJobOpeningParams,
  GetJobMatchesParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

// GET /job-openings
router.get("/job-openings", async (_req, res): Promise<void> => {
  const jobs = await db
    .select()
    .from(jobOpeningsTable)
    .orderBy(jobOpeningsTable.createdAt);
  res.json(jobs);
});

// POST /job-openings
router.post("/job-openings", async (req, res): Promise<void> => {
  const parsed = CreateJobOpeningBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [job] = await db.insert(jobOpeningsTable).values(parsed.data).returning();
  res.status(201).json(job);
});

// GET /job-openings/:id
router.get("/job-openings/:id", async (req, res): Promise<void> => {
  const params = GetJobOpeningParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [job] = await db
    .select()
    .from(jobOpeningsTable)
    .where(eq(jobOpeningsTable.id, params.data.id));

  if (!job) {
    res.status(404).json({ error: "Job opening not found" });
    return;
  }
  res.json(job);
});

// PATCH /job-openings/:id
router.patch("/job-openings/:id", async (req, res): Promise<void> => {
  const params = UpdateJobOpeningParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateJobOpeningBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [job] = await db
    .update(jobOpeningsTable)
    .set(parsed.data)
    .where(eq(jobOpeningsTable.id, params.data.id))
    .returning();

  if (!job) {
    res.status(404).json({ error: "Job opening not found" });
    return;
  }
  res.json(job);
});

// DELETE /job-openings/:id
router.delete("/job-openings/:id", async (req, res): Promise<void> => {
  const params = DeleteJobOpeningParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(jobOpeningsTable)
    .where(eq(jobOpeningsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Job opening not found" });
    return;
  }
  res.sendStatus(204);
});

// GET /job-openings/:id/matches
// Returns candidates whose desiredRoleCategory matches this job's roleCategory,
// sorted by lastVerifiedAt descending (recently verified first, nulls last)
router.get("/job-openings/:id/matches", async (req, res): Promise<void> => {
  const params = GetJobMatchesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [job] = await db
    .select()
    .from(jobOpeningsTable)
    .where(eq(jobOpeningsTable.id, params.data.id));

  if (!job) {
    res.status(404).json({ error: "Job opening not found" });
    return;
  }

  // Get all candidates
  const allCandidates = await db.select().from(candidatesTable);
  const allPrefs = await db.select().from(candidatePreferencesTable);
  const prefMap = new Map(allPrefs.map((p) => [p.candidateId, p]));

  // Filter to matching role category
  let matched = allCandidates
    .map((c) => ({ ...c, preferences: prefMap.get(c.id) ?? null }))
    .filter((c) => {
      if (!job.roleCategory) return true; // no role category = show all
      return c.preferences?.desiredRoleCategory === job.roleCategory;
    });

  // Sort by lastVerifiedAt descending (recently verified first, nulls last)
  matched.sort((a, b) => {
    const aTime = a.preferences?.lastVerifiedAt?.getTime() ?? 0;
    const bTime = b.preferences?.lastVerifiedAt?.getTime() ?? 0;
    return bTime - aTime;
  });

  // Attach job status if exists
  const candidateIds = matched.map((c) => c.id);
  const statuses =
    candidateIds.length > 0
      ? await db
          .select()
          .from(candidateJobStatusTable)
          .where(
            or(
              ...candidateIds.map((id) => eq(candidateJobStatusTable.candidateId, id)),
            ),
          )
      : [];

  const statusMap = new Map(
    statuses
      .filter((s) => s.jobId === job.id)
      .map((s) => [s.candidateId, s]),
  );

  const results = matched.map((c) => ({
    candidate: c,
    jobStatus: statusMap.get(c.id) ?? null,
  }));

  res.json(results);
});

export default router;
