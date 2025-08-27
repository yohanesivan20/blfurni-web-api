import express from "express";
import {
    getCarts,
    addCart,
    deleteCart,
    deleteAllCart,
} from "../controllers/cart.controller.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.use(verifyToken);
router.get("/", getCarts);
router.post("/add", addCart);
router.delete("/delete/:cartId", deleteCart);
router.post("/delete/all", deleteAllCart);

export default router;