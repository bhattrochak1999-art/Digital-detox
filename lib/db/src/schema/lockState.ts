import { pgTable, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const lockStateTable = pgTable("lock_state", {
  id: serial("id").primaryKey(),
  isLocked: boolean("is_locked").notNull().default(false),
  lockedAt: timestamp("locked_at"),
  emergencyUnlockAt: timestamp("emergency_unlock_at"),
});

export const insertLockStateSchema = createInsertSchema(lockStateTable).omit({ id: true });
export type InsertLockState = z.infer<typeof insertLockStateSchema>;
export type LockState = typeof lockStateTable.$inferSelect;
