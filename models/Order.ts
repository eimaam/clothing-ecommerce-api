// server/models/Order.ts

import mongoose, { Schema, Document } from 'mongoose';

interface OrderItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
}

enum Status {
    "PENDING" = "pending",
    "SHIPPED" = "shipped",
    "DELIVERED" = "delivered",
    "CANCELED" = "cancelled",
}

interface Order extends Document {
  user: mongoose.Types.ObjectId;
  items: OrderItem[];
  total: number;
  status: string; 
  createdAt: Date;
}

const orderSchema = new Schema<Order>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  items: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: 'Product', // Reference to the Product model
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
    enum: ['pending', 'shipped', 'delivered', 'cancelled'], 
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Order = mongoose.models.Order || mongoose.model<Order>('Order', orderSchema);

