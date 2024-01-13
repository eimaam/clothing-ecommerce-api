import mongoose, { Schema, Document } from 'mongoose';

interface CartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  total: number
}

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  items: CartItem[];
  grandTotal: number
  createdAt: Date;
}

const cartSchema = new Schema<ICart>({
  userId: {
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
      total: {
        type: Number,
        required: true,
      },
      
    },
  ],
  grandTotal: {
    type: Number, 
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true});

export const Cart = mongoose.models.Cart || mongoose.model<ICart>('Cart', cartSchema);

