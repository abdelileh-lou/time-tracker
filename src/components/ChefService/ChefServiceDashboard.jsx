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

  // State for new planning entry
  const [newPlanningEntry, setNewPlanningEntry] = useState({
    employeeId: "",
    date: "",
    startTime: "",
    endTime: "",
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
          `http://localhost:8092/api/employees/not-managers-or-chefs`,
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

  // Handle changes to the new planning entry form
  const handlePlanningInputChange = (e) => {
    const { name, value } = e.target;
    setNewPlanningEntry({
      ...newPlanningEntry,
      [name]: value,
    });
  };

  // Create a new planning entry
  const createPlanningEntry = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const token = localStorage.getItem("token");

      await axios.post(
        `http://localhost:8092/api/planning`,
        {
          ...newPlanningEntry,
          department: serviceInfo.department,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

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
      setNewPlanningEntry({
        employeeId: "",
        date: "",
        startTime: "",
        endTime: "",
        description: "",
      });
    } catch (err) {
      console.error("Error creating planning:", err);
      setError("Failed to create planning");
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
                  Créer un nouveau planning
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
                    <div>
                      <label className="block text-gray-700 mb-2">Date</label>
                      <input
                        type="date"
                        name="date"
                        value={newPlanningEntry.date}
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
                        Heure de fin
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        value={newPlanningEntry.endTime}
                        onChange={handlePlanningInputChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                      />
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
                      {loading.planning ? "Création..." : "Créer le planning"}
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
                              colSpan="6"
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

export default ChefServiceDashboard;
