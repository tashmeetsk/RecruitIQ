import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const jobOpeningsTable = pgTable("job_openings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  roleCategory: text("role_category"),
  requirements: text("requirements"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertJobOpeningSchema = createInsertSchema(jobOpeningsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertJobOpening = z.infer<typeof insertJobOpeningSchema>;
export type JobOpening = typeof jobOpeningsTable.$inferSelect;
