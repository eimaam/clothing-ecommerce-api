import { Request, Response } from "express";
import { Cart, ICart } from "../../models/Cart";
import { IProduct, Product } from "../../models/Product";

export class Carts {
  static async addToCart(req: Request, res: Response) {
    const { userId, productId, quantity } = req.body;

    try {
      const existingCartItem: ICart | null = await Cart.findOne({
        user: userId,
        "items.product": productId,
      });

      const product: IProduct | null = await Product.findById(productId);

      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product Not Found" });
      }

      if (existingCartItem) {
        // Update existing item in the cart
        existingCartItem.items.forEach((item) => {
          if (item.product.toString() === productId) {
            item.quantity += quantity;
            item.total = item.quantity * product.price;
          }
        });

        existingCartItem.grandTotal = existingCartItem.items.reduce(
          (total, item) => total + item.total,
          0,
        );

        await existingCartItem.save();

        return res.status(200).json({
          success: true,
          message: "Quantity updated in cart",
          data: existingCartItem,
        });
      } else {
        // Create a new cart item
        const newCartItem = {
          product: productId,
          quantity,
          total: quantity * product.price,
        };

        const cart = await Cart.findOneAndUpdate(
          { user: userId },
          {
            $push: { items: newCartItem },
            $inc: { grandTotal: newCartItem.total },
          },
          { new: true, upsert: true },
        );

        return res.status(200).json({
          success: true,
          message: "Item successfully added to cart",
          data: cart,
        });
      }
    } catch (error: any) {
      console.error("There was a problem adding item to cart: ", error);
      res.status(500).json({
        success: false,
        message: "There was a problem adding item to cart",
        error: error?.message,
      });
    }
  }

  static async updateCart(req: Request, res: Response) {
    const { id } = req.params;
    const { userId, productId, quantity } = req.body;

    try {
      const cartItemToUpdate: ICart | null = await Cart.findOne({
        _id: id,
        "items.product": productId,
      });

      if (!cartItemToUpdate) {
        return res.status(400).json({
          success: false,
          message:
            "Incorrect Cart/Product Id or Product does not exist in the selected Cart",
        });
      }

      if (cartItemToUpdate.user.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message:
            "Access Denied. You do not have permission to update user's cart",
        });
      }

      const product: IProduct | null = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ message: "Product Not Found" });
      }

      //   ensure quantity passed of item is not above the val of available product/item
      if (quantity > product.availability)
        return res.status(400).json({
          success: false,
          message: "Invalid quantity. Quantity above available product/item",
        });

      cartItemToUpdate.items.forEach((item) => {
        if (item.product.toString() === productId) {
          item.quantity = quantity;
          item.total = item.quantity * product.price;
        }
      });

      cartItemToUpdate.grandTotal = cartItemToUpdate.items.reduce(
        (total, item) => total + item.total,
        0,
      );

      let updatedCart;

      try {
        updatedCart = await cartItemToUpdate.save();
        console.log("Save successful");
      } catch (error) {
        console.error("Error saving cart item:", error);
      }

      res.status(200).json({
        success: true,
        message: "Cart updated successfully",
        data: updatedCart,
      });
    } catch (error: any) {
      console.error("There was a problem updating cart: ", error);
      res.status(500).json({
        success: false,
        message: "There was a problem updating cart",
        error: error?.message,
      });
    }
  }

  static async getAllCarts(_req: Request, res: Response) {
    try {
      const carts: ICart[] = await Cart.find();

      if (!carts.length) {
        return res
          .status(404)
          .json({ success: false, message: "No Cart Found" });
      }

      res.status(200).json({
        success: true,
        message: "All Carts fetched successfully",
        total: carts.length,
        data: carts,
      });
    } catch (error) {
      console.log("There was a problem getting all carts data/item", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error. Error getting all carts",
        error: error,
      });
    }
  }

  static async getCart(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const cart = await Cart.findById(id);

      if (!cart) {
        return res
          .status(404)
          .json({ success: false, message: "Cart Not Found" });
      }

      res.status(200).json({
        success: true,
        message: "Cart data fetched successfully",
        data: cart,
      });
    } catch (error) {
      console.log("There was a problem getting all carts data/item", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error. Error getting all carts",
        error: error,
      });
    }
  }

  static async getUserCart(req: Request, res: Response) {
    const { userId } = req.params;

    try {
      const userCart: ICart | null = (await Cart.findOne({
        user: userId,
      }).populate("user")) as ICart | null;

      if (!userCart) {
        return res
          .status(404)
          .json({ success: false, message: "User's cart is empty" });
      }

      // Additional check to ensure the userId matches
      if (userId !== req.body.userId) {
        return res.status(403).json({
          success: false,
          message:
            "Access Denied. You do not have permission to access this user's cart",
        });
      }

      res.status(200).json({
        success: true,
        message: "User's Cart data fetched successfully",
        total: userCart.items.length,
        data: userCart,
      });
    } catch (error) {
      console.log("There was a problem getting all carts data/item", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error. Error getting all carts",
        error: error,
      });
    }
  }

  static async deleteCart(req: Request, res: Response) {
    const { id } = req.params;
    const { userId } = req.body;

    try {
      const cart: ICart | null = await Cart.findById(id);

      if (!cart) {
        return res
          .status(404)
          .json({ success: false, message: "Cart Not Found", data: cart });
      }

      if (cart.user.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message:
            "Access Denied. You do not have permission to update user's account",
        });
      }

      const deletedCart = await Cart.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: "Cart deleted successfully",
        data: deletedCart,
      });
    } catch (error) {
      console.error("There was a problem updating cart: ", error);
      res
        .status(500)
        .json({ success: false, message: "There was a problem updating cart" });
    }
  }
}
