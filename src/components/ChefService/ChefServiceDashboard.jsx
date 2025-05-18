import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { logout, getUserData } from "../../Auth/auth";
import ChefProfileView from "./ChefProfileView";
import ChefEditProfile from "./ChefEditProfile"; // Import the edit profile component
import { Monitor, CalendarClock, Users, Settings, LogOut, ClipboardList, History, User } from "lucide-react";

const ChefServiceDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("planning");
  const [activePlanningTab, setActivePlanningTab] = useState("create");
  const [planningName, setPlanningName] = useState("");
  const [planning, setPlanning] = useState(
    Array(7).fill({ day: "", from: "", to: "", isWorkDay: false }),
  );
  const [savedPlanning, setSavedPlanning] = useState(null);
  const [attendanceSheets, setAttendanceSheets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [planningHistory, setPlanningHistory] = useState([]);
  const [availablePlannings, setAvailablePlannings] = useState([]);
  const [selectedPlanning, setSelectedPlanning] = useState("");
  const [chefService, setChefService] = useState(null);

  // Updated Planning History section for ChefServiceDashboard.jsx

  // Add this state to your existing state variables
  const [expandedDays, setExpandedDays] = useState({});

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // ChefServiceDashboard.jsx - Keep the authorization header
  useEffect(() => {
    const currentUser = getUserData();
    if (!currentUser) {
      navigate("/");
      return;
    }
    setChefService(currentUser);
    console.log("Chef service data:", currentUser);
    console.log("Current user:", currentUser);
  }, [navigate]);

  useEffect(() => {
    const fetchAllEmployees = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8092/api/employees-only",
        );
        setEmployees(response.data); // Or use a different state variable like setAllEmployees
      } catch (error) {
        console.error("Error fetching all employees:", error);
      }
    };

    fetchAllEmployees();
  }, []); // Empty dependency array = runs only on component mount

  useEffect(() => {
    if (activeSection === "attendance") {
      fetchAttendanceSheets();
    } else if (activeSection === "history") {
      fetchPlanningHistory();
    } else if (activeSection === "planning" && activePlanningTab === "assign") {
      fetchAvailablePlannings();
    }
  }, [activeSection, activePlanningTab]);

  const fetchPlanningHistory = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8092/api/planning/plannings",
      );
      setPlanningHistory(response.data);
      console.log("Planning history data:", response.data);
    } catch (error) {
      console.error("Error fetching planning history:", error);
      alert("Failed to load planning history.");
    }
  };

  const fetchAvailablePlannings = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8092/api/planning`);
      setAvailablePlannings(response.data);
      console.log("Available plannings:", response.data);
    } catch (error) {
      console.error("Error fetching available plannings:", error);
      alert("Failed to load available plannings.");
    }
  };

  const handleInputChange = (index, field, value) => {
    const updatedPlanning = [...planning];
    updatedPlanning[index] = {
      ...updatedPlanning[index],
      [field]: value,
      day: daysOfWeek[index],
    };
    setPlanning(updatedPlanning);
  };

  const handleWorkDayToggle = (index) => {
    const updatedPlanning = [...planning];
    updatedPlanning[index] = {
      ...updatedPlanning[index],
      isWorkDay: !updatedPlanning[index].isWorkDay,
    };
    setPlanning(updatedPlanning);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const savePlanning = async () => {
    try {
      if (!planningName.trim()) {
        alert("Please enter a planning name");
        return;
      }

      const planningData = {
        name: planningName,
        days: planning.map((day) => ({
          ...day,
          from: day.isWorkDay ? day.from : null,
          to: day.isWorkDay ? day.to : null,
        })),
        serviceId: chefService?.serviceId,
      };

      const response = await axios.post("http://127.0.0.1:8092/api/planning", {
        planning: JSON.stringify(planningData),
      });
      setSavedPlanning(planningData);
      alert("Planning saved successfully!");

      // Refresh planning history after saving
      fetchPlanningHistory();
      // Reset fields after saving
      resetPlanningForm();
    } catch (error) {
      console.error("Error saving planning:", error);
      alert("Failed to save planning.");
    }
  };

  const resetPlanningForm = () => {
    setPlanningName("");
    setPlanning(Array(7).fill({ day: "", from: "", to: "", isWorkDay: false }));
    setSavedPlanning(null);
  };

  const deletePlanning = async () => {
    try {
      if (!selectedPlanning) {
        alert("Please select a planning to delete");
        return;
      }

      // Find the selected planning in availablePlannings
      const planningToDelete = availablePlannings.find(
        (plan) => plan.id.toString() === selectedPlanning,
      );

      if (!planningToDelete) {
        alert("Selected planning not found");
        return;
      }

      // Parse the planJson to get the name
      const planningData = JSON.parse(planningToDelete.planJson);
      const planningName = planningData.name;
      console.log("Planning name to delete:", planningName);

      await axios.delete(`http://127.0.0.1:8092/api/planning/${planningName}`);
      setSelectedPlanning("");
      alert("Planning deleted successfully!");

      // Refresh available plannings and history after deletion
      fetchAvailablePlannings();
      fetchPlanningHistory();
    } catch (error) {
      console.error("Error deleting planning:", error);
      alert("Failed to delete planning.");
    }
  };
  const assignToEmployees = async () => {
    try {
      // Corrected validation: use selectedPlanning instead of savedPlanning
      if (!selectedPlanning || selectedEmployees.length === 0) {
        alert("Please select a planning and employees");
        return;
      }

      // Find the selected planning object
      const selectedPlan = availablePlannings.find(
        (plan) => plan.id.toString() === selectedPlanning,
      );

      if (!selectedPlan) {
        alert("Selected planning not found");
        return;
      }

      // Parse the planning data from JSON string
      const planningData = JSON.parse(selectedPlan.planJson);

      // Convert employee IDs to numbers if needed
      const numericEmployeeIds = selectedEmployees.map((id) => Number(id));

      await axios.post("http://127.0.0.1:8092/api/planning/assign-planning", {
        planningName: planningData.name, // Use name from parsed planning data
        employeeIds: numericEmployeeIds, // Send numeric IDs if backend requires
      });

      alert("Planning assigned to selected employees successfully!");
      fetchPlanningHistory();
    } catch (error) {
      console.error("Error assigning planning:", error);
      alert(
        `Failed to assign planning: ${
          error.response?.data?.message || error.message
        }`,
      );
    }
  };

  const fetchAttendanceSheets = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8092/api/chef/records",
      );
      setAttendanceSheets(response.data);
      console.log("Attendance sheets:", response.data);
    } catch (error) {
      console.error("Error fetching attendance sheets:", error);
      alert("Failed to load attendance sheets.");
    }
  };

  return (
    <div className="flex h-screen bg-emerald-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b border-emerald-100">
          <div className="flex items-center gap-2 mb-4">
            <Monitor size="2rem" className="text-emerald-600" />
            <CalendarClock size="2rem" className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-emerald-800">Espace Chef Service</h1>
          <p className="text-sm text-emerald-600">NTIC Management</p>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveSection("planning")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  activeSection === "planning"
                    ? "bg-emerald-100 text-emerald-800"
                    : "text-emerald-600 hover:bg-emerald-50"
                }`}>
                <ClipboardList size={20} />
                <span>Planning Management</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection("attendance")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  activeSection === "attendance"
                    ? "bg-emerald-100 text-emerald-800"
                    : "text-emerald-600 hover:bg-emerald-50"
                }`}>
                <CalendarClock size={20} />
                <span>Attendance Sheets</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection("history")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  activeSection === "history"
                    ? "bg-emerald-100 text-emerald-800"
                    : "text-emerald-600 hover:bg-emerald-50"
                }`}>
                <History size={20} />
                <span>Planning History</span>
              </button>
            </li>

            <div className="mt-6 mb-2 text-sm font-medium text-emerald-600 uppercase">
              Profile Management
            </div>
            <li>
              <button
                onClick={() => setActiveSection("viewProfile")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  activeSection === "viewProfile"
                    ? "bg-emerald-100 text-emerald-800"
                    : "text-emerald-600 hover:bg-emerald-50"
                }`}>
                <User size={20} />
                <span>View Profile</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection("editProfile")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  activeSection === "editProfile"
                    ? "bg-emerald-100 text-emerald-800"
                    : "text-emerald-600 hover:bg-emerald-50"
                }`}>
                <Settings size={20} />
                <span>Edit Profile</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-all duration-300">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        {activeSection === "planning" && (
          <div>
            <h2 className="text-2xl font-bold text-emerald-800 mb-6">Planning Management</h2>

            {/* Planning Management Tabs */}
            <div className="mb-6 flex border-b border-emerald-200">
              <button
                onClick={() => setActivePlanningTab("create")}
                className={`px-4 py-2 ${
                  activePlanningTab === "create"
                    ? "border-b-2 border-emerald-600 text-emerald-600 font-medium"
                    : "text-emerald-600 hover:text-emerald-700"
                }`}>
                Create Planning
              </button>
              <button
                onClick={() => setActivePlanningTab("assign")}
                className={`px-4 py-2 ${
                  activePlanningTab === "assign"
                    ? "border-b-2 border-emerald-600 text-emerald-600 font-medium"
                    : "text-emerald-600 hover:text-emerald-700"
                }`}>
                Assign/Delete Planning
              </button>
            </div>

            {/* Create Planning Tab */}
            {activePlanningTab === "create" && (
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="mb-4">
                  <label className="block text-emerald-700 mb-2">Planning Name</label>
                  <input
                    type="text"
                    value={planningName}
                    onChange={(e) => setPlanningName(e.target.value)}
                    className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter planning name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {daysOfWeek.map((day, index) => (
                    <div key={index} className="p-4 border border-emerald-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-emerald-800">{day}</h3>
                        <label className="flex items-center text-emerald-700">
                          <input
                            type="checkbox"
                            checked={planning[index].isWorkDay}
                            onChange={() => handleWorkDayToggle(index)}
                            className="mr-2 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          Work Day
                        </label>
                      </div>
                      {planning[index].isWorkDay && (
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-emerald-700">From:</label>
                          <input
                            type="time"
                            value={planning[index].from}
                            onChange={(e) => handleInputChange(index, "from", e.target.value)}
                            className="border border-emerald-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          />
                          <label className="text-sm text-emerald-700">To:</label>
                          <input
                            type="time"
                            value={planning[index].to}
                            onChange={(e) => handleInputChange(index, "to", e.target.value)}
                            className="border border-emerald-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex gap-4">
                  <button
                    onClick={savePlanning}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                    Save Planning
                  </button>
                  <button
                    onClick={resetPlanningForm}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                    Reset Form
                  </button>
                </div>
              </div>
            )}

            {/* Assign/Delete Planning Tab */}
            {activePlanningTab === "assign" && (
              <div className="bg-white p-6 rounded-xl shadow-md">
                {/* Planning Selection */}
                <div className="mb-6">
                  <label className="block text-emerald-700 mb-2">Select Planning</label>
                  <select
                    value={selectedPlanning}
                    onChange={(e) => setSelectedPlanning(e.target.value)}
                    className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                    <option value="">-- Select a planning --</option>
                    {availablePlannings.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {JSON.parse(plan.planJson).name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Delete Button */}
                <div className="mb-6">
                  <button
                    onClick={deletePlanning}
                    disabled={!selectedPlanning}
                    className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ${
                      !selectedPlanning ? "opacity-50 cursor-not-allowed" : ""
                    }`}>
                    Delete Selected Planning
                  </button>
                </div>

                <hr className="my-6 border-emerald-200" />

                {/* Employee Selection Section */}
                <div className="mt-4 border border-emerald-200 p-4 rounded-lg">
                  <h3 className="font-bold text-emerald-800 mb-2">Assign Planning to Employees</h3>

                  <div className="mb-2 text-sm text-emerald-600">
                    Showing employees from your service only
                  </div>

                  {/* Employee Selection Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto border border-emerald-200 p-2 rounded-lg">
                    {employees.length > 0 ? (
                      employees.map((employee) => (
                        <label
                          key={employee.id}
                          className="flex items-center p-2 hover:bg-emerald-50 rounded-lg">
                          <input
                            type="checkbox"
                            checked={selectedEmployees.includes(employee.id)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setSelectedEmployees((prev) =>
                                checked
                                  ? [...prev, employee.id]
                                  : prev.filter((id) => id !== employee.id),
                              );
                            }}
                            className="mr-2 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div>
                            <div className="text-emerald-800">{employee.name}</div>
                            <div className="text-xs text-emerald-600">
                              {employee.role || "No role"}
                            </div>
                          </div>
                        </label>
                      ))
                    ) : (
                      <p className="col-span-3 text-emerald-600 italic">
                        No employees found in your service
                      </p>
                    )}
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={assignToEmployees}
                      disabled={!selectedPlanning || selectedEmployees.length === 0}
                      className={`px-4 py-2 bg-emerald-600 text-white rounded-lg transition-colors ${
                        !selectedPlanning || selectedEmployees.length === 0
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-emerald-700"
                      }`}>
                      Assign Planning to Selected Employees
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === "attendance" && (
          <div>
            <h2 className="text-2xl font-bold text-emerald-800 mb-6">Attendance Sheets</h2>
            <div className="bg-white p-6 rounded-xl shadow-md">
              {attendanceSheets.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-emerald-200">
                      <th className="text-left p-2 text-emerald-800">Date</th>
                      <th className="text-left p-2 text-emerald-800">Employee</th>
                      <th className="text-left p-2 text-emerald-800">Status</th>
                      <th className="text-left p-2 text-emerald-800">Hours Worked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceSheets.map((sheet, index) => (
                      <tr key={index} className="border-b border-emerald-100 hover:bg-emerald-50">
                        <td className="p-2 text-emerald-700">
                          {new Date(sheet.timestamp).toISOString().split("T")[0]}
                        </td>
                        <td className="p-2 text-emerald-700">{sheet.employeeName}</td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-1 rounded text-sm ${
                              sheet.status === "Present"
                                ? "bg-emerald-100 text-emerald-800"
                                : sheet.status === "Absent"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                            {sheet.status}
                          </span>
                        </td>
                        <td className="p-2 text-emerald-700">{sheet.hoursWorked}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-emerald-600">
                  No attendance records found
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === "history" && (
          <div>
            <h2 className="text-2xl font-bold text-emerald-800 mb-6">Planning History</h2>
            <div className="bg-white p-6 rounded-xl shadow-md">
              {planningHistory.length > 0 ? (
                Object.entries(
                  planningHistory.reduce((acc, planning) => {
                    const date = new Date(planning.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });
                    if (!acc[date]) acc[date] = [];
                    acc[date].push(planning);
                    return acc;
                  }, {}),
                )
                  .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
                  .map(([date, plannings]) => (
                    <div key={date} className="mb-4 border border-emerald-200 rounded-lg overflow-hidden">
                      <div
                        className="flex items-center justify-between p-4 bg-emerald-50 hover:bg-emerald-100 cursor-pointer"
                        onClick={() =>
                          setExpandedDays((prev) => ({
                            ...prev,
                            [date]: !prev[date],
                          }))
                        }>
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-600 text-xl">📁</span>
                          <div>
                            <h3 className="font-semibold text-emerald-800">{date}</h3>
                            <p className="text-sm text-emerald-600">
                              {plannings.length} planning{plannings.length > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`transform transition-transform ${
                            expandedDays[date] ? "rotate-90" : ""
                          }`}>
                          ▸
                        </span>
                      </div>

                      {expandedDays[date] && (
                        <div className="border-t border-emerald-200">
                          {plannings.map((planning, index) => {
                            let planningDetails = {};
                            try {
                              if (planning.planJson) {
                                planningDetails = JSON.parse(planning.planJson);
                              }
                            } catch (e) {
                              console.error("Error parsing planning JSON:", e);
                            }

                            return (
                              <div
                                key={index}
                                className="p-4 hover:bg-emerald-50 border-b border-emerald-100 last:border-b-0">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium text-emerald-800">
                                      {planningDetails.name || planning.planningName || "Unnamed Planning"}
                                    </div>
                                    <div className="text-sm text-emerald-600">
                                      Created by: {planning.createdBy || "Unknown"}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => {
                                      if (planningDetails.days) {
                                        const workDays = planningDetails.days
                                          .filter((day) => day.isWorkDay)
                                          .map((day) => `${day.day}: ${day.from} - ${day.to}`)
                                          .join("\n");
                                        alert(`Planning Details:\n${workDays || "No workdays defined"}`);
                                      } else {
                                        alert("Planning details not available");
                                      }
                                    }}
                                    className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded text-sm">
                                    View Details
                                  </button>
                                </div>

                                <div className="mt-2 flex flex-wrap gap-2">
                                  {planning.assignedTo?.length > 0 ? (
                                    planning.assignedTo.map((employee, i) => (
                                      <span
                                        key={i}
                                        className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">
                                        {employee.name}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-emerald-600 text-sm italic">
                                      Not assigned to any employees
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-emerald-600">
                  No planning history found
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === "viewProfile" && <ChefProfileView chef={chefService} />}
        {activeSection === "editProfile" && (
          <ChefEditProfile chef={chefService} setChef={setChefService} />
        )}
      </div>
    </div>
  );
};

export default ChefServiceDashboard;
