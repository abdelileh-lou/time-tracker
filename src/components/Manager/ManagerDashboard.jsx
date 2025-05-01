import React, { useState, useEffect } from "react";
import axios from "axios";
import { Client } from "@stomp/stompjs";
import Facile from "./Facile";
import QrCode from "./QrCode";

const ManagerDashboard = () => {
  // States
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [planning, setPlanning] = useState([]);
  const [activeView, setActiveView] = useState("attendance");
  const [stompClient, setStompClient] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [department, setDepartment] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  // Attendance Methods Management
  const [attendanceMethods, setAttendanceMethods] = useState({
    facialRecognition: { active: false, priority: 2 },
    qrCode: { active: false, priority: 1 },
  });
  const [currentMethod, setCurrentMethod] = useState("");

  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 7 days ago
    endDate: new Date().toISOString().split("T")[0], // today
  });

  // Fetch configured attendance methods
  useEffect(() => {
    const fetchAttendanceMethods = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8092/api/attendance-methods",
        );
        setAttendanceMethods(response.data);

        // Determine which method to show first based on priority
        const activeMethods = Object.entries(response.data)
          .filter(([_, config]) => config.active)
          .sort((a, b) => a[1].priority - b[1].priority);

        if (activeMethods.length > 0) {
          setCurrentMethod(activeMethods[0][0]);
        }
      } catch (error) {
        console.error("Error fetching attendance methods:", error);
      }
    };

    fetchAttendanceMethods();
  }, []);

  // Fetch manager profile and department
  useEffect(() => {
    const fetchManagerProfile = async () => {
      try {
        // const managerId = localStorage.getItem("userId");
        const managerId = 2;
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

  // WebSocket setup
  useEffect(() => {
    if (!department) return;

    const client = new Client({
      brokerURL: "ws://localhost:8092/ws-attendance",
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe("/topic/new-attendance", (message) => {
          const newRecord = JSON.parse(message.body);

          // Check if the record's method is currently active
          if (
            newRecord.employee.department === department &&
            attendanceMethods[newRecord.method]?.active
          ) {
            setAttendanceRecords((prev) => [newRecord, ...prev]);
            setNotifications((prev) => [
              {
                id: Date.now(),
                message: `${newRecord.employee.name} a pointé (${
                  newRecord.attendanceType.name
                }) par ${
                  newRecord.method === "facialRecognition"
                    ? "Reconnaissance Faciale"
                    : "QR Code"
                }`,
                timestamp: new Date(),
                read: false,
              },
              ...prev,
            ]);
          }
        });
      },
      onError: (err) => {
        console.error("WebSocket connection error:", err);
        setTimeout(() => client.activate(), 5000);
      },
    });

    client.activate();
    setStompClient(client);

    return () => {
      if (client && client.connected) {
        client.deactivate();
      }
    };
  }, [department, attendanceMethods]);

  // Fetch attendance records
  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      if (!department) return;

      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8092/api/attendance/today/department/${department}`,
        );
        setAttendanceRecords(response.data);
      } catch (error) {
        console.error("Error fetching attendance records:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceRecords();

    // Refresh every 5 minutes
    const intervalId = setInterval(fetchAttendanceRecords, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [department]);

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!department) return;

      try {
        const response = await axios.get(
          `http://localhost:8092/api/employees/department/${department}`,
        );
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, [department]);

  // Fetch planning
  useEffect(() => {
    const fetchPlanning = async () => {
      if (!department) return;

      try {
        const response = await axios.get(
          `http://localhost:8092/api/planning/department/${department}`,
        );
        setPlanning(response.data);
      } catch (error) {
        console.error("Error fetching planning:", error);
      }
    };

    fetchPlanning();
  }, [department]);

  // Fetch attendance history
  const fetchHistoryRecords = async () => {
    if (!department) return;

    try {
      setHistoryLoading(true);
      const response = await axios.get(
        `http://localhost:8092/api/attendance/history/department/${department}`,
        {
          params: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          },
        },
      );
      setHistoryRecords(response.data);
    } catch (error) {
      console.error("Error fetching history records:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Fetch history when date range changes
  useEffect(() => {
    if (activeView === "history") {
      fetchHistoryRecords();
    }
  }, [dateRange, department, activeView]);

  // Toggle between attendance methods
  const toggleAttendanceMethod = () => {
    // Get active methods
    const activeMethods = Object.keys(attendanceMethods).filter(
      (method) => attendanceMethods[method].active,
    );

    if (activeMethods.length > 1) {
      // Find the next method in the list
      const currentIndex = activeMethods.indexOf(currentMethod);
      const nextIndex = (currentIndex + 1) % activeMethods.length;
      setCurrentMethod(activeMethods[nextIndex]);
    }
  };

  // Handle date range change
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Mark notification as read
  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)),
    );
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Calculate metrics
  const presentEmployees = attendanceRecords.filter(
    (record) => record.attendanceType.name === "Entrée",
  ).length;

  const absentEmployees = employees.length - presentEmployees;

  const lateEmployees = attendanceRecords.filter(
    (record) =>
      record.attendanceType.name === "Entrée" &&
      new Date(record.timestamp) > new Date(record.expectedTime),
  ).length;

  // Get method display name
  const getMethodDisplayName = (method) => {
    switch (method) {
      case "facialRecognition":
        return "Reconnaissance Faciale";
      case "qrCode":
        return "QR Code";
      default:
        return method;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">
          Tableau de bord - {department}
        </h1>

        {/* Notifications */}
        <div className="relative">
          <button
            className="p-2 rounded-full hover:bg-gray-100 relative"
            onClick={() => setShowNotifications(!showNotifications)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {notifications.filter((n) => !n.read).length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notifications.filter((n) => !n.read).length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-xl z-10 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center p-3 border-b">
                <h3 className="font-semibold">Notifications</h3>
                <button
                  onClick={clearAllNotifications}
                  className="text-sm text-blue-600 hover:text-blue-800">
                  Tout effacer
                </button>
              </div>
              {notifications.length === 0 ? (
                <div className="p-4 text-gray-500 text-center">
                  Aucune notification
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 border-b hover:bg-gray-50 ${
                      !notif.read ? "bg-blue-50" : ""
                    }`}
                    onClick={() => markNotificationAsRead(notif.id)}>
                    <p className="text-sm">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notif.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 p-6 flex flex-col">
        {/* Tabs */}
        <div className="mb-6 border-b">
          <div className="flex space-x-4">
            <button
              className={`py-2 px-4 ${
                activeView === "attendance"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-blue-500"
              }`}
              onClick={() => setActiveView("attendance")}>
              Pointage en temps réel
            </button>
            <button
              className={`py-2 px-4 ${
                activeView === "history"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-blue-500"
              }`}
              onClick={() => setActiveView("history")}>
              Historique
            </button>
            <button
              className={`py-2 px-4 ${
                activeView === "planning"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-blue-500"
              }`}
              onClick={() => setActiveView("planning")}>
              Planning
            </button>
          </div>
        </div>

        {/* Method Selection (if multiple methods are active) */}
        {activeView === "attendance" && (
          <div className="mb-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">
                Méthode de pointage
              </h3>

              {/* Show active methods */}
              <div className="flex space-x-4">
                {Object.entries(attendanceMethods)
                  .filter(([_, config]) => config.active)
                  .sort((a, b) => a[1].priority - b[1].priority)
                  .map(([method, config]) => (
                    <button
                      key={method}
                      onClick={() => setCurrentMethod(method)}
                      className={`px-4 py-2 rounded-md ${
                        currentMethod === method
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}>
                      {getMethodDisplayName(method)}
                      {config.priority === 1 && (
                        <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                          Prioritaire
                        </span>
                      )}
                    </button>
                  ))}
              </div>

              {/* Component for the selected method */}
              <div className="mt-6">
                {currentMethod === "facialRecognition" && <Facile />}
                {currentMethod === "qrCode" && <QrCode />}
              </div>
            </div>
          </div>
        )}

        {/* Real-time Attendance View */}
        {activeView === "attendance" && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Présents
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  {presentEmployees}
                </p>
                <p className="text-sm text-gray-500">
                  sur {employees.length} employés
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Absents
                </h3>
                <p className="text-3xl font-bold text-red-600">
                  {absentEmployees}
                </p>
                <p className="text-sm text-gray-500">
                  sur {employees.length} employés
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  En retard
                </h3>
                <p className="text-3xl font-bold text-amber-600">
                  {lateEmployees}
                </p>
                <p className="text-sm text-gray-500">
                  sur {presentEmployees} présents
                </p>
              </div>
            </div>

            {/* Attendance Records Table */}
            <div className="bg-white p-6 rounded-lg shadow flex-1">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <svg
                    className="animate-spin h-10 w-10 text-blue-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-semibold mb-4">
                    Pointages du jour
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Employé
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Heure
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Méthode
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {attendanceRecords.length === 0 ? (
                          <tr>
                            <td
                              colSpan="5"
                              className="px-6 py-4 text-center text-gray-500">
                              Aucun pointage enregistré aujourd'hui
                            </td>
                          </tr>
                        ) : (
                          attendanceRecords.map((record) => (
                            <tr key={record.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <img
                                      className="h-10 w-10 rounded-full"
                                      src={
                                        record.employee.photoUrl ||
                                        "https://via.placeholder.com/40"
                                      }
                                      alt=""
                                    />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {record.employee.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {record.employee.employeeId}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    record.attendanceType.name === "Entrée"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}>
                                  {record.attendanceType.name}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(
                                  record.timestamp,
                                ).toLocaleTimeString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    record.method === "facialRecognition"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-indigo-100 text-indigo-800"
                                  }`}>
                                  {record.method === "facialRecognition"
                                    ? "Reconnaissance Faciale"
                                    : "QR Code"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {record.attendanceType.name === "Entrée" && (
                                  <span
                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      new Date(record.timestamp) >
                                      new Date(record.expectedTime)
                                        ? "bg-red-100 text-red-800"
                                        : "bg-green-100 text-green-800"
                                    }`}>
                                    {new Date(record.timestamp) >
                                    new Date(record.expectedTime)
                                      ? "En retard"
                                      : "À l'heure"}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* History View */}
        {activeView === "history" && (
          <div className="bg-white p-6 rounded-lg shadow flex-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Historique des pointages
              </h2>
              <div className="flex space-x-2">
                <div>
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-medium text-gray-700">
                    Date de début
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={dateRange.startDate}
                    onChange={handleDateChange}
                    className="mt-1 p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-medium text-gray-700">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={dateRange.endDate}
                    onChange={handleDateChange}
                    className="mt-1 p-2 border rounded-md"
                  />
                </div>
                <button
                  onClick={fetchHistoryRecords}
                  className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Filtrer
                </button>
              </div>
            </div>

            {historyLoading ? (
              <div className="flex justify-center items-center h-64">
                <svg
                  className="animate-spin h-10 w-10 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employé
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Heure
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Méthode
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {historyRecords.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-4 text-center text-gray-500">
                          Aucun pointage trouvé pour cette période
                        </td>
                      </tr>
                    ) : (
                      historyRecords.map((record) => (
                        <tr key={record.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(record.timestamp).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={
                                    record.employee.photoUrl ||
                                    "https://via.placeholder.com/40"
                                  }
                                  alt=""
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {record.employee.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {record.employee.employeeId}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                record.attendanceType.name === "Entrée"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}>
                              {record.attendanceType.name}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(record.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                record.method === "facialRecognition"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-indigo-100 text-indigo-800"
                              }`}>
                              {record.method === "facialRecognition"
                                ? "Reconnaissance Faciale"
                                : "QR Code"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {record.attendanceType.name === "Entrée" && (
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounde d-full ${
                                  new Date(record.timestamp) >
                                  new Date(record.expectedTime)
                                    ? "bg-red-100 text-red-800"
                                    : "bg-green-100 text-green-800"
                                }`}>
                                {new Date(record.timestamp) >
                                new Date(record.expectedTime)
                                  ? "En retard"
                                  : "À l'heure"}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Planning View */}
        {activeView === "planning" && (
          <div className="bg-white p-6 rounded-lg shadow flex-1">
            <h2 className="text-xl font-semibold mb-4">Planning de l'équipe</h2>

            {planning.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Aucun planning disponible
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employé
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lundi
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mardi
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mercredi
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jeudi
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vendredi
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Samedi
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dimanche
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {planning.map((schedule) => (
                      <tr key={schedule.employee.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-full"
                                src={
                                  schedule.employee.photoUrl ||
                                  "https://via.placeholder.com/40"
                                }
                                alt=""
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {schedule.employee.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {schedule.employee.employeeId}
                              </div>
                            </div>
                          </div>
                        </td>
                        {/* Days of the week */}
                        {schedule.weekSchedule.map((day, index) => (
                          <td
                            key={index}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {day.isWorkDay ? (
                              <div>
                                <div className="font-medium text-gray-800">
                                  {day.startTime} - {day.endTime}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {day.shiftName}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">Repos</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
