import * as fs from "fs";
import * as path from "path";
import { Router } from "express";

const pkgPath = path.join(__dirname, "..", "..", "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8")) as { version: string };

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).json({ version: pkg.version });
});

export default router;
