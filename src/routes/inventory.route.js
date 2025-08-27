import express from "express";
import {
    getInventories,
    getInventoryById,
    createInventory,
    updateInventory,
    deleteInventory
} from "../controllers/inventory.controller.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.use(verifyToken);
router.get("/", getInventories);
router.get("/:id", getInventoryById);
router.post("/create", createInventory);
router.put("/:id", updateInventory);
router.delete("/:id", deleteInventory);

export default router;