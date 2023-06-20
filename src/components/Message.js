// import { Avatar } from "@mui/material";
import React from "react";
// import { v4 as uuidv4 } from 'uuid'
const Message = ({ uid, sender, time, content }) => {
  function stringToColor(string) {
    console.log(string);
    let hash = 0;
    let i;

    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    console.log(color);
    return color;
  }

  function stringAvatar(name) {
    return {
      sx: {
        bgcolor: stringToColor(name),
        width: 20,
        height: 25,
        radius: 5,
      },
      children: `${name.split(' ')[0][0]}${(name.split(' ').length > 1?name.split(' ')[1][0]:name.split(' ')[0][1])}`,
    };
  }
  return (
    <div className="chat_message" key={uid}>
      <div className="chat_message_content">
        <div className="chat_message_upper_row">
          <div className="chat_message_sender_name">{sender}</div>
          <div className="chat_message_time">{time}</div>
        </div>
        <div className="chat_actual_message" >
          {content}
        </div>
      </div>
    </div>
  );
};

export default Message;

