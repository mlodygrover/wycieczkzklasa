
import React, { useState, useEffect, useRef } from 'react';
import axios from "axios";
import styled from 'styled-components';
import TopKreatorSlider from './topKreatorSlider.js';
import BookingDatePicker from './wybordaty.js';
import BookingGuestsPicker from './uczestnicyWybor.js';
import HotelStandardSelector from './hotelandtransport.js';
import TransportSelector from './transportWybor.js';
import ChromeTabs from './testkarty.js';
import { WyborPoleAtrakcja } from './wyborPoleAtrakcja.js';
import Loader from './loader.js';
import { LoadScript } from '@react-google-maps/api';
import { AktwnoscSlider } from './aktywnoscSlider.js';
import Timer from './timerAnimation.js';
import { AktywnosciNaw } from './aktywnosciNaw.js';
export const HotelMeldowanie = ({ wybranyDzien, dayIndex, activityIndex, swapAttractions, activity, schedule, handleCzasZwiedzaniaChange, formatTime, scheduleLoading }) => {
    return (
        <div className='aktywnoscPlanGroup'>
            <AktywnosciNaw dayIndex={wybranyDzien} activityIndex={activityIndex} onClick={swapAttractions} />
            <div className='aktywnoscPlan hotel'>

                
                <div className='aktywnoscPlanR b'>
                    <div className='atrybutGroup b'>
                        <div className='atrybut'><label><img src="../icons/castle.svg" height={'15px'} />Aktywność </label><a>{activity.rodzaj}</a></div>
                        <div className='atrybut'><label><img src="../icons/icon-location.svg" height={'15px'} />Doba hotelowa</label><a>{activity.godzinaZameldowania} - {activity.godzinaWymeldowania}</a></div>
                    </div>
                    
                    <div className='wyborCzasuGroup'>

                        <div className='wyborCzasu'>


                            <div className='atrybut b'>
                                <Timer />

                                <div className='etykiety'>
                                    <a className='etykieta'>
                                        Godzina zameldowania
                                    </a>
                                    <a className="etykietaBottom">
                                        {(scheduleLoading || !schedule?.[wybranyDzien]?.[activityIndex + 1]?.startTime)
                                            ? <span className="blinking">chwila...</span>
                                            : schedule[wybranyDzien][activityIndex + 1].startTime}
                                    </a>


                                </div>
                                <a>
                                    <input
                                        type="range"
                                        max="360"
                                        step="10"
                                        value={activity.czasZwiedzania}
                                        onChange={(e) =>
                                            handleCzasZwiedzaniaChange(dayIndex, activityIndex, e.target.value)
                                        }
                                    />
                                </a>
                                <div className='etykiety'>
                                    <a className='etykieta'>
                                        Przeznaczony czas
                                    </a>
                                    <a className='etykietaBottom'>{formatTime(activity.czasZwiedzania)}</a>


                                </div>

                            </div>
                        </div>
                        Możesz dostostować czas trwania aktywności do swoich preferencji. Czas ustawiony domyślnie jest wynikiem analizy sztucznej inteligencji.


                    </div>



                    {/*{activity.nazwa}, {activity.adres}, {activity.czasZwiedzania}*/}


                </div>

            </div>
        </div>
    )
}