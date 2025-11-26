import styled from "styled-components"
import React, { useEffect, useState } from "react"
import { TravelSlider } from "./offerslider"
import { MenuRadio } from "./components"
import { FeaturesSection } from "./brandTiles"
import DestinationsSlider from "./destinationsSlider"
import { TeacherOfferBanner } from "./teacherBanner"
import ConfiguratorCTA from "./configuratorSlide.js"


const HomePageMainbox = styled.div`
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    postion: relative;
    `
const HomePageHideBox = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    background-color: white;
    width: 100%;
    height: 100%;

`
export const HomePage = () => {
    return (

        <HomePageMainbox >
            <TravelSlider/>
            <FeaturesSection />
            <ConfiguratorCTA />
            <DestinationsSlider />
            <TeacherOfferBanner />

        </HomePageMainbox>
    )
}