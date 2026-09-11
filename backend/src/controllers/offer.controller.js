import { Offer } from "../models/offer.model.js";
import { Product } from "../models/product.model.js";
import { ENV } from "../config/env.js";

export async function createOffer(req, res) {
  try {
    if (req.user.role !== "customer") return res.status(403).json({ message: "Only customers can make offers" });

    const { productId, offeredPrice, quantity = 1, message = "" } = req.body;
    const price = Number(offeredPrice);
    const requestedQuantity = Number(quantity);
    if (!productId || !Number.isFinite(price) || price <= 0 || !Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
      return res.status(400).json({ message: "A valid product, price, and quantity are required" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (!product.vendor) return res.status(400).json({ message: "This product is not available for negotiation" });
    if (requestedQuantity > product.stock) return res.status(400).json({ message: "Requested quantity exceeds available stock" });

    const existingOffer = await Offer.findOne({ customer: req.user._id, product: product._id, status: "pending" });
    if (existingOffer) return res.status(409).json({ message: "You already have a pending offer for this product" });

    const offer = await Offer.create({
      customer: req.user._id,
      vendor: product.vendor,
      product: product._id,
      offeredPrice: price,
      quantity: requestedQuantity,
      message: String(message).trim(),
    });

    await offer.populate([
      { path: "product", select: "name price images" },
      { path: "vendor", select: "name email" },
    ]);
    res.status(201).json({ offer });
  } catch (error) {
    console.error("Error creating offer:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getCustomerOffers(req, res) {
  try {
    const offers = await Offer.find({ customer: req.user._id })
      .populate("product", "name price images")
      .populate("vendor", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ offers });
  } catch (error) {
    console.error("Error fetching customer offers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function markCustomerOffersSeen(req, res) {
  try {
    await Offer.updateMany({ customer: req.user._id, customerSeen: false }, { customerSeen: true });
    res.status(200).json({ message: "Offers marked as seen" });
  } catch (error) {
    console.error("Error marking offers seen:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getVendorOffers(req, res) {
  try {
    const filter = req.user.email === ENV.ADMIN_EMAIL ? {} : { vendor: req.user._id };
    const offers = await Offer.find(filter)
      .populate("customer", "name email")
      .populate("vendor", "name email")
      .populate("product", "name price images stock")
      .sort({ status: 1, createdAt: -1 });
    res.status(200).json({ offers });
  } catch (error) {
    console.error("Error fetching vendor offers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateOfferStatus(req, res) {
  try {
    const { status } = req.body;
    if (!["accepted", "rejected"].includes(status)) return res.status(400).json({ message: "Invalid offer status" });

    const offer = await Offer.findById(req.params.offerId).populate("product", "name price images stock vendor");
    if (!offer) return res.status(404).json({ message: "Offer not found" });
    if (req.user.email !== ENV.ADMIN_EMAIL && offer.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You cannot update this offer" });
    }
    if (offer.status !== "pending") return res.status(409).json({ message: "This offer has already been answered" });

    offer.status = status;
    offer.vendorSeen = true;
    offer.respondedAt = new Date();
    await offer.save();
    await offer.populate("customer", "name email");
    res.status(200).json({ offer });
  } catch (error) {
    console.error("Error updating offer:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
