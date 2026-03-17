import { Router, type IRouter } from "express";
import healthRouter from "./health";
import questionsRouter from "./questions";
import settingsRouter from "./settings";
import progressRouter from "./progress";
import lockRouter from "./lock";

const router: IRouter = Router();

router.use(healthRouter);
router.use(questionsRouter);
router.use(settingsRouter);
router.use(progressRouter);
router.use(lockRouter);

export default router;
