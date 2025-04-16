import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ChefServiceDashboard = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("planning");
  const [employees, setEmployees] = useState([]);
  const [planning, setPlanning] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState({
    profile: true,
    employees: true,
    planning: true,
    reports: true,
  });
  const [serviceInfo, setServiceInfo] = useState({
    department: "Default Department",
  });
  const [error, setError] = useState(null);

  // Enhanced state for new planning entry
  const [newPlanningEntry, setNewPlanningEntry] = useState({
    employeeId: "",
    weekStartDate: "",
    totalHoursPerWeek: 40,
    workDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    },
    dailyHours: 8,
    startTime: "08:00",
    endTime: "17:00",
    description: "",
  });

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("role");

    if (!token || userRole !== "chef") {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch chef service profile
  useEffect(() => {
    const fetchChefProfile = async () => {
      try {
        setLoading((prev) => ({ ...prev, profile: true }));
        setError(null);

        const userId = 2; // Replace with actual user ID from localStorage
        const token = localStorage.getItem("token");

        if (!userId || !token) {
          throw new Error("Authentication required");
        }

        const response = await axios.get(
          `http://localhost:8092/api/employee/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const department =
          response.data?.serviceDepartement ||
          response.data?.department ||
          "default-department";

        setServiceInfo({ department });
      } catch (err) {
        console.error("Error fetching chef profile:", err);
        setError("Failed to load profile. Please login again.");
        // localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");
        navigate("/login");
      } finally {
        setLoading((prev) => ({ ...prev, profile: false }));
      }
    };

    fetchChefProfile();
  }, [navigate]);

  // Fetch employees in the department
  useEffect(() => {
    if (!serviceInfo.department) return;

    const fetchEmployees = async () => {
      try {
        setLoading((prev) => ({ ...prev, employees: true }));
        setError(null);

        const token = localStorage.getItem("token");

        const response = await axios.get(
          `http://localhost:8092/api/AllEmployees`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setEmployees(response.data || []);
      } catch (err) {
        console.error("Error fetching employees:", err);
        // setError("Failed to load employees");
      } finally {
        setLoading((prev) => ({ ...prev, employees: false }));
      }
    };

    fetchEmployees();
  }, [serviceInfo.department]);

  // Fetch planning for the department
  useEffect(() => {
    if (!serviceInfo.department) return;

    const fetchPlanning = async () => {
      try {
        setLoading((prev) => ({ ...prev, planning: true }));
        setError(null);

        const token = localStorage.getItem("token");

        const response = await axios.get(
          `http://localhost:8092/api/planning/department/${serviceInfo.department}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setPlanning(response.data || []);
      } catch (err) {
        console.error("Error fetching planning data:", err);
        // setError("Failed to load planning data");
      } finally {
        setLoading((prev) => ({ ...prev, planning: false }));
      }
    };

    fetchPlanning();
  }, [serviceInfo.department]);

  // Fetch attendance reports
  useEffect(() => {
    if (!serviceInfo.department) return;

    const fetchReports = async () => {
      try {
        setLoading((prev) => ({ ...prev, reports: true }));
        setError(null);

        const token = localStorage.getItem("token");

        const response = await axios.get(
          `http://localhost:8092/api/attendance/reports/${serviceInfo.department}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setReports(response.data || []);
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError("Failed to load reports");
      } finally {
        setLoading((prev) => ({ ...prev, reports: false }));
      }
    };

    if (activeView === "reports") {
      fetchReports();
    }
  }, [serviceInfo.department, activeView]);

  // Handle changes to work days checkboxes
  const handleWorkDayChange = (day) => {
    setNewPlanningEntry({
      ...newPlanningEntry,
      workDays: {
        ...newPlanningEntry.workDays,
        [day]: !newPlanningEntry.workDays[day],
      },
    });
  };

  // Handle changes to the new planning entry form
  const handlePlanningInputChange = (e) => {
    const { name, value } = e.target;

    // Special handling for numeric fields
    if (name === "totalHoursPerWeek" || name === "dailyHours") {
      setNewPlanningEntry({
        ...newPlanningEntry,
        [name]: parseInt(value) || 0,
      });
    } else {
      setNewPlanningEntry({
        ...newPlanningEntry,
        [name]: value,
      });
    }
  };

  // Generate individual day entries from the weekly schedule
  const generateDailyEntries = () => {
    const entries = [];
    const startDate = new Date(newPlanningEntry.weekStartDate);
    const workDays = Object.entries(newPlanningEntry.workDays)
      .filter(([_, isWorking]) => isWorking)
      .map(([day]) => day);

    const dayMapping = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    // Create an entry for each selected day of the week
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const dayName = Object.keys(dayMapping).find(
        (key) => dayMapping[key] === currentDate.getDay(),
      );

      if (workDays.includes(dayName)) {
        entries.push({
          employeeId: newPlanningEntry.employeeId,
          date: currentDate.toISOString().split("T")[0],
          startTime: newPlanningEntry.startTime,
          endTime: newPlanningEntry.endTime,
          description: newPlanningEntry.description,
          department: serviceInfo.department,
          hours: newPlanningEntry.dailyHours,
        });
      }
    }

    return entries;
  };

  // Create a new planning entry
  // const createPlanningEntry = async (e) => {
  //   e.preventDefault();
  //   try {
  //     setError(null);
  //     setLoading((prev) => ({ ...prev, planning: true }));
  //     const token = localStorage.getItem("token");

  //     // Generate daily entries from weekly schedule
  //     const dailyEntries = generateDailyEntries();

  //     // Create all daily entries
  //     for (const entry of dailyEntries) {
  //       await axios.post(`http://localhost:8092/api/planning`, entry, {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });
  //     }

  //     // Refresh planning data
  //     const response = await axios.get(
  //       `http://localhost:8092/api/planning/department/${serviceInfo.department}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       },
  //     );

  //     setPlanning(response.data || []);

  //     // Reset form
  //     setNewPlanningEntry({
  //       employeeId: "",
  //       weekStartDate: "",
  //       totalHoursPerWeek: 40,
  //       workDays: {
  //         monday: true,
  //         tuesday: true,
  //         wednesday: true,
  //         thursday: true,
  //         friday: true,
  //         saturday: false,
  //         sunday: false,
  //       },
  //       dailyHours: 8,
  //       startTime: "08:00",
  //       endTime: "17:00",
  //       description: "",
  //     });
  //   } catch (err) {
  //     console.error("Error creating planning:", err);
  //     setError("Failed to create planning");
  //   } finally {
  //     setLoading((prev) => ({ ...prev, planning: false }));
  //   }
  // };
  // In your createPlanningEntry function, modify it like this:
  const createPlanningEntry = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setLoading((prev) => ({ ...prev, planning: true }));

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Generate daily entries from weekly schedule
      const dailyEntries = generateDailyEntries();

      console.log("Creating planning entries:", dailyEntries); // Debug log

      // Create all daily entries
      const creationPromises = dailyEntries.map((entry) =>
        axios.post(`http://localhost:8092/api/planning`, entry, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      );

      await Promise.all(creationPromises);

      // Refresh planning data
      const response = await axios.get(
        `http://localhost:8092/api/planning/department/${serviceInfo.department}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setPlanning(response.data || []);

      // Reset form
      setNewPlanningEntry({
        employeeId: "",
        weekStartDate: "",
        totalHoursPerWeek: 40,
        workDays: {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: false,
          sunday: false,
        },
        dailyHours: 8,
        startTime: "08:00",
        endTime: "17:00",
        description: "",
      });
    } catch (err) {
      console.error("Error creating planning:", err);

      // More specific error handling
      if (err.response) {
        // The request was made and the server responded with a status code
        console.error("Server response:", err.response.data);
        setError(
          `Server error: ${err.response.status} - ${
            err.response.data.message || "No details"
          }`,
        );
      } else if (err.request) {
        // The request was made but no response was received
        console.error("No response received:", err.request);
        setError("No response from server. Please try again.");
      } else {
        // Something happened in setting up the request
        console.error("Request setup error:", err.message);
        setError(`Failed to create planning: ${err.message}`);
      }

      // Don't redirect here - let the user see the error and try again
      // localStorage.removeItem("token");
      // localStorage.removeItem("userId");
      // localStorage.removeItem("userRole");
      // navigate("/login");
    } finally {
      setLoading((prev) => ({ ...prev, planning: false }));
    }
  };

  // Delete a planning entry
  const deletePlanningEntry = async (planningId) => {
    try {
      setError(null);
      const token = localStorage.getItem("token");

      await axios.delete(`http://localhost:8092/api/planning/${planningId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPlanning(planning.filter((plan) => plan.id !== planningId));
    } catch (err) {
      console.error("Error deleting planning:", err);
      setError("Failed to delete planning");
    }
  };

  // Calculate end time based on start time and daily hours
  useEffect(() => {
    if (newPlanningEntry.startTime && newPlanningEntry.dailyHours) {
      try {
        const [hours, minutes] = newPlanningEntry.startTime
          .split(":")
          .map(Number);
        let endHours = hours + Math.floor(newPlanningEntry.dailyHours);
        let endMinutes =
          minutes + Math.floor((newPlanningEntry.dailyHours % 1) * 60);

        if (endMinutes >= 60) {
          endHours += Math.floor(endMinutes / 60);
          endMinutes = endMinutes % 60;
        }

        if (endHours >= 24) {
          endHours = endHours % 24;
        }

        const formattedEndHours = endHours.toString().padStart(2, "0");
        const formattedEndMinutes = endMinutes.toString().padStart(2, "0");

        setNewPlanningEntry((prev) => ({
          ...prev,
          endTime: `${formattedEndHours}:${formattedEndMinutes}`,
        }));
      } catch (e) {
        console.error("Error calculating end time:", e);
      }
    }
  }, [newPlanningEntry.startTime, newPlanningEntry.dailyHours]);

  // Generate attendance report
  const generateNewReport = async () => {
    try {
      setError(null);
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `http://localhost:8092/api/attendance/report/generate-new`,
        {
          department: serviceInfo.department,
          date: new Date().toISOString().split("T")[0],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setReports([response.data, ...reports]);
    } catch (err) {
      console.error("Error generating report:", err);
      setError("Failed to generate report");
    }
  };

  // Calculate total selected days
  const getTotalSelectedDays = () => {
    return Object.values(newPlanningEntry.workDays).filter(Boolean).length;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  if (loading.profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#123458] mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-6 rounded shadow-md text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={handleLogout}
            className="bg-[#123458] text-white px-4 py-2 rounded hover:bg-[#02aafd] transition-colors">
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-[#123458] min-h-screen text-white p-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Chef de Service</h1>
            <button
              onClick={handleLogout}
              className="text-sm hover:text-[#02aafd]">
              Logout
            </button>
          </div>

          <div className="mb-6">
            <p className="text-sm">Département: {serviceInfo.department}</p>
          </div>

          <nav>
            <ul>
              <li className="mb-2">
                <button
                  onClick={() => setActiveView("planning")}
                  className={`w-full text-left p-2 rounded ${
                    activeView === "planning"
                      ? "bg-[#02aafd]"
                      : "hover:bg-[#02aafd]"
                  }`}>
                  Gestion des plannings
                </button>
              </li>
              <li className="mb-2">
                <button
                  onClick={() => setActiveView("reports")}
                  className={`w-full text-left p-2 rounded ${
                    activeView === "reports"
                      ? "bg-[#02aafd]"
                      : "hover:bg-[#02aafd]"
                  }`}>
                  Rapports de présence
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
              <p>{error}</p>
            </div>
          )}

          {/* Planning Management View */}
          {activeView === "planning" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Gestion des plannings</h2>

              {/* Create Planning Form */}
              <div className="bg-white rounded shadow-md p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">
                  Créer un planning hebdomadaire
                </h3>
                <form onSubmit={createPlanningEntry}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Employé
                      </label>
                      <select
                        name="employeeId"
                        value={newPlanningEntry.employeeId}
                        onChange={handlePlanningInputChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                        disabled={loading.employees}>
                        <option value="">Sélectionner un employé</option>
                        {employees.map((employee) => (
                          <option key={employee.id} value={employee.id}>
                            {employee.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* <div>
                      <label className="block text-gray-700 mb-2">
                        Date de début de semaine
                      </label>
                      <input
                        type="date"
                        name="weekStartDate"
                        value={newPlanningEntry.weekStartDate}
                        onChange={handlePlanningInputChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                      />
                    </div> */}

                    <div>
                      <label className="block text-gray-700 mb-2">
                        Heures par jour
                      </label>
                      <input
                        type="number"
                        name="dailyHours"
                        min="1"
                        max="24"
                        value={newPlanningEntry.dailyHours}
                        onChange={handlePlanningInputChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">
                        Heure de début
                      </label>
                      <input
                        type="time"
                        name="startTime"
                        value={newPlanningEntry.startTime}
                        onChange={handlePlanningInputChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">
                        Heure de fin (calculée)
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        value={newPlanningEntry.endTime}
                        className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                        disabled
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">
                        Total heures par semaine:{" "}
                        {newPlanningEntry.dailyHours * getTotalSelectedDays()}{" "}
                        heures
                      </label>
                      <div className="text-sm text-gray-500">
                        ({getTotalSelectedDays()} jours ×{" "}
                        {newPlanningEntry.dailyHours} heures)
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-gray-700 mb-2">
                        Jours de travail
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {Object.entries(newPlanningEntry.workDays).map(
                          ([day, isChecked]) => (
                            <label
                              key={day}
                              className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleWorkDayChange(day)}
                                className="form-checkbox h-5 w-5 text-[#123458]"
                              />
                              <span className="capitalize">{day}</span>
                            </label>
                          ),
                        )}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={newPlanningEntry.description}
                        onChange={handlePlanningInputChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        rows="3"></textarea>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      type="submit"
                      className="bg-[#123458] text-white px-4 py-2 rounded hover:bg-[#02aafd] transition-colors"
                      disabled={loading.planning}>
                      {loading.planning
                        ? "Création..."
                        : "Créer le planning hebdomadaire"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Planning List */}
              <div className="bg-white rounded shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Plannings existants
                </h3>
                {loading.planning ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#123458]"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="border border-gray-300 px-4 py-2">
                            Employé
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Date
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Début
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Fin
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Heures
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Description
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {planning.length > 0 ? (
                          planning.map((plan) => (
                            <tr key={plan.id}>
                              <td className="border border-gray-300 px-4 py-2">
                                {employees.find((e) => e.id === plan.employeeId)
                                  ?.name || "Employé inconnu"}
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {plan.date}
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {plan.startTime}
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {plan.endTime}
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {plan.hours ||
                                  (plan.startTime && plan.endTime
                                    ? calculateHours(
                                        plan.startTime,
                                        plan.endTime,
                                      )
                                    : "N/A")}
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {plan.description}
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                <button
                                  onClick={() => deletePlanningEntry(plan.id)}
                                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors">
                                  Supprimer
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="7"
                              className="border border-gray-300 px-4 py-2 text-center">
                              Aucun planning trouvé
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reports View */}
          {activeView === "reports" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Rapports de présence</h2>

              <div className="bg-white rounded shadow-md p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">
                    Rapports disponibles
                  </h3>
                  <button
                    onClick={generateNewReport}
                    className="bg-[#123458] text-white px-4 py-2 rounded hover:bg-[#02aafd] transition-colors"
                    disabled={loading.reports}>
                    {loading.reports
                      ? "Génération..."
                      : "Générer un nouveau rapport"}
                  </button>
                </div>

                {loading.reports ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#123458]"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="border border-gray-300 px-4 py-2">
                            Date du rapport
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Nombre d'employés
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Présents
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Absents
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.length > 0 ? (
                          reports.map((report) => (
                            <tr key={report.id}>
                              <td className="border border-gray-300 px-4 py-2">
                                {formatDate(report.date)}
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {report.totalEmployees}
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {report.presentCount}
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {report.absentCount}
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                <button
                                  onClick={() =>
                                    window.open(
                                      `http://localhost:8092/api/attendance/report/${report.id}/pdf`,
                                      "_blank",
                                    )
                                  }
                                  className="bg-[#123458] text-white px-2 py-1 rounded hover:bg-[#02aafd] transition-colors">
                                  Télécharger PDF
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="5"
                              className="border border-gray-300 px-4 py-2 text-center">
                              Aucun rapport trouvé
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Detailed Report */}
              {reports.length > 0 && (
                <div className="bg-white rounded shadow-md p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Rapport détaillé du {formatDate(reports[0].date)}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-green-50 p-4 rounded border border-green-200">
                      <h4 className="font-semibold text-green-700 mb-2">
                        Employés présents ({reports[0].presentCount})
                      </h4>
                      <ul className="divide-y divide-green-200">
                        {reports[0].presentEmployees?.map((empId) => {
                          const employee = employees.find(
                            (e) => e.id === empId,
                          );
                          return (
                            <li key={empId} className="py-2">
                              {employee?.name || "Employé inconnu"}
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    <div className="bg-red-50 p-4 rounded border border-red-200">
                      <h4 className="font-semibold text-red-700 mb-2">
                        Employés absents ({reports[0].absentCount})
                      </h4>
                      <ul className="divide-y divide-red-200">
                        {reports[0].absentEmployees?.map((empId) => {
                          const employee = employees.find(
                            (e) => e.id === empId,
                          );
                          return (
                            <li key={empId} className="py-2">
                              {employee?.name || "Employé inconnu"}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Notes</h4>
                    <p className="bg-gray-50 p-4 rounded border border-gray-200">
                      {reports[0].notes ||
                        "Aucune note disponible pour ce rapport."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate hours between two time strings
const calculateHours = (startTime, endTime) => {
  try {
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);

    let totalHours = endHours - startHours;
    let totalMinutes = endMinutes - startMinutes;

    if (totalMinutes < 0) {
      totalHours--;
      totalMinutes += 60;
    }

    if (totalHours < 0) {
      totalHours += 24; // Assuming the shift crosses midnight
    }

    return totalHours + (totalMinutes / 60).toFixed(2);
  } catch (e) {
    console.error("Error calculating hours:", e);
    return "N/A";
  }
};

export default ChefServiceDashboard;
