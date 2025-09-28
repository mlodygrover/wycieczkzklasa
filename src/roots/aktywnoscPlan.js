
import React, { useState, useEffect, useRef } from 'react';
import axios from "axios";
import styled from 'styled-components';
import TopKreatorSlider from './topKreatorSlider';
import BookingDatePicker from './wybordaty';
import BookingGuestsPicker from './uczestnicyWybor';
import HotelStandardSelector from './hotelandtransport';
import TransportSelector from './transportWybor.js';
import ChromeTabs from './testkarty.js';
import { WyborPoleAtrakcja } from './wyborPoleAtrakcja.js';
import Loader from './loader.js';
import { LoadScript } from '@react-google-maps/api';
import { AktwnoscSlider } from './aktywnoscSlider.js';
import Timer from './timerAnimation.js';
import { AktywnosciNaw } from './aktywnosciNaw.js';

async function fetchImageLink(activity) {
    const { nazwa, adres, idGoogle } = activity;
    try {
      const res = await axios.get('http://localhost:5002/api/attraction-image', {
        params: { nazwa, adres, idGoogle }
      });
      return res.data.url;
    } catch (err) {
      console.error("fetchImageLink error:", err);
      return null;
    }
  }

export const AktywnoscPlan = ({ wybranyDzien, dayIndex, activityIndex, swapAttractions, activity, schedule, handleCzasZwiedzaniaChange, formatTime, scheduleLoading }) => {
    let idDiv;
    const [imageLink, setImageLink] = useState(null);

  useEffect(() => {
    // dla każdej zmiany activity pobieramy nowy link
    if (activity.idGoogle !== "FREE") {
      setImageLink(null);          // reset przy zmianie
      fetchImageLink(activity)
        .then(url => setImageLink(url))
        .catch(()=>{/* już loguje wewnątrz */});
    }
  }, [activity]);
  

    if (activity.idGoogle == "FREE") {
        idDiv = "aktywnoscPlan basic";
        return (
            <div className='aktywnoscPlanGroup'>
                <AktywnosciNaw dayIndex={wybranyDzien} activityIndex={activityIndex} onClick={swapAttractions} />
                <div className={idDiv}>


                    <div className='aktywnoscPlanR b'>
                        <div className='atrybutGroup b'>
                            <div className='atrybut'><label><img src="../icons/castle.svg" height={'15px'} />Aktywność </label><a>{activity.rodzaj}</a></div>
                            <div className='atrybut'><label><img src="../icons/icon-location.svg" height={'0px'} /></label></div>
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
    else {
        
        idDiv = "aktywnoscPlan";
        return (
            <div className='aktywnoscPlanGroup'>
                <AktywnosciNaw dayIndex={wybranyDzien} activityIndex={activityIndex} onClick={swapAttractions} />
                <div className={idDiv}>

                    <div className='aktywnoscPlanL' style={{ zIndex: '10' }}>
                        <AktwnoscSlider link={imageLink} lng={activity?.location?.lng || null} lat={activity?.location?.lat || null} />
                    </div>
                    <div className='aktywnoscPlanR'>
                        <div className='atrybutGroup'>
                            <div className='atrybut'><label><img src="../icons/castle.svg" height={'15px'} />Nazwa </label><a>{activity.nazwa}</a></div>
                            <div className='atrybut'><label><img src="../icons/icon-location.svg" height={'15px'} />Adres</label><a>{activity.adres}</a></div>
                        </div>
                        <div className='atrybutGroup'>
                            <div className='atrybut'><label><img src="../icons/icon-ticket.svg" height={'15px'} />Cena biletu</label><a>{activity.cenaZwiedzania || 24}zł</a></div>
                            <div className='atrybut'><label><img src="../icons/icon-time.svg" height={'15px'} />Godziny otwarcia</label><a>9:00-18:30</a></div>

                        </div>
                        <div className='wyborCzasuGroup'>

                            <div className='wyborCzasu'>


                                <div className='atrybut b'>
                                    <Timer />

                                    <div className='etykiety'>
                                        <a className='etykieta'>
                                            Godzina rozpoczęcia
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
                                            Czas zwiedzania
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
    /*return (
        <div className='aktywnoscPlanGroup'>
            <AktywnosciNaw dayIndex={wybranyDzien} activityIndex={activityIndex} onClick={swapAttractions} />
            <div className={idDiv}>

                <div className='aktywnoscPlanL' style={{ zIndex: '10' }}>
                    <AktwnoscSlider />
                </div>
                <div className='aktywnoscPlanR'>
                    <div className='atrybutGroup'>
                        <div className='atrybut'><label><img src="../icons/castle.svg" height={'15px'} />Nazwa </label><a>{activity.nazwa}</a></div>
                        <div className='atrybut'><label><img src="../icons/icon-location.svg" height={'15px'} />Adres</label><a>{activity.adres}</a></div>
                    </div>
                    <div className='atrybutGroup'>
                        <div className='atrybut'><label><img src="../icons/icon-ticket.svg" height={'15px'} />Cena biletu</label><a>24zł</a></div>
                        <div className='atrybut'><label><img src="../icons/icon-time.svg" height={'15px'} />Godziny otwarcia</label><a>9:00-18:30</a></div>

                    </div>
                    <div className='wyborCzasuGroup'>

                        <div className='wyborCzasu'>


                            <div className='atrybut b'>
                                <Timer />

                                <div className='etykiety'>
                                    <a className='etykieta'>
                                        Godzina rozpoczęcia
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
                                        Czas zwiedzania
                                    </a>
                                    <a className='etykietaBottom'>{formatTime(activity.czasZwiedzania)}</a>


                                </div>

                            </div>
                        </div>
                        Możesz dostostować czas trwania aktywności do swoich preferencji. Czas ustawiony domyślnie jest wynikiem analizy sztucznej inteligencji.


                    </div>



                    


                </div>

            </div>
        </div>
    )*/
}