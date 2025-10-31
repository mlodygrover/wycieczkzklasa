import React, { useState } from "react";
import styled from "styled-components";

const AddGuidePopupMainbox = styled.div`
  width: calc(100vw - 60px);
  max-width: 800px;
  min-height: 400px;
`;

const AddGuideNav = styled.div`
  width: 180px;
  height: 24px;
  display: flex;
  gap: 8px;
  align-items: center;

  /* ukryj natywne radio */
  input[type="radio"] {
    display: none;
  }

  label {
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .guideNavRadio {
    background-color: gray;
    height: 15px;
    width: 15px;
    transition: 0.3s ease;
    border-radius: 9999px;
  }

  .guideNavRadio.chosen {
    width: 60px;
    background-color: #00cfa9ff;
  }
`;

export const AddGuidePopup = () => {
    const [chosenSlide, setChosenSlide] = useState(0);

    return (
        <AddGuidePopupMainbox>
            abcd
            <AddGuideNav>
                {/* slide 0 */}
                <label>
                    <input
                        type="radio"
                        name="guideSlide"
                        value="0"
                        checked={chosenSlide === 0}
                        onChange={() => setChosenSlide(0)}
                    />
                    <div className={chosenSlide === 0 ? "guideNavRadio chosen" : "guideNavRadio"} />
                </label>

                {/* slide 1 */}
                <label>
                    <input
                        type="radio"
                        name="guideSlide"
                        value="1"
                        checked={chosenSlide === 1}
                        onChange={() => setChosenSlide(1)}
                    />
                    <div className={chosenSlide === 1 ? "guideNavRadio chosen" : "guideNavRadio"} />
                </label>

                {/* slide 2 */}
                <label>
                    <input
                        type="radio"
                        name="guideSlide"
                        value="2"
                        checked={chosenSlide === 2}
                        onChange={() => setChosenSlide(2)}
                    />
                    <div className={chosenSlide === 2 ? "guideNavRadio chosen" : "guideNavRadio"} />
                </label>

                {/* slide 3 */}
                <label>
                    <input
                        type="radio"
                        name="guideSlide"
                        value="3"
                        checked={chosenSlide === 3}
                        onChange={() => setChosenSlide(3)}
                    />
                    <div className={chosenSlide === 3 ? "guideNavRadio chosen" : "guideNavRadio"} />
                </label>
            </AddGuideNav>
        </AddGuidePopupMainbox>
    );
};
