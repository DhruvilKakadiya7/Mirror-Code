<<<<<<< HEAD
import React, { useState } from 'react'
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid'

const Home = () => {
    const [roomId, setRoomId] = useState('');
    const [username,setUsername] = useState('');
    const navigate = useNavigate();
    const createNewRoom = (ele) =>{
        ele.preventDefault();
        const id = uuidv4();
        setRoomId(id);
        toast.success('Created a new room.')
    }

    const joinRoom = ()=>{
        if(!roomId || !username){
            toast.error('ROOM ID & username is required');
            return;
        }
        if(username.length < 2){
            toast.error('username is too small');
            return;
        }
        navigate(`/room/${roomId}`,{
            state:{
                username,
            },
        });
    }

    const handleInput = (ele)=>{
        if(ele.code === 'Enter'){
            joinRoom();
        }
        
    }
    return (
        <div className="limiter">
            <div className="container-login100">
                <div className="wrap-login100 p-l-110 p-r-110 p-t-62 p-b-33">
                    <form className="login100-form validate-form flex-sb flex-w">
                        <h4 className='MainLable'>Paste Invitation ROOM ID</h4>
                        <div className="wrap-input100 validate-input">
                            <input
                                className="input100"
                                type="text"
                                placeholder='ROOM ID'
                                onChange={(e)=>setRoomId(e.target.value)} 
                                value={roomId}
                                onKeyUp={handleInput}
                            />
                            <span className="focus-input100"></span>
                        </div>
                        <br />
                        <div className="wrap-input100 validate-input">
                            <input
                                className="input100"
                                type="text"
                                placeholder="USERNAME"
                                onChange={(e)=>setUsername(e.target.value)} 
                                value={username}
                                onKeyUp={handleInput}
                            />
                            <span className="focus-input100"></span>
                        </div>
                        <br />
                        <div className="container-login100-form-btn m-t-17">
                            <button className="login100-form-btn" onClick={joinRoom}>
                                Enter
                            </button>
                        </div>
                        <br />
                        <span className='createInfo'>
                            If you don't have invitation &nbsp;
                            <a href="/" className='createNewBtn' onClick={createNewRoom}>new room</a>
                        </span>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Home
=======
import React, { useState } from 'react'
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid'

const Home = () => {
    const [roomId, setRoomId] = useState('');
    const [username,setUsername] = useState('');
    const navigate = useNavigate();
    const createNewRoom = (ele) =>{
        ele.preventDefault();
        const id = uuidv4();
        setRoomId(id);
        toast.success('Created a new room.')
    }

    const joinRoom = ()=>{
        if(!roomId || !username){
            toast.error('ROOM ID & username is required');
            return;
        }
        if(username.length < 2){
            toast.error('username is too small');
            return;
        }
        navigate(`/room/${roomId}`,{
            state:{
                username,
            },
        });
    }

    const handleInput = (ele)=>{
        if(ele.code === 'Enter'){
            joinRoom();
        }
        
    }
    return (
        <div className="limiter">
            <div className="container-login100">
                <div className="wrap-login100 p-l-110 p-r-110 p-t-62 p-b-33">
                    <form className="login100-form validate-form flex-sb flex-w">
                        <h4 className='MainLable'>Paste Invitation ROOM ID</h4>
                        <div className="wrap-input100 validate-input">
                            <input
                                className="input100"
                                type="text"
                                placeholder='ROOM ID'
                                onChange={(e)=>setRoomId(e.target.value)} 
                                value={roomId}
                                onKeyUp={handleInput}
                            />
                            <span className="focus-input100"></span>
                        </div>
                        <br />
                        <div className="wrap-input100 validate-input">
                            <input
                                className="input100"
                                type="text"
                                placeholder="USERNAME"
                                onChange={(e)=>setUsername(e.target.value)} 
                                value={username}
                                onKeyUp={handleInput}
                            />
                            <span className="focus-input100"></span>
                        </div>
                        <br />
                        <div className="container-login100-form-btn m-t-17">
                            <button className="login100-form-btn" onClick={joinRoom}>
                                Enter
                            </button>
                        </div>
                        <br />
                        <span className='createInfo'>
                            If you don't have invitation &nbsp;
                            <a href="/" className='createNewBtn' onClick={createNewRoom}>new room</a>
                        </span>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Home
>>>>>>> e517c679396531f83abc888ad2b734fda4d51d8b
