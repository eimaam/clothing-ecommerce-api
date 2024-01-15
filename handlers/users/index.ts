import { Request, Response } from "express";
import { User } from "../../models/User";
import bcrypt from "bcrypt";

export class Users {
  static async createUser(req: Request, res: Response) {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res
        .status(400)
        .json({ success: true, message: "All fields are required." });
    }

    try {
      const userData = {
        email,
        password,
        fullName,
      };

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, message: "User already exists" });
      }

      const user = await User.create(userData);

      res
        .status(201)
        .json({
          success: true,
          message: "Account created successfully",
          data: user,
        });
    } catch (error: any) {
      res
        .status(500)
        .json({
          success: false,
          message: "Error creating new user",
          error: error?.message,
        });
    }
  }

  static async getUserById(req: Request, res: Response) {
    const { userId } = req.params;
    try {
      const user = await User.findById(userId)
        .populate("favourites")
        .populate("orders");

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found", data: userId });
      }

      res
        .status(200)
        .json({
          success: true,
          message: "User fetched successfully",
          data: user,
        });
    } catch (error) {
      res
        .status(500)
        .json({
          success: false,
          message: "Error getting User. Internal Server Error",
          error,
        });
    }
  }

  static async getAllUsers(_req: Request, res: Response) {
    try {
      const users = await User.find();

      if (users.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "NO USER CREATED" });
      }

      res.status(200).json({
        message: "All users fetched successfully",
        "total users": users?.length,
        users,
      });
    } catch (error) {
      console.log("Failed to fetched all accounts: ", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }

  static async updateUser(req: Request, res: Response) {
    const { userId } = req.params;

    try {
      const user = await User.findById(userId);

      if (user?._id.toString() !== req.body["userId"]) {
        return res.status(403).json({
          sucess: false,
          message:
            "Access Denied. You do not have permission to update User's account",
        });
      }

      let hashedPassword;

      const data: { [key: string]: any } = {};

      const fieldsToUpdate = [
        "fullName",
        "password",
        "street",
        "city",
        "state",
        "zip",
        "addressType",
      ];

      for (const field of fieldsToUpdate) {
        if (field === "password" && req.body[field]) {
          const saltRounds = 10;
          hashedPassword = await bcrypt.hash(req.body[field], saltRounds);
          data["password"] = hashedPassword;
        } else if (
          ["city", "state", "zip", "addressType", "street"].includes(field) &&
          req.body[field]
        ) {
          if (!data["addresses"]) {
            data["addresses"] = {};
          }
          data["addresses"] = {
            street: req.body["street"] || user?.addresses[0]["street"],
            city: req.body["city"] || user?.addresses[0]["city"],
            state: req.body["state"] || user?.addresses[0]["state"],
            zip: req.body["zip"] || user?.addresses[0]["zip"],
            addressType:
              req.body["addressType"] || user?.addresses[0]["addressType"],
          };
        } else if (req.body[field]) {
          data[field] = req.body[field];
        }
      }

      const updatedUser = await User.findByIdAndUpdate(
        { _id: req.body["userId"] },
        data,
        {
          new: true,
          runValidators: true,
        },
      );

      if (!updatedUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      return res
        .status(200)
        .json({
          success: true,
          message: "User updated successfully",
          user: updatedUser,
        });
    } catch (error) {
      console.error("Error updating user account", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error", error });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    const { userId } = req.params;

    try {
      const user = await User.findById({ _id: userId });

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User/Account not found" });
      }
      res
        .status(204)
        .json({
          success: true,
          message: "Account deleted successfully",
          account: user,
        });
    } catch (error) {
      res
        .status(500)
        .json({
          success: false,
          message: "There was an error deleting account",
          error,
        });
    }
  }
}
