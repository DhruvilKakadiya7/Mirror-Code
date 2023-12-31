
import React from 'react'
import Button from "@mui/material/Button";
import { TextField } from "@mui/material";
import { useState } from 'react';
import Message from './Message';
import { useEffect, useRef } from 'react';
import ACTIONS from '../Actions';
import { toast } from 'react-hot-toast';
import LogoutIcon from '@mui/icons-material/Logout';
import { v4 as uuidv4 } from 'uuid';

const MessageBox = ({ socketRef, usr, roomId }) => {
    const hideChatWindow = async () => {
        document.getElementById('chat').style.display = 'none';
        document.getElementById('sidebar').style.display = 'block';
        document.getElementById("aside").style.background = "#1c1e29";
        document.getElementById("btnlist").style.display = "flex";
        // document.getElementById("leave").style.display = "block";
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
                let time = hours + ":" + (today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes());
                time = time + " " + d;
                if (xxx != null && xxx != "") {
                    console.log(xxx);
                    socketRef.current.emit(ACTIONS.MSG, {
                        roomId,
                        msg: xxx,
                        name: usr.name,
                        time,
                    });
                    msgTmp = "";
                    const message = {
                        uid: uuidv4(),
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
            <div className='upperpart'>
                <div className="close_chat_window parent-element">
                    <div className='child-element magenta'>
                        <h3>Messages</h3>
                    </div>
                    <div className="child-element green tooltip" title='leave message room'>
                        <LogoutIcon onClick={hideChatWindow} />
                    </div>
                </div>
                <div className="chat_window_info_para">
                    <p>
                        Messages can only be seen by people which are in room and will be
                        deleted when room ends
                    </p>
                </div>
                <div id="outer" className='outer'>
                    <div className="chat_messages_block">
                        {allMessages.map((message) => {
                            return (
                                <>
                                    <Message
                                        key={message.uid}
                                        uid={message.uid}
                                        sender={message.sender}
                                        time={message.sentTime}
                                        content={message.content}
                                    />
                                </>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div className="chat_send_message" id="chat_send">
                <TextField
                    id="message-box"
                    onChange={(e) => {
                        setMyMsg(e.target.value);
                        msgTmp = myMsg;
                    }}
                    value={myMsg}
                    margin="normal"
                    inputProps={{ style: { color: "white", overflow: "hidden", width: '100%' } }}
                    multiline
                    maxRows={2}
                    minRows={2}
                    sx={{
                        "& .MuiInputLabel-root": { color: "white" },
                        border: "1px solid white",
                        borderRadius: 1
                    }}
                />
                <Button variant="contained" color="success" ref={msgRef} className='sendbtn'>
                    Send
                </Button>
            </div>
        </div>
    )
}

export default MessageBox
