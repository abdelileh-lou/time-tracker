import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { logout } from "../../Auth/auth";

const ChefServiceDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("planning");
  const [planningName, setPlanningName] = useState("");
  const [planning, setPlanning] = useState(
    Array(7).fill({ day: "", from: "", to: "", isWorkDay: false }),
  );
  const [savedPlanning, setSavedPlanning] = useState(null);
  const [attendanceSheets, setAttendanceSheets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [planningHistory, setPlanningHistory] = useState([]);
  const [selectedRole, setSelectedRole] = useState("all");

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8092/api/AllEmployees",
        );
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (activeSection === "attendance") {
      fetchAttendanceSheets();
    } else if (activeSection === "history") {
      fetchPlanningHistory();
    }
  }, [activeSection]);

  const fetchPlanningHistory = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8092/api/planning/history",
      );
      setPlanningHistory(response.data);
    } catch (error) {
      console.error("Error fetching planning history:", error);
      alert("Failed to load planning history.");
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
      };

      const response = await axios.post("http://127.0.0.1:8092/api/planning", {
        planning: JSON.stringify(planningData),
      });
      setSavedPlanning(planningData);
      alert("Planning saved successfully!");

      // Refresh planning history after saving
      fetchPlanningHistory();
    } catch (error) {
      console.error("Error saving planning:", error);
      alert("Failed to save planning.");
    }
  };

  const deletePlanning = async () => {
    try {
      if (!savedPlanning) {
        alert("No planning to delete");
        return;
      }

      await axios.delete(
        `http://127.0.0.1:8092/api/planning/${savedPlanning.name}`,
      );
      setSavedPlanning(null);
      setPlanningName("");
      setPlanning(
        Array(7).fill({ day: "", from: "", to: "", isWorkDay: false }),
      );
      alert("Planning deleted successfully!");

      // Refresh planning history after deletion
      fetchPlanningHistory();
    } catch (error) {
      console.error("Error deleting planning:", error);
      alert("Failed to delete planning.");
    }
  };

  const assignToEmployees = async () => {
    try {
      if (!savedPlanning || selectedEmployees.length === 0) {
        alert("Please select a planning and employees");
        return;
      }

      await axios.post("http://127.0.0.1:8092/api/planning/assign-planning", {
        planningName: savedPlanning.name,
        employeeIds: selectedEmployees,
      });
      alert("Planning assigned to selected employees successfully!");

      // Refresh planning history after assignment
      fetchPlanningHistory();
    } catch (error) {
      console.error("Error assigning planning:", error);
      alert("Failed to assign planning.");
    }
  };

  const fetchAttendanceSheets = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8092/api/attendance-sheets",
      );
      setAttendanceSheets(response.data);
    } catch (error) {
      console.error("Error fetching attendance sheets:", error);
      alert("Failed to load attendance sheets.");
    }
  };

  const filteredEmployees =
    selectedRole === "all"
      ? employees
      : employees.filter((employee) => employee.role === selectedRole);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-[#123458] text-white p-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Chef Service</h1>
            <button
              onClick={handleLogout}
              className="bg-[#88304E] px-3 py-1 rounded hover:bg-opacity-80">
              Logout
            </button>
          </div>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveSection("planning")}
              className={`w-full text-left p-2 rounded ${
                activeSection === "planning"
                  ? "bg-[#02aafd]"
                  : "hover:bg-[#02aafd]/50"
              }`}>
              Planning Management
            </button>
            <button
              onClick={() => setActiveSection("attendance")}
              className={`w-full text-left p-2 rounded ${
                activeSection === "attendance"
                  ? "bg-[#02aafd]"
                  : "hover:bg-[#02aafd]/50"
              }`}>
              Attendance Sheets
            </button>
            <button
              onClick={() => setActiveSection("history")}
              className={`w-full text-left p-2 rounded ${
                activeSection === "history"
                  ? "bg-[#02aafd]"
                  : "hover:bg-[#02aafd]/50"
              }`}>
              Planning History
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-auto">
          {activeSection === "planning" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Gérer Planning</h2>
              <div className="bg-white p-6 rounded shadow-md">
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Planning Name
                  </label>
                  <input
                    type="text"
                    value={planningName}
                    onChange={(e) => setPlanningName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded"
                    placeholder="Enter planning name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {daysOfWeek.map((day, index) => (
                    <div key={index} className="p-4 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold">{day}</h3>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={planning[index].isWorkDay}
                            onChange={() => handleWorkDayToggle(index)}
                            className="mr-2"
                          />
                          Work Day
                        </label>
                      </div>
                      {planning[index].isWorkDay && (
                        <div className="flex items-center gap-2">
                          <label className="text-sm">From:</label>
                          <input
                            type="time"
                            value={planning[index].from}
                            onChange={(e) =>
                              handleInputChange(index, "from", e.target.value)
                            }
                            className="border border-gray-300 rounded p-2"
                          />
                          <label className="text-sm">To:</label>
                          <input
                            type="time"
                            value={planning[index].to}
                            onChange={(e) =>
                              handleInputChange(index, "to", e.target.value)
                            }
                            className="border border-gray-300 rounded p-2"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-col gap-4">
                  <div className="flex gap-4">
                    <button
                      onClick={savePlanning}
                      className="bg-[#02aafd] text-white px-4 py-2 rounded hover:bg-opacity-80 transition-colors">
                      Save Planning
                    </button>
                    <button
                      onClick={deletePlanning}
                      className="bg-[#88304E] text-white px-4 py-2 rounded hover:bg-opacity-80 transition-colors">
                      Delete Planning
                    </button>
                  </div>

                  {/* Employee Selection Section */}
                  <div className="mt-4 border p-4 rounded">
                    <h3 className="font-bold mb-2">
                      Assign Planning to Employees
                    </h3>

                    {/* Employee Filter by Role */}
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">
                        Filter by Role:
                      </label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded">
                        <option value="all">All Employees</option>
                        <option value="chef">Chef Service</option>
                        <option value="admin">Admin</option>
                        <option value="worker">Worker</option>
                      </select>
                    </div>

                    {/* Employee Selection Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto border p-2 rounded">
                      {filteredEmployees.length > 0 ? (
                        filteredEmployees.map((employee) => (
                          <label
                            key={employee.id}
                            className="flex items-center p-2 hover:bg-gray-100 rounded">
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
                              className="mr-2"
                            />
                            <div>
                              <div>{employee.name}</div>
                              <div className="text-xs text-gray-500">
                                {employee.role || "No role"}
                              </div>
                            </div>
                          </label>
                        ))
                      ) : (
                        <p className="col-span-3 text-gray-500 italic">
                          No employees found with this role
                        </p>
                      )}
                    </div>

                    <div className="mt-4">
                      <button
                        onClick={assignToEmployees}
                        disabled={
                          !savedPlanning || selectedEmployees.length === 0
                        }
                        className={`bg-[#123458] text-white px-4 py-2 rounded transition-colors ${
                          !savedPlanning || selectedEmployees.length === 0
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-opacity-80"
                        }`}>
                        Assign Planning to Selected Employees
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "attendance" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Attendance Sheets</h2>
              <div className="bg-white p-6 rounded shadow-md">
                {attendanceSheets.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Employee</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Hours Worked</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceSheets.map((sheet, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-2">{sheet.date}</td>
                          <td className="p-2">{sheet.employee}</td>
                          <td className="p-2">
                            <span
                              className={`px-2 py-1 rounded text-sm ${
                                sheet.status === "Present"
                                  ? "bg-green-100 text-green-800"
                                  : sheet.status === "Absent"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}>
                              {sheet.status}
                            </span>
                          </td>
                          <td className="p-2">{sheet.hoursWorked}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No attendance records found
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === "history" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Planning History</h2>
              <div className="bg-white p-6 rounded shadow-md">
                {planningHistory.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Date Created</th>
                        <th className="text-left p-2">Planning Name</th>
                        <th className="text-left p-2">Created By</th>
                        <th className="text-left p-2">Assigned To</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {planningHistory.map((history, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-2">{history.createdAt}</td>
                          <td className="p-2">{history.planningName}</td>
                          <td className="p-2">{history.createdBy}</td>
                          <td className="p-2">
                            <div className="flex flex-wrap gap-1">
                              {history.assignedTo?.map((employee, i) => (
                                <span
                                  key={i}
                                  className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {employee.name}
                                </span>
                              ))}
                              {(!history.assignedTo ||
                                history.assignedTo.length === 0) && (
                                <span className="text-gray-500 italic">
                                  Not assigned
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-2">
                            <button
                              className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                              onClick={() => {
                                // View details functionality could be added here
                                alert(
                                  `Details for planning: ${history.planningName}`,
                                );
                              }}>
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No planning history found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChefServiceDashboard;
