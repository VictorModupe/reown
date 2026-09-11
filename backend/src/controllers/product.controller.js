import { Product } from "../models/product.model.js";

export async function getCatalogProducts(_, res) {
  try {
    const products = await Product.find().populate("vendor", "name email").sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching catalog products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
