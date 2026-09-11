import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createFlutterwavePayment, verifyFlutterwavePayment } from "../controllers/payment.controller.js";

const router = Router();

router.post("/flutterwave", protectRoute, createFlutterwavePayment);
router.post("/flutterwave/verify", protectRoute, verifyFlutterwavePayment);

export default router;
