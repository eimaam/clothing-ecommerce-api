import mongoose, { Schema, Document } from 'mongoose';

interface CartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
}

interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: CartItem[];
  createdAt: Date;
}

const cartSchema = new Schema<ICart>({
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true});

export const Cart = mongoose.model<ICart>('Cart', cartSchema);

