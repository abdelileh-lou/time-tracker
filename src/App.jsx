import React from "react";
import NavBar from "./components/NavBar";
import Login from "./components/Login";
import Landing from "./pages/landing";
import Footer from "./components/Footer";
import Admin from "./components/Admin/Admin";
import EmployeeDashboard from "./components/Employee/EmployeeDashboard";
import ScanPointage from "./pages/ScanPointage";
import ManagerDashboard from "./components/Manager/ManagerDashboard";
import ChefServiceDashboard from "./components/ChefService/ChefServiceDashboard";
import Error from "./pages/Error";
import { Route, Routes } from "react-router-dom";

window.global = window;

const App = () => {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <NavBar /> <Landing /> <Footer />
            </>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/employee" element={<EmployeeDashboard />} />
        <Route path="/manager" element={<ManagerDashboard />} />
        <Route path="/chef" element={<ChefServiceDashboard />} />
        {/* Scan Pointage route */}
        <Route path="/scan-pointage" element={<ScanPointage />} />

        <Route path="/*" element={<Error />} />
      </Routes>
    </>
  );
};

export default App;
