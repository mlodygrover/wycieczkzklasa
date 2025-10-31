import styled from "styled-components"
import React from "react"
import { TravelSlider } from "./offerslider"
export const HomePage = ({trips})=>{
    return(
        <>
        <TravelSlider trips={trips}/>
        </>
    )
}