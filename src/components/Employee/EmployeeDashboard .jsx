import React, { useState, useEffect } from "react";
import { User, Calendar, Clock, Settings, Edit, LogOut } from "lucide-react";
import { getUserData, logout } from "../../Auth/auth";
import { useNavigate } from "react-router-dom";
import PlanningView from "./PlanningView ";
import PointageView from "./PointageView ";
import ProfileView from "./ProfileView ";
import EditProfileView from "./EditProfileView ";

const EmployeeDashboard = () => {
  const [activeTab, setActiveTab] = useState("planning");
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  console.log(employee);
  // Get the current employee data from auth
  console.log("Employee data:", employee);

  useEffect(() => {
    const currentUser = getUserData();
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setEmployee(currentUser);
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white">
        <div className="p-4 text-xl font-bold border-b border-gray-700">
          {employee?.name || "Employee"} Dashboard
        </div>

        <div className="p-4">
          {employee && (
            <div className="flex items-center mb-6">
              <div className="bg-gray-600 rounded-full p-2">
                <User size={24} />
              </div>
              <div className="ml-3">
                <div className="font-medium">{employee.name}</div>
                <div className="text-sm text-gray-400">{employee.email}</div>
              </div>
            </div>
          )}

          <nav>
            <button
              onClick={() => setActiveTab("planning")}
              className={`flex items-center w-full p-3 mb-2 rounded ${
                activeTab === "planning" ? "bg-gray-700" : "hover:bg-gray-700"
              }`}>
              <Calendar size={20} />
              <span className="ml-3">Mon Planning</span>
            </button>

            <button
              onClick={() => setActiveTab("pointage")}
              className={`flex items-center w-full p-3 mb-2 rounded ${
                activeTab === "pointage" ? "bg-gray-700" : "hover:bg-gray-700"
              }`}>
              <Clock size={20} />
              <span className="ml-3">Mes Pointages</span>
            </button>

            <button
              onClick={() => navigate("/scan-pointage")} // Using navigate instead of setActiveTab since it's a separate page
              className="flex items-center w-full p-3 mb-2 rounded hover:bg-gray-700">
              <Clock size={20} />
              <span className="ml-3">Scanner Pointage</span>
            </button>

            <div className="mt-6 mb-2 text-sm font-medium text-gray-400 uppercase">
              Gérer Profile
            </div>

            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center w-full p-3 mb-2 rounded ${
                activeTab === "profile" ? "bg-gray-700" : "hover:bg-gray-700"
              }`}>
              <User size={20} />
              <span className="ml-3">Consulter Profile</span>
            </button>

            <button
              onClick={() => setActiveTab("editProfile")}
              className={`flex items-center w-full p-3 mb-2 rounded ${
                activeTab === "editProfile"
                  ? "bg-gray-700"
                  : "hover:bg-gray-700"
              }`}>
              <Edit size={20} />
              <span className="ml-3">Modifier Profile</span>
            </button>
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-3 text-red-400 hover:bg-gray-700 rounded">
              <LogOut size={20} />
              <span className="ml-3">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-lg">Chargement...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-lg text-red-500">{error}</div>
          </div>
        ) : (
          <div className="p-6">
            {activeTab === "planning" && <PlanningView employee={employee} />}
            {activeTab === "pointage" && <PointageView employee={employee} />}
            {activeTab === "profile" && <ProfileView employee={employee} />}
            {activeTab === "editProfile" && (
              <EditProfileView employee={employee} setEmployee={setEmployee} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
