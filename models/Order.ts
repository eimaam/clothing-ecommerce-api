// server/models/Order.ts

import mongoose, { Schema, Document } from "mongoose";
import { ShippingType } from "../types";
interface OrderItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
}
interface Order extends Document {
  user: mongoose.Types.ObjectId;
  items: OrderItem[];
  total: number;
  status: string;
  shippingType: ShippingType;
  createdAt: Date;
}

const orderSchema = new Schema<Order>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  items: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: "Product", // Reference to the Product model
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ["pending", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  shippingType: {
    type: String,
    required: true,
    enum: ["in_store", "standard",  "express"],
    default: ShippingType.IN_STORE,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Order =
  mongoose.models.Order || mongoose.model<Order>("Order", orderSchema);
