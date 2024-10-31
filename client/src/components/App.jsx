// imports
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import SignUp from "./SignUp";
import Notes from "./Notes";
import Login from "./Login";



export default function App() {
  // const [isAuthenticated, setIsAuthenticated] = useState(false);

  // useEffect(() => {
  //   // Check authentication status on load
  //   const checkAuthStatus = async () => {
  //     try {
  //       const response = await axios.get("/api/auth/check");
  //       console.log(response.data.auth);
  //       setIsAuthenticated(parseInt(response.data.auth) == 200);
  //       console.log(isAuthenticated);
  //     } catch (error) {
  //       setIsAuthenticated(false);
  //     }
  //   };
  //   checkAuthStatus();
  // }, []);
    return (
        <Router>
        <Routes>
          <Route path="/SignUp" element={<SignUp />} />
          <Route path="/LogIn" element={<Login />} />
          <Route path="/" element={<Notes /> }/>
        </Routes>
      </Router>
       
    );
} 