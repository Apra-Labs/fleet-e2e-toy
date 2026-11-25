import { Router, Request, Response } from "express";

const router = Router();

// Echo the msg query parameter back as JSON
router.get("/", (req: Request, res: Response) => {
  const msg = req.query.msg;
  if (typeof msg !== "string") {
    res.status(400).json({ error: "msg query parameter is required" });
    return;
  }
  res.status(200).json({ echo: msg });
});

// Return the length of the msg query parameter as JSON
router.get("/length", (req: Request, res: Response) => {
  const msg = req.query.msg;
  if (typeof msg !== "string") {
    res.status(400).json({ error: "msg query parameter is required" });
    return;
  }
  res.status(200).json({ length: msg.length });
});

export default router;
