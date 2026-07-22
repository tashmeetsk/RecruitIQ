import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import candidatesRouter from "./candidates";
import jobsRouter from "./jobs";
import candidateJobStatusRouter from "./candidate_job_status";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(candidatesRouter);
router.use(jobsRouter);
router.use(candidateJobStatusRouter);
router.use(dashboardRouter);

export default router;
