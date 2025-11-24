import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import DashBoard from "./pages/Dashboard";

const App: React.FC = () => {

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<DashBoard />} /> 
    </Routes>
  );

};


export default App;