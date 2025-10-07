import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { InputText1 } from './inputtext1';
import { InputText2 } from './inputtext2';
// Ustawienia kontenera mapy – można dostosować do własnych potrzeb

const aktywnoscl = {
  nazwa: "Bazylika Archikatedralna Świętych Apostołów Piotra i Pawła",
  adres: "Ostrów Tumski 17, Poznań",
  czasZwiedzania: "60",
  koszt: "4,50 zł (bilet normalny), 3,50 zł (bilet ulgowy)",
  godzinaRozpoczecia: "12:30",
  godzinaZakonczenia: "13:30",
  miejsceRozpoczecia: "!",
  miejsceZakonczenia: "!",
  
};
const containerStyle = {
    height: '80%',
    aspectRatio: '3 / 2',
    borderRadius: '20px',
  };

  export const MapLoc = ({ aktywnosc }) => {
    const [center, setCenter] = useState({ lat: 52.4064, lng: 16.9252 });
    const [loading, setLoading] = useState(true);
    const miasto = "Poznań";
    useEffect(() => {
      // Geokodowanie – warto użyć adresu, aby uzyskać precyzyjniejsze współrzędne
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(aktywnosc.nazwa + miasto)}&key=AIzaSyCgFponvaAfvr0TLaEabyBdVqzZ3gt-qxE`;
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
    }, [aktywnosc.nazwa]);
  
    if (loading) {
      return <div>Ładowanie mapy...</div>;
    }
  
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
  };

export const ProgramTile = ({aktywnosc = aktywnoscl, rozp="12:00", onChangeRozp, zak="12:00", onChangeZak, typ="aktywnosc"}) => {
  const [godzinaRozpoczecia, setGodzinaRozpoczecia] = useState(aktywnosc.godzinaRozpoczecia);
  const [godzinaZakonczenia, setGodzinaZakonczenia] = useState(aktywnosc.godzinaZakonczenia);
  const [miejsceRozpoczecia, setMiejsceRozpoczecia] = useState(aktywnosc.miejsceRozpoczecia);
  const [miejsceZakonczenia, setMiejsceZakonczenia] = useState(aktywnosc.miejsceZakonczenia)

  const klasa = "ProgramTile" + (typ==="aktywnosc" ? "" : " " + typ)
  return (
    
    <div className={klasa}>
        <MapLoc aktywnosc={aktywnosc}/>
        {typ == "aktywnosc" ? 
        <div className='activityAtributes'>
            <div className='akapit'>
                    <img src="icons/icon-attraction.svg" width={'20px'}/>
                    <div className="para t">
                        <a>Nazwa aktywności</a>
                        {aktywnosc.nazwa}
                    </div>
            </div>
            <div className='akapit'>
                <img src="icons/Czas wolny.svg" width={'20px'}/>
                <div className='startStopStats'>
                    <div className="para t">
                        <a>Godzina rozpoczęcia</a>
                        <InputText2 value={rozp} onChange={onChangeRozp}/>
                    </div>
                    <div className="para t">
                        <a>Godzina zakończenia</a>
                        <InputText2 value={zak} onChange={onChangeZak}/>
                    </div>
                </div>
             </div>
            <div className='akapit'>
                <img src="icons/icon-adres.svg" width={'20px'}/>
                <div className='startStopStats'>
                    <div className="para t">
                        <a>Miejsce rozpoczęcia </a>
                        <InputText2 typ={'text'} value={miejsceRozpoczecia!="!" ? miejsceRozpoczecia : aktywnosc.adres} onChange={(e) => setMiejsceRozpoczecia(e.target.value)}/>
                    </div>
                    <div className="para t">
                        <a>Miejsce zakończenia</a>
                        <InputText2 typ={'text'} value={miejsceZakonczenia!="!" ? "" : aktywnosc.adres}/>
                    </div>
            </div>
            </div> 
            
            
            
        </div>
        : 

        <div className='activityAtributes'>
          <div className='akapit'>
                    <img src="icons/icon-hotel.svg" width={'20px'}/>
                    <div className="para t">
                        <a>Nazwa hotelu</a>
                        {aktywnosc.nazwa}
                    </div>
                    <div className="para t">
                        <a>Adres hotelu</a>
                        {aktywnosc.adres} 
                    </div>
                    
            </div>
            <div className='akapit'>
               <img src="icons/Czas wolny.svg" width={'20px'}/>
               <div className='startStopStats'>
                   <div className="para t">
                       <a>Godzina rozpoczęcia</a>
                       <InputText2 value={rozp} onChange={onChangeRozp}/>
                   </div>
                   <div className="para t">
                   </div>
               </div>
            </div>
        
        </div>
        }
      
    </div>
   
  );
};

