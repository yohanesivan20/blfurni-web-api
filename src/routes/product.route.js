import express from "express";
import {
    getProducts,
    getProductByInventoryId,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} from "../controllers/product.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/inventories/:id", getProductByInventoryId);
router.get("/:id", getProductById);
router.post("/create", verifyToken, upload.single("image"), createProduct);
router.put("/:id", verifyToken, upload.single("image"), updateProduct);
router.delete("/:id", verifyToken, deleteProduct);

export default router;