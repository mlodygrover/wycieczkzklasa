import { useEffect, useState } from "react"
import styled from "styled-components"
import { KonfiguratorRadioButton } from "../konfiguratorMain";
import LeafletMap from "../roots/googleMapViewer";
import { StarRating } from "../roots/wyborPoleAtrakcja";
import { OwnAttraction } from "../ownAttraction";
import { minutesToStringTime } from "../roots/attractionResults";
import { AtrakcjaResultMidComp } from "./atrakcjaResultMid";

const baseActivities = [
    { idGoogle: "baseAct", czasZwiedzania: 30, nazwa: "Przerwa śniadaniowa", adres: "", cenaZwiedzania: 0, icon: "../icons/park.svg" }
]

const AddActivityPanelMainbox = styled.div.withConfig({
    shouldForwardProp: (prop) => prop !== 'opened' // nie wysyłaj opened do DOM
})`

  
    font-family: Inter;
    width: ${props => !props.opened ? "1200px" : "100%"};
    min-height: ${props => !props.opened ? "300px" : "100vh"};
    max-width: ${props => !props.opened ? "70%" : "100%"};
    transition: 0.2s ease-in-out;
    margin: auto;
    border-radius: ${props => !props.opened ? "20px" : "0"};
    overflow: hidden;
    background-color: white;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 5px;
    @media screen and (max-width: 800px){
        max-width: 100%;
        width: 100%;
        height: 100%;
        min-height: 100vh;
    }
    opacity: 0;
    transform: translateY(10px);
    animation: fadeIn 0.6s ease forwards;
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

const AddActivityPanelNav = styled.div`
    margin: 10px 5px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 5px;
    padding:4px 10px;
    border-bottom: 1px solid gray;
`
const AddActivityNavButton = styled.div`
    width: 20px;
    height: 20px;
  
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 1000px;
    transition: 0.3s ease-in-out;
    cursor: pointer;
    &.close{
    background-color: #ff5f57;
    @media screen and (max-width: 800px){
            display: none;
        }
    }
    &.maxi{
        background-color: #28c940;
        @media screen and (max-width: 800px){
            display: none;
        }
        &:hover{
        background-color: #06a720;
        }
    }
    &.mobileClose{
        @media screen and (min-width: 800px){
            display: none;
        }
    }
    
`
const AddActivityPanelTitle = styled.div`
    width: 75%;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    text-align: flex-start;
    font-size: 26px;
    font-weight: 400;
    color: #404040;
    margin: 0px auto;
    border-bottom: 1px solid gray;
    text-wrap: nowrap;
    @media screen and (max-width: 800px){
        font-size: 20px;
        width: 90%;
        
    }
    
`
const AddActivityPanelBox = styled.div`
    width: 75%;
    min-height: 3000px;
    margin: 0 auto;
    @media screen and (max-width: 800px){
        width: 90%;
        
    }

`
const PanelBoxNav = styled.div`
    width: 100%;
    display: flex;
    height: 36px;
    padding: 2px 4px;
    box-sizing: border-box;
    flex-direction: row;
    align-items: stretch;
    justify-content: flex-start;
    gap: 2px;
    border-radius: 999px;
    background-color: #f6f6f6;
    .panelBoxNavButton{
        flex:1;
        cursor: pointer;
        transition: 0.3s ease;
        border-radius: 9999px;
        display: flex;
        align-items: center;
        justify-content: center;
        &.chosen{
            background-color: #008d73ff;
            img {
                filter: brightness(0) invert(1);
            }
    
    }
}
`
const PanelBoxContent = styled.div`
  display: ${props => props.hidden ? "none" : "flex"};
  flex-wrap: wrap;          /* pozwala przechodzić do nowego wiersza */
  justify-content: flex-start; /* kafelki zaczynają się od lewej */
  gap: 10px;                 /* odstęp między kafelkami */
  width: 100%;
  margin-top: 10px;
`;

export const AtrakcjaResultMid = styled.div`
  flex: 1 1 250px;   /* rośnie i maleje, bazowa szerokość ~250px */
  min-width: 200px;  /* minimalna szerokość kafelka */
  
  border-radius: 20px;
  box-sizing: border-box;
  background-color: white;
  border: 1px solid lightgray;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  overflow: hidden;
  font-weight: 300;
  padding-bottom: 20px;
  min-height: fit-content;
  gap: 5px;
  font-family: 'Inter';
  .addActivityAddButton{
    height: 30px;
        width: 90%;
        background-color: #008d73ff;
        margin: 3px auto;
        border-radius: 5px;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: 0.3s ease-in-out;
        box-sizing: border-box;
        
        &:hover{
            background-color: #007a61ff;
        }

  }
  .atrakcjaResultMidName{
    text-align: left;
    display: flex;
    flex-direction: row;
    gap: 5px;
    font-family: 'Inter';
    font-size: 16px;
    width: 90%;
    font-weight: 500;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    margin: auto;
    .doubleName{
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        font-size: 14px;
        &.a{
            font-size: 16px;
        }
        span{
            font-weight: 400;
            font-size: 13px;
            color: #606060;
        }
        .doubleNameRating{
            color: auto;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;
            gap: 5px;
            a{
                font-size: 12px;   
                color: #606060;         
            }
        }
        

    }
  }
  .mapBox {
  padding-bottom: 5px;
  width: 100%;
  height: 150px;
  position: relative; /* konieczne dla ::after */
  overflow: hidden;   /* żeby overlay nie wychodził poza box */

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    filter: brightness(1.05) saturate(0.8) contrast(0.95);
    display: block;
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(255, 220, 180, 0.2); /* delikatny pastelowy overlay */
    mix-blend-mode: soft-light;
    pointer-events: none;
  }
}

  .titleBox{
    padding-top: 10px;
    width: 90%;
    margin: 0 auto;
    font-size: 14px;
    text-align: left;
  }
  .adresBox{
    
    width: 90%;
    margin: 0 auto;
    font-size: 12px;
    text-align: left;
  }
  .ratingBox{
    padding-top: 5px;
    width: 90%;
    margin: 0 auto;
    font-size: 12px;
    text-align: left;
    a{
        color: gray;
        margin: auto 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }
  }
  .timeBox{
    width: 90%;
    padding-top: 5px;
    margin: 0 auto;
    font-size: 12px;
    text-align: left;
    vertical-align: center;
  }
  .buttonsBox{
    width: 90%;
    height: 30px;
    margin-top: 20px;
    padding: 10px;
    gap: 10px;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    justify-content: flex-start;
    margin: auto;
    padding-bottom: 0;
    .operationButton{
        flex: 1;
        
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        cursor: pointer;
        transition: 0.3s ease-in-out;
        color: white;
        font-weight: 500;
        &.a{
            background-color: #008d73ff;

            &:hover{
                background-color: #006b51ee;
            }
        }
        &.b{
            background-color: #ffe3e6;
            &:hover{
                background-color: #eed2d5;
            }
        }
        &.c{
            background-color:  #fff4de;
            &:hover{
                background-color: #eee3cd;
            }
       
        }
    }
   }
   

`;

export const SuccessAlert = styled.div`
    width: 100%;
    height: 50px;
    background-color: #232531;
    border-radius: 10px;
    color: white;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    padding-left: 10px;
    border-left: 5px solid #2b9875;
    gap: 10px;
  
    .successAlertIcon{
        background-color: #454753;
        height: 40px;
        width: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
         svg{
            height: 30px;
            width: 30px;
            color: #2b9875;
        }
    }
    .successAlertTextbox{
        flex: 1;
        display: flex;
        height: 100%;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        .successAlertTitle{
            color: white;
            font-size: 14px;
            font-weight: 400;
        }
        .successAlertDesc{
            color: #c0c0c0;
            font-size: 12px;
            font-weight: 400;
        }
    }
    .successAlertCloseButton{
            width: 30px;
            height: 30px;
            margin-right: 10px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: 0.3s ease-in-out;
            &:hover{
                background-color: #454753;
            }
    }  
    &.b{
        border-left: 5px solid #2d67cf;
        svg{
           
            color: #2d67cf;
        }
    }
    &.c{
        border-left: 5px solid #d20d03;
        svg{
           
            color:  #d20d03;
        }
    }
`
const PanelBoxFilter = styled.div`
    width: 100%;
    height: 40px;
    background-color: #f6f6f6;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    border-radius: 10px;
    transition: 0.3s ease-in-out;
   
    input{
        flex: 1;
        height: 100%;
        border-radius: 10px;
        outline: 0;
        border: none;
        padding-left: 10px;
        font-size: 14px;
        font-weight: 400;
        font-family: inherit;
        box-sizing: border-box;
        background-color: inherit;
        color: #606060;
    }
    .searchDiv{
        width: 40px;
        height: 30px;
        margin: auto 10px;
        background-color: #008d73ff;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: 0.3s ease-in-out;
        &:hover{
            background-color: #006b51dd;
        }
    }
    
`

export const AddActivityPanel = ({ miejsceDocelowe, setModAct, modActIdx, dayIndex, closePanel, addActivity }) => {

    const [openedLocal, setOpenedLocal] = useState(false)
    const [atrakcje, setAtrakcje] = useState([])
    const [radioChosen, setRadioChosen] = useState(0)
    const [favAtrakcje, setFavAtrakcje] = useState([])
    const [alerts, setAlerts] = useState([])
    const [filtersOpened, setFiltersOpened] = useState(false);
    const [searchActivity, setSearchActivity] = useState("")
    const [searchingValue, setSearchingValue] = useState("");
    function addToFav(atrakcja) {
        setFavAtrakcje(prevFav => [...prevFav, atrakcja]);
    }

    useEffect(() => {
        const cached = localStorage.getItem("lsAtrakcje");

        if (cached) {
            const parsed = JSON.parse(cached);

            // sortowanie malejąco po liczbaOpinie
            const sorted = parsed.sort((a, b) => (b.liczbaOpinie || 0) - (a.liczbaOpinie || 0));

            setAtrakcje(sorted);

        }
    }, []);
    function addAlert(nazwa) {
        // Dodajemy alert do stanu
        setAlerts(prevAlerts => [...prevAlerts, nazwa]);

        // Ustawiamy timer, który po 10 sekundach usunie alert
        setTimeout(() => {
            setAlerts(prevAlerts => prevAlerts.filter(alert => alert !== nazwa));
        }, 15000); // 10000 ms = 10 s
    }
    function deleteAlert(idx) {
        setAlerts(prevAlerts => prevAlerts.filter((_, i) => i !== idx));
    }
    function addAlertOwnAttr(lok) {
        lok && setAlerts(prevAlerts => [...prevAlerts, { nazwa: "abcd", lok }]);
    }
    useEffect(() => {
        if (!searchingValue) {
            setSearchActivity("")
            setAlerts(prevAlerts => prevAlerts.filter((a, i) => a.nazwa !== "abcd"));
        };
    }, [searchingValue])
    return (
        <AddActivityPanelMainbox opened={openedLocal} >

            <AddActivityPanelNav>
                <AddActivityNavButton className="close" onClick={() => { closePanel(); setModAct({ flag: false, dayIdx: null, idx: null }) }}>
                    <img src={"../icons/close2.svg"} height={"30px"} />
                </AddActivityNavButton>
                <AddActivityNavButton className="maxi" onClick={() => setOpenedLocal(!openedLocal)}>
                    {openedLocal ? <img src={"../icons/minimize2.svg"} height={"10px"} /> : <img src={"../icons/maximize2.svg"} height={"10px"} />}
                </AddActivityNavButton>
                <AddActivityNavButton className="mobileClose" onClick={() => { closePanel(); setModAct({ flag: false, dayIdx: null, idx: null }) }}>
                    <img src={"../icons/close2.svg"} height={"30px"} />
                </AddActivityNavButton>

            </AddActivityPanelNav>
            <AddActivityPanelTitle>
                {modActIdx || modActIdx == 0 ? "Zamiana aktywności" : "Dodawanie aktywności"}
            </AddActivityPanelTitle>
            <AddActivityPanelBox>
                <PanelBoxNav>
                    {/*
                    <KonfiguratorRadioButton className={radioChosen == 0 ? "chosen" : ""} onClick={() => setRadioChosen(0)}>
                        <img src={"../icons/castle.svg"} width={'30px'} />
                    </KonfiguratorRadioButton>
                    <KonfiguratorRadioButton className={radioChosen == 1 ? "chosen" : ""} onClick={() => setRadioChosen(1)}>
                        <img src={"../icons/park.svg"} width={'30px'} />
                    </KonfiguratorRadioButton >
                    <KonfiguratorRadioButton className={radioChosen == 2 ? "chosen" : ""} onClick={() => setRadioChosen(2)}>
                        <img src={"../icons/serce.svg"} width={'30px'} />
                    </KonfiguratorRadioButton>
                    <KonfiguratorRadioButton className={radioChosen == 3 ? "chosen" : ""} onClick={() => setRadioChosen(3)}>
                        <img src={"../icons/pencil.svg"} width={'30px'} />
                    </KonfiguratorRadioButton>
                    */}
                    {[
                        { id: 0, icon: "../icons/castle.svg", label: "Podstawowe" },
                        { id: 1, icon: "../icons/park.svg", label: "Parki" },
                        { id: 2, icon: "../icons/serce.svg", label: "Ulubione" },
                        { id: 3, icon: "../icons/pencil.svg", label: "Edycja" }
                    ].map(option => (
                        <label
                            key={option.id}
                            className={radioChosen === option.id ? "panelBoxNavButton chosen" : "panelBoxNavButton"}
                        >
                            <input
                                type="radio"
                                name="navChoice"
                                value={option.id}
                                checked={radioChosen === option.id}
                                onChange={() => setRadioChosen(option.id)}
                                style={{ display: "none" }} // ukrywamy natywny wygląd radio
                            />
                            <img src={option.icon} width="25px" alt={option.label} />
                        </label>
                    ))}
                </PanelBoxNav>

                <PanelBoxContent hidden={radioChosen !== 0} key={searchActivity}>
                    <PanelBoxFilter>
                        <input type="text"
                            placeholder="Wyszukaj atrakcję"
                            onChange={(e) => setSearchingValue(e.target.value)}
                            value={searchingValue}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    setSearchActivity(searchingValue);
                                    addAlertOwnAttr(searchingValue);
                                }
                            }}>
                        </input>
                        <div className="searchDiv" onClick={() => { setSearchActivity(searchingValue); addAlertOwnAttr(searchingValue) }}>
                            <img src="../icons/icon-search.svg" height="20px" />
                        </div>

                    </PanelBoxFilter>
                    {alerts.map((alert, idx) => (
                        alert?.nazwa != "abcd" ?
                            <SuccessAlert key={idx}>
                                <div className="successAlertIcon">
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
                                            d="m4.5 12.75 6 6 9-13.5"
                                        ></path>
                                    </svg>
                                </div>
                                <div className="successAlertTextbox">
                                    <div className="successAlertTitle">
                                        Dodano atrakcję do planu!
                                    </div>
                                    <div className="successAlertDesc">
                                        Aktywność <span style={{ color: '#4dba97' }}>{alert}</span> została dodana
                                    </div>
                                </div>
                                <div className="successAlertCloseButton" onClick={() => deleteAlert(idx)}>
                                    <img src="../icons/icon-close-white.svg" height={'20px'} />
                                </div>
                            </SuccessAlert>
                            :
                            <SuccessAlert key={idx} className="b" onClick={() => setRadioChosen(3)} style={{ cursor: 'pointer' }}>
                                <div className="successAlertIcon">
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
                                <div className="successAlertTextbox">
                                    <div className="successAlertTitle">
                                        Nie znalazłeś <span style={{ color: '#3e78df' }}>{alert.lok}</span> w wyszukiwaniach?
                                    </div>
                                    <div className="successAlertDesc">
                                        Kliknij aby wyszukać więcej atrakcji lub dodać własną!
                                    </div>
                                </div>
                                <div
                                    className="successAlertCloseButton"
                                    onClick={(e) => {
                                        e.stopPropagation();   // zatrzymuje propagację kliknięcia w górę
                                        deleteAlert(idx);      // wywołuje tylko usuwanie alertu
                                    }}
                                >
                                    <img src="../icons/icon-close-white.svg" height="20px" />
                                </div>
                            </SuccessAlert>
                    ))}

                    {atrakcje
                        .filter((atrakcja) =>
                            atrakcja.nazwa
                                ?.normalize("NFD")                // rozbij litery z akcentami
                                .replace(/[\u0300-\u036f]/g, "")  // usuń diakrytyki
                                .toLowerCase()
                                .includes(
                                    searchActivity
                                        .normalize("NFD")
                                        .replace(/[\u0300-\u036f]/g, "")
                                        .toLowerCase()
                                )
                        )
                        .map((atrakcja, idx) => (
                            <AtrakcjaResultMidComp radioChosen={radioChosen} dayIndex={dayIndex} setModAct={setModAct} atrakcja={atrakcja} modActIdx={modActIdx} addActivity={addActivity} closePanel={closePanel} addAlert={addAlert} addToFav={addToFav} key={atrakcja.googleId} />

                        ))}

                </PanelBoxContent>

                <PanelBoxContent hidden={radioChosen !== 1}>
                    {
                        baseActivities.map((act, actIdx) => (
                            <AtrakcjaResultMid key={`${actIdx}-${act.nazwa}`}>
                                <div className="mapBox" style={{ pointerEvents: "none" }}>
                                    <img src={act.icon} height={'100%'} />
                                </div>
                                <div className="titleBox">
                                    <img src="../icons/castle.svg" height="15px" />
                                    {act.nazwa}
                                </div>


                                <div className="buttonsBox">
                                    <div
                                        className="operationButton a"
                                        onClick={e => {
                                            e.stopPropagation();
                                            setModAct({ flag: false, dayIdx: null, idx: null });
                                            if (!modActIdx && modActIdx !== 0) {
                                                addActivity(dayIndex, act);
                                            } else {
                                                addActivity(dayIndex, modActIdx, act);
                                                closePanel();
                                            }
                                            addAlert(act.nazwa);
                                        }}
                                    >
                                        <img src="../icons/plus-white.svg" height="20px" />
                                        Dodaj do planu
                                    </div>


                                </div>
                            </AtrakcjaResultMid>
                        ))
                    }
                </PanelBoxContent>


                <PanelBoxContent hidden={radioChosen !== 2}>
                    {radioChosen == 2 && favAtrakcje.map((atrakcja, idx) => (
                        <AtrakcjaResultMid key={atrakcja.googleId} >
                            <div className="mapBox" style={{ pointerEvents: "none" }}>
                                <LeafletMap lat={atrakcja?.lokalizacja?.lat || 52.5333} lng={atrakcja?.lokalizacja?.lng || 16.9252} zoom={11} />

                            </div>
                            <div className="titleBox">
                                <img src="../icons/castle.svg" height={'15px'} />{atrakcja.nazwa}
                            </div>
                            <div className="adresBox">
                                <img src="../icons/icon-adres.svg" height={'15px'} />{atrakcja.adres}

                            </div>
                            <div className="ratingBox">
                                <StarRating rating={atrakcja.ocena} />{atrakcja.ocena} <a>({atrakcja.liczbaOpinie})</a>
                            </div>
                            <div className="timeBox">
                                <img src="../icons/icon-time.svg" height={'15px'} />{atrakcja?.czasZwiedzania || "60min"}
                            </div>
                            <div className="timeBox">
                                <img src="../icons/icon-ticket.svg" height={'15px'} />{atrakcja?.cenaZwiedzania || "Bezpłatne"}
                            </div>

                        </AtrakcjaResultMid>

                    ))}
                </PanelBoxContent>
                <PanelBoxContent hidden={radioChosen !== 3}>
                    <OwnAttraction miejsceDocelowe={miejsceDocelowe} setModAct={setModAct} modActIdx={modActIdx} dayIndex={dayIndex} closePanel={closePanel} addActivity={addActivity} />
                </PanelBoxContent>
            </AddActivityPanelBox>
        </AddActivityPanelMainbox>

    )
}

