import { Request, Response } from "express";
import { User } from "../../models/User";
import bcrypt from "bcrypt";

export class Users {
  static async createUser(req: Request, res: Response) {
    const { email, password, fullName } = req.body;

    try {
      const userData = {
        email,
        password,
        fullName,
      };

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await User.create(userData);

      res.status(201).json({ message: "Account created successfully", user });
    } catch (error) {
      res.status(500).json({ message: "Error creating new user", error });
    }
  }

  static async getUserById(req: Request, res: Response) {
    const { userId } = req.body;
    try {
      const user = await User.findById({ _id: userId });

      if (!user) {
        res.status(404).json({ message: "User not found", userId });
      }

      res.status(200).json({ message: "User fetched successfully", user });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error getting Users. Internal Server Error", error });
    }
  }

  static async getAllUsers(_req: Request, res: Response) {
    try {
      const users = await User.find();

      if (users.length === 0) {
        return res.status(400).json({ message: "NO USER CREATED" });
      }

      res.status(200).json({
        message: "All users fetched successfully",
        "total users": users?.length,
        users,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async updateUser(req: Request, res: Response) {
    const { userId } = req.params;

    const { fullName, password, street, city, state, zip } = req.body;

    try {
      function validateInputData(
        data: Record<string, string | undefined>
      ): boolean {
        for (const key in data) {
          if (data[key]) {
            if (data[key] === undefined || data[key]?.trim() === "") {
              return false;
            }
          }
        }
        return true;
      }

      if (
        !validateInputData({ fullName, password, street, city, state, zip })
      ) {
        return res
          .status(400)
          .json({ message: "Data contains an empty or invalid field" });
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const data = {
        fullName,
        password: hashedPassword,
        street,
        city,
        state,
        zip,
      };

      const _id = userId;

      const user = await User.findByIdAndUpdate(_id, data, {
        new: true,
        runValidators: true,
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res
        .status(200)
        .json({ message: "User updated successfully", user });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error", error });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    const { userId } = req.body;

    try {
      const user = await User.findById(userId);

      if (!user) {
        res.status(404).json({ message: "User/Account not found" });
      }
      res
        .status(200)
        .json({ message: "Account deleted successfully", account: user });
    } catch (error) {
      res
        .status(500)
        .json({ message: "There was an error deleting account", error });
    }
  }
}