import styled from "styled-components"

const ChatBoxMainboxWrapper = styled.div`
    margin-top: 20px;
    width: 90%;
    min-height: 400px;
    padding: 2px;
    display: flex;
    align-items: stretch;
    background: linear-gradient(135deg,rgba(255, 255, 255, 1) 0%, #00e5bbff 50%, rgba(0, 255, 255, 1) 100%);
    justify-content: center;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 2px 2px 10px lightgray;
`

const ChatBoxMainbox = styled.div`
    width: 100%;
    background-color: #ffffffff;
    border-radius: 18px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 20px 5px;
    .message{
        display: flex;
        background-color: #e9e9e9;
        max-width: 70%;
        border-radius: 15px;
        font-size: 13px;
        text-align: left;
        padding: 5px 10px;
        font-weight: 400;
        color: #202020;
    }
    .wypelniacz{
        flex: 1;
    }
    .sendMessageBox{
        height: 50px;
        width: 100%;
        background-color: #f0f0f0;
        border-radius: 20px;
    }
`
export const ChatBox = () =>{

    return(
        <ChatBoxMainboxWrapper>
            <ChatBoxMainbox>
                <div className="message a">
                    Cześć, potrzebujesz pomocy z przygotowaniem planu?
                </div>
                <div className="wypelniacz"></div>
                <div className="sendMessageBox">

                </div>

            </ChatBoxMainbox>

        </ChatBoxMainboxWrapper>
    )

}