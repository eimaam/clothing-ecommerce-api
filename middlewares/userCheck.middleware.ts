import { NextFunction, Request, Response } from "express";
import { User } from "../models/User";

export const checkUser = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
  } catch (error) {
    console.log("There was a problem checking user", error);
    res.status(500).json("Internal Server Error");
  }

  next();
};
