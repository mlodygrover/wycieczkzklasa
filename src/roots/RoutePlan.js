
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



export const RoutePlan = ({ startValue = "08:00", wybranyDzien, dayIndex, activityIndex, swapAttractions, activity, schedule, handleCzasZwiedzaniaChange, formatTime, hotel, setGodzinaStart }) => {

    return (
        <div className='aktywnoscPlanGroup'>
            <AktywnosciNaw dayIndex={wybranyDzien} activityIndex={activityIndex} onClick={swapAttractions} />
            <div className='aktywnoscPlan hotel'>


                <div className='aktywnoscPlanR b'>
                    <div className='atrybutGroup b'>
                        <div className='atrybut'><label><img src="../icons/castle.svg" height={'15px'} />Miejsce rozpoczęcia wyjazdu</label><a>{hotel.nazwa}</a></div>
                        <div className='atrybut'><label><img src="../icons/icon-location.svg" height={'15px'} />Dodatkowe informacje</label><a>{hotel.adres}</a></div>

                    </div>

                    <div className='wyborCzasuGroup'>

                        <div className='wyborCzasu'>


                            <div className='atrybut b'>
                                <Timer />


                                <div className='etykiety'>
                                    <a className='etykieta R b'>
                                        Wyjście z miejsca zbiorki
                                    </a>
                                    <MyTimePicker startValue={startValue} setWybranaGodzinaOut={setGodzinaStart} />


                                </div>



                            </div>
                        </div>
                        Godzinę rozpoczęcia wyjazdu podaj, po zakończeniu zbiórki uczestników.


                    </div>



                    {/*{activity.nazwa}, {activity.adres}, {activity.czasZwiedzania}*/}


                </div>

            </div>
        </div>
    )


}
export const RoutePlanBack = ({ startValue = "08:00", wybranyDzien, dayIndex, activityIndex, swapAttractions, activity, schedule, handleCzasZwiedzaniaChange, formatTime, hotel, setGodzinaStart }) => {
    
    function timeStringToMinutes(timeStr) {
        // Jeśli to nie jest string, zwróć argument
        if (typeof timeStr !== 'string') return timeStr;

        // Sprawdź czy pasuje do formatu HH:MM (1-2 cyfry godzin, dwie cyfry minut)
        const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
        if (!match) return timeStr;

        const hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);

        // Jeżeli parsowanie się nie udało albo minuty są poza zakresem 0–59, zwróć argument
        if (isNaN(hours) || isNaN(minutes) || minutes < 0 || minutes > 59) {
            return timeStr;
        }

        return hours * 60 + minutes;
    }

    return (
        <div className='aktywnoscPlanGroup'>
            <AktywnosciNaw dayIndex={wybranyDzien} activityIndex={activityIndex} onClick={swapAttractions} />
            <div className='aktywnoscPlan hotel'>


                <div className='aktywnoscPlanR b'>
                    <div className='atrybutGroup b'>
                        <div className='atrybut'><label><img src="../icons/castle.svg" height={'15px'} />Miejsce zakończenia wyjazdu</label><a>{hotel.nazwa}</a></div>
                        <div className='atrybut'><label><img src="../icons/icon-location.svg" height={'15px'} />Dodatkowe informacje</label><a>{hotel.adres}</a></div>

                    </div>

                    <div className='wyborCzasuGroup'>

                        <div className='wyborCzasu'>


                            <div className='atrybut b'>
                                <Timer />


                                <div className='etykiety'>
                                    <a className='etykieta R b'>
                                        Godzina powrotu
                                    </a>

                                    <MyTimePicker startValue={timeStringToMinutes(startValue)} czyZmienna={false} />


                                </div>



                            </div>
                        </div>



                    </div>



                    {/*{activity.nazwa}, {activity.adres}, {activity.czasZwiedzania}*/}


                </div>

            </div>
        </div>
    )


}