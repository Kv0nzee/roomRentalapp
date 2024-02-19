import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from '@/app/libs/prismadb';

interface IParams{
    listingId?: string;
}

export async  function POST(
    request:Request,
    { params } : { params: IParams}
){
    const currentUser = await getCurrentUser();

    if(!currentUser){
        return NextResponse.error();
    }

    const { listingId } = params;

    if(!listingId || typeof listingId !== 'string'){
        throw new Error("Invalid ID");
    }

    let favoriteids = [...(currentUser.favoriteids || [])];

    favoriteids.push(listingId);

    const user = await prisma.user.update({
        where: {
          id: currentUser.id
        },
        data: {
          favoriteids
        }
    });
    

    return NextResponse.json(user);
}

export async function DELETE(
    request: Request,
    { params } : { params: IParams}
){
    const currentUser = await getCurrentUser();

    if(!currentUser){
        return NextResponse.error();
    }

    const { listingId } = params;
    
    if(!listingId || typeof listingId !== 'string'){
        throw new Error("Invalid ID");
    }

    let favoriteids = [...(currentUser.favoriteids || [])];

    favoriteids = favoriteids.filter((id) => id !== listingId);

    const user = await prisma.user.update({
        where: {
            id: currentUser.id
        },
        data: {
            favoriteids
        }
    });

    return NextResponse.json(user);
}