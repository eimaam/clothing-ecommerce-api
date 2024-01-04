import mongoose, { Schema } from "mongoose";
import { IProduct } from "./Product";

interface IFavourite extends Document {
    product: IProduct,
    createdAt: Date
}

const favouriteSchema = new Schema<IFavourite> ({
    product: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
}, { timestamps: true })


export const Favorites = mongoose.models.Favorites || mongoose.model("Favourites", favouriteSchema)