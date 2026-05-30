import React from "react";
import { useContext } from "react";
import { userDataContext } from "../context/UserContext";

function Card({ image }) {
   const {
      serverUrl,
      userData,
      setUserData,
      selected,
      setSelected,
      backendImage,
      setBackendImage,
      selectedAvatar,
      setSelectedAvatar,
    } = useContext(userDataContext);
  return (
   
    <img
      src={image}
      alt="avatar"
      className="w-full h-full object-cover rounded-full"
      onClick={() => {
        setSelectedAvatar(image);
        setBackendImage(null);
        setSelected(null);
      }}
      />
     

  );
}

export default Card;
