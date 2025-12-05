import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { AtrakcjaResultMidComp } from "./konfigurator/atrakcjaResultMid";
import AttractionResultMediumComponent, { AttractionResultMediumVerifiedComponent } from "./attractionResultMediumComp";
import { Landmark, Map, PencilLine, Search, SearchCheck, Shrub, X } from "lucide-react";
import AttractionsMap from "./attractionMap";
import { basicActivities } from "./konfiguratorMain";

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const SearchResultItem = styled.div`
  opacity: 0;
  animation: ${fadeInUp} 0.18s ease-out forwards;
`;

const overlayFadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const panelEnter = keyframes`
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.96);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const AddActivityNewWrapper = styled.div`
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  background-color: #00000090;
  z-index: 99999;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px;
  box-sizing: border-box;

  animation: ${overlayFadeIn} 0.18s ease-out forwards;
  @media screen and (max-width: 800px) {
    padding: 10px;
  }
`;

const AddActivityNewMainbox = styled.div`
  width: 100%;
  max-width: 1200px;
  height: 100%;        /* kluczowe – nie rośnie ponad viewport */
  background-color: #ffffffff;
  border-radius: 20px;

  /* animacja wejścia panelu */
  animation: ${panelEnter} 0.22s ease-out forwards;

 
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 20px;
  box-sizing: border-box;

  overflow-y: auto;       /* włączamy scroll w pionie */
  overscroll-behavior: contain; /* żeby scroll nie „przebijał” na tło */
  gap: 10px;
  @media screen and (max-width: 800px) {
    border-radius: 10px;
    padding: 10px;
  }
`;
const AddActivityNewTitle = styled.div`
  font-size: 34px;
  color: black;
  font-weight: 600;
  margin-bottom: 20px;
  width: 100%;
  text-align: left;
  color: black;
  font-family: 'Inter';
`;

const AtrakcjeList = styled.div`
   display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
`
const AddActivityNewWallpaper = styled.div`
  width: 100%;
  height: 300px;
  background-image: url("https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D");
  background-size: cover;
  background-position: center;
  border-radius: 20px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 20px;
  box-sizing: border-box;

  position: relative;
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(180deg, transparent 35%, rgba(0, 0, 0, 0.6) 100%);
    border-radius: 20px;
    z-index: 0;
  }
  .wallpaperTextBox{
    color: white;
    font-size: 34px;
    font-weight: 700;
    text-align: left;
    font-family: 'Inter', sans-serif;
    text-align: left;
    z-index: 1;

    .wallpaperSubtitles{
      font-size: 14px;
      font-weight: 500;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      width: 100%; 
      color: #f0f0f0;
      
      }
      @media screen and (max-width: 800px) {
        font-size: 22px;
        .wallpaperSubtitles{
          font-size: 12px;
        }
      }
  }

`

const BasicNavBarMainbox = styled.div`
  width: 100%;
  max-width: 1200px;
  height: 38px;
  flex-shrink: 0;
  background-color: #f6f6f6;;
  border-radius: 10px;
  padding: 2px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;

`;
const NavButton = styled.button`
  flex: 1;
  height: 100%;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: ${({ active }) => (active ? "white" : "black")};
  background-color: ${({ active }) => (active ? "#008d73ff" : "transparent")};
`;
export const BasicNavBar = ({ options, chosenOption, setChosenOption }) => {
  return (
    <BasicNavBarMainbox>
      {options?.map((option) => {
        const Icon = option.icon; // bierzemy komponent
        return (
          <NavButton
            key={option.id}
            type="button"
            active={chosenOption === option.id}
            onClick={option.setter}
          >
            <Icon />
          </NavButton>
        );
      })}
    </BasicNavBarMainbox>
  );
};
const AddActivityNewMapMainbox = styled.div`

  font-family: 'Inter', sans-serif;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background-color: #f6f6f6;
  flex-shrink: 0;
  height: 450px;
  .mapTitle{
    width: 100%;
    font-size: 18px;
    font-weight: 500;
    color: black;
    text-align: left;
    margin-bottom: 5px;
    color: #606060;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 2px;
    justify-content: flex-start;
  }
   &.search {
      height: 100px;

      input {
        width: 100%;
        height: 30px;
        border: none;
        border-bottom: 1px solid #d0d0d0;
        background: transparent;
        outline: none;
        font-size: 16px;
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        color: #606060;

        /* „magia” – animowana kreska */
        background-image: linear-gradient(#008d73ff, #008d73ff);
        background-repeat: no-repeat;
        background-position: 0 100%;
        background-size: 0% 1px;             /* start: 0% szerokości */
        transition: background-size 0.25s ease, border-color 0.25s ease;

        &:focus {
          border-bottom-color: #008d73ff;    /* kolor kreski bazowej */
          background-size: 100% 1px;         /* animuje się do pełnej szerokości */
        }
      }
    }

`
const CloseBarMainbox = styled.div`
  width: 100%;
  height: 30px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: end;
  .closeButton{
    width: 30px;
    height: 30px;
    border: none;
    background: #f0f0f0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    color: #606060;
  }
`
const CloseBar = ({close} ) =>{
  return (
    <CloseBarMainbox>
      <button className="closeButton" onClick={close}><X/></button>
    </CloseBarMainbox>

  )
}
export const AddActivityNewMap = ({ atrakcje, addActivity, wybranyDzien }) => {
  return (
    <AddActivityNewMapMainbox >
      <div className="mapTitle">
        <Map /> Wybierz atrakcje z mapy
      </div>
      <AttractionsMap attractions={atrakcje} addActivity={addActivity} wybranyDzien={wybranyDzien} />
    </AddActivityNewMapMainbox>
  )
}

export const AddActivityNewSearch = ({ attractionsSearching, setAttractionsSearching }) => {
  return (
    <AddActivityNewMapMainbox className="search">
      <div className="mapTitle">
        <SearchCheck />Baza atrakcji
      </div>
      <input
        type="text"
        placeholder="Wpisz nazwę lub adres atrakcji"
        value={attractionsSearching}
        onChange={(e) => setAttractionsSearching(e.target.value)}

      />
    </AddActivityNewMapMainbox>
  )
}
export const AddActivityNew = ({ addActivity, wybranyDzien, miejsceDocelowe, atrakcje, setActivityPanelOpened }) => {
  // zamykanie po ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" || e.key === "Esc") {
        setActivityPanelOpened(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setActivityPanelOpened]);
  const [mapIsOpened, setMapIsOpened] = useState(false);
  const [chosenOption, setChosenOption] = useState(0);
  const [attractionsSearching, setAttractionsSearching] = useState("");
  const options = [
    { id: 0, icon: Landmark, setter: () => setChosenOption(0) },
    { id: 1, icon: Shrub, setter: () => setChosenOption(1) },
    { id: 2, icon: Search, setter: () => setChosenOption(2) },
    { id: 3, icon: PencilLine, setter: () => setChosenOption(3) },
  ];

  return (
    <AddActivityNewWrapper onClick={() => setActivityPanelOpened(false)}>
      <AddActivityNewMainbox onClick={(e) => e.stopPropagation()}>
        <CloseBar close={() => setActivityPanelOpened(false)} />
        <AddActivityNewWallpaper>
          <div className="wallpaperTextBox">Dodawanie aktywności<div className="wallpaperSubtitles">Wybierz aktywności z mapy, z bazy atrakcji, wyszukaj poza bazą lub dodaj własne</div></div>
        </AddActivityNewWallpaper>
        <BasicNavBar
          options={options}
          chosenOption={chosenOption}
          setChosenOption={setChosenOption}
        />
        {
          chosenOption === 0 && <>
            <AddActivityNewMap atrakcje={atrakcje} addActivity={addActivity} wybranyDzien={wybranyDzien} />
            <AddActivityNewSearch attractionsSearching={attractionsSearching} setAttractionsSearching={setAttractionsSearching}>

            </AddActivityNewSearch>
            <AtrakcjeList>
              {atrakcje
                .filter(atrakcja =>
                  atrakcja.dataSource !== "Bot" && (
                    atrakcja.nazwa.toLowerCase().includes(attractionsSearching.toLowerCase()) ||
                    atrakcja.adres.toLowerCase().includes(attractionsSearching.toLowerCase()))
                )
                .toSorted((a, b) => (b.liczbaOpinie * b.ocena || 0) - (a.liczbaOpinie * a.ocena || 0))
                .map((atrakcja, idx) => (
                  <AttractionResultMediumVerifiedComponent
                    key={`${atrakcja.googleId}${idx}`}
                    atrakcja={atrakcja}
                    wybranyDzien={wybranyDzien}
                    addActivity={addActivity}
                    typ={1}
                    latMD={miejsceDocelowe.location.lat}
                    lngMD={miejsceDocelowe.location.lng}

                    sourcePlace={true}
                  />
                ))}
              {atrakcje
                .filter(atrakcja =>
                  atrakcja.dataSource === "Bot" && (
                    atrakcja.nazwa.toLowerCase().includes(attractionsSearching.toLowerCase()) ||
                    atrakcja.adres.toLowerCase().includes(attractionsSearching.toLowerCase()))
                )
                .toSorted((a, b) => (b.liczbaOpinie * b.ocena || 0) - (a.liczbaOpinie * a.ocena || 0))
                .map((atrakcja, idx) => (
                  <AttractionResultMediumVerifiedComponent
                    key={`${atrakcja.googleId}${idx}`}
                    atrakcja={atrakcja}
                    wybranyDzien={wybranyDzien}
                    addActivity={addActivity}
                    typ={2}
                    latMD={miejsceDocelowe.location.lat}
                    lngMD={miejsceDocelowe.location.lng}
                    sourcePlace={true}
                  />
                ))}
              {atrakcje
                .filter(atrakcja =>
                  atrakcja.dataSource !== "Bot" && (
                    !atrakcja.nazwa.toLowerCase().includes(attractionsSearching.toLowerCase()) &&
                    !atrakcja.adres.toLowerCase().includes(attractionsSearching.toLowerCase()))
                )
                .toSorted((a, b) => (b.liczbaOpinie * b.ocena || 0) - (a.liczbaOpinie * a.ocena || 0))
                .map((atrakcja, idx) => (
                  <AttractionResultMediumVerifiedComponent
                    key={`${atrakcja.googleId}${idx}`}
                    atrakcja={atrakcja}
                    wybranyDzien={wybranyDzien}
                    addActivity={addActivity}
                    typ={1}
                    latMD={miejsceDocelowe.location.lat}
                    lngMD={miejsceDocelowe.location.lng}

                    sourcePlace={true}
                  />
                ))}
              {atrakcje
                .filter(atrakcja =>
                  atrakcja.dataSource === "Bot" && (
                    !atrakcja.nazwa.toLowerCase().includes(attractionsSearching.toLowerCase()) &&
                    !atrakcja.adres.toLowerCase().includes(attractionsSearching.toLowerCase()))
                )
                .toSorted((a, b) => (b.liczbaOpinie * b.ocena || 0) - (a.liczbaOpinie * a.ocena || 0))
                .map((atrakcja, idx) => (
                  <AttractionResultMediumVerifiedComponent
                    key={`${atrakcja.googleId}${idx}`}
                    atrakcja={atrakcja}
                    wybranyDzien={wybranyDzien}
                    addActivity={addActivity}
                    typ={2}
                    latMD={miejsceDocelowe.location.lat}
                    lngMD={miejsceDocelowe.location.lng}
                    sourcePlace={true}
                  />
                ))}

            </AtrakcjeList>


          </>

        }
        {
          chosenOption === 1 && <>
            <AddActivityNewSearch attractionsSearching={attractionsSearching} setAttractionsSearching={setAttractionsSearching}>

            </AddActivityNewSearch>
            <AtrakcjeList>
              {basicActivities
                .filter(atrakcja => {
                  const search = attractionsSearching.toLowerCase();
                  const name = (atrakcja.nazwa || "").toLowerCase();
                  const address = (atrakcja.adres || "").toLowerCase();
                  return name.includes(search) || address.includes(search);
                })
                .toSorted((a, b) =>
                  (a.nazwa || "").localeCompare(b.nazwa || "", "pl", { sensitivity: "base" })
                )
                .map((atrakcja, idx) => (
                  <AttractionResultMediumComponent
                    key={`${atrakcja.googleId}${idx}`}
                    atrakcja={atrakcja}
                    wybranyDzien={wybranyDzien}
                    addActivity={addActivity}
                    baseVersion={true}
                  />
                ))}


            </AtrakcjeList></>
        }

      </AddActivityNewMainbox>
    </AddActivityNewWrapper>
  );
};
