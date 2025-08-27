import prisma from "../config/prisma.js";
import { successResponse, failedResponse } from "../utils/response.js";

export const getInvoices = async (req, res) => {
    try {
        const userId = req.user.id;
        const invoices = await prisma.invoice.findMany({ where : {userId:userId}});

        if(!invoices || invoices.length === 0) return failedResponse(res, "Tidak ada invoice yang tersedia", null, 404);

        return successResponse(res, "Invoice ditemukan", invoices, 200);
    } catch(error) {
        return failedResponse(res, "Server error", error.message, 500);
    }
}

export const addInvoice = async (req, res) => {
    try {
        const { phone } = req.body;
        const userId = req.user.id;
        
        const allCart = await prisma.cart.findMany({where : {userId:userId}})

        if(!allCart || allCart.length === 0) return failedResponse(res, "Tidak ada keranjang yang tersedia", null, 404);

        const user = await prisma.user.findFirst({ where : {id:userId}});
        
        let totalPrice = 0;
        const allCartItems = [];

        for (const cart of allCart) {
            const product = await prisma.product.findUnique({
                where: {id:cart.productId},
                select: {
                    name: true,
                    price: true,
                    stock: true
                }
            });

            if(product) {
                allCartItems.push({
                    productId: cart.productId,
                    productName: product.name,
                    quantity: cart.quantity,
                    price: product.price
                });
            }

            //Hitung total harga
            totalPrice = totalPrice + cart.total;

            //Update stock product
            const updatedStock = product.stock - cart.quantity;

            if(updatedStock < 0) return failedResponse(res, `Stok produk ${product.name} tidak mencukupi`, null, 400);

            await prisma.product.update({
                where: { id:cart.productId},
                data: {
                    stock: updatedStock
                }
            });
        }

        const jsonCartItems = JSON.stringify(allCartItems);        

        //Buat invoice
        const invoice = await prisma.invoice.create({
            data: {
                email: user.email,
                name: user.name,
                phone: phone,
                items: jsonCartItems,
                total: totalPrice,
                date: new Date(),
                userId: user.id
            }
        }); 
        
        return successResponse(res, "Berhasil membuat invoice", invoice, 200);
    } catch(error) {
        console.error(error);
        return failedResponse(res, "Server error", error.message, 500);
    }
}

export const deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        
        //Cek if invoice exist
        const invoice = await prisma.invoice.findUnique({ where: {id} });
        if(!invoice) return failedResponse(res, "Invoice not found", null, 404);

        await prisma.invoice.delete({ where: {id} });

        return successResponse(res, "Invoice deleted successfully", null, 200);
    } catch (error) {
        console.error(error);
        return failedResponse(res, "Server error", error.message, 500);
    }
}