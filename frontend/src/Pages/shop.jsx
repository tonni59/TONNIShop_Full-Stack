import React from "react";
import Hero from '../Components/Hero/Hero';
import Popular from '../Components/Popular/Popular'; // ✅ Add this line
import Offers from '../Components/Offers/Offers'
import NewCollections from "../Components/NewCollections/NewCollections";
import NewsLetter from '../Components/NewsLetter/NewsLetter'

const Shop = () => {
    return (
        <div>
            <Hero></Hero>
            <Popular></Popular>
            <Offers></Offers>
            <NewCollections></NewCollections>
            <NewsLetter></NewsLetter>
        </div>
    )
}

export default Shop;
