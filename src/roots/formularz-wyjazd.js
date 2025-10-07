import React, { useState, useEffect, useMemo } from 'react';
import styled, {keyframes, css} from 'styled-components';
import { InputText1 } from './inputtext1';
import { RadioStars } from '../components';
import { TransportChoice } from './TransportChoice';
import Checkbox1 from './checkbox1';
import ChoiceInput1 from './choiceinput1';
export const FormularzWyborMiasta = () =>{

    return(
        
        
            <div className='FormularzRightWyjazd-mainbox b'>
                <a>Wybrane miasto</a>
                <a style={{fontWeight: '600', fontSize: '30px'}}>Poznań</a>
                <img
                    src="/miasta/poznan.jpg"
                    style={{ width: "200px", height: "200px", objectFit: "cover" }}
                    alt="Poznań"
                />
            </div>

            
    )
}
export const FormularzRightWyjazd = () =>{

    const [startDate, setStartDate] = useState(() => localStorage.getItem("startDate") || "");
    const [endDate, setEndDate] = useState(() => localStorage.getItem("endDate") || "");
    const [partNum, setPartNum] = useState(() => localStorage.getItem("partNum") || 1);
    const [supNum, setSupNum] = useState(() => localStorage.getItem("supNum") || 0);
    const [standardHotel, setStandardHotel] = useState(() => {
        const stored = localStorage.getItem("standardHotel");
        return stored !== null ? Number(stored) : 1;
    });
    const [standardTransport, setStandardTransport] = useState(() => {
        
        const stored = localStorage.getItem("standardTransport");
        console.log("test115", stored)
        return stored !== null ? Number(stored) : 1;
    });
    const [chosenMeal, setChosenMeal] = useState(() => localStorage.getItem("chosenMeal") || "brak");
    const [ifPilot, setIfPilot] = useState(() => {
        const stored = localStorage.getItem("ifPilot");
        return stored !== null ? JSON.parse(stored) : false;
    });

    useEffect(() => {
        localStorage.setItem("startDate", startDate);
      }, [startDate]);
    
      useEffect(() => {
        localStorage.setItem("endDate", endDate);
      }, [endDate]);
    
      useEffect(() => {
        localStorage.setItem("partNum", partNum);
      }, [partNum]);
    
      useEffect(() => {
        localStorage.setItem("supNum", supNum);
      }, [supNum]);
    
      useEffect(() => {
        localStorage.setItem("standardHotel", standardHotel);
      }, [standardHotel]);
    
      useEffect(() => {
        localStorage.setItem("standardTransport", standardTransport);
        console.log("test111", standardTransport)
      }, [standardTransport]);
    
      useEffect(() => {
        localStorage.setItem("chosenMeal", chosenMeal);
      }, [chosenMeal]);
    
      useEffect(() => {
        localStorage.setItem("ifPilot", ifPilot);
      }, [ifPilot]);

    useEffect(() =>{
        if(startDate !== "" &&  endDate < startDate || endDate === "")
        {
            setEndDate(startDate);
        }
    }, [startDate, endDate])
    const presetPartNum = (a) =>{
        if(a<100 && a > 0)setPartNum(a);
    }
    const presetSupNum = (a) =>{
        if(0<=a && a<20)setSupNum(a);
    }
    return(
    <>
        <div className='FormularzRightWyjazd-mainbox'>
    <div className='ParaRow'>
            <div className='para'>
                <a>Data wyjazdu <svg fill="#000000" width="20px" height="20px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.842 15.296a1.61 1.61 0 0 0 1.892-1.189v-.001a1.609 1.609 0 0 0-1.177-1.949l-4.576-1.133L9.825 4.21l-2.224-.225 2.931 6.589-4.449-.449-2.312-3.829-1.38.31 1.24 5.52 15.211 3.17zM3 18h18v2H3z"/></svg></a>
                <InputText1 typ={"date"} value={startDate} onChange={(e) => setStartDate(e.target.value)}/>
            </div>
            <div className='para'>
                <a>Data powrotu<svg fill="#000000" width="20px" height="20px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 18h18v2H3zm18.509-9.473a1.61 1.61 0 0 0-2.036-1.019L15 9 7 6 5 7l6 4-4 2-4-2-1 1 4 4 14.547-5.455a1.611 1.611 0 0 0 .962-2.018z"/></svg></a>
                <InputText1 typ={"date"} value={endDate} onChange={(e) => setEndDate(e.target.value)}/>
            </div>
    </div>
    <div className='ParaRow'>
            <div className='para b'>
                <a>Liczba uczestników 
                    <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 7.16C17.94 7.15 17.87 7.15 17.81 7.16C16.43 7.11 15.33 5.98 15.33 4.58C15.33 3.15 16.48 2 17.91 2C19.34 2 20.49 3.16 20.49 4.58C20.48 5.98 19.38 7.11 18 7.16Z" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M16.9699 14.44C18.3399 14.67 19.8499 14.43 20.9099 13.72C22.3199 12.78 22.3199 11.24 20.9099 10.3C19.8399 9.59004 18.3099 9.35003 16.9399 9.59003" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M5.96998 7.16C6.02998 7.15 6.09998 7.15 6.15998 7.16C7.53998 7.11 8.63998 5.98 8.63998 4.58C8.63998 3.15 7.48998 2 6.05998 2C4.62998 2 3.47998 3.16 3.47998 4.58C3.48998 5.98 4.58998 7.11 5.96998 7.16Z" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M6.99994 14.44C5.62994 14.67 4.11994 14.43 3.05994 13.72C1.64994 12.78 1.64994 11.24 3.05994 10.3C4.12994 9.59004 5.65994 9.35003 7.02994 9.59003" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 14.63C11.94 14.62 11.87 14.62 11.81 14.63C10.43 14.58 9.32996 13.45 9.32996 12.05C9.32996 10.62 10.48 9.46997 11.91 9.46997C13.34 9.46997 14.49 10.63 14.49 12.05C14.48 13.45 13.38 14.59 12 14.63Z" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9.08997 17.78C7.67997 18.72 7.67997 20.26 9.08997 21.2C10.69 22.27 13.31 22.27 14.91 21.2C16.32 20.26 16.32 18.72 14.91 17.78C13.32 16.72 10.69 16.72 9.08997 17.78Z" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    
                </a>
                <InputText1 typ={"number"} maxlen={'30px'} value={partNum} onChange={(e) => presetPartNum(e.target.value)}/>
            </div>
            
            <div className='para b'>
                <a>Liczba opiekunów 
                    <svg height="20px" width="20px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" 
                        xmlnsXlink="http://www.w3.org/1999/xlink" 
                        viewBox="0 0 51.742 51.742" 
                        xmlSpace="preserve">
                    <g>
                        <g>
                        <ellipse style={{ fill: "#010002" }} cx="27.864" cy="4.52" rx="4.306" ry="4.355" />

                            <path style={{fill:"#010002"}} d="M38.599,16.262c-0.929-2.036-2.109-3.97-3.875-5.369c-0.189-0.15-0.388-0.25-0.586-0.327
                                c-0.014-0.016-0.021-0.035-0.035-0.05c-2.656-1.349-8.126-1.001-10.905-0.602c-0.171,0.001-0.35,0.019-0.544,0.073
                                c-0.108,0.03-0.218,0.046-0.327,0.07c-0.073,0.014-0.155,0.028-0.219,0.042v0.006c-1.541,0.29-3.127,0.044-4.62-0.451
                                c-0.776-1.708-1.385-3.494-1.699-5.348c-0.016-0.094-0.046-0.175-0.071-0.261l-0.787-3.578c-0.071-0.321-0.386-0.524-0.703-0.452
                                c-0.318,0.071-0.52,0.39-0.448,0.711l0.426,1.941c-1.25-0.224-2.723,0.643-2.445,2.285c0.322,1.9,0.886,3.771,1.635,5.543
                                c0.417,0.986,0.803,2.316,1.886,2.742c2.036,0.799,4.39,1.314,6.607,1.074l-0.081,1.552c0.004,3.194,0.021,15.185,0.021,15.354
                                l0.083,17.986c0,1.376,1.133,2.491,2.531,2.491s2.533-1.115,2.533-2.491v-17.43c0,0-0.023-0.859,0.867-0.85
                                c0.891,0.01,0.972,0.893,0.972,0.893v17.436c0,1.375,1.133,2.49,2.531,2.49c1.4,0,2.396-1.115,2.396-2.49V32.517l-0.007-2.652
                                c1.977-1.283,3.517-3.137,4.621-5.229c0.606-1.149,1.658-2.755,1.658-4.122C40.015,19.118,39.154,17.479,38.599,16.262z
                                M35.712,20.751c-0.271,0.611-0.55,1.223-0.878,1.805c-0.343,0.606-0.712,1.184-1.114,1.731l-0.021-8.473
                                c0.979,1.381,1.664,2.996,2.133,4.621C35.806,20.525,35.767,20.628,35.712,20.751z M35.88,20.256
                                C35.879,20.046,35.923,20.049,35.88,20.256L35.88,20.256z"/>
                        </g>
                    </g>
                </svg>
                </a>
                <InputText1 typ={"number"} maxlen={'30px'} value={supNum} onChange={(e) => presetSupNum(e.target.value)}/>
            </div>
    </div>
    <div className='ParaRow'>
            <div className='Para K'>
                <div className='para b'>
                <a>Standard hotelu
                    <img src="/icons/icon-hotel.svg"/>
                    </a>
                    <RadioStars onChange={(val) => setStandardHotel(val)} value={standardHotel} />
                    



                </div>
                <a className='info-hotel'><img src="icons/icon-info.svg"/>{standardHotel == 1 ? "Ośrodki kolonijne" : standardHotel == 2 ? "Hotele 2-3 gwiazdkowego standardu" : "Hotele standardu high end" }</a>
            </div>
            <div className='Para K'>
                <div className='para b'>
                <a>Rodzaj transportu
                    <img src="/icons/icon-transport.svg" height={'20px'}/>
                    </a>
                    <TransportChoice onChange={(val) => setStandardTransport(val)} value={standardTransport}/>
                    



                </div>
                <a className='info-hotel'><img src="icons/icon-info.svg"/>{standardTransport == 1 ? "Wynajęty autokar" : standardTransport == 2 ? "Transport zbiorowy" : "Transport we własnym zakresie" }</a>
            </div>
    </div>
    <div className='ParaRow'>
            <div className='para'>
                <a>Opcje posiłków <img src="icons/icon-meal.svg" height={'20px'}/>  </a>
                <ChoiceInput1 onChange={(e) => setChosenMeal(e.target.value)} value={chosenMeal}/>
            </div>
            <div className='para b' style={{marginTop: "20px"}}>
                <a>Czy wycieczka z pilotem?
                    
                    
                </a>
                <Checkbox1 onChange={() => setIfPilot(!ifPilot)} value={ifPilot} />
            </div>
    </div>
            


        </div>


        </>
    )
}
