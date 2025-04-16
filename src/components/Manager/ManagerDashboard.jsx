import React, { useState, useEffect } from "react";
import axios from "axios";
import { Client } from "@stomp/stompjs";

const ManagerDashboard = () => {
  // States for different data
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [planning, setPlanning] = useState([]);
  const [activeView, setActiveView] = useState("attendance"); // "attendance" or "planning"
  const [stompClient, setStompClient] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState(""); // Current manager's department

  // Fetch manager profile and department
  useEffect(() => {
    const fetchManagerProfile = async () => {
      try {
        // Assuming you have the manager ID stored in localStorage after login
        const managerId = localStorage.getItem("userId");
        const response = await axios.get(
          `http://localhost:8092/api/employee/${managerId}`,
        );
        setDepartment(response.data.department);
      } catch (error) {
        console.error("Error fetching manager profile:", error);
      }
    };

    fetchManagerProfile();
  }, []);

  // Setup WebSocket connection for real-time attendance updates
  useEffect(() => {
    if (!department) return;

    const setupWebSocket = () => {
      const client = new Client({
        brokerURL: "ws://localhost:8092/ws-attendance",
        reconnectDelay: 5000,
        onConnect: () => {
          client.subscribe("/topic/new-attendance", (message) => {
            const newRecord = JSON.parse(message.body);

            // Only update if the record belongs to the manager's department
            if (newRecord.employee.department === department) {
              setAttendanceRecords((prev) => [newRecord, ...prev]);
              setNotifications((prev) => [
                {
                  id: Date.now(),
                  message: `${newRecord.employee.name} a pointé (${newRecord.attendanceType.name})`,
                  timestamp: new Date(),
                  read: false,
                },
                ...prev,
              ]);
            }
          });
        },
      });

      client.activate();
      setStompClient(client);
      return client;
    };

    const client = setupWebSocket();

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [department]);

  // Fetch attendance records for the department
  useEffect(() => {
    if (!department) return;

    const fetchAttendanceData = async () => {
      setLoading(true);
      try {
        const managerId = localStorage.getItem("userId");
        const response = await axios.get(
          `http://localhost:8092/api/attendance/manager/${managerId}`,
        );
        setAttendanceRecords(response.data);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [department]);

  // Fetch planning for the department
  useEffect(() => {
    if (!department) return;

    const fetchPlanning = async () => {
      setLoading(true);
      try {
        // Endpoint should be adjusted to match your actual backend API
        const response = await axios.get(
          `http://localhost:8092/api/planning/department/${department}`,
        );
        setPlanning(response.data);
      } catch (error) {
        console.error("Error fetching planning data:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`http://localhost:8092/api/employees`);
        // Filter only employees that belong to this manager's department
        setEmployees(
          response.data.filter((emp) => emp.department === department),
        );
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchPlanning();
    fetchEmployees();
  }, [department]);

  // Mark a notification as read
  const markNotificationAsRead = (notificationId) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification,
      ),
    );
  };

  // Generate attendance report for chef service
  const generateReport = async () => {
    try {
      await axios.post(`http://localhost:8092/api/attendance/report/generate`, {
        department: department,
        date: new Date().toISOString().split("T")[0],
      });
      alert("Rapport envoyé au Chef de Service avec succès!");
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Erreur lors de l'envoi du rapport");
    }
  };

  // Format date to local string
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("fr-FR");
  };

  // Check if an employee is present today
  const isEmployeePresent = (employeeId) => {
    const today = new Date().toISOString().split("T")[0];
    return attendanceRecords.some(
      (record) =>
        record.employee.id === employeeId && record.timestamp.startsWith(today),
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-[#123458] min-h-screen text-white p-4">
          <h1 className="text-2xl font-bold mb-8">Manager Dashboard</h1>
          <nav>
            <ul>
              <li className="mb-2">
                <button
                  onClick={() => setActiveView("attendance")}
                  className={`w-full text-left p-2 rounded ${
                    activeView === "attendance"
                      ? "bg-[#02aafd]"
                      : "hover:bg-[#02aafd]"
                  }`}>
                  Pointage des employés
                </button>
              </li>
              <li className="mb-2">
                <button
                  onClick={() => setActiveView("planning")}
                  className={`w-full text-left p-2 rounded ${
                    activeView === "planning"
                      ? "bg-[#02aafd]"
                      : "hover:bg-[#02aafd]"
                  }`}>
                  Planning
                </button>
              </li>
              <li className="mb-2">
                <button
                  onClick={() => setActiveView("report")}
                  className={`w-full text-left p-2 rounded ${
                    activeView === "report"
                      ? "bg-[#02aafd]"
                      : "hover:bg-[#02aafd]"
                  }`}>
                  Rapport de présence
                </button>
              </li>
            </ul>
          </nav>

          {/* Notifications Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-2 mb-2 rounded ${
                      notification.read ? "bg-gray-700" : "bg-[#02aafd]"
                    }`}
                    onClick={() => markNotificationAsRead(notification.id)}>
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs">
                      {formatDate(notification.timestamp)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">Aucune notification</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Attendance Records View */}
          {activeView === "attendance" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Pointage des employés</h2>
              <div className="bg-white rounded shadow-md p-6">
                {loading ? (
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
                            Type
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Heure
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Statut
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceRecords.length > 0 ? (
                          attendanceRecords.map((record) => (
                            <tr key={record.id}>
                              <td className="border border-gray-300 px-4 py-2">
                                {record.employee.name}
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {record.attendanceType.name}
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {formatDate(record.timestamp)}
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                <span
                                  className={`px-2 py-1 rounded ${
                                    record.status === "PRESENT"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}>
                                  {record.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="4"
                              className="border border-gray-300 px-4 py-2 text-center">
                              Aucun enregistrement de pointage trouvé
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

          {/* Planning View */}
          {activeView === "planning" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Planning du département
              </h2>
              <div className="bg-white rounded shadow-md p-6">
                {loading ? (
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
                            Heure début
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Heure fin
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Statut
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {planning.length > 0 ? (
                          planning.map((plan) => (
                            <tr key={plan.id}>
                              <td className="border border-gray-300 px-4 py-2">
                                {plan.employee.name}
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
                                <span
                                  className={`px-2 py-1 rounded ${
                                    isEmployeePresent(plan.employee.id)
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}>
                                  {isEmployeePresent(plan.employee.id)
                                    ? "Présent"
                                    : "Absent"}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="5"
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

          {/* Report View */}
          {activeView === "report" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Rapport de présence</h2>
              <div className="bg-white rounded shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Présence des employés aujourd'hui
                </h3>

                <div className="overflow-x-auto mb-6">
                  <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border border-gray-300 px-4 py-2">
                          Employé
                        </th>
                        <th className="border border-gray-300 px-4 py-2">
                          Statut
                        </th>
                        <th className="border border-gray-300 px-4 py-2">
                          Heure d'arrivée
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((employee) => {
                        const todayDate = new Date()
                          .toISOString()
                          .split("T")[0];
                        const todayAttendance = attendanceRecords.find(
                          (record) =>
                            record.employee.id === employee.id &&
                            record.timestamp.startsWith(todayDate) &&
                            record.attendanceType.name
                              .toLowerCase()
                              .includes("arrivée"),
                        );

                        return (
                          <tr key={employee.id}>
                            <td className="border border-gray-300 px-4 py-2">
                              {employee.name}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              <span
                                className={`px-2 py-1 rounded ${
                                  todayAttendance
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}>
                                {todayAttendance ? "Présent" : "Absent"}
                              </span>
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {todayAttendance
                                ? formatDate(todayAttendance.timestamp)
                                : "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={generateReport}
                    className="bg-[#123458] text-white px-4 py-2 rounded hover:bg-[#02aafd] transition-colors">
                    Envoyer le rapport au Chef de Service
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
