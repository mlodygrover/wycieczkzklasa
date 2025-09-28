import styled from "styled-components"

const WyborUczestnikowMainbox = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    padding: 10px 20px;
    gap: 10px;
    .wyborBox{
        font-size: 14px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-around;
        border-left: 4px solid orange;
        font-weight: 300;

        .numberButton{
            flex: 1;
            transition: 0.1s ease-in-out;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 500;

            &:hover{
                border-bottom: 3px solid orange;
                background-color: #f4f4f4;
                
            }   
        }
    
        .numberCounter{
            flex: 2;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
        
    
            
        }
        @media screen and (max-width: 800px){
            font-size: 12px;
            border-left: 2px solid orange;
            padding-left: 3px;
            .numberCounter{
                font-size: 14px;
            }
        }
    }
`
const NumberInputMainbox = styled.div`
    width: 120px;
    height: 30px;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    
    
`
export const NumberInput = ({ n = 3, setN }) => {

    return (
        <NumberInputMainbox>
            <div className="numberButton" onClick={() => {n > 0 && setN(n - 1)}}>
                -
            </div>
            <div className="numberCounter">
                {n}
            </div>
            <div className="numberButton" onClick={() => setN(n + 1)}>
                +
            </div>

        </NumberInputMainbox>

    )
}
export const WyborUczestnikow = ({ uczestnicy = 0, setUczestnicy, opiekunowie = 0, setOpiekunowie }) => {

    return (
        <WyborUczestnikowMainbox>
            <div className="wyborBox">
                Wybierz liczbę uczestników
                <NumberInput n={uczestnicy} setN={setUczestnicy} />
            </div>
            <div className="wyborBox">
                Wybierz liczbę opiekunów
                <NumberInput n={opiekunowie} setN={setOpiekunowie} />
            </div>
        </WyborUczestnikowMainbox>
    )
}