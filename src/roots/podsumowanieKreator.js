import { secondsInDay } from 'date-fns/constants';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Loader from './loader';
import { useSchedule } from './ScheduleContext.js';
const OsCzasuDiv = styled.div`

width: 100%;

`
function getMinutesDifference(time1, time2) {
    const [h1, m1] = time1.split(':').map(s => parseInt(s, 10));
    const [h2, m2] = time2.split(':').map(s => parseInt(s, 10));

    const total1 = h1 * 60 + m1;
    const total2 = h2 * 60 + m2;

    const diff = Math.abs(total1 - total2);
    // minimalna różnica w ramach 24h
    return Math.min(diff, 1440 - diff);
}
function subtractMinutesFromTime(time, minutes) {
    const [h, m] = time.split(':').map(str => parseInt(str, 10));
    let total = h * 60 + m - minutes;
    // obsługa "zawinięcia" powyżej / poniżej doby
    total = ((total % 1440) + 1440) % 1440;
    const newH = Math.floor(total / 60);
    const newM = total % 60;
    const hh = String(newH).padStart(2, '0');
    const mm = String(newM).padStart(2, '0');
    return `${hh}:${mm}`;
}

const LiniaCzasu = ({ godzinaRozpoczecia = "", nazwa = "TEST1", czasZwiedzania = 30, colorTop = 'rgba(255, 0, 0, 0)' }) => {



    return (
        <div className='liniaGroup'>
            {
                colorTop !== "rgba(255, 0, 0, 0)" && (
                    <div
                        className="liniaStart"
                        style={{ height: `${czasZwiedzania}px` }}
                    />
                ) || (
                    <div
                        className="liniaStart b"
                        style={{ height: `${czasZwiedzania}px` }}
                    />
                )
            }
            {
                colorTop !== "rgba(255, 0, 0, 0)" && (

                    <div className='liniaDesc'><div className='descGodzina'>{godzinaRozpoczecia}</div><div className='descGodzina b'>{nazwa}</div></div>
                ) || (
                    <div className='liniaDesc'><img src="../icons/icon-private-bus.svg" width={'10px'} style={{ marginLeft: '-7px' }} /></div>
                )
            }

        </div>
    )
}
const OsCzasu = ({ schedule = [], aktywnosci = [] }) => {

    const [tabAxis, setTabAxis] = useState([]);

    useEffect(() => {
        // 1) Tworzymy pustą tablicę 2D o takim samym "wymiarze" jak `schedule`
        const temp = schedule.map(() => []);

        // 2) Wypełniamy ją obiektami
        for (let i = 0; i < schedule.length; i++) {
            temp[i].push({
                startH: schedule[i][0]?.startTime,
                nazwa: "Wyjście z hotelu",
                czasZwiedzania: 0,
                czasTransportu: schedule[i].length ? getMinutesDifference(schedule[i][0].startTime, schedule[i][1].startTime) : 0,
                rodzajTransportu: aktywnosci[i]?.baseActivityStart.selectedTransport || 'czasAutem'
            });
            for (let j = 1; j < schedule[i].length - 1; j++) {
                const startTime = schedule[i][j].startTime;
                const nextTime = schedule[i][j + 1].startTime;
                const act = aktywnosci[i].dayActivities[j - 1] || {};
                const nazwa = act.rodzaj || act.nazwa || '';
                const czas = act.czasZwiedzania || 0;
                const transportTime = getMinutesDifference(startTime, nextTime) - czas;
                const transportType = act.selectedTransport || 'czasAutem';

                temp[i].push({
                    startH: startTime,
                    nazwa,
                    czasZwiedzania: czas,
                    czasTransportu: transportTime,
                    rodzajTransportu: transportType
                });
            }
        }

        // 3) Aktualizacja stanu
        setTabAxis(temp);
    }, [schedule, aktywnosci]);

    const { scheduleLoadingGlobal, setScheduleLoadingGlobal } = useSchedule();
    if (scheduleLoadingGlobal) {
        return (
            <Loader />
        )
    }
    else {
        return (
            <OsCzasuDiv>
                <div className='osCzasuMainbox'>
                    Oś czasu wyjazdu
                    <div className="linieBox">
                        {tabAxis.map((dayPlan, dayIndex) => (
                            <>

                                <div className="dzienOs" key={dayIndex}>
                                    <a>Dzień {dayIndex + 1}</a>
                                    {dayPlan.map((dayAct, actIndex) => (
                                        <React.Fragment key={`${dayIndex}-${actIndex}`}>
                                            <LiniaCzasu
                                                godzinaRozpoczecia={dayAct.startH}
                                                czasZwiedzania={dayAct.czasZwiedzania}
                                                nazwa={dayAct.nazwa}
                                                colorTop="black"
                                            />
                                            <LiniaCzasu
                                                czasZwiedzania={dayAct.czasTransportu}
                                                colorTop="rgba(255, 0, 0, 0)"
                                            />
                                        </React.Fragment>
                                    ))}
                                    <LiniaCzasu
                                        godzinaRozpoczecia={schedule[dayIndex][schedule[dayIndex].length - 1]?.startTime || "22:00"}
                                        czasZwiedzania={0}
                                        nazwa={"Powrót do hotelu"}
                                        colorTop="black"
                                        key={`${dayIndex}-e`}
                                    />
                                </div>
                            </>
                        ))}
                    </div>
                </div>




            </OsCzasuDiv>
        );
    }

}



const LoaderMachine = () => {
    return (
        <StyledWrapper>
            <div className="typewriter">
                <div className="slide"><i /></div>
                <div className="paper" />
                <div className="keyboard" />
            </div>
        </StyledWrapper>
    );
}

const StyledWrapper = styled.div`
  .typewriter {
    --blue: #5cbbff;
    --blue-dark: #162d72;
    --key: #fff;
    --paper: #eef0fd;
    --text: #00000049;
    --tool: #ffbb00;
    --duration: 3s;
    position: relative;
    -webkit-animation: bounce05 var(--duration) linear infinite;
    animation: bounce05 var(--duration) linear infinite;
  }

  .typewriter .slide {
    width: 92px;
    height: 20px;
    border-radius: 3px;
    margin-left: 14px;
    transform: translateX(14px);
    background: linear-gradient(var(--blue), var(--blue-dark));
    -webkit-animation: slide05 var(--duration) ease infinite;
    animation: slide05 var(--duration) ease infinite;
  }

  .typewriter .slide:before,
  .typewriter .slide:after,
  .typewriter .slide i:before {
    content: "";
    position: absolute;
    background: var(--tool);
  }

  .typewriter .slide:before {
    width: 2px;
    height: 8px;
    top: 6px;
    left: 100%;
  }

  .typewriter .slide:after {
    left: 94px;
    top: 3px;
    height: 14px;
    width: 6px;
    border-radius: 3px;
  }

  .typewriter .slide i {
    display: block;
    position: absolute;
    right: 100%;
    width: 6px;
    height: 4px;
    top: 4px;
    background: var(--tool);
  }

  .typewriter .slide i:before {
    right: 100%;
    top: -2px;
    width: 4px;
    border-radius: 2px;
    height: 14px;
  }

  .typewriter .paper {
    position: absolute;
    left: 24px;
    top: -26px;
    width: 40px;
    height: 46px;
    border-radius: 5px;
    background: var(--paper);
    transform: translateY(46px);
    -webkit-animation: paper05 var(--duration) linear infinite;
    animation: paper05 var(--duration) linear infinite;
  }

  .typewriter .paper:before {
    content: "";
    position: absolute;
    left: 6px;
    right: 6px;
    top: 7px;
    border-radius: 2px;
    height: 4px;
    transform: scaleY(0.8);
    background: var(--text);
    box-shadow: 0 12px 0 var(--text), 0 24px 0 var(--text), 0 36px 0 var(--text);
  }

  .typewriter .keyboard {
    width: 120px;
    height: 56px;
    margin-top: -10px;
    z-index: 1;
    position: relative;
  }

  .typewriter .keyboard:before,
  .typewriter .keyboard:after {
    content: "";
    position: absolute;
  }

  .typewriter .keyboard:before {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 7px;
    background: linear-gradient(135deg, var(--blue), var(--blue-dark));
    transform: perspective(10px) rotateX(2deg);
    transform-origin: 50% 100%;
  }

  .typewriter .keyboard:after {
    left: 2px;
    top: 25px;
    width: 11px;
    height: 4px;
    border-radius: 2px;
    box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key),
      60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key),
      22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key),
      60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key);
    -webkit-animation: keyboard05 var(--duration) linear infinite;
    animation: keyboard05 var(--duration) linear infinite;
  }

  @keyframes bounce05 {
    85%,
    92%,
    100% {
      transform: translateY(0);
    }

    89% {
      transform: translateY(-4px);
    }

    95% {
      transform: translateY(2px);
    }
  }

  @keyframes slide05 {
    5% {
      transform: translateX(14px);
    }

    15%,
    30% {
      transform: translateX(6px);
    }

    40%,
    55% {
      transform: translateX(0);
    }

    65%,
    70% {
      transform: translateX(-4px);
    }

    80%,
    89% {
      transform: translateX(-12px);
    }

    100% {
      transform: translateX(14px);
    }
  }

  @keyframes paper05 {
    5% {
      transform: translateY(46px);
    }

    20%,
    30% {
      transform: translateY(34px);
    }

    40%,
    55% {
      transform: translateY(22px);
    }

    65%,
    70% {
      transform: translateY(10px);
    }

    80%,
    85% {
      transform: translateY(0);
    }

    92%,
    100% {
      transform: translateY(46px);
    }
  }

  @keyframes keyboard05 {
    5%,
    12%,
    21%,
    30%,
    39%,
    48%,
    57%,
    66%,
    75%,
    84% {
      box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key),
        60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key),
        22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key),
        60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key);
    }

    9% {
      box-shadow: 15px 2px 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key),
        60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key),
        22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key),
        60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key);
    }

    18% {
      box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key),
        60px 2px 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key),
        22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key),
        60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key);
    }

    27% {
      box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key),
        60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key),
        22px 12px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key),
        60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key);
    }

    36% {
      box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key),
        60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key),
        22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 12px 0 var(--key),
        60px 12px 0 var(--key), 68px 12px 0 var(--key), 83px 10px 0 var(--key);
    }

    45% {
      box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key),
        60px 0 0 var(--key), 75px 0 0 var(--key), 90px 2px 0 var(--key),
        22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key),
        60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key);
    }

    54% {
      box-shadow: 15px 0 0 var(--key), 30px 2px 0 var(--key), 45px 0 0 var(--key),
        60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key),
        22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key),
        60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key);
    }

    63% {
      box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key),
        60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key),
        22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key),
        60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 12px 0 var(--key);
    }

    72% {
      box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 2px 0 var(--key),
        60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key),
        22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key),
        60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key);
    }

    81% {
      box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key),
        60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key),
        22px 10px 0 var(--key), 37px 12px 0 var(--key), 52px 10px 0 var(--key),
        60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key);
    }
  }`;

export default LoaderMachine;

const PodsumowanieMainbox = styled.div`
width: 100%;
`


export const PodsumowanieKreator = ({ schedule = [], aktywnosci = [] }) => {
    const { scheduleLoadingGlobal, setScheduleLoadingGlobal } = useSchedule();

    return (
        <PodsumowanieMainbox>
            <div className='podsumowanie'>
                <div className='podsumowanieTitle'>

                    <LoaderMachine /><a>Podsumowanie</a>

                </div>
                <OsCzasu schedule={schedule} aktywnosci={aktywnosci} />
            </div>
        </PodsumowanieMainbox>

    )


}