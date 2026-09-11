import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getCatalogProducts, getProductById } from "../controllers/product.controller.js";

const router = Router();

router.get("/", protectRoute, getCatalogProducts);
router.get("/:id", protectRoute, getProductById);

export default router;
