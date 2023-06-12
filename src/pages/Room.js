import React, { useEffect, useRef, useState } from 'react'
import User from '../components/User';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import ACTIONS from '../Actions';
import MessageBox from '../components/MessageBox';
const Room = () => {
    const socketRef = useRef(null);
    const [users, setUsers] = useState([])
    const reactNavigator = useNavigate();
    const location = useLocation();
    const codeRef = useRef(null);
    const { roomId } = useParams();
    const usr = {name: location.state?.username};
    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket();
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
                }
            );

            socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                    console.log('okk',code);
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
        return ()=>{
            socketRef.current.disconnect();
            socketRef.current.off(ACTIONS.JOINED);
            socketRef.current.off(ACTIONS.DISCONNECTED);
        };
    }, []);



    const cpyRoomID = async () => {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('ROOM ID copied to clipboard');
        } catch (e) {
            toast.error('Could not copy ROOM ID.');
            console.log(e);
        }
    }

    const openChat = async()=>{
        document.getElementById("chat").style.display = "block";
        document.getElementById("sidebar").style.display = "none";
        // background-color:#7d777d;
        document.getElementById("aside").style.background = "#27374D";
        document.getElementById("msg").style.display = "none";
    }

    const leaveRoom = () => {
        reactNavigator('/');
    }

    if (!location.state) {
        return <Navigate to="/" />
    }
    return (
        <div className='mainWrap'>
            

            <div className='editorWrap'>
                <Editor
                    roomId={roomId} 
                    socketRef={socketRef} 
                    codeRef={codeRef}
                    onCodeChange = {(code)=>{
                        codeRef.current=code;
                    }} 
                    />
            </div>
            <div className='aside' id='aside'>
                <MessageBox socketRef={socketRef} usr={usr} roomId={roomId}></MessageBox>
                <div className='asideInner' id='sidebar'>
                    <h4>Online:</h4>
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
                <button className='btnxx copyBtn' onClick={cpyRoomID}>
                    Copy ROOM ID
                </button>
                <button className='btnxx2 leaveBtn' onClick={leaveRoom}>
                    Leave
                </button>
            </div>
        </div>
    )
}

export default Room
