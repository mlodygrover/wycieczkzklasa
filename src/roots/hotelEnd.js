
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



export const HotelPlanEnd = ({godzinaEnd}) => {
    return (
        <div className='aktywnoscPlanGroup'>
            <AktywnosciNaw rodzaj={1}/>
            <div className='aktywnoscPlan hotel end'>
                <a>Powrót do hotelu - cisza nocna</a>
                <Timer/>
                <div className='etykietaBottom'>
                    {godzinaEnd}
                </div>

                
                




            </div>
        </div>
    )
}