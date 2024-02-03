import EmptyState from "../components/EmptyState";
import ClientOnly from "../components/ClientOnly";

import getCurrentUser from "../actions/getCurrentUser";
import getFavoriteList from "../actions/getFavoriteList";
import FavoritesClient from "./FavoritesClient";

const ListingPage = async () => {
    const currentUser = await getCurrentUser();
    const listings = await getFavoriteList();

    if(!currentUser){
        return(
            <ClientOnly>
                <EmptyState
                    title="Unauthorized"
                    subtitle="Please login"
                />
            </ClientOnly>
        );
    }

    if(listings.length === 0){
        return(
            <ClientOnly>
                <EmptyState
                    title="No favorites found"
                    subtitle="Looks like you have no favorite listings."
                />
            </ClientOnly>
        );
    }

    return ( 
        <ClientOnly>
            <FavoritesClient
                listings={listings}
                currentUser={currentUser}
            />
        </ClientOnly>
     );
}
 
export default ListingPage;
