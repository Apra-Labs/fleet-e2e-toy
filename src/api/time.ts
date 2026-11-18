import { Router, Request, Response } from "express";

const router = Router();

// Server time: GET /api/time -> { now: <ISO-8601 string> }
router.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ now: new Date().toISOString() });
});

export default router;
