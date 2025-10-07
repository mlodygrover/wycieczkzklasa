import React from 'react';
import styled from 'styled-components';
export const AktywnosciNaw = ({ dayIndex, activityIndex, onClick, rodzaj=0 }) => {
  const containerStyle = {
    visibility: dayIndex == null ? 'hidden' : 'visible'
  };

  return (
    <AktNaw style={containerStyle}>
      <div
        className='nawStrzalka'
        onClick={() => onClick?.(dayIndex, activityIndex, -1)}
      >
        <img src="../icons/icon-arrow.svg" alt="Arrow Left" />
      </div>
      {rodzaj === 0 ? (
    <>
      <div
        className='nawTrash'
        
      >
        <img src="../icons/icon-trash.svg" alt="Trash" />
      </div>
      <div
        className='nawStrzalka b'
        onClick={() => onClick?.(dayIndex, activityIndex, 1)}
      >
        <img src="../icons/icon-arrow.svg" alt="Arrow Right" />
      </div>
    </>
  ) : null}
      
    </AktNaw>
  );
};
const AktNaw = styled.div`
    
    padding: 3px 3px;
    width: fit-content;
    height: fit-content;
    border-radius: 900000px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    .nawStrzalka{
        background-color: #222222;
        width: 30px;
        height: 30px;
        border-radius: 5px;
        border-top-left-radius: 15px;
        border-top-right-radius: 15px;

        display: flex;
        align-items: center;
        justify-content: center;
        transition: 0.5s ease-in-out;
        cursor: pointer;
    }
    .nawStrzalka:hover{
        background-color: #444444;
    }
    .nawStrzalka.b{

        border-radius: 5px;
        border-bottom-left-radius: 15px;
        border-bottom-right-radius: 15px;
        img{
            transform: rotate(180deg);
        }

    }
    .nawTrash{
        background-color: rgb(230, 0, 0);
        width: 30px;
        height: 30px;
    
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: 0.5s ease-in-out;
    }
    .nawTrash:hover{
        background-color: rgb(200, 0, 0)
    }
`