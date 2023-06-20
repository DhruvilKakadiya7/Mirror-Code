import React, { useEffect, useRef, useState } from 'react'
import User from '../components/User';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import ACTIONS from '../Actions';
import MessageBox from '../components/MessageBox';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SplitPane, { Pane } from 'split-pane-react';
import 'split-pane-react/esm/themes/default.css';
import { languageOptions } from '../constants/languageOptions';

const Room = () => {
    const socketRef = useRef(null);
    const [users, setUsers] = useState([])
    const reactNavigator = useNavigate();
    const location = useLocation();
    const codeRef = useRef(null);
    const { roomId } = useParams();
    const usr = { name: location.state?.username };
    const [sizes, setSizes] = useState(['86%', '14%']);
    const customInpRef = useRef(null);
    const outputRef = useRef(null);
    const runningRef = useRef(null);
    const langRef = useRef(null);
    
    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket();
            customInpRef.current="";
            langRef.current=languageOptions[0];
            runningRef.current=false;
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));

            function handleErrors(e) {
                console.log('socket error', e);
                toast.error('Socket connection failed, try again later.');
                reactNavigator('/');
            }

            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                username: location.state?.username,
            });

            socketRef.current.on(ACTIONS.JOINED,
                ({ users, username, socketId }) => {
                    if (username !== location.state?.username) {
                        toast.success(`${username} joined the room.`);
                        console.log(`${username} joined.`);
                    } 
                    setUsers(users);
                    socketRef.current.emit(ACTIONS.SYNC_CODE, {
                        code: codeRef.current,
                        socketId,
                    });
                    // console.log("sync",document.getElementById('custom-input-text').value,langRef.current);
                    // console.log('Input',customInpRef.current);
                    // console.log('output',outputRef.current);
                    // console.log('language',langRef.current);
                    // console.log('running',runningRef.current);
                    socketRef.current.emit(ACTIONS.SYNC_INP_OUT_SEC,{
                        inp: customInpRef.current,
                        out: outputRef.current,
                        lang: langRef.current,
                        running: runningRef.current,
                        socketId,
                    })
                }
            );

            socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                console.log('okk', code);
            });

            socketRef.current.on(
                ACTIONS.DISCONNECTED,
                ({ socketId, username }) => {
                    toast.success(`${username} left the room.`);
                    setUsers((prev) => {
                        return prev.filter(
                            (client) => client.socketId !== socketId
                        );
                    });
                }
            );
        };
        init();
        return () => {
            socketRef.current.disconnect();
            socketRef.current.off(ACTIONS.JOINED);
            socketRef.current.off(ACTIONS.DISCONNECTED);
        };
    }, [location.state?.username,reactNavigator,roomId]);



    const cpyRoomID = async () => {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('ROOM ID copied to clipboard');
        } catch (e) {
            toast.error('Could not copy ROOM ID.');
            console.log(e);
        }
    }

    const openChat = async () => {
        document.getElementById("chat").style.display = "flex";
        document.getElementById("sidebar").style.display = "none";
        // background-color:#7d777d;
        document.getElementById("aside").style.background = "#27374D";
        document.getElementById("msg").style.display = "none";
        document.getElementById("leave").style.display = "none";
    }

    const leaveRoom = () => {
        reactNavigator('/');
    }

    if (!location.state) {
        return <Navigate to="/" />
    }
    return (

        <div className='mainWrap'>
            <SplitPane
                split='vertical'
                sizes={sizes}
                onChange={setSizes}
            >
                <Pane minSize='50%' maxSize='90%'>
                <div className='editorWrap'>
                        <Editor
                            roomId={roomId}
                            socketRef={socketRef}
                            codeRef={codeRef}
                            onCodeChange={(code) => {
                                codeRef.current = code;
                            }}
                            onInpChnage={(inp)=>{
                                customInpRef.current = inp;
                            }}
                            onRunChnage={(running)=>{
                                runningRef.current = running;
                            }}
                            onOutputChange={(output)=>{
                                outputRef.current=output;
                            }}
                            onLangChange={(lang)=>{
                                langRef.current=lang;
                            }}
                        />
                    </div>
                </Pane>
                <div className='aside' id='aside'>
                        <MessageBox socketRef={socketRef} usr={usr} roomId={roomId}></MessageBox>

                        <div className='asideInner' id='sidebar'>
                            <div className="parent-element">
                                <div className="child-element magenta"><h4>Online:</h4></div>
                                <div className="child-element green tooltip">
                                    <ContentCopyIcon id="copy-btn" onClick={cpyRoomID} />
                                    <span className="tooltiptext">Copy RoomId</span>
                                </div>
                            </div>
                            <br></br>
                            <div className='usersList'>
                                {users.map((user) => (
                                    <User
                                        key={user.socketId}
                                        username={user.username}
                                    />
                                ))}
                            </div>
                        </div>

                        <button className='btnxx copyBtn' id='msg' onClick={openChat}>
                            Message Room
                        </button>
                        <button className='btnxx2 leaveBtn' id="leave" onClick={leaveRoom}>
                            Leave
                        </button>
                    </div>
            </SplitPane>


        </div>
    )
};

export default Room;
