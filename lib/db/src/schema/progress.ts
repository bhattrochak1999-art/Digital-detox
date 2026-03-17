import { pgTable, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { questionsTable } from "./questions";

export const progressTable = pgTable("progress", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").references(() => questionsTable.id, { onDelete: "cascade" }).notNull(),
  answeredCorrectly: boolean("answered_correctly").notNull(),
  answeredAt: timestamp("answered_at").defaultNow().notNull(),
});

export const insertProgressSchema = createInsertSchema(progressTable).omit({ id: true, answeredAt: true });
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type Progress = typeof progressTable.$inferSelect;
