import { Request, Response } from "express";
import { Product } from "../../models/Product";
import { validateInputData } from "../../utils/validateInput";

export class Products {
  static async createProduct(req: Request, res: Response) {
    const {
      name,
      description,
      price,
      colours,
      availability,
      mainCategory,
      subCategory,
      images,
      sizes,
    } = req.body;

    try {
      const newProduct = {
        name,
        description,
        colours,
        availability,
        category: { main: mainCategory, sub: subCategory },
        images,
        sizes,
        price,
      };

      if (!images.length) {
        return res.status(400).json({ message: "Product/Item missing images" });
      }

      const product = await Product.create(newProduct);

      res.status(201).json({
        status: "ok",
        message: `Item successfully added to ${mainCategory}`,
        product,
      });
    } catch (error) {
      console.error("Server err", error);
      res
        .status(500)
        .json({ message: "There was a problem creating product", error });
    }
  }

  static async getProductById(req: Request, res: Response) {
    const { productId } = req.params;

    try {
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(400).json({ message: "Product not found" });
      }

      res.status(200).json({ message: "Product/Item fetched", product });
    } catch (error) {
      console.error("Error gettiing product/item");
      res.status(500).json({ message: "Internal Server Error.", error });
    }
  }

  static async getProducts(_req: Request, res: Response) {
    try {
      const products = await Product.find();

      if (!products.length) {
        return res.status(400).json({ message: "NO PRODUCT/ITEM ADDED" });
      }

      res.status(200).json({
        status: "ok",
        message: "All products/items fetched",
        products,
      });
    } catch (error) {
      console.error("Error gettiing all products/items");
      res.status(500).json({ message: "Internal Server Error.", error });
    }
  }

  static async updateProduct(req: Request, res: Response) {
    const {
      name,
      description,
      price,
      colours,
      availability,
      mainCategory,
      subCategory,
      images,
      sizes,
    } = req.body;

    try {
      const { productId } = req.params;

      const product = await Product.findById(productId);

      const productData = {
        name,
        description,
        colours,
        availability,
        category: {
          main: mainCategory || product.category.main,
          sub: subCategory || product.category.sub,
        },
        images,
        sizes,
        price,
      };

      if (
        !validateInputData({
          name,
          description,
          price,
          ...colours,
          availability,
          mainCategory,
          subCategory,
          images,
          sizes,
        })
      ) {
        return res
          .status(400)
          .json({ message: "Data contains an empty or invalid field" });
      }

      const _id = productId;

      const updatedProduct = await Product.findByIdAndUpdate(_id, productData, {
        new: true,
        runValidators: true,
      });

      res
        .status(200)
        .json({ message: "Product/Item updated successfully", updatedProduct });
    } catch (error) {
      console.error("Error updating product/item", error);
      res.status(500).json({
        message: "Internal Server Error. Failed to update Product/Item",
        error,
      });
    }
  }

  static async deleteProduct(req: Request, res: Response) {
    const { productId } = req.params;

    try {
      const product = await Product.findByIdAndDelete(productId);

      if (!product) {
        return res.status(400).json({ message: "Product/Item not found" });
      }

      res.status(400).json({ message: "Product/Item deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({
          message:
            "Internal Server Error. There was a problem deleting the item",
        });
    }
  }
}
