import type { Request, Response, NextFunction } from "express";

const UPDATE_SECRET_HEADER = "x-update-secret";

export function validateUpdateSecret(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (process.env.SKIP_AUTH === "true") {
    next();
    return;
  }

  const expectedSecret = process.env.UPDATE_SECRET;
  if (!expectedSecret) {
    res.status(500).json({
      error: "UPDATE_SECRET not configured",
    });
    return;
  }

  const providedSecret = req.headers[UPDATE_SECRET_HEADER];
  if (providedSecret !== expectedSecret) {
    res.status(401).json({
      error: "Unauthorized: invalid or missing X-Update-Secret header",
    });
    return;
  }

  next();
}
