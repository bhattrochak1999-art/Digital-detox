import { Router, type IRouter } from "express";
import { db, progressTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { SaveAnswerBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/progress", async (_req, res) => {
  const progress = await db.select().from(progressTable);
  res.json(progress);
});

router.post("/progress", async (req, res) => {
  const body = SaveAnswerBody.parse(req.body);
  const existing = await db
    .select()
    .from(progressTable)
    .where(eq(progressTable.questionId, body.questionId))
    .limit(1);

  let result;
  if (existing.length > 0) {
    const [updated] = await db
      .update(progressTable)
      .set({ answeredCorrectly: body.answeredCorrectly, answeredAt: new Date() })
      .where(eq(progressTable.questionId, body.questionId))
      .returning();
    result = updated;
  } else {
    const [inserted] = await db
      .insert(progressTable)
      .values({ questionId: body.questionId, answeredCorrectly: body.answeredCorrectly })
      .returning();
    result = inserted;
  }

  res.json(result);
});

router.delete("/progress", async (_req, res) => {
  await db.delete(progressTable);
  res.status(204).send();
});

export default router;
