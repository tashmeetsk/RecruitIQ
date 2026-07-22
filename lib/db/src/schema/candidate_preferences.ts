import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { candidatesTable } from "./candidates";

export const candidatePreferencesTable = pgTable("candidate_preferences", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id")
    .notNull()
    .references(() => candidatesTable.id, { onDelete: "cascade" }),
  desiredRole: text("desired_role"),
  desiredRoleCategory: text("desired_role_category"),
  salaryExpectation: text("salary_expectation"),
  noticePeriod: text("notice_period"),
  wfhPreference: text("wfh_preference"),
  relocationWillingness: boolean("relocation_willingness"),
  shiftPreference: text("shift_preference"),
  careerInterests: text("career_interests"),
  lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCandidatePreferenceSchema = createInsertSchema(candidatePreferencesTable).omit({
  id: true,
  updatedAt: true,
});

export type InsertCandidatePreference = z.infer<typeof insertCandidatePreferenceSchema>;
export type CandidatePreference = typeof candidatePreferencesTable.$inferSelect;
