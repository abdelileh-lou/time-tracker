import React, { useState, useEffect } from "react";
import axios from "axios";
import Facile from "./Facile";
import QrCodeGenerator from "./QrCodeGenerator";
import PointageManuel from "./PointageManuel";
import ProfileView from "../Employee/ProfileView";
import EditProfileView from "../Employee/EditProfileView";
import {
  loadModels,
  detectFaces,
  compareFaces,
} from "../../FacialRecognition/facialRecognition";
import { getUserData, logout } from "../../Auth/auth";

const ManagerDashboard = () => {
  // States
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [activeView, setActiveView] = useState("attendance");
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState("");
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [storedFacialData, setStoredFacialData] = useState(null);
  const [isSendingReport, setIsSendingReport] = useState(false);
  const [manager, setManager] = useState(null);
  const [primaryMethod, setPrimaryMethod] = useState("facial");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [planningData, setPlanningData] = useState([]);
  const [planningLoading, setPlanningLoading] = useState(false);
  const [planningError, setPlanningError] = useState(null);

  useEffect(() => {
    const currentManager = getUserData();
    if (!currentManager) {
      window.location.href = "/login";
      return;
    }
    setManager(currentManager);
    setLoading(false);
  }, []);

  useEffect(() => {
    const fetchActiveMethod = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8092/api/attendance-methods",
        );
        const methods = response.data;
        setPrimaryMethod(methods.qrCode.priority === 1 ? "qr" : "facial");
      } catch (error) {
        console.error("Error fetching active method:", error);
      }
    };
    fetchActiveMethod();
  }, []);

  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8092/api/attendance/record/today`,
        );
        setAttendanceRecords(response.data);
      } catch (error) {
        console.error("Error fetching attendance records:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceRecords();
    const intervalId = setInterval(fetchAttendanceRecords, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchFacialData = async () => {
      if (!employeeId) {
        setStoredFacialData(null);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:8092/api/employee/${employeeId}/facial-data`,
        );
        setStoredFacialData(response.data);
      } catch (error) {
        console.error("Error fetching facial data:", error);
        setStoredFacialData(null);
        setVerificationStatus("error");
        setVerificationMessage("No facial data found for this employee");
      }
    };

    fetchFacialData();
  }, [employeeId]);

  useEffect(() => {
    const fetchPlanningData = async () => {
      if (activeView === "planning" && manager) {
        try {
          setPlanningLoading(true);
          setPlanningError(null);
          const response = await axios.get(
            "http://localhost:8092/api/planning/plannings",
          );
          console.log("Fetched planning data:", response.data);
          const filteredPlannings = response.data.filter(
            (planning) => planning.departmentId === manager.departmentId,
          );
          console.log("Fetched planning data:", filteredPlannings);
          setPlanningData(filteredPlannings);
        } catch (error) {
          console.error("Error fetching planning data:", error);
          setPlanningError("Erreur lors du chargement du planning");
        } finally {
          setPlanningLoading(false);
        }
      }
    };

    fetchPlanningData();
  }, [activeView, manager]);

  useEffect(() => {
    const shouldActivateCamera =
      activeView === "attendance" && primaryMethod === "facial";
    setIsCameraActive(shouldActivateCamera);
  }, [activeView, primaryMethod]);

  const handleFacialDataCapture = async (liveDescriptor) => {
    if (!employeeId) {
      setVerificationStatus("error");
      setVerificationMessage("Please enter Employee ID first");
      return;
    }

    if (!storedFacialData) {
      setVerificationStatus("error");
      setVerificationMessage("No registered facial data for this employee");
      return;
    }

    setVerificationStatus("pending");
    setVerificationMessage("Verifying face...");

    try {
      const liveArray = Array.from(liveDescriptor);
      const storedDescriptor = storedFacialData[0].descriptor;
      const similarity = compareFaces(liveArray, storedDescriptor);

      if (similarity > 0.8) {
        setVerificationStatus("success");
        setVerificationMessage("Verification successful!");

        try {
          const response = await axios.post(
            "http://localhost:8092/api/attendance/record",
            {
              employeeId: parseInt(employeeId),
              timestamp: new Date().toISOString(),
              status: "PRESENT",
            },
          );

          if (response.data) {
            setAttendanceRecords((prevRecords) => [
              ...prevRecords,
              response.data,
            ]);
          }
        } catch (error) {
          console.error("Recording error:", error);
          setVerificationStatus("error");
          setVerificationMessage(
            "Failed to record attendance: " +
              (error.response?.data?.message || error.message),
          );
        }
      } else {
        setVerificationStatus("error");
        setVerificationMessage("Verification failed - Face mismatch");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationStatus("error");
      setVerificationMessage("Error processing verification");
    }
  };

  const handleEmployeeIdChange = (e) => {
    setEmployeeId(e.target.value);
    setVerificationStatus(null);
    setVerificationMessage("");
  };

  const handleSendReport = async () => {
    if (attendanceRecords.length === 0) {
      alert("No attendance records to report");
      return;
    }

    try {
      setIsSendingReport(true);
      await axios.post("http://localhost:8092/api/attendance/report-to-chef", {
        date: new Date().toISOString(),
        records: attendanceRecords,
        reportedChef: true,
      });

      setAttendanceRecords((records) =>
        records.map((record) => ({ ...record, reportedChef: true })),
      );
      alert("Report sent successfully to chef service!");
    } catch (error) {
      console.error("Error sending report:", error);
      alert("Error sending report. Please try again.");
    } finally {
      setIsSendingReport(false);
    }
  };

  const handleTabChange = (view) => {
    setActiveView(view);
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const getVerificationStatusClass = () => {
    switch (verificationStatus) {
      case "success":
        return "bg-green-100 text-green-700 border-green-300";
      case "error":
        return "bg-red-100 text-red-700 border-red-300";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      default:
        return "hidden";
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">
          Tableau de bord
        </h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          Déconnexion
        </button>
      </header>

      <div className="flex-1 p-6">
        <div className="mb-6 border-b">
          <div className="flex space-x-4">
            {[
              "attendance",
              "manual",
              "history",
              "planning",
              "profile",
              "editProfile",
            ].map((view) => (
              <button
                key={view}
                className={`py-2 px-4 ${
                  activeView === view
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-600 hover:text-blue-500"
                }`}
                onClick={() => handleTabChange(view)}>
                {
                  {
                    attendance: "Pointage en temps réel",
                    manual: "Pointage Manuel",
                    history: "Historique",
                    planning: "Planning",
                    profile: "Consulter Profile",
                    editProfile: "Gérer Profile",
                  }[view]
                }
              </button>
            ))}
          </div>
        </div>

        {activeView === "attendance" && (
          <div className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-3 bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Vérification</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Employé
                    </label>
                    <input
                      type="text"
                      value={employeeId}
                      onChange={handleEmployeeIdChange}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Entrez l'ID"
                    />
                  </div>
                  {verificationStatus && (
                    <div
                      className={`p-3 border rounded-md mt-4 ${getVerificationStatusClass()}`}>
                      {verificationMessage}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-span-6">
                {primaryMethod === "qr" ? (
                  <QrCodeGenerator />
                ) : (
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4 text-center">
                      {isCameraActive ? "Capture Faciale" : "Caméra désactivée"}
                    </h3>
                    <div className="flex justify-center">
                      <Facile
                        onCapture={handleFacialDataCapture}
                        isActive={isCameraActive}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="col-span-3 bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Statistiques</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Pointages aujourd'hui
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {attendanceRecords.length}
                    </p>
                  </div>
                  <button
                    onClick={handleSendReport}
                    disabled={isSendingReport || attendanceRecords.length === 0}
                    className={`w-full px-4 py-2 text-white rounded-md text-sm ${
                      isSendingReport || attendanceRecords.length === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}>
                    {isSendingReport
                      ? "Envoi en cours..."
                      : "Envoyer au Chef de Service"}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Pointages du jour</h3>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                    Exporter PDF
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nom
                      </th>
                      <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Heure
                      </th>
                      <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="py-4 text-center text-gray-500">
                          Chargement...
                        </td>
                      </tr>
                    ) : attendanceRecords.length > 0 ? (
                      attendanceRecords.map((record, index) => (
                        <tr key={index}>
                          <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-900">
                            {record.employeeId}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-900">
                            {record.employeeName}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-900">
                            {new Date(record.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap text-sm">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                record.reportedChef
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}>
                              {record.status}
                              {record.reportedChef && " ✓"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="py-4 text-center text-gray-500">
                          Aucun pointage enregistré aujourd'hui
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeView === "manual" && <PointageManuel />}

        {activeView === "history" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">
              Historique des pointages
            </h3>
            <div className="text-center text-gray-500 py-8">
              Cette fonctionnalité sera disponible prochainement
            </div>
          </div>
        )}

        {activeView === "planning" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Planning du Service</h3>
            <div className="overflow-x-auto">
              {planningLoading ? (
                <div className="text-center text-gray-500 py-8">
                  Chargement en cours...
                </div>
              ) : planningError ? (
                <div className="text-center text-red-500 py-8">
                  {planningError}
                </div>
              ) : planningData.length > 0 ? (
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Weekly Hours
                      </th>
                      <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monthly Hours
                      </th>
                      <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Planning
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {planningData.map((planning) => {
                      const planDetails = JSON.parse(planning.planJson || "{}");

                      // Calculate working hours
                      const weeklyHours =
                        planDetails.days?.reduce((total, day) => {
                          if (!day.isWorkDay) return total;
                          const [fromH, fromM] = (day.from || "")
                            .split(":")
                            .map(Number) || [0, 0];
                          const [toH, toM] = (day.to || "")
                            .split(":")
                            .map(Number) || [0, 0];
                          return total + (toH - fromH) + (toM - fromM) / 60;
                        }, 0) || 0;

                      const monthlyHours = (weeklyHours * 4.333).toFixed(1);

                      return (
                        <tr key={planning.id}>
                          <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-900">
                            {weeklyHours.toFixed(1)} hrs
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-900">
                            {monthlyHours} hrs
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-900">
                            {planDetails.name || "N/A"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Aucun planning disponible pour votre service
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === "profile" && manager && (
          <ProfileView employee={manager} />
        )}

        {activeView === "editProfile" && manager && (
          <EditProfileView employee={manager} setEmployee={setManager} />
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
