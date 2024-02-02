"use client";

import { differenceInCalendarDays, eachDayOfInterval } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Reservation } from "@prisma/client";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { Range } from "react-date-range";

import { SafeListing, SafeUser, safeReservations } from "@/app/types";
import { categories } from "@/app/components/navbar/Categories";
import Container from "@/app/components/Container";
import ListingHead from "@/app/components/listings/ListingHead";
import ListingInfo from "@/app/components/listings/ListingInfo";
import useLoginModal from "@/app/components/useLoginModal";
import ListingReservation from "@/app/components/listings/ListingReservation";

const initialDataRange = {
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection'
}

interface ListingClientProps{
    reservations?: safeReservations[];
    listing: SafeListing & {
        user: SafeUser
    };
    currentUser?: SafeUser | null;
}

const ListingClient:React.FC<ListingClientProps> = ({
    currentUser,
    listing,
    reservations = [],
}) => {
    const loginModal = useLoginModal();
    const router = useRouter();

    const disabledDates = useMemo(() => {
        let dates: Date[] = [];

        reservations.forEach((reservation: any) => {
            const range = eachDayOfInterval({
                start: new Date(reservation.startDate),
                end: new Date(reservation.endDate)
            });

            dates = [...dates, ...range];
        });

        return dates;
    }, [reservations]);

    const [isloading, setIsLoading] = useState(false);
    const [totalPrice, setTotalPrice] = useState(listing.price);
    const [dataRange, setDataRange] = useState<Range>(initialDataRange);

    const onCreateReservation = useCallback(() => {
        if(!currentUser){
            return loginModal.onOpen();
        }
        setIsLoading(true);

        axios.post('/api/reservations', {
            totalPrice,
            startDate: dataRange.startDate,
            endDate: dataRange.endDate,
            listingId: listing?.id
        })
        .then(() => {
            toast.success("Listing reserved!");
            setDataRange(initialDataRange);
            router.push('/trips');
        })
        .catch(() => {
            toast.error('Something went wrong.',{
                position: "bottom-center"
              });
        })
        .finally(() => {
            setIsLoading(false);
        })
    }, [ totalPrice, dataRange, listing?.id,router, currentUser, loginModal])


    useEffect(() => {
        if(dataRange.startDate && dataRange.endDate){
            const dayCount = differenceInCalendarDays(
                dataRange.endDate,
                dataRange.startDate
            );

            if(dayCount && listing.price){
                setTotalPrice(dayCount * listing.price)
            }else{
                setTotalPrice(listing.price);
            }
        }
    }, [dataRange, listing.price]);

    const category = useMemo(() => {
        return  categories.find((item) => item.label === listing.category);
    }, [ listing.category ]);

    return ( 
        <Container>
            <div className="max-w-screen-lg mx-auto ">
                <div className=" flex flex-col gap-6 ">
                    <ListingHead
                        title={listing.title}
                        imageSrc={listing.imageSrc}
                        locationValue={listing.locationValue}
                        id={listing.id}
                        currentUser={currentUser}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-7 md:gap-10 mt-6">
                        <ListingInfo
                            user={listing.user}
                            category={category}
                            description={listing.description}
                            roomCount = {listing.roomCount}
                            guestCount = {listing.guestCount}
                            bathroomCount = {listing.bathroomCount}
                            locationValue={listing.locationValue}
                        />
                        <div className=" order-first mb-10 md:order-last md:col-span-3 ">
                            <ListingReservation
                                price={listing.price}
                                totalPrice={totalPrice}
                                onChangeDate = {(value) => setDataRange(value)}
                                dataRange={dataRange}
                                onSubmit={onCreateReservation}
                                disabled={isloading}
                                disabledDates={disabledDates}
                            />
                        </div>
                        
                    </div>
                </div>
            </div>

        </Container>
     );
}
 
export default ListingClient;