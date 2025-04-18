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
    if (activeSection === "attendance") {
      fetchAttendanceSheets();
    }
  }, [activeSection]);

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

      const response = await axios.post("http://127.0.0.1:8000/api/planning", {
        planning: JSON.stringify(planningData),
      });
      setSavedPlanning(planningData);
      alert("Planning saved successfully!");
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
        `http://127.0.0.1:8000/api/planning/${savedPlanning.name}`,
      );
      setSavedPlanning(null);
      setPlanningName("");
      setPlanning(
        Array(7).fill({ day: "", from: "", to: "", isWorkDay: false }),
      );
      alert("Planning deleted successfully!");
    } catch (error) {
      console.error("Error deleting planning:", error);
      alert("Failed to delete planning.");
    }
  };

  const assignToEmployees = async () => {
    try {
      if (!savedPlanning) {
        alert("No planning to assign");
        return;
      }

      await axios.post("http://127.0.0.1:8000/api/assign-planning", {
        planningName: savedPlanning.name,
      });
      alert("Planning assigned to employees successfully!");
    } catch (error) {
      console.error("Error assigning planning:", error);
      alert("Failed to assign planning.");
    }
  };

  const fetchAttendanceSheets = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/attendance-sheets",
      );
      setAttendanceSheets(response.data);
    } catch (error) {
      console.error("Error fetching attendance sheets:", error);
      alert("Failed to load attendance sheets.");
    }
  };

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

                <div className="mt-6 flex gap-4">
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
                  <button
                    onClick={assignToEmployees}
                    className="bg-[#123458] text-white px-4 py-2 rounded hover:bg-opacity-80 transition-colors">
                    Assign to Employees
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === "attendance" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Attendance Sheets</h2>
              <div className="bg-white p-6 rounded shadow-md">
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
                      <tr key={index} className="border-b">
                        <td className="p-2">{sheet.date}</td>
                        <td className="p-2">{sheet.employee}</td>
                        <td className="p-2">{sheet.status}</td>
                        <td className="p-2">{sheet.hoursWorked}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChefServiceDashboard;
