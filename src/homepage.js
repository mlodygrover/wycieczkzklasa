import styled from "styled-components"
import React from "react"
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
    `
export const HomePage = ({ trips }) => {
    return (
        <HomePageMainbox>
            <TravelSlider trips={trips} />
            <FeaturesSection />
            <ConfiguratorCTA/>
            <DestinationsSlider />
            <TeacherOfferBanner />
            
        </HomePageMainbox>
    )
}