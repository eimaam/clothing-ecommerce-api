import { NextFunction, Request, Response } from "express";

export async function validateInputData(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const data = req.body;
  for (const key in data) {
    if (data[key] !== undefined && data[key] !== null) {
      if (
        (typeof data[key] === "string" &&
          (data[key] as string).trim() === "") ||
        (Array.isArray(data[key]) && !data[key].length)
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Data contains empty or invalid field",
          });
      }
    }
  }
  next();
}
