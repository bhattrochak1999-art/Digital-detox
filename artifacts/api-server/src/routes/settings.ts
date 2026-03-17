import { Router, type IRouter } from "express";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateSettingsBody } from "@workspace/api-zod";

const router: IRouter = Router();

async function ensureSettings() {
  const rows = await db.select().from(settingsTable).limit(1);
  if (rows.length === 0) {
    const [settings] = await db
      .insert(settingsTable)
      .values({ questionCount: 3, emergencyDelayMinutes: 2 })
      .returning();
    return settings;
  }
  return rows[0];
}

router.get("/settings", async (_req, res) => {
  const settings = await ensureSettings();
  res.json(settings);
});

router.put("/settings", async (req, res) => {
  const body = UpdateSettingsBody.parse(req.body);
  const settings = await ensureSettings();
  const [updated] = await db
    .update(settingsTable)
    .set(body)
    .where(eq(settingsTable.id, settings.id))
    .returning();
  res.json(updated);
});

export default router;
