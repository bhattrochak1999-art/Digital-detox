import { Router, type IRouter } from "express";
import { db, questionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateQuestionBody,
  UpdateQuestionBody,
  UpdateQuestionParams,
  DeleteQuestionParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/questions", async (_req, res) => {
  const questions = await db.select().from(questionsTable).orderBy(questionsTable.createdAt);
  res.json(questions);
});

router.post("/questions", async (req, res) => {
  const body = CreateQuestionBody.parse(req.body);
  const [question] = await db.insert(questionsTable).values(body).returning();
  res.status(201).json(question);
});

router.put("/questions/:id", async (req, res) => {
  const { id } = UpdateQuestionParams.parse({ id: Number(req.params.id) });
  const body = UpdateQuestionBody.parse(req.body);
  const [question] = await db
    .update(questionsTable)
    .set(body)
    .where(eq(questionsTable.id, id))
    .returning();
  if (!question) {
    res.status(404).json({ error: "Question not found" });
    return;
  }
  res.json(question);
});

router.delete("/questions/:id", async (req, res) => {
  const { id } = DeleteQuestionParams.parse({ id: Number(req.params.id) });
  await db.delete(questionsTable).where(eq(questionsTable.id, id));
  res.status(204).send();
});

export default router;
