import React, { useEffect } from "react";
import styled from "styled-components";
import { AddGuidePopup } from "../roots/addGuidePopup";

const AlertsOutbox = styled.div`
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        min-height: 100vh;
        background-color: rgba(12, 3, 59, 0.31);
        z-index: 501;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.3s ease-in-out;
        overflow-y: auto; /* ✅ pozwól przewijać cały overlay (lub zamień na hidden, jeśli chcesz tylko scroll w środku) */
        backdrop-filter: blur(3px);
        -webkit-backdrop-filter: blur(3px);
    .alertsBoxMainbox {
        min-width: 300px;
        max-height: 90vh; /* 🔹 ograniczenie wysokości */
        overflow-y: auto; /* ✅ tu dodaj scroll */
        background-color: #232531;
        color: #bcbeca;
        font-family: Inter, system-ui, -apple-system, sans-serif;
        border-radius: 25px;
        padding: 30px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        justify-content: flex-start; 
        box-shadow: 0px 4px 20px rgba(3, 0, 46, 1);
        font-size: 16px;
        text-align: center;
        cursor: pointer;    
        @media screen and (max-width: 600px){
            width: 100%;
            min-width: 150px;
        }
        .wypelniacz{
            flex: 1;
        }
        .alertsBoxTitle{
            width: 95%;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            gap: 10px;
            font-size: 18px;
            padding-bottom: 10px;
            border-bottom: 1px solid #bcbeca;
        }
        .errorMainbox{
            background-color: #343642;
            
            max-width: 400px;
            width: 95%;
            margin: 0 auto;
            padding: 10px 15px;
            padding-left: 0px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            border-left: 5px solid #d20d03;
            text-align: left;
            box-sizing: border-box;
            .errorIcon{
                width: 50px;
                height: 50px;
                color: #d20d03;
                margin: auto 5px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

        }
        .routeTileWrapper{
            width: 95%;
            max-width: 400px;
            min-height: 300px;
            border-radius: 20px;
            padding-left: 5px;
            box-sizing: border-box;
            background: linear-gradient(0deg, rgba(184, 104, 0, 1) 0%, rgba(219, 187, 72, 1) 100%);
            display: flex;
            align-items: stretch;
            justify-content: stretch;
            overflow: hidden;
            box-sizing: border-box;

            .googleLogoDiv{
                width: 90%;
                text-align: center;
                margin: 10px auto; 
                padding-left:10px;
            }
            .routeTile{
                padding: 10px 2px;
                background-color: #343642;
                border-radius: 20px;
                width: 100%;
            }
        }
       
        .continueButton{
            background-color: #008d73ff;
            width: 95%;
            max-width: 400px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 5px;
            color: #a2ffeeff;
            cursor: pointer;
            transition: 0.3s ease;
            &:hover{
                background-color: #007c62ee;
            }
        }
        .routeSummaryRow{
            box-sizing: border-box;
            padding: 10px;
            border-radius: 10px;
           
            width: 90%;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;
            background-color: #2325315f;
            margin: 2px auto;
            gap: 5px;
            text-align: left;
            .routeSummaryRowContent{
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: center;
                font-size: 12px;
                a{
                    text-align: left;
                font-weight: 600;
                }
                
            }
        }
        .first{
            margin-top: 10px;
            box-shadow: 0px 0px 10px #61688dff;
        }
    }   

`;

export const AlertsBox = ({ alertsTable, deleteAlert }) => {

    // 🔹 Zablokuj scrollowanie tła, gdy alert jest otwarty
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);
    if (!alertsTable?.length) return null;


    return (
        <AlertsOutbox>

            <div
                className="alertsBoxMainbox"

            >
                <div className="alertsBoxTitle">
                    <img src="../icons/icon-info.svg" height="25px" />Informacje
                </div>
                {alertsTable.map((alert, idx) => (
                    alert.type == "error" ?
                        <div className={idx == 0 ? "errorMainbox first" : "errorMainbox"} key={`${idx}idx${alert}`}>
                            <div className="errorIcon">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="w-6 h-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                                    ></path>
                                </svg>
                            </div>

                            {alert.content}
                        </div> :
                        alert.type == "route"
                            ?
                            <div className={idx == 0 ? "routeTileWrapper first" : "routeTileWrapper"} key={`${idx}idx${alert}`}>

                                <div className="routeTile">

                                    {alert.route.map((routePart, idx) => (
                                        <div className="routeSummaryRow" key={`${routePart.type}_${idx}`}>
                                            <img src={routePart.type == "WALK" ? "../icons/pedestrian-white.svg" : routePart?.vehicleType == "TRAM" ? "../icons/tram.svg" : "../icons/train-white.svg"} height={'20px'} />
                                            {routePart.type == "WALK" ? <div className="routeSummaryRowContent">{routePart.instructions}</div> : <div className="routeSummaryRowContent">{routePart.departureStop} - {routePart.arrivalStop}</div>}
                                        </div>
                                    ))}
                                    <div className="googleLogoDiv">
                                        <img src="googlelogo-white.svg" />
                                    </div>
                                </div>
                            </div>
                            :
                            alert.type=="guidance" ? 
                            <AddGuidePopup/>
                            : "Błąd odczytu"

                ))}
                {/*alertsTable[0].type = "error" &&
                    <div className="errorMainbox">
                        <div className="errorIcon">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                                ></path>
                            </svg>
                        </div>

                        {alertsTable[0].content}
                    </div>

                */}

                <div className="wypelniacz">

                </div>

                <div className="continueButton" onClick={() => deleteAlert(alertsTable[0].id)}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-6 h-6"
                        height="90%"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m4.5 12.75 6 6 9-13.5"
                        ></path>
                    </svg>
                </div>
            </div>
        </AlertsOutbox>
    );
};
