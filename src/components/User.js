import React from 'react'
import { createAvatar } from '@dicebear/core';
import { initials } from '@dicebear/collection';
import Svg from "react-inlinesvg";

const User = ({username}) => {
    const colors = ["00897b","00acc1","039be5","3949ab","43a047","8e24aa","7cb342","43a047","d81b60","c0ca33","f4511e","e53935"];
    const rnd = ()=>{
        return Math.floor(Math.random() * colors.length);
    }
    const degrees = [];
    for(let i=0;i<360;i+=10){
        degrees.push(i);
        degrees.push(-i);
    }
    const rnd1 = ()=>{
        return Math.floor(Math.random() * degrees.length);
    }
    
    const avatar = createAvatar(initials, {
        seed: username,
        radius: 30,
        size: 50,
        backgroundColor: [colors[rnd()],colors[rnd()]],
        backgroundType: ["gradientLinear"],
        backgroundRotation: [degrees[rnd1()]],
        fontFamily: ["Tahoma","Arial"],
    });

    const svg = avatar.toString();
    return (
        <div className="user">
            <Svg src={svg} id={username}/>
            <span className="userName">{username}</span>
        </div>
    );
}

export default User
