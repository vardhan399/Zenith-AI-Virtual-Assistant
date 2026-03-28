import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const userDataContext = createContext();

const UserContext = ({ children }) => {
  const serverUrl = "http://localhost:8000";

  const [userData, setUserData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const handleCurrentUser = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/user/current`,
        { withCredentials: true }
      );
      setUserData(result.data.user || result.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getGeminiResponse = async (command) => {
    try{
      const result = await axios.post(
        `${serverUrl}/api/user/asktoassistant`,
        { command },
        { withCredentials: true }
      );
      return result.data;
    }
    catch(err){
      console.log(err);
    }
  }

  useEffect(() => {
    handleCurrentUser();
  }, []);

  const value = {
    serverUrl,
    userData,
    setUserData,
    selected,
    setSelected,
    backendImage,
    setBackendImage,
    selectedAvatar,
    setSelectedAvatar,
    getGeminiResponse,
  };

  return (
    <userDataContext.Provider value={value}>
      {children}
    </userDataContext.Provider>
  );
};

export default UserContext;
 