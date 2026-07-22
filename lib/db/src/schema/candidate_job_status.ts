import { pgTable, serial, text, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { candidatesTable } from "./candidates";
import { jobOpeningsTable } from "./job_openings";

export const candidateJobStatusTable = pgTable(
  "candidate_job_status",
  {
    id: serial("id").primaryKey(),
    candidateId: integer("candidate_id")
      .notNull()
      .references(() => candidatesTable.id, { onDelete: "cascade" }),
    jobId: integer("job_id")
      .notNull()
      .references(() => jobOpeningsTable.id, { onDelete: "cascade" }),
    status: text("status").notNull(),
    updatedBy: text("updated_by"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [unique().on(t.candidateId, t.jobId)],
);

export const insertCandidateJobStatusSchema = createInsertSchema(candidateJobStatusTable).omit({
  id: true,
  updatedAt: true,
});

export type InsertCandidateJobStatus = z.infer<typeof insertCandidateJobStatusSchema>;
export type CandidateJobStatus = typeof candidateJobStatusTable.$inferSelect;
