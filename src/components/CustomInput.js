import React from "react";
import { useEffect } from "react";

const CustomInput = ({ customInput, setCustomInput, socketRef, roomId }) => {
  // useEffect()

  return (
    <>
      {" "}
      <textarea
        id="custom-input-text"
        rows="5"
        value={customInput}
        onChange={(e) => setCustomInput(e.target.value)}
        placeholder={`Custom input`}
      ></textarea>
    </>
  );
};

export default CustomInput;