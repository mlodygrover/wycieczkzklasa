import React, { useState, useEffect, useMemo } from 'react';
import styled, {keyframes} from 'styled-components';

const StyledHeartIcon = styled.div`
  cursor: pointer;
  
  &:hover svg path {
    stroke: black;
    /* Jeśli chcesz również, aby fill się zmieniał (np. gdy nie jest polubione) możesz odkomentować poniższą linię: */
    /* fill: black; */
    
  }
`;

export const HeartIcon = () => {
    const [liked, setLiked] = useState(false);
  
    const markLike = (e) => {
      e.stopPropagation(); // zatrzymuje propagację kliknięcia
      setLiked(!liked);
    };
  
    return (
      <StyledHeartIcon onClick={markLike}>
        <svg
          id="serce"
          width="20px"
          height="20px"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill={liked ? "black" : "none"}
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z"
            stroke={!liked ? "gray" : "black"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </StyledHeartIcon>
    );
  };
  

export const CityResult = ({miasto}) =>{

    const getCityImageUrl = (cityName) => {
        const normalizedName = cityName
          .toLowerCase()                                
          .normalize('NFD')                             
          .replace(/[\u0300-\u036f]/g, "");              
          
        return `miasta/${normalizedName}.jpg`;
      };

    const pic = getCityImageUrl(miasto.nazwa);

    return(
        <>  
        <StyledCityResult>
            
            <div className='CityResult'>
                
                <HeartIcon/>

                <img src={pic} height={'100%'} width={'auto'}/>
                <div className='CityResult-stats'>
               
                <a>
                <svg width="20px" height="20px" viewBox="0 0 1024 1024" class="icon"  version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M513.2 56.6c-164 0-296.9 131-296.9 292.6 0 50.2 12.8 97.4 35.4 138.6 37.7 69 166.6 266.1 228.3 359.6 29.8 27.9 59 6.4 66.5 0 61.3-93.3 189.3-289.6 227.3-357.6 23.3-41.7 36.5-89.7 36.5-140.6-0.2-161.6-133.1-292.6-297.1-292.6z m214.2 413.6c-36.1 61-163.5 264.3-202.7 326.8-8.2 2.9-15.9 2.5-23 0-38.9-62.3-165.5-264.9-201.8-325.2-21.7-36.1-34.2-78.2-34.2-123.1 0-134 110.8-242.7 247.4-242.7s247.4 108.6 247.4 242.7c0.1 44.3-12 85.8-33.1 121.5z" fill="#EF6D64" /><path d="M513.2 477.7c-70.8 0-128.4-57.6-128.4-128.4s57.6-128.4 128.4-128.4 128.4 57.6 128.4 128.4S584 477.7 513.2 477.7z m0-208.7c-44.3 0-80.3 36-80.3 80.3s36 80.3 80.3 80.3 80.3-36 80.3-80.3-36-80.3-80.3-80.3zM511.9 969.6c-163.4 0-286.6-59.6-286.6-138.7 0-46.1 42.4-87.2 116.4-112.7 11.5-4 24.1 2.1 28 13.6 4 11.5-2.1 24.1-13.6 28-53.5 18.5-86.7 45.7-86.7 71.1 0 44.7 99.6 94.6 242.5 94.6s242.5-49.9 242.5-94.6c0-25.4-33.3-52.6-86.8-71.1-11.5-4-17.6-16.5-13.6-28 4-11.5 16.5-17.6 28-13.6 74 25.5 116.5 66.7 116.5 112.8 0 78.9-123.2 138.6-286.6 138.6z" fill="#EF6D64" /></svg>
                {miasto.nazwa}
                </a>
                <a>
                <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
               
                <path d="M3 9H21M7 3V5M17 3V5M6 12H8M11 12H13M16 12H18M6 15H8M11 15H13M16 15H18M6 18H8M11 18H13M16 18H18M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z" stroke="#EF6D64" stroke-width="2" stroke-linecap="round"/>
                </svg>

                {miasto.czas}{miasto.czas > 1 ? " dni" : " dzień" }
                </a>
                </div>
            </div>
        </StyledCityResult>
        </>
        
    )
}
const StyledCityResult = styled.div`

width: 100%;


.CityResult{
    width: 100%;
    height: 40px;
    overflow: hidden;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding-bottom: 5px;
    border-bottom: 0.3px solid black;
}
.CityResult-stats{
display: flex;
flex-direction: row;
gap: 10px;
height: 100%;
}
.CityResult a{
display: flex;
text-align: center;
height: fit-content;
gap: 5px;
}
@media screen and (max-width: 800px){

.CityResult-stats{
flex-direction: column;
gap: 2px;
}
}
.CityResult-serce-przycisk{
    display: flex;
    align-items: center;
}


`