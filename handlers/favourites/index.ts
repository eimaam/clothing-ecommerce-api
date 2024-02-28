import { Request, Response } from "express";
import { IUser, User } from "../../models/User";
import { Product } from "../../models/Product";

export class Favourites {
  static async addToFavourites(req: Request, res: Response) {
    const { userId, productId } = req.body;

    try {
      const product = await Product.findById(productId);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product Not Found" });
      }
      const user: IUser | null = await User.findByIdAndUpdate(
        { _id: userId },
        { $addToSet: { favourites: productId } },
        { new: true },
      );

      return res.status(200).json({
        success: true,
        message: "Item successfully added to User's favourites list",
        data: { userId: user?._id, favourites: user!.favourites },
      });
    } catch (error: any) {
      console.error("There was a problem adding item to favourites: ", error);
      res.status(500).json({
        success: false,
        message: "There was a problem adding item to favourites list",
        error: error?.message,
      });
    }
  }

  static async getFavourites(req: Request, res: Response) {
    const { userId } = req.params;

    try {
      const user = await User.findById(userId).populate("favourites");

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User Not Found" });
      }

      const favourites = user.favourites || [];

      res.status(200).json({
        success: true,
        message: "User favourites list fetched successfully",
        total: user.favourites.length,
        data: { userId: user._id, favourites: favourites },
      });
    } catch (error: any) {
      console.error(
        "There was a problem getting User's favourites list",
        error,
      );
      res.status(500).json({
        success: false,
        message: "There was a problem getting User's favourites list",
        error: error?.message,
      });
    }
  }

  static async removeFavourite(req: Request, res: Response) {
    const { productId } = req.params;
    const { userId } = req.body;

    try {
      const user = await User.findByIdAndUpdate(
        { _id: userId },
        { $pull: { favourites: productId } },
        { new: true },
      );

      res.status(200).json({
        success: true,
        message: "Item removed successfully",
        data: { user: user._id, favourites: user.favourites },
      });
    } catch (error: any) {
      console.error(
        "There was a problem removing item from favourites list: ",
        error,
      );
      res.status(500).json({
        success: false,
        message: "There was a problem removing item from favourites list",
        error: error?.message,
      });
    }
  }
}
