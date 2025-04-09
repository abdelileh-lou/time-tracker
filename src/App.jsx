import React from "react";
import NavBar from "./components/NavBar";
import Login from "./components/Login";
import Landing from "./pages/landing";
import Footer from "./components/Footer";
import Admin from "./components/Admin/Admin";
import EmployeeDashboard from "./components/Employee/EmployeeDashboard ";
import ScanPointage from "./pages/ScanPointage";
import Error from "./pages/Error";
import { Route, Routes } from "react-router-dom";

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
        {/* Scan Pointage route */}
        <Route path="/scan-pointage" element={<ScanPointage />} />
        <Route path="/*" element={<Error />} />
      </Routes>
    </>
  );
};

export default App;
