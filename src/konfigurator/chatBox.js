import styled from "styled-components"

const ChatBoxMainboxWrapper = styled.div`
    margin-top: 20px;
    width: 90%;
    min-height: 400px;
    padding: 2px;
    display: flex;
    align-items: stretch;
    background: linear-gradient(135deg,rgba(255, 255, 255, 1) 0%, #008d73ff 50%, rgba(0, 255, 255, 1) 100%);
    justify-content: center;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 2px 2px 10px lightgray;
`

const ChatBoxMainbox = styled.div`
    width: 100%;
    background-color: white;
    border-radius: 18px;


`
export const ChatBox = () =>{

    return(
        <ChatBoxMainboxWrapper>
            <ChatBoxMainbox>

            </ChatBoxMainbox>

        </ChatBoxMainboxWrapper>
    )

}