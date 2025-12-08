import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import DashBoard from "./pages/Dashboard";
import Payments from "./pages/Payments";


const App: React.FC = () => {

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<DashBoard />} /> 
      <Route path="/payments" element={<Payments />} />
    </Routes>
  );

};


export default App;