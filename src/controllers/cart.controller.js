import prisma from "../config/prisma.js";
import { successResponse, failedResponse } from "../utils/response.js"

export const getCarts = async (req, res) => {
    try {
        const userId = req.user.id;
        const carts = await prisma.cart.findMany({ where : {userId:userId}});
        
        if(!carts || carts.length === 0) return failedResponse(res, "Keranjang anda kosong", null, 404);

        return successResponse(res, "Keranjang ditemukan", carts, 200);
    } catch (error) {
        return failedResponse(res, "Server error", error.message, 500);
    }
}

export const addCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.id;

        const existCart = await prisma.cart.findFirst({
            where: { productId, userId }
        });

        const product = await prisma.product.findUnique({ where : { id: productId }});

        if(!product) return failedResponse(res, "Product not found", null, 404);

        if(existCart) {
            const updatedQty = existCart.quantity + quantity;

            if(updatedQty > product.stock) return failedResponse(res, "Insufficient product stock", `Available stock: ${product.stock}`, 400);

            const updatedTotal = updatedQty * product.price;

            const cart = await prisma.cart.update({
                where: { id: existCart.id },
                data: {
                    quantity: updatedQty,
                    total: updatedTotal
                }
            });
            
            return successResponse(res, "Product successfully added to cart", cart, 200);
        } else {
            if (quantity > product.stock) return failedResponse(res, "Insufficient product stock", `Available stock: ${product.stock}`, 400);

            const totalPrice = product.price * quantity;
            const cart = await prisma.cart.create({
                data: {
                    productId,
                    quantity,
                    total: totalPrice,
                    userId
                }
            });

            return successResponse(res, "Product successfully added to cart", cart, 200);
        }
    } catch (error) {
        console.error(error);
        return failedResponse(res, "Server error", error.message, 500);
    }
}

export const deleteCart = async (req, res) => {
    try {
        const { cartId } = req.params;

        const existingCarts = await prisma.cart.findFirst({ where : {id:cartId}})
        
        if(!existingCarts) {
            return failedResponse(res, "Cart not found", null, 404);
        } else {
            await prisma.cart.delete({ where: {id:cartId}});

            return successResponse(res, "Cart successfully deleted", null, 200);
        }
    } catch (error) {
        console.error(error);
        return failedResponse(res, "Server error", error.message, 500);
    }
}

export const deleteAllCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const existingCarts = await prisma.cart.findMany({ where : {userId: userId}});
        
        if(!existingCarts) {
            return successResponse(res, "Cart is empty", null, 200)
        } else {
            await prisma.cart.deleteMany({ 
                where: {userId: userId}
            });

            return successResponse(res, "All products successfully removed from your cart", null, 200);
        }
    } catch (error) {
        console.error(error);
        return failedResponse(res, "Server error", error.message, 500);
    }
}