import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { successResponse, failedResponse } from "../utils/response.js";
import cookieOptions from "../utils/cookiesOptions.js";

//API Register
export const register = async (req, res) => {
    const { name, email, password } = req.body;
    
    //Cek jika email sudah digunakan
    const existedMail = await prisma.user.findUnique({where: {email}});
    if(existedMail) return failedResponse(res, "Email is already in use", null, 400);

    //Hashing password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    //Save data to User Database
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword
        }
    });

    return successResponse(res, "Successfully registered", {
        id: user.id,
        name: user.name,
        email: user.email
    }, 200);
}
//API Login
export const login = async (req, res) => {
    const { email, password } = req.body;

    //Cari data user
    const findUser = await prisma.user.findUnique({ where: {email} });
    if( !findUser ) return failedResponse(res, 'Email not found', null, 401);

    //Cocokan password
    const passwordMatch = await bcrypt.compare(password, findUser.password);
    if( !passwordMatch ) return failedResponse(res, 'Wrong password', null, 401);

    //Buat JWT Token
    const JWT_SECRET = process.env.JWT_SECRET;
    const token = jwt.sign({ id: findUser.id }, JWT_SECRET, {expiresIn: "1d"});

    res.cookie("token", token, cookieOptions);

    return successResponse(res, "Login successfully", {
        userId: findUser.id,
        email: findUser.email,
        token: token
    });

}
//API Logout
export const logout = async (req, res) => {
    res.clearCookie("token",{
        ...cookieOptions(req),
        maxAge: undefined, //
    });

    return successResponse(res, "Logout successfully")
}