import mongoose, { Schema } from "mongoose";

enum SizeEnum {
  S = "S",
  M = "M",
  L = "L",
  XL = "XL",
}

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: {
    main: string;
    sub?: string;
  };
  image: string[];
  colours: string[];
  availability: number;
  sizes: (SizeEnum | number)[];
  createdAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    colours: {
      type: [String],
    },
    availability: {
      type: Number,
      required: true,
      min: 0,
      default: 1
    },
    category: {
      type: {
        main: {
          type: String,
          required: true,
        },
        sub: {
          type: String,
        },
      },
      required: true,
    },
    sizes: {
      type: [Schema.Types.Mixed],
      required: true,
    },
    images: {
        type: [String],
        required: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
