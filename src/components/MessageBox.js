import React from 'react'
import CloseIcon from '@mui/icons-material/Close';
import Button from "@mui/material/Button";
import { TextField } from "@mui/material";
import { useState } from 'react';
import Message from './Message';
import { useEffect, useRef } from 'react';
import ACTIONS from '../Actions';
import { toast } from 'react-hot-toast';
const MessageBox = ({ socketRef, usr, roomId }) => {
    const hideChatWindow = async () => {
        document.getElementById('chat').style.display = 'none';
        document.getElementById('sidebar').style.display = 'block';
        document.getElementById("aside").style.background = "#1c1e29";
        document.getElementById("msg").style.display = "block";
    }
    const getTime = async () => {
        var today = new Date();
        let hours = today.getHours() > 12 ? today.getHours() - 12 : today.getHours();
        let d = today.getHours() > 12 ? "PM" : "AM";
        let time = hours + " : " + today.getMinutes();
        time = time + " " + d;
        time = time.toString();
        return time;
    }


    const [myMsg, setMyMsg] = useState("");
    const [allMessages, setAllMessages] = useState([]);
    const msgRef = useRef();
    let msgTmp = "";
    useEffect(() => {
        const init = async () => {
            if (socketRef.current) {
                socketRef.current.on("recive", ({ msg, name, time }) => {
                    toast.success(`${name} sent a new mesage.`);
                    let message = {
                        sender: name,
                        content: msg,
                        sentTime: time,
                    };
                    setAllMessages(currentArray => [...currentArray, message]);
                    setMyMsg("");
                })
            }
        }
        init();
    }, [socketRef.current]);

    useEffect(() => {
        const init = async () => {
            msgRef.current.addEventListener('click', (event) => {
                let xxx = document.getElementById('message-box').value;
                var today = new Date();
                let hours = today.getHours() > 12 ? today.getHours() - 12 : today.getHours();
                let d = today.getHours() > 12 ? "PM" : "AM";
                let time = hours + " : " + today.getMinutes();
                time = time + " " + d;
                if (xxx != null && xxx != "") {
                    socketRef.current.emit(ACTIONS.MSG, {
                        roomId,
                        msg: xxx,
                        name: usr.name,
                        time,
                    });
                    msgTmp = "";
                    const message = {
                        sender: usr.name,
                        content: xxx,
                        sentTime: time,
                    }
                    setAllMessages(currentArray => [...currentArray, message]);
                    xxx = null;
                    setMyMsg("");
                }
            })
        }
        init();
    }, []);

    return (
        <div id='chat'>
            <div className="close_chat_window">
                <h3>In-Room messages</h3>
                <CloseIcon onClick={hideChatWindow} />
            </div>
            <div className="chat_window_info_para">
                <p>
                    Messages can only be seen by people which are in room and will be
                    deleted when room ends
                </p>
            </div>
            <div id="outer">
                <div className="chat_messages_block">
                    {allMessages.map((message) => {
                        // console.log("ok",message);
                        return (
                            <>
                                <Message
                                    sender={message.sender}
                                    time={message.sentTime}
                                    content={message.content}
                                />
                            </>
                        );
                    })}
                </div>
            </div>
            {/* <br></br> */}
            <div className="chat_send_message" id="chat_send">
                <TextField
                    id="message-box"
                    onChange={(e) => {
                        setMyMsg(e.target.value);
                        msgTmp = myMsg;
                        // console.log("msg",myMsg);
                    }}
                    value={myMsg}
                    margin="normal"
                    inputProps={{ style: { color: "white"} }}
                    sx={{
                        "& .MuiInputLabel-root": { color: "white" },
                        border: "1px solid white",
                        borderRadius: 1
                      }}
                />
                <Button variant="contained" color="success" ref={msgRef}>
                    Send
                </Button>
            </div>
        </div>
    )
}

export default MessageBox
