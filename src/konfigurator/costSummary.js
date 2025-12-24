import React from "react"
import styled from "styled-components"
import { Users, Plane, Shield, Rocket } from 'lucide-react';
import { SaveButton } from "./konfiguratorWyjazduComp";
import { Navigate } from "react-router-dom";

const CostSummaryMainbox = styled.div`
    width: 90%;
    margin: 10px auto;
    min-height: 300px;
    box-shadow: 0 0 5px lightgray;
    border-radius: 15px;
    padding: 20px 0;
    
    .costSummaryTitle{
        text-align: left;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        width: 90%;
        margin: 0 auto 15px auto;
        font-family: 'Inter';
        font-size: 16px;
        font-weight: 500;
        gap: 8px;
    }
    
    .participantsInfo{
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 6px;
        width: 90%;
        margin: 0 auto;
        font-size: 12px;
        color: #606060;
        padding-bottom: 15px;
        border-bottom: 1px solid #e0e0e0;
        margin-bottom: 20px;
    }
`

const CostTilesContainer = styled.div`
    width: 90%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 15px;
`

const CostTile = styled.div`
    background: #fbfbfb;
    border-radius: 10px;
    padding: 16px 20px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    transition: all 0.2s ease;
    border: 1px solid #e6e6e6;
    
`

const TileLeft = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
`

const IconWrapper = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: ${props => props.bg || '#e3f2fd'};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.color || '#1976d2'};
`

const TileInfo = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    text-align: left;
    gap: 2px;
`

const TileLabel = styled.div`
    font-family: 'Inter';
    font-size: 12px;
    color: #606060;
    font-weight: 400;
`

const TileTitle = styled.div`
    font-family: 'Inter';
    font-size: 14px;
    color: #202020;
    font-weight: 400;
`

const TilePrice = styled.div`
    font-family: 'Inter';
    font-size: 14px;
    font-weight: 400;
    color: #202020;
`

const TotalSection = styled.div`
    width: 90%;
    margin: 20px auto 0 auto;
    padding-top: 15px;
    border-top: 1px solid #dee2e6;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
`

const TotalLabel = styled.div`
    font-family: 'Inter';
    font-size: 15px;
    font-weight: 500;
    color: #202020;
`

const TotalPrice = styled.div`
    font-family: 'Inter';
    font-size: 22px;
    font-weight: 600;
    color: #1aa04bff;
    background: #f0fdf4;
    padding: 5px 8px;
    border-radius: 5px;

`

export const CostSummary = ({ tripId="", setRedirecting, handleSaveClick, hasPendingAutoSave, miejsceDocelowe = "Poznań", tripPrice, insurancePrice, liczbaUczestnikow, liczbaOpiekunow }) => {

    const redirectToRealization = async () => {
        try {
            if (hasPendingAutoSave) {
                setRedirecting(true);
                // 🔽 zakładamy, że handleSaveClick zwraca Promise
                await handleSaveClick();
            }

            const url = new URL(window.location.href);
            const params = url.search || ""; // np. "?tripId=123&arr=2025-05-01..."

            const redirectLink = `/realizacja/?tripId=${tripId || ""}`;
            Navigate(redirectLink);
        } finally {
            setRedirecting(false);
        }
    };
    return (
        <CostSummaryMainbox>
            <div className="costSummaryTitle">
                Twój wyjazd do {miejsceDocelowe}
            </div>

            <div className="participantsInfo">
                <Users height='15px' />
                {liczbaUczestnikow || 10} uczestników
                {liczbaOpiekunow ? ` + ${liczbaOpiekunow} opiekunów` : ""}
            </div>

            <CostTilesContainer>
                <CostTile>
                    <TileLeft>
                        <IconWrapper bg="#e3f2fd" color="#1976d2">
                            <Plane size={20} />
                        </IconWrapper>
                        <TileInfo>
                            <TileLabel>Koszt</TileLabel>
                            <TileTitle>Wyjazd</TileTitle>
                        </TileInfo>
                    </TileLeft>
                    <TilePrice>{tripPrice.toLocaleString('pl-PL')} zł</TilePrice>
                </CostTile>

                <CostTile>
                    <TileLeft>
                        <IconWrapper bg="#e8f5e9" color="#388e3c">
                            <Shield size={20} />
                        </IconWrapper>
                        <TileInfo>
                            <TileLabel>Koszt</TileLabel>
                            <TileTitle>Ubezpieczenia</TileTitle>
                        </TileInfo>
                    </TileLeft>
                    <TilePrice>{insurancePrice.toLocaleString('pl-PL')} zł</TilePrice>
                </CostTile>
            </CostTilesContainer>

            <TotalSection>
                <TotalLabel>Suma całkowita</TotalLabel>
                <TotalPrice>{(insurancePrice + tripPrice).toLocaleString('pl-PL')} zł</TotalPrice>
            </TotalSection>
            <SaveButton
                className="b c d"
                onClick={() => redirectToRealization()}

            >
                Realizacja wyjazdu<Rocket size={16} />
            </SaveButton>
        </CostSummaryMainbox>
    )
}
