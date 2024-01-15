import { Request, Response } from "express";
import { IOrder, Order } from "../../models/Order";
import { IProduct, Product } from "../../models/Product";
import mongoose from "mongoose";
import { User } from "../../models/User";
import { Status } from "../../types";

export class Orders {
  static async createOrder(req: Request, res: Response) {
    const { userId, productId, quantity, status, shippingType, colour, size } =
      req.body;
    console.log("BODYYYYY ==> ", req.body);
    try {
      const existingOrder: IOrder | null = await Order.findOne({
        user: userId,
      });

      const product: IProduct | null = await Product.findById(productId);

      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product/Item not found" });
      }

      if (quantity > product.availability)
        return res.status(400).json({
          success: false,
          message:
            "Invalid quantity! Item available is below the entered quantity",
        });

      if (existingOrder) {
        existingOrder.items.forEach((item) => {
          if (
            item.product.toString() === productId &&
            status === Status.PENDING
          ) {
            if (item.colour === colour || item.size === size) {
              item.quantity += quantity;
              item.total = item.quantity * product.price;
            }
          }
        });

        await existingOrder.save();

        return res
          .status(201)
          .json({
            success: true,
            message: "Order created successfully",
            data: existingOrder,
          });
      }

      const newOrder = {
        items: {
          product: new mongoose.Types.ObjectId(productId),
          quantity,
          colour,
          size,
          total: quantity * product.price,
          status,
          shippingType,
        },
      };

      const order = await Order.findOneAndUpdate(
        { user: userId },
        { $push: newOrder },
        { new: true, upsert: true },
      );

      if (order) {
        await Product.findByIdAndUpdate(
          { _id: productId },
          { $inc: { availability: -quantity } },
        );
      }

      await User.findOneAndUpdate(
        { _id: userId },
        { $addToSet: { orders: order._id } },
      );

      return res
        .status(201)
        .json({
          success: true,
          message: "New Order created successfully",
          data: order,
        });
    } catch (error: any) {
      console.log("Error creating order", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Internal Server Error",
          error: error?.message,
        });
    }
  }

  static async getOrderById(req: Request, res: Response) {
    const { orderId } = req.params;

    try {
      const order: IOrder | null = await Order.findById(orderId);

      if (!order) {
        return res.status(400).json({
          success: false,
          message: "No Order Found with the supplied ID",
        });
      }

      res
        .status(200)
        .json({ success: true, message: "Order fetched", data: order });
    } catch (error) {
      console.error("Error getting order", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error. Order fetching failed",
        error,
      });
    }
  }

  static async getUserOrders(req: Request, res: Response) {
    const { userId } = req.params;

    try {
      const userOrders: IOrder[] = await Order.find({ user: userId });

      if (!userOrders.length) {
        return res
          .status(400)
          .json({ success: false, message: "User has no orders" });
      }

      // Additional check to ensure the userId matches
      if (userId !== req.body.userId) {
        return res.status(403).json({
          success: false,
          message:
            "Access Denied. You do not have permission to access this user's order",
        });
      }

      res
        .status(200)
        .json({ success: true, message: "Order fetched", userOrders });
    } catch (error) {
      console.error("Error getting order", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error. Order fetching failed",
        error,
      });
    }
  }

  static async getAllOrders(_req: Request, res: Response) {
    try {
      const orders = await Order.find();

      if (!orders.length) {
        return res
          .status(400)
          .json({ success: false, message: "NO USER CREATED" });
      }
      res.status(200).json({
        success: true,
        message: "All orders fetched successfully",
        "total orders": orders?.length,
        orders,
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }

  static async updateOrder(req: Request, res: Response) {
    const { orderId } = req.params;
    const { userId } = req.body;

    try {
      const order: IOrder | null = await Order.findById(orderId);

      if (!order) {
        return res
          .status(404)
          .json({ success: false, message: "Order Not Found" });
      }

      if (order?.user.toString() !== userId) {
        return res.status(403).json({
          message:
            "Access Denied. You do not have permission to update user's account",
        });
      }
      const product: IProduct | null = await Product.findById(
        order.items[0].product,
      );

      if (req.body["productId"] && !product) {
        return res
          .status(404)
          .json({ success: false, message: "product not found" });
      }

      const data: { [key: string]: string | number | object } = {};

      const fields = [
        "productId",
        "quantity",
        "status",
        "colour",
        "size",
        "shippingType",
        "total",
      ];
      for (const field of fields) {
        if (
          ["productId", "colour", "size", "quantity"].includes(field) &&
          req.body[field]
        ) {
          // handle case where order is updated with colour which product is not listed with
          if (
            req.body["colour"] &&
            !product?.colours.includes(req.body["colour"])
          ) {
            return res.status(400).json({
              message:
                "Invalid Colour. Product/Item not listed with the entered colour",
            });
          }
          // handle case where order is updated with size which product is not listed with
          if (req.body["size"] && !product?.sizes.includes(req.body["size"])) {
            return res.status(400).json({
              message:
                "Invalid Size. Product/Item not listed with the entered size",
            });
          }

          // handle case where the val of quantity is more than the available item
          if (req.body["quantity"] && product) {
            if (req.body["quantity"] > product?.availability) {
              return res.status(400).json({
                message:
                  "Invalid quantity. Available items not up to entered quantity",
              });
            }
          }

          if (!data["items"]) {
            data["items"] = {};
          }

          data["items"] = {
            product: req.body["productId"] || order.items[0].product,
            colour: req.body["colour"] || order.items[0].colour,
            size: req.body["size"] || order.items[0].size,
            quantity: req.body["quantity"] || order.items[0].quantity,
          };
        } else if (req.body[field]) {
          data[field] = req.body[field];
        }
      }

      const updatedOrder = await Order.findByIdAndUpdate(orderId, data, {
        new: true,
      });

      // Calculate the difference in quantity
      const quantityDifference = req.body["quantity"] - order.items[0].quantity;

      // Update the availability for the product after successfully updating the order
      if (quantityDifference && quantityDifference !== 0) {
        await Product.findByIdAndUpdate(order.items[0].product, {
          $inc: { availability: -quantityDifference },
        });
      }

      res
        .status(200)
        .json({
          success: true,
          message: "Order updated successfully",
          order: updatedOrder,
        });
    } catch (error: any) {
      console.error("Error updating order", error);
      res
        .status(500)
        .json({ success: false, message: "Error updating order", error });
    }
  }

  static async deleteOrder(req: Request, res: Response) {
    const { orderId } = req.params;
    const { userId } = req.body;
    try {
      const order = await Order.findById(orderId);

      if (!order) {
        return res
          .status(403)
          .json({ success: false, message: "Order not found" });
      }

      if (order.user?.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to execute this action",
        });
      }

      await Order.findByIdAndDelete(orderId);

      res
        .status(200)
        .json({ success: true, message: "Order deleted successfully" });
    } catch (error) {
      console.error("Error deleting order", error);
      res.status(500).json({
        success: false,
        message:
          "Internal Server Error. There was a problem executing delete order action",
      });
    }
  }
}
