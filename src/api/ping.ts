import { Router, Request, Response } from "express";

const router = Router();

// Liveness probe: GET /api/ping -> { pong: true }
router.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ pong: true });
});

export default router;
