import prisma from "../config/prisma.js";
import fs from "fs";
import path from "path";
import { successResponse, failedResponse } from "../utils/response.js";
import { cleanImageUrl } from "../utils/imageHelper.js";

//Get All Products
export const getProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: {inventory:true} //Join ke table inventory
        });
        const base = `${req.protocol}://${req.get("host")}`;
        const productWithImageUrl = products.map((product) => ({
            ...product,
            image: product.image? cleanImageUrl(base, product.image) : null,
        }));

        return successResponse(res, "Successfully fetch all products", productWithImageUrl, 200);
    } catch (error) {
        return failedResponse(res, "Server error", error.message, 500);
    }
}

//Get Product By Inventory ID
export const getProductByInventoryId = async (req, res) => {
    try {
        const { id } = req.params; //get inventory id from url params
        const productsByInventory = await prisma.product.findMany({
            where: {inventoryId:id} //join ke table inventory
        });

        //Cek if exists
        if(!productsByInventory || productsByInventory.length === 0) {
            return failedResponse(res, "No products found for this inventory", null, 404);
        }

        const base = `${req.protocol}://${req.get("host")}`;
        const productWithImageUrl = productsByInventory.map((product) => ({
            ...product,
            image: product.image? cleanImageUrl(base, product.image) : null,
        }));

        return successResponse(res, "Successfully fetch all products by inventoryId", productWithImageUrl, 200);

    } catch (error) {
        return failedResponse(res, "Server error", error.message, 500);
    }
}

//Get Product By ID
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params; //Ambil product id dari url params
        const product = await prisma.product.findUnique({ where: {id} });

        if(!product) {
            return failedResponse(res, "Product not found", null, 404);
        }

        const base = `${req.protocol}://${req.get("host")}`;
        const productWithImageUrl = {
            ...product,
            image: product.image? cleanImageUrl(base, product.image) : null,
        };

        return successResponse(res, "Successfully fetch product by id", productWithImageUrl, 200);
    } catch (error) {
        return failedResponse(res, "Server error", error.message, 500);
    }
}

//Create Product
export const createProduct = async (req, res) => {
    try {
        const { name, price, stock, description, inventoryId } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : null;

        const product = await prisma.product.create({
            data: {
                name, 
                price: parseFloat(price),
                stock: parseInt(stock),
                description,
                image,
                inventoryId
            }
        });

        const baseUrl = `${req.protocol}://${req.get("host")}`;
        return successResponse(res, "Product successfull created", {
            ...product,
            image: product.image? `${baseUrl}${product.image}` : null,
        });

    } catch (error) {
        return failedResponse(res, "Server error", error.message, 500);
    }
}

//Update Product
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params; 
        const { newName, newPrice, newStock, newDescription, newInventoryId } = req.body;
        const image = req.file;

        //Cek if product exists
        const product = await prisma.product.findUnique({ where: {id} });
        if(!product) return failedResponse(res, "Product not found", null, 404);

        //Hapus file lama jika ada image baru
        if(!image && product.image) {
            const oldImagePath = path.join(
                process.cwd(), //Ganti __dirname dengan process.cwd
                "uploads",
                path.basename(product.image)
            );

            fs.unlink(oldImagePath, (err) => {
                if (err) {
                    console.warn("Gagal hapus file lama:", oldImagePath);
                } else {
                    console.log("File lama terhapus:", oldImagePath);
                }
            });

            const updatedData = {
                name: newName,
                price: parseFloat(newPrice),
                stock: parseInt(newStock),
                description: newDescription,
                inventoryId: newInventoryId
            };

            if(image) updatedData.image = image;

            const updatedProduct = await prisma.product.update({
                where: { id },
                data: updatedData
            });

            //URL Dinamis
            const baseUrl = `${req.protocol}://${req.get("host")}`;

            return successResponse(res, "Product successfully updated", {
                ...updatedProduct,
                image: updatedProduct.image ? `${baseUrl}${updatedProduct.image}` : null
            }, 200);
        }
    } catch (error) {
        return failedResponse(res, "Server error", error.message, 500);
    }
}

//Delete Product
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        //Cek if product exist
        const product = await prisma.product.findUnique({ where: {id} });
        if(!product) return failedResponse(res, "Product not found", null, 404);

        await prisma.product.delete({ where: {id} });
        
        return successResponse(res, "Product deleted successfully", null, 200);
    } catch (error) {
        return failedResponse(res, "Server error", error.message, 500);
    }
}