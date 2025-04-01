import React from 'react';
import styled from 'styled-components';
import { StarRating } from './wyborPoleAtrakcja';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Loader from './loader';
const containerStyle = {
    width: '100%',
    height: '100%',
};

export const MapLoc = ({ aktywnosc }) => {
    const [center, setCenter] = useState({ lat: 52.4064, lng: 16.9252 });
    const [loading, setLoading] = useState(true);
    const miasto = "Poznań";

    // Funkcja fallback – używa bezpośrednio Google Geocoding API
    const fallbackGeocode = () => {
        const adresDoGeocode = encodeURIComponent(aktywnosc.nazwa + " " + miasto);
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${adresDoGeocode}&key=AIzaSyAHz9AkyQMxwpBkoMrOMuJUYqXuO09BdMk`;
        fetch(geocodeUrl)
            .then(response => response.json())
            .then(data => {
                if (data.status === "OK") {
                    const location = data.results[0].geometry.location;
                    setCenter(location);
                } else {
                    console.error("Błąd Geocoding API:", data.status, data.error_message);
                }
            })
            .catch(error => console.error("Błąd podczas geokodowania:", error))
            .finally(() => setLoading(false));
    };
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            // Jeśli mamy idGoogle, próbujemy pobrać lokalizację z naszego endpointu
            if (aktywnosc.idGoogle) {
                axios
                    .get(`http://localhost:5002/api/attraction-location?idGoogle=${aktywnosc.idGoogle}`)
                    .then(res => {
                        if (res.data && res.data.location) {
                            setCenter(res.data.location);
                        } else {
                            console.warn("Brak lokalizacji w odpowiedzi endpointu, używam fallback.");
                            fallbackGeocode();
                        }
                    })
                    .catch(err => {
                        console.error("Błąd pobierania lokalizacji z endpointu:", err);
                        fallbackGeocode();
                    })
                    .finally(() => setLoading(false));
            } else {
                // Jeśli nie mamy idGoogle, od razu korzystamy z fallbacku
                console.log("korzystam z api")
                fallbackGeocode();
            }
        }, 3000); // opóźnienie 3 sekundy

        return () => clearTimeout(timeoutId);
    }, [aktywnosc.idGoogle, aktywnosc.nazwa]);

    if (loading) {
        return <div><Loader /></div>;
    }

    //console.log(`https://www.google.com/maps?q=${center.lat},${center.lng}&z=13`)
    return (
        <iframe
            width='100%'
            height={'100%'}
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={`https://www.google.com/maps?q=${center.lat},${center.lng}&zoom=2&output=embed`}>
        </iframe>
    )
    /*
    return (
            
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={13}
                options={{
                    mapTypeControl: false,
                    fullscreenControl: false,
                    streetViewControl: false,
                    disableDefaultUI: true,
                }}
            >
                <Marker position={center} />
            </GoogleMap>
    );
    */
};


export const GoogleLikeCard = ({
    aktywnosc
}) => {

    const [zdjecie, setZdjecie] = useState(" ")

    useEffect(() => {
        const fetchPhotos = async () => {
            if (aktywnosc.zdjecia.length > 0) {
                setZdjecie(aktywnosc.zdjecia[0])
            }
            else {
                try {
                    const response = await axios.get(`http://localhost:5002/api/attraction-photos?idGoogle=${aktywnosc.idGoogle}`);
                    const imageLinks = response.data.imageLinks;
                    setZdjecie(imageLinks[0])

                } catch (error) {
                    console.error("Błąd przy pobieraniu zdjęć atrakcji:", error);
                }

            }

        };

        fetchPhotos();
    }, []);
    return (
        <>
            <CardContainer>
                <div className='extAtrakcjaPreview'>
                    <div className='zdj-map'>
                        <div className='ext-zdj'>
                            {/*<img src={zdjecie}
                                height={'100%'}
                                width={'100%'}
                            />*/}
                        </div>
                        <div className='ext-zdj b'>
                            <MapLoc aktywnosc={aktywnosc} />

                        </div>
                    </div>
                    <div className='naz-oc-typ'>
                        <div className='naz'>
                            {aktywnosc.nazwa}
                        </div>
                        <div className='oc'>
                            <a>{aktywnosc.ocenaGoogle}</a><StarRating rating={aktywnosc.ocenaGoogle} /><div className='ocCount'>{aktywnosc.liczbaOcen} opinii</div><img height={'14px'} src="../icons/icon-info.svg" />
                        </div>
                        <div className='typ'>
                            Atrakcja turystyczna
                        </div>
                    </div>
                    <div className='extAtrakcjaPrzyciski'>
                        <div className='przycisk'>
                            <svg width="20" height="20px" viewBox="0 0 24 24" fill="#255FF4">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-.61.08-1.21.21-1.78L8.99 15v1c0 1.1.9 2 2 2v1.93C7.06 19.43 4 16.07 4 12zm13.89 5.4c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41C17.92 5.77 20 8.65 20 12c0 2.08-.81 3.98-2.11 5.4z"></path>
                            </svg>
                            <a>Mapa</a>
                        </div>
                        <div className='przycisk'>
                            <svg width="20" height="20px" viewBox="0 0 18 18" fill="#255FF4">
                                <path d="M1.24264 8.24264L8 15L14.7574 8.24264C15.553 7.44699 16 6.36786 16 5.24264V5.05234C16 2.8143 14.1857 1 11.9477 1C10.7166 1 9.55233 1.55959 8.78331 2.52086L8 3.5L7.21669 2.52086C6.44767 1.55959 5.28338 1 4.05234 1C1.8143 1 0 2.8143 0 5.05234V5.24264C0 6.36786 0.44699 7.44699 1.24264 8.24264Z" />
                            </svg>
                            <a>Dodaj do polubionych</a>
                        </div>
                        <div className='przycisk'>
                            <svg width="20" height="20px" viewBox="0 0 24 24" fill="none">
                                <path d="M12 17V16.9929M12 14.8571C12 11.6429 15 12.3571 15 9.85714C15 8.27919 13.6568 7 12 7C10.6567 7 9.51961 7.84083 9.13733 9M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#255FF4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <a>Pomoc</a>
                        </div>
                    </div>
                    <div className='przyciskDodajPlan'>
                        Dodaj do twojego planu
                    </div>
                    <div className='statsBottom'>
                        <div><p style={{ fontWeight: '600' }}>Adres: </p>  {aktywnosc.adres}</div>
                        <div><p style={{ fontWeight: '600' }}>Czas zwiedzania: </p> {aktywnosc.czasZwiedzania} minut</div>
                        <div><p style={{ fontWeight: '600' }}>Szacownana cena</p>: {aktywnosc.cenaOsoba} zł</div>
                    </div>
                </div>

            </CardContainer>

        </>
    );
};

export default GoogleLikeCard;
const CardContainer = styled.div`
width: 100%;
background-color: gray;
border-radius: 25px;
`