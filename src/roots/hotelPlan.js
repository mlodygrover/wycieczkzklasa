
import React, { useState, useEffect, useRef } from 'react';
import axios from "axios";
import styled from 'styled-components';
import TopKreatorSlider from './topKreatorSlider';
import BookingDatePicker from './wybordaty';
import BookingGuestsPicker from './uczestnicyWybor';
import HotelStandardSelector from './hotelandtransport';
import TransportSelector from './transportWybor.js';
import ChromeTabs from './testkarty.js';
import { StarRating, WyborPoleAtrakcja } from './wyborPoleAtrakcja.js';
import Loader from './loader.js';
import { LoadScript } from '@react-google-maps/api';
import { AktwnoscSlider } from './aktywnoscSlider.js';
import Timer from './timerAnimation.js';
import { AktywnosciNaw } from './aktywnosciNaw.js';
import TimePicker from 'react-time-picker';
import MyTimePicker from './timePicker.js';



export const HotelPlan = ({ startValue = "08:00", wybranyDzien, dayIndex, activityIndex, swapAttractions, activity, schedule,handleCzasZwiedzaniaChange,formatTime, hotel, setGodzinaStart}) => {

    return (
        <div className='aktywnoscPlanGroup'>
            <AktywnosciNaw dayIndex={wybranyDzien} activityIndex={activityIndex} onClick={swapAttractions} />
            <div className='aktywnoscPlan hotel'>

                <div className='aktywnoscPlanL' style={{ zIndex: '10' }}>
                    <AktwnoscSlider />
                </div>
                <div className='aktywnoscPlanR'>
                    <div className='atrybutGroup'>
                        <div className='atrybut'><label><img src="../icons/icon-hotel.svg" height={'15px'} />Nazwa hotelu</label><a>{hotel.nazwa}</a></div>
                        <div className='atrybut'><label><img src="../icons/icon-location.svg" height={'15px'} />Adres</label><a>{hotel.adres}</a></div>
                    </div>
                    <div className='atrybutGroup'>
                        <div className='atrybut'><label><img src="../icons/icon-stars.svg" height={'15px'} />Standard hotelu</label><a><StarRating rating={hotel.gwiazdki}/></a></div>
                        <div className='atrybut'><label><img src="../icons/icon-time.svg" height={'15px'} />Doba hotelowa</label><a>{hotel.zameldowanie}-{hotel.wymeldowanie}</a></div>

                    </div>
                    <div className='wyborCzasuGroup'>

                        <div className='wyborCzasu'>


                            <div className='atrybut b'>
                                <Timer />
                                
                                <div className='etykiety'>
                                    <a className='etykieta'>
                                        Wyjście z hotelu
                                    </a>
                                    <MyTimePicker startValue={startValue} setWybranaGodzinaOut={setGodzinaStart}/>


                                </div>
                                
                            </div>
                        </div>
                        Ustaw godzinę opuszczenia miejsca noclegu. <span style={{fontWeight: '600'}}>Jeśli zaplanowane jest śniadanie, pamiętaj zeby ustawic późniejszą godzinę!</span>


                    </div>



                    {/*{activity.nazwa}, {activity.adres}, {activity.czasZwiedzania}*/}


                </div>

            </div>
        </div>
    )
}