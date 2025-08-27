import prisma from "../config/prisma.js";
import { successResponse, failedResponse } from "../utils/response.js";

export const getInventories = async (req, res) => {
    const inventories = await prisma.inventory.findMany();
    return successResponse(res, "Successfully fetch data inventory", inventories, 200);
}

export const getInventoryById = async (req, res) => {
    const { id } = req.params;
    const inventories = await prisma.inventory.findUnique({ where: {id} });
    if(!inventories) return failedResponse(res, "Data inventory not found", null, 401);

    return successResponse(res, "Successfully fetch data inventory", inventories, 200);
}

export const createInventory = async (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) return failedResponse(res, "Data cannot be empty", null, 401);

    try {
        const inventory = await prisma.inventory.create({
            data: {name, description}
        });

        return successResponse(res, "New inventory created", inventory, 200);
    } catch (error) {
        return failedResponse(res, "Server error", error.message, 500);
    }
}

export const updateInventory = async (req, res) => {
    const { id } = req.params;
    
    const { newName, newDescription } = req.body;

    if (!newName || !newDescription ) return failedResponse(res, "New data cannot be empty", null, 401);

    try {
        //Cek apakah inventory dengan id tersebut ada
        const existingInventory = await prisma.inventory.findUnique({
            where: { id: id }
        });

        if(!existingInventory) {
            return failedResponse(res, "Inventory not found", null, 404);
        }

        const inventory = await prisma.inventory.update({
            where: { id: id },
            data: { 
                name: newName,
                description: newDescription 
            }
        });

        return successResponse(res, "Inventory updated successfully", inventory, 200);
    } catch (error) {
        return failedResponse(res, "Server error", error.message, 500);
    }
}

export const deleteInventory = async (req, res) => {
    const { id } = req.params
    
    try {
        //Cek apakah inventory dengan id tersebut ada
        const existingInventory = await prisma.inventory.findUnique({
            where: { id: id }
        });

        if(!existingInventory) {
            return failedResponse(res, "Inventory not found", null, 404);
        }

        //Delete Inventory
        await prisma.inventory.delete({ where : {id: id} });

        return successResponse(res, "Inventory deleted successfully", null, 200);
    } catch (error) {
        return failedResponse(res, "Server error", error.message, 500);
    }
}