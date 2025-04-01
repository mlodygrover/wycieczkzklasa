import React, { useState, useEffect, useMemo } from 'react';
import styled, {keyframes} from 'styled-components';
import { MacbookLoader } from './Macbook';

export const SlideKonfiguracja = () =>{

    return(
        <SlideKonfiguracjaStyle>
        <div className='SlideKonfiguracja-mainbox'>
            <MacbookLoader/>
            <div className='SlideKonfiguracja-tekst-przyciski'>
                <div className='SlideKonfiguracja-tekst'>
                    <a>
                        Masz już pomysł?
                    </a>
                    <div style={{fontSize: '25px'}}>
                        Przejdź do działania!
                    </div>
                </div>
                <div className='SlideKonfiguracja-przyciski'>
                    <button><a>Konfigurator<br></br><span style={{fontSize: '16px'}}>stwórz swój własny projekt</span></a></button>
                    <button><a>Modyfikuj<br></br><span style={{fontSize: '16px'}}>dostosuj gotowy projekt</span></a></button>
                </div>

            </div>
        </div>
        </SlideKonfiguracjaStyle>

    )

}
const SlideKonfiguracjaStyle = styled.div`
    .SlideKonfiguracja-mainbox{
        margin-top: 50px;
        width: 100%;
        height: 300px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 100px;
    }
    .SlideKonfiguracja-tekst-przyciski{
        display: flex;
        flex-direction: column;
        gap: 30px;
    }
    .SlideKonfiguracja-tekst{
        display: flex;
        flex-direction: column;
    }
    .SlideKonfiguracja-tekst a{
        font-size: 40px;
        font-weight: 500;
    }
    .SlideKonfiguracja-przyciski button{
        width: 300px;
        height: 70px;
        border-radius: 35px;
        border: none;
        color: white;
        background-color: black;
        cursor: pointer;
        font-size: 22px;
        margin: 5px;
    }
    .SlideKonfiguracja-przyciski button:hover{
        background-color: #F42582;
        transition: 0.3s ease-in-out;
        
    }



`