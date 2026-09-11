import { ENV } from "../config/env.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";

export async function createFlutterwavePayment(req, res) {
  try {
    if (!ENV.FLUTTERWAVE_SECRET_KEY) {
      return res.status(503).json({ error: "Flutterwave is not configured. Set FLUTTERWAVE_SECRET_KEY in backend/.env." });
    }

    const { cartItems, shippingAddress } = req.body;
    if (!cartItems?.length) return res.status(400).json({ error: "Cart is empty" });

    let subtotal = 0;
    const orderItems = [];
    for (const item of cartItems) {
      const product = await Product.findById(item.product._id);
      if (!product) return res.status(404).json({ error: `Product ${item.product.name} not found` });
      if (product.stock < item.quantity) return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      subtotal += product.price * item.quantity;
      orderItems.push({ product: product._id, name: product.name, price: product.price, quantity: item.quantity, image: product.images[0] });
    }

    const total = subtotal + 10 + subtotal * 0.08;
    const user = req.user;
    const response = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: { Authorization: `Bearer ${ENV.FLUTTERWAVE_SECRET_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        tx_ref: `reown-${user._id}-${Date.now()}`,
        amount: total.toFixed(2),
        currency: "USD",
        redirect_url: "https://flutterwave.com/rn-redirect",
        customer: { email: user.email, name: user.name },
        customizations: { title: "Reown checkout" },
        meta: { userId: user._id.toString(), clerkId: user.clerkId, orderItems, shippingAddress, totalPrice: total.toFixed(2) },
      }),
    });
    const result = await response.json();
    if (!response.ok || result.status !== "success") return res.status(502).json({ error: result.message || "Unable to start Flutterwave checkout" });
    return res.status(200).json({ paymentLink: result.data.link });
  } catch (error) {
    console.error("Error creating Flutterwave payment:", error);
    return res.status(500).json({ error: "Failed to create Flutterwave payment" });
  }
}

export async function verifyFlutterwavePayment(req, res) {
  try {
    if (!ENV.FLUTTERWAVE_SECRET_KEY) return res.status(503).json({ error: "Flutterwave is not configured" });
    const transactionId = req.body?.transactionId;
    if (!transactionId) return res.status(400).json({ error: "Flutterwave transaction is missing" });

    const response = await fetch(`https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transactionId)}/verify`, {
      headers: { Authorization: `Bearer ${ENV.FLUTTERWAVE_SECRET_KEY}` },
    });
    const result = await response.json();
    const transaction = result.data;
    if (!response.ok || result.status !== "success" || transaction?.status !== "successful") {
      return res.status(400).json({ error: "Flutterwave payment was not successful" });
    }

    const metadata = transaction.meta || {};
    if (metadata.userId !== req.user._id.toString()) return res.status(403).json({ error: "Payment user mismatch" });
    const existingOrder = await Order.findOne({ "paymentResult.id": String(transaction.id) });
    if (existingOrder) return res.status(200).json({ orderId: existingOrder._id, status: "success" });

    const order = await Order.create({
      user: metadata.userId,
      clerkId: metadata.clerkId,
      orderItems: metadata.orderItems,
      shippingAddress: metadata.shippingAddress,
      paymentResult: { id: String(transaction.id), status: "succeeded" },
      totalPrice: Number(metadata.totalPrice),
    });
    for (const item of metadata.orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }
    return res.status(200).json({ orderId: order._id, status: "success" });
  } catch (error) {
    console.error("Error verifying Flutterwave payment:", error);
    return res.status(500).json({ error: "Failed to verify Flutterwave payment" });
  }
}