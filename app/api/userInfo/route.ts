import bcrypt from "bcrypt";

import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

export async function PATCH(
    request: Request
){
    const body = await request.json();
    const {
        name,
        email,
        currentPassword,
        newPassword,
        imageSrc,
        oEmail
    } = body;

    
    const user = await prisma.user.findUnique({
        where:{
            email: oEmail
        }
    })

    if(!user || !user?.hashePassword){
        throw new Error("Invalid credentials");
    }

    const isCorrectPassword = await bcrypt.compare(
        currentPassword,
        user.hashePassword
    )
    
    if(!isCorrectPassword && currentPassword){
        throw new Error("Passwords Mismatch");
    }
    const hashePassword = currentPassword ? await bcrypt.hash(newPassword, 12) : user.hashePassword;

    const updateUser = await prisma.user.update({
        where:{
            email: oEmail
        },
        data:{
            email,
            name,
            hashePassword,
            image:imageSrc
        }
    });

    return NextResponse.json(updateUser);
}