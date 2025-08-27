import express from "express";
import {
    getInvoices,
    addInvoice,
    deleteInvoice
} from "../controllers/invoice.controller.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.use(verifyToken);
router.get("/", getInvoices);
router.post("/add", addInvoice);
router.delete("/delete/:id", deleteInvoice);

export default router;