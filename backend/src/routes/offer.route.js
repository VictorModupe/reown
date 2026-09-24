import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
	createOffer,
	getCustomerOffers,
	getVendorOffers,
	markCustomerOffersSeen,
	updateOfferStatus,
} from "../controllers/offer.controller.js";

const router = Router();
router.use(protectRoute);
router.post("/", createOffer);
router.get("/", getCustomerOffers);
router.patch("/seen", markCustomerOffersSeen);
router.get("/vendor", getVendorOffers);
router.patch("/:offerId", updateOfferStatus);

export default router;
