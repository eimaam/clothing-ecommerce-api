// server/models/Order.ts

import mongoose, { Schema, Document } from "mongoose";
import { ShippingType } from "../types";
import { IProduct, SizeEnum } from "./Product";
interface OrderItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  size: SizeEnum | number;
  colour: string;
  total: number;
  status: string;
  shippingType: ShippingType;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: OrderItem[];

  createdAt: Date;
}

const orderSchema = new Schema<IOrder>({
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
        validate: {
          validator: function (this: OrderItem, value: any): Promise<boolean> {
            return validateQuantity.call(this, value);
          },
          message:
            "Invalid quantity - confirm quantity is not greater than availability",
        },
      },
      colour: {
        type: String,
        required: true,
        lowercase: true,
        validate: {
          validator: function (this: OrderItem, value: any): Promise<boolean> {
            return validateColor.call(this, value);
          },
          message: "Invalid color",
        },
      },
      size: {
        type: Schema.Types.Mixed,
        required: true,
        validate: {
          validator: function (this: OrderItem, value: any): Promise<boolean> {
            return validateSize.call(this, value);
          },
          message: "Invalid size",
        },
      },
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
        enum: ["in_store", "standard", "express"],
        default: ShippingType.IN_STORE,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Custom validation function for color
async function validateColor(this: OrderItem, value: any): Promise<boolean> {
  const product = await mongoose
    .model<IProduct>("Product")
    .findById(this.product);

  if (!product) {
    // Handle the case when the product is not found
    return false;
  }

  return product.colours.includes(value);
}

// Custom validation function for size
async function validateSize(this: OrderItem, value: any): Promise<boolean> {
  const product = await mongoose
    .model<IProduct>("Product")
    .findById(this.product);

  if (!product) {
    return false;
  }

  return product.sizes.includes(value);
}

// custom validation for quantity
// ensure quantity passed correlates with the available items to avoid ordering whats not available
async function validateQuantity(this: OrderItem, value: any): Promise<boolean> {
  const product = await mongoose
    .model<IProduct>("Product")
    .findById(this.product);

  if (!product) {
    return false;
  }

  return value <= product.availability;
}

export const Order =
  mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);
