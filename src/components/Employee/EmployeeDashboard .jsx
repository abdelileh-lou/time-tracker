import React, { useState, useEffect } from "react";
import { User, Calendar, Clock, Settings, Edit, LogOut } from "lucide-react";
import { getUserData, logout } from "../../Auth/auth";
import { useNavigate } from "react-router-dom";
import PlanningView from "./PlanningView";
import PointageView from "./PointageView";
import ProfileView from "./ProfileView";
import EditProfileView from "./EditProfileView";

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

  console.log("Employee data:", employee);
  return (
    <div className="flex h-screen bg-sky-50">
      {/* Sidebar */}
      <div className="w-64 bg-sky-900 text-white">
        <div className="p-4 text-xl font-bold border-b border-sky-800">
          {employee?.name || "Employee"} Dashboard
        </div>

        <div className="p-4">
          {employee && (
            <div className="flex items-center mb-6">
              <div className="bg-sky-700 rounded-full p-2">
                <User size={24} />
              </div>
              <div className="ml-3">
                <div className="font-medium">{employee.name}</div>
                <div className="text-sm text-sky-300">{employee.email}</div>
              </div>
            </div>
          )}

          <nav>
            <button
              onClick={() => setActiveTab("planning")}
              className={`flex items-center w-full p-3 mb-2 rounded ${
                activeTab === "planning" ? "bg-sky-800" : "hover:bg-sky-800"
              }`}>
              <Calendar size={20} />
              <span className="ml-3">Mon Planning</span>
            </button>

            <button
              onClick={() => setActiveTab("pointage")}
              className={`flex items-center w-full p-3 mb-2 rounded ${
                activeTab === "pointage" ? "bg-sky-800" : "hover:bg-sky-800"
              }`}>
              <Clock size={20} />
              <span className="ml-3">Mes Pointages</span>
            </button>

            <div className="mt-6 mb-2 text-sm font-medium text-sky-300 uppercase">
              Gérer Profile
            </div>

            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center w-full p-3 mb-2 rounded ${
                activeTab === "profile" ? "bg-sky-800" : "hover:bg-sky-800"
              }`}>
              <User size={20} />
              <span className="ml-3">Consulter Profile</span>
            </button>

            <button
              onClick={() => setActiveTab("editProfile")}
              className={`flex items-center w-full p-3 mb-2 rounded ${
                activeTab === "editProfile"
                  ? "bg-sky-800"
                  : "hover:bg-sky-800"
              }`}>
              <Edit size={20} />
              <span className="ml-3">Modifier Profile</span>
            </button>
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={handleLogout}
              className="flex items-center p-3 text-red-400 hover:bg-sky-800 rounded">
              <LogOut size={20} />
              <span className="ml-3">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-sky-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-lg text-sky-700">Chargement...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-rose-100 rounded-full p-3">
                  <Calendar size={24} className="text-rose-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-rose-800 text-center mb-2">
                Aucun Planning Disponible
              </h3>
              <p className="text-rose-600 text-center">
                {error === "no_planning" 
                  ? "Vous n'avez pas encore de planning assigné. Veuillez contacter votre chef de service."
                  : error}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {activeTab === "planning" && (
              employee?.planning ? (
                <PlanningView employee={employee} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 max-w-md w-full">
                    <div className="flex items-center justify-center mb-4">
                      <div className="bg-rose-100 rounded-full p-3">
                        <Calendar size={24} className="text-rose-600" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-rose-800 text-center mb-2">
                      Aucun Planning Disponible
                    </h3>
                    <p className="text-rose-600 text-center">
                      Vous n'avez pas encore de planning assigné. Veuillez contacter votre chef de service.
                    </p>
                  </div>
                </div>
              )
            )}
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
