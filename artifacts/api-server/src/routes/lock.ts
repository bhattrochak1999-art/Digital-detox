import { Router, type IRouter } from "express";
import { db, lockStateTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { SetLockStateBody } from "@workspace/api-zod";

const router: IRouter = Router();

async function ensureLockState() {
  const rows = await db.select().from(lockStateTable).limit(1);
  if (rows.length === 0) {
    const [state] = await db
      .insert(lockStateTable)
      .values({ isLocked: false, lockedAt: null, emergencyUnlockAt: null })
      .returning();
    return state;
  }
  return rows[0];
}

router.get("/lock", async (_req, res) => {
  const state = await ensureLockState();
  res.json(state);
});

router.post("/lock", async (req, res) => {
  const body = SetLockStateBody.parse(req.body);
  const state = await ensureLockState();

  const updates: {
    isLocked: boolean;
    lockedAt: Date | null;
    emergencyUnlockAt: Date | null;
  } = {
    isLocked: body.isLocked,
    lockedAt: body.isLocked ? new Date() : null,
    emergencyUnlockAt: null,
  };

  if (body.isLocked === false && body.emergencyDelayMinutes) {
    const unlockAt = new Date();
    unlockAt.setMinutes(unlockAt.getMinutes() + body.emergencyDelayMinutes);
    updates.emergencyUnlockAt = unlockAt;
    updates.isLocked = true;
  }

  const [updated] = await db
    .update(lockStateTable)
    .set(updates)
    .where(eq(lockStateTable.id, state.id))
    .returning();

  res.json(updated);
});

export default router;
