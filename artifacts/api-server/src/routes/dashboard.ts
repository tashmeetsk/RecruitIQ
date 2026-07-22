import { Router, type IRouter } from "express";
import { db, candidatesTable, jobOpeningsTable, candidateJobStatusTable, candidatePreferencesTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

// GET /dashboard/stats
router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const [candidateCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(candidatesTable);

  const [jobCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(jobOpeningsTable);

  // Count by status
  const statusCounts = await db
    .select({
      status: candidateJobStatusTable.status,
      count: sql<number>`count(*)::int`,
    })
    .from(candidateJobStatusTable)
    .groupBy(candidateJobStatusTable.status);

  // Count candidates by desired role category
  const roleCounts = await db
    .select({
      roleCategory: candidatePreferencesTable.desiredRoleCategory,
      count: sql<number>`count(*)::int`,
    })
    .from(candidatePreferencesTable)
    .groupBy(candidatePreferencesTable.desiredRoleCategory);

  // Recent candidates (last 5)
  const recentCandidates = await db
    .select()
    .from(candidatesTable)
    .orderBy(sql`${candidatesTable.createdAt} DESC`)
    .limit(5);

  const prefs = await db.select().from(candidatePreferencesTable);
  const prefMap = new Map(prefs.map((p) => [p.candidateId, p]));

  const recentWithPrefs = recentCandidates.map((c) => ({
    ...c,
    preferences: prefMap.get(c.id) ?? null,
  }));

  res.json({
    totalCandidates: candidateCount?.count ?? 0,
    totalJobs: jobCount?.count ?? 0,
    byCandidateStatus: statusCounts.map((r) => ({
      status: r.status,
      count: r.count,
    })),
    byCandidateRoleCategory: roleCounts
      .filter((r) => r.roleCategory !== null)
      .map((r) => ({
        roleCategory: r.roleCategory as string,
        count: r.count,
      })),
    recentCandidates: recentWithPrefs,
  });
});

export default router;
