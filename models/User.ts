import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

export enum Gender {
  "MALE" = "m",
  "FEMALE" = "f",
  "OTHERS" = "o",
}

export enum AddressType {
  "MAIN" = "main",
  "OTHERS" = "other",
}
interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  type: AddressType;
}

interface IUser extends Document {
  email: string;
  password: string;
  fullName: string;
  gender: Gender;
  addresses: Address[];
  orders: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    enum: ["m", "f", "o"],
  },
  addresses: [
    {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      zip: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
    },
  ],
  orders: [
    {
      type: Schema.Types.ObjectId,
      ref: "Order", // Reference to the Order model
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash the password before saving to the database
userSchema.pre<IUser>("save", async function (next) {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(this.password, saltRounds);
    this.password = hashedPassword;
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords during login
userSchema.methods.comparePassword = async function (userPassword: string) {
  try {
    return await bcrypt.compare(userPassword, this.password);
  } catch (error) {
    throw error;
  }
};

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);
