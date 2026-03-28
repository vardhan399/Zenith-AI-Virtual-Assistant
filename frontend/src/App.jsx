import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Customize from "./pages/Customize";
import Customize2 from "./pages/Customize2";
import Home from "./pages/Home";

import { userDataContext } from "./context/UserContext";

function App() {

  const { userData } = useContext(userDataContext);

  return (
    <Routes>

      {/* HOME */}
      <Route
        path="/"
        element={
          userData
            ? <Home />
            : <Navigate to="/signin" />
        }
      />

      {/* SIGNUP */}
      <Route
        path="/signup"
        element={
          !userData
            ? <SignUp />
            : <Navigate to="/" />
        }
      />

      {/* SIGNIN */}
      <Route
        path="/signin"
        element={
          !userData
            ? <SignIn />
            : <Navigate to="/" />
        }
      />

      {/* CUSTOMIZE STEP 1 */}
      <Route
        path="/customize"
        element={
          userData
            ? <Customize />
            : <Navigate to="/signin" />
        }
      />

      {/* CUSTOMIZE STEP 2 */}
      <Route
        path="/customize2"
        element={
          userData
            ? <Customize2 />
            : <Navigate to="/signin" />
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  );
}

export default App;
