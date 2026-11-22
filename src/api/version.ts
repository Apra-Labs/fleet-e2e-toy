import { Router, Request, Response } from "express";
import { readFileSync } from "fs";
import path from "path";

interface PackageJson {
  version: string;
}

const router = Router();

// package.json is two levels up from both src/api and dist/api
const pkgPath = path.join(__dirname, "..", "..", "package.json");

router.get("/", (_req: Request, res: Response) => {
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as PackageJson;
  res.status(200).json({ version: pkg.version });
});

export default router;
