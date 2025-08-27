import { PrismaClient } from "@prisma/client";

//Inisialisasi Prisma Client
const prisma = new PrismaClient();

//Export supaya bisa digunakan di file lain
export default prisma;
