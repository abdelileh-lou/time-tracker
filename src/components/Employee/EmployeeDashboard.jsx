import React, { useState, useEffect, useRef } from "react";
import { User, Calendar, Clock, Settings, Edit, LogOut, Monitor, CalendarClock, Building2 } from "lucide-react";
import { getUserData, logout } from "../../Auth/auth";
import { useNavigate } from "react-router-dom";
import PlanningView from "./PlanningView";
import PointageView from "./PointageView";
import ProfileView from "./ProfileView";
import EditProfileView from "./EditProfileView";
import axios from "axios";

const EmployeeDashboard = () => {
  const [activeTab, setActiveTab] = useState("planning");
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Add refs for video and canvas if needed
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const currentUser = getUserData();
        if (!currentUser) {
          navigate("/login");
          return;
        }

        // Fetch additional employee data if needed
        const response = await axios.get(`http://localhost:8092/api/employee/${currentUser.id}`);
        setEmployee(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching employee data:", error);
        setError("Failed to load employee data");
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-2xl border-r border-emerald-100">
        <div className="p-8 border-b border-emerald-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-emerald-600 p-4 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300">
              <Building2 size="3rem" className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-emerald-800">NTIC</h1>
              <p className="text-sm text-emerald-600 font-medium">Management System</p>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
        </div>

        <div className="p-6">
          {employee && (
            <div className="flex items-center mb-8 p-5 bg-gradient-to-r from-emerald-50 to-white rounded-2xl shadow-sm border border-emerald-100 hover:shadow-md transition-shadow duration-300">
              <div className="bg-emerald-600 rounded-full p-3.5 shadow-lg">
                <User size={24} className="text-white" />
              </div>
              <div className="ml-4">
                <div className="font-semibold text-emerald-800 text-lg">{employee.name}</div>
                <div className="text-sm text-emerald-600">{employee.email}</div>
              </div>
            </div>
          )}

          <nav className="space-y-3">
            <button
              onClick={() => setActiveTab("planning")}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 ${
                activeTab === "planning"
                  ? "bg-emerald-600 text-white shadow-lg transform hover:scale-[1.02]"
                  : "text-emerald-700 hover:bg-emerald-50 hover:shadow-md"
              }`}>
              <Calendar size={22} className="flex-shrink-0" />
              <span className="font-medium text-lg">Mon Planning</span>
            </button>

            <button
              onClick={() => setActiveTab("pointage")}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 ${
                activeTab === "pointage"
                  ? "bg-emerald-600 text-white shadow-lg transform hover:scale-[1.02]"
                  : "text-emerald-700 hover:bg-emerald-50 hover:shadow-md"
              }`}>
              <Clock size={22} className="flex-shrink-0" />
              <span className="font-medium text-lg">Mes Pointages</span>
            </button>

            <div className="mt-10 mb-4 px-5">
              <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">
                Gérer Profile
              </span>
            </div>

            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 ${
                activeTab === "profile"
                  ? "bg-emerald-600 text-white shadow-lg transform hover:scale-[1.02]"
                  : "text-emerald-700 hover:bg-emerald-50 hover:shadow-md"
              }`}>
              <User size={22} className="flex-shrink-0" />
              <span className="font-medium text-lg">Consulter Profile</span>
            </button>

            <button
              onClick={() => setActiveTab("editProfile")}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 ${
                activeTab === "editProfile"
                  ? "bg-emerald-600 text-white shadow-lg transform hover:scale-[1.02]"
                  : "text-emerald-700 hover:bg-emerald-50 hover:shadow-md"
              }`}>
              <Edit size={22} className="flex-shrink-0" />
              <span className="font-medium text-lg">Modifier Profile</span>
            </button>
          </nav>

          <div className="absolute bottom-8 left-8 right-8">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-300 font-medium text-lg hover:shadow-md">
              <LogOut size={22} className="flex-shrink-0" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-10">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-xl text-emerald-600 font-medium">Chargement...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-xl text-red-600 font-medium">{error}</div>
          </div>
        ) : (
          <div className="space-y-10">
            {activeTab === "planning" && (
              <div className="bg-white p-10 rounded-3xl shadow-xl border border-emerald-100 hover:shadow-2xl transition-shadow duration-300">
                <div className="flex items-center gap-4 mb-10">
                  <div className="bg-emerald-600 p-4 rounded-2xl shadow-lg">
                    <Calendar size={28} className="text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-emerald-800">Mon Planning</h2>
                </div>
                <PlanningView employee={employee} />
              </div>
            )}
            
            {activeTab === "pointage" && (
              <div className="bg-white p-10 rounded-3xl shadow-xl border border-emerald-100 hover:shadow-2xl transition-shadow duration-300">
                <div className="flex items-center gap-4 mb-10">
                  <div className="bg-emerald-600 p-4 rounded-2xl shadow-lg">
                    <Clock size={28} className="text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-emerald-800">Mes Pointages</h2>
                </div>
                <PointageView employee={employee} />
              </div>
            )}
            
            {activeTab === "profile" && (
              <div className="bg-white p-10 rounded-3xl shadow-xl border border-emerald-100 hover:shadow-2xl transition-shadow duration-300">
                <div className="flex items-center gap-4 mb-10">
                  <div className="bg-emerald-600 p-4 rounded-2xl shadow-lg">
                    <User size={28} className="text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-emerald-800">Mon Profile</h2>
                </div>
                <ProfileView employee={employee} />
              </div>
            )}
            
            {activeTab === "editProfile" && (
              <div className="bg-white p-10 rounded-3xl shadow-xl border border-emerald-100 hover:shadow-2xl transition-shadow duration-300">
                <div className="flex items-center gap-4 mb-10">
                  <div className="bg-emerald-600 p-4 rounded-2xl shadow-lg">
                    <Edit size={28} className="text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-emerald-800">Modifier Profile</h2>
                </div>
                <EditProfileView employee={employee} setEmployee={setEmployee} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard; 