import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Monitor, CalendarClock, Users, Settings, LogOut } from "lucide-react";
import {
  loadModels,
  detectFaces,
} from "../../FacialRecognition/facialRecognition";

const Admin = () => {
  // State declarations
  const [activeSection, setActiveSection] = useState("dashboard");
  const [employees, setEmployees] = useState([]);
  const [attendanceTypes, setAttendanceTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedConfiguration, setSavedConfiguration] = useState([]);

  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role: "employee",
    service: "IT",
  });

  const [attendanceMethods, setAttendanceMethods] = useState({
    qrCode: { active: true, priority: 1 },
    facialRecognition: { active: true, priority: 2 },
    pinCode: { active: true, priority: 3 }
  });

  // Facial Recognition states
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [detections, setDetections] = useState([]);
  const [showFacialRecognition, setShowFacialRecognition] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [facialData, setFacialData] = useState(null);

  // Constants
  const employeeRoles = [
    { id: "employee", label: "Employee" },
    { id: "manager", label: "Manager" },
    { id: "chef", label: "Chef de service" },
  ];

  const services = [
    { id: "IT", label: "IT" },
    { id: "TLS", label: "TLS" },
  ];

  // Helper function for manager view
  const getHighestPriorityMethod = () => {
    const methodDisplayNames = {
      qrCode: "QR Code",
      facialRecognition: "Reconnaissance faciale",
      pinCode: "Code PIN"
    };

    const activeMethods = Object.entries(attendanceMethods)
      .filter(([_, config]) => config.active)
      .map(([method, config]) => ({
        name: methodDisplayNames[method],
        priority: config.priority,
      }));

    if (activeMethods.length === 0) return null;

    activeMethods.sort((a, b) => a.priority - b.priority);
    return activeMethods[0];
  };

  // Effects
  useEffect(() => {
    fetchMethodConfig();
  }, []);

  useEffect(() => {
    if (showFacialRecognition) {
      startVideo();
      return () => stopVideo();
    }
  }, [showFacialRecognition]);

  useEffect(() => {
    if (activeSection === "employees" || activeSection === "dashboard") {
      fetchEmployees();
    }
    if (activeSection === "attendance" || activeSection === "dashboard") {
      fetchAttendanceTypes();
    }
  }, [activeSection]);

  // API Functions
  const fetchMethodConfig = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8092/api/attendance-methods",
      );
      setAttendanceMethods(response.data);
    } catch (error) {
      console.error("Error fetching methods:", error);
      setAttendanceMethods({
        qrCode: { active: true, priority: 1 },
        facialRecognition: { active: true, priority: 2 },
        pinCode: { active: true, priority: 3 }
      });
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8092/api/employees");
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceTypes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:8092/api/attendance-types",
      );
      setAttendanceTypes(response.data || []);
    } catch (error) {
      console.error("Error fetching attendance types:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handler Functions
  const handleMethodToggle = (method) => {
    setAttendanceMethods((prev) => ({
      ...prev,
      [method]: { ...prev[method], active: !prev[method].active },
    }));
  };

  const handlePriorityChange = (method, newPriority) => {
    // Get all methods except the current one
    const otherMethods = Object.keys(attendanceMethods).filter(m => m !== method);
    
    // Create new state with updated priorities
    const newState = { ...attendanceMethods };
    newState[method] = { ...newState[method], priority: newPriority };
    
    // Update other methods' priorities
    otherMethods.forEach((otherMethod, index) => {
      newState[otherMethod] = {
        ...newState[otherMethod],
        priority: index + (newPriority === 1 ? 2 : 1)
      };
    });
    
    setAttendanceMethods(newState);
  };

  const saveMethodsConfig = async () => {
    try {
      setLoading(true);
      await axios.post(
        "http://localhost:8092/api/attendance-methods",
        attendanceMethods,
      );

      const configSummary = [
        {
          type: "QR Code",
          active: attendanceMethods.qrCode.active,
          priority: attendanceMethods.qrCode.priority,
        },
        {
          type: "Reconnaissance faciale",
          active: attendanceMethods.facialRecognition.active,
          priority: attendanceMethods.facialRecognition.priority,
        },
        {
          type: "Code PIN",
          active: attendanceMethods.pinCode.active,
          priority: attendanceMethods.pinCode.priority,
        }
      ];

      setSavedConfiguration(configSummary);
      alert("Configuration sauvegardée avec succès!");
    } catch (error) {
      console.error("Error saving methods:", error);
      alert("Échec de l'enregistrement de la configuration.");
    } finally {
      setLoading(false);
    }
  };

  // Facial Recognition Functions
  const startVideo = async () => {
    try {
      await loadModels();
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setVideoDimensions({
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight,
          });
          videoRef.current.play();
        };
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
    }
  };

  const stopVideo = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
  };

  const handleDetectFaces = async () => {
    setLoading(true);
    try {
      const faces = await detectFaces(videoRef.current);
      setDetections(faces);
      drawDetections(faces);

      if (faces.length > 0) {
        const faceData = faces.map((detection) => ({
          descriptor: Array.from(detection.descriptor),
          landmarks: detection.landmarks.positions.map((pos) => ({
            x: pos.x,
            y: pos.y,
          })),
          box: detection.detection.box,
        }));
        setFacialData(faceData);
      }
    } catch (error) {
      console.error("Detection error:", error);
    } finally {
      setLoading(false);
    }
  };

  const drawDetections = (detections) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach((detection) => {
      const { x, y, width, height } = detection.detection.box;
      context.lineWidth = 2;
      context.strokeStyle = "#02aafd";
      context.strokeRect(x, y, width, height);
    });
  };

  // Employee Functions
  const addEmployee = async (e) => {
    e.preventDefault();
    try {
      let endpoint = "http://localhost:8092/api/employee";
      if (newEmployee.role === "chef") {
        endpoint = "http://localhost:8092/api/chef-service";
      } else if (newEmployee.role === "manager") {
        endpoint = "http://localhost:8092/api/manager";
      }

      const employeeData = {
        ...newEmployee,
        facialData: facialData ? JSON.stringify(facialData) : null,
      };

      const response = await axios.post(endpoint, employeeData);
      setEmployees([...employees, response.data]);

      setNewEmployee({
        name: "",
        email: "",
        username: "",
        password: "",
        role: "employee",
        service: "IT",
      });
      setFacialData(null);
      setShowFacialRecognition(false);

      alert("Employé ajouté avec succès!");
    } catch (error) {
      console.error("Error adding employee:", error);
      alert("Échec de l'ajout de l'employé.");
    }
  };

  const deleteEmployee = async (id) => {
    try {
      await axios.delete(`http://localhost:8092/api/employee/${id}`);
      setEmployees(employees.filter((employee) => employee.id !== id));
      alert("Employé supprimé avec succès!");
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("Échec de la suppression de l'employé.");
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
          <h1 className="text-2xl font-bold text-emerald-800">Espace Admin</h1>
          <p className="text-sm text-emerald-600">NTIC Management</p>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveSection("dashboard")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  activeSection === "dashboard"
                    ? "bg-emerald-100 text-emerald-800"
                    : "text-emerald-600 hover:bg-emerald-50"
                }`}>
                <Users size={20} />
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection("employees")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  activeSection === "employees"
                    ? "bg-emerald-100 text-emerald-800"
                    : "text-emerald-600 hover:bg-emerald-50"
                }`}>
                <Users size={20} />
                <span>Employees</span>
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
                <span>Attendance</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection("settings")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  activeSection === "settings"
                    ? "bg-emerald-100 text-emerald-800"
                    : "text-emerald-600 hover:bg-emerald-50"
                }`}>
                <Settings size={20} />
                <span>Settings</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={() => {
              // Add logout logic here
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-all duration-300">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-emerald-600">Loading...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Dashboard Section */}
            {activeSection === "dashboard" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  <h3 className="text-lg font-semibold text-emerald-800 mb-2">
                    Total Employees
                  </h3>
                  <p className="text-3xl font-bold text-emerald-600">
                    {employees.length}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  <h3 className="text-lg font-semibold text-emerald-800 mb-2">
                    Active Attendance Methods
                  </h3>
                  <p className="text-3xl font-bold text-emerald-600">
                    {
                      Object.values(attendanceMethods).filter((m) => m.active)
                        .length
                    }
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  <h3 className="text-lg font-semibold text-emerald-800 mb-2">
                    Attendance Types
                  </h3>
                  <p className="text-3xl font-bold text-emerald-600">
                    {attendanceTypes.length}
                  </p>
                </div>
              </div>
            )}

            {/* Employees Section */}
            {activeSection === "employees" && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h2 className="text-2xl font-bold text-emerald-800 mb-6">
                    Employee Management
                  </h2>

                  {/* Add Employee Form */}
                  <div className="bg-emerald-50 p-6 rounded-lg mb-6">
                    <h3 className="text-xl font-semibold text-emerald-800 mb-4">
                      Add New Employee
                    </h3>
                    <form onSubmit={addEmployee} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-emerald-700 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={newEmployee.name}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                name: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-emerald-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={newEmployee.email}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                email: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-emerald-700 mb-1">
                            Username
                          </label>
                          <input
                            type="text"
                            value={newEmployee.username}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                username: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-emerald-700 mb-1">
                            Password
                          </label>
                          <input
                            type="password"
                            value={newEmployee.password}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                password: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-emerald-700 mb-1">
                            Role
                          </label>
                          <select
                            value={newEmployee.role}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                role: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            required>
                            {employeeRoles.map((role) => (
                              <option key={role.id} value={role.id}>
                                {role.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-emerald-700 mb-1">
                            Service
                          </label>
                          <select
                            value={newEmployee.service}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                service: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            required>
                            {services.map((service) => (
                              <option key={service.id} value={service.id}>
                                {service.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Facial Recognition Section */}
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-medium text-emerald-800">
                            Facial Recognition
                          </h4>
                          <button
                            type="button"
                            onClick={() =>
                              setShowFacialRecognition(!showFacialRecognition)
                            }
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                            {showFacialRecognition
                              ? "Hide"
                              : "Add Facial Recognition"}
                          </button>
                        </div>

                        {showFacialRecognition && (
                          <div className="border border-emerald-200 p-4 rounded-lg">
                            <div className="relative">
                              <video
                                ref={videoRef}
                                width={videoDimensions.width}
                                height={videoDimensions.height}
                                autoPlay
                                muted
                                className="w-full h-64 bg-emerald-100 rounded-lg mb-4"
                              />
                              <canvas
                                ref={canvasRef}
                                width={videoDimensions.width}
                                height={videoDimensions.height}
                                className="absolute top-0 left-0 w-full h-64"
                              />
                            </div>

                            <div className="flex space-x-3 mt-3">
                              <button
                                type="button"
                                onClick={handleDetectFaces}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                disabled={loading}>
                                {loading ? "Detecting..." : "Detect Face"}
                              </button>

                              {detections.length > 0 && (
                                <div className="bg-emerald-100 text-emerald-800 px-3 py-2 rounded-lg flex items-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  {detections.length === 1
                                    ? "Face detected successfully!"
                                    : `${detections.length} faces detected`}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-6">
                        <button
                          type="submit"
                          className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                          Add Employee
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Employee List */}
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold text-emerald-800 mb-4">
                      Employee List
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-emerald-50">
                            <th className="px-4 py-2 text-left text-emerald-800">
                              Name
                            </th>
                            <th className="px-4 py-2 text-left text-emerald-800">
                              Email
                            </th>
                            <th className="px-4 py-2 text-left text-emerald-800">
                              Role
                            </th>
                            <th className="px-4 py-2 text-left text-emerald-800">
                              Service
                            </th>
                            <th className="px-4 py-2 text-left text-emerald-800">
                              Facial
                            </th>
                            <th className="px-4 py-2 text-left text-emerald-800">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {employees.map((employee) => (
                            <tr
                              key={employee.id}
                              className="border-b border-emerald-100 hover:bg-emerald-50">
                              <td className="px-4 py-2">{employee.name}</td>
                              <td className="px-4 py-2">{employee.email}</td>
                              <td className="px-4 py-2">{employee.role}</td>
                              <td className="px-4 py-2">{employee.service}</td>
                              <td className="px-4 py-2 text-center">
                                {employee.facialData ? (
                                  <span className="text-emerald-600">✓</span>
                                ) : (
                                  <span className="text-red-600">✗</span>
                                )}
                              </td>
                              <td className="px-4 py-2">
                                <button
                                  onClick={() => deleteEmployee(employee.id)}
                                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Attendance Section */}
            {activeSection === "attendance" && (
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold text-emerald-800 mb-6">
                  Attendance Settings
                </h2>
                <div className="space-y-6">
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-emerald-800 mb-4">
                      Active Methods
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(attendanceMethods).map(
                        ([method, config]) => (
                          <div
                            key={method}
                            className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                            <span className="text-emerald-700">
                              {method === "qrCode"
                                ? "QR Code"
                                : method === "facialRecognition"
                                ? "Reconnaissance faciale"
                                : "Code PIN"}
                            </span>
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={config.active}
                                  onChange={() => handleMethodToggle(method)}
                                  className="form-checkbox h-5 w-5 text-emerald-600"
                                />
                                <span className="text-sm text-emerald-600">Active</span>
                              </label>
                              <select
                                value={config.priority}
                                onChange={(e) => handlePriorityChange(method, parseInt(e.target.value))}
                                className="form-select px-3 py-1 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                <option value={1}>Primary</option>
                                <option value={2}>Secondary</option>
                                <option value={3}>Tertiary</option>
                              </select>
                            </div>
                          </div>
                        )
                      )}
                    </div>

                    <div className="mt-4">
                      <button
                        onClick={saveMethodsConfig}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                        Save Configuration
                      </button>
                    </div>
                  </div>

                  {/* Manager View Section */}
                  <div className="mt-6 bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-emerald-800 mb-4">
                      Manager View - Priority Method
                    </h3>
                    {getHighestPriorityMethod() ? (
                      <div className="p-4 border-l-4 border-emerald-500 bg-emerald-50">
                        <p className="font-medium text-emerald-800">
                          Active Method:{" "}
                          <span className="font-bold">
                            {getHighestPriorityMethod().name}
                          </span>
                        </p>
                        <p className="text-sm text-emerald-600 mt-1">
                          This method will be displayed for managers
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 border-l-4 border-red-500 bg-red-50">
                        <p className="font-medium text-red-800">
                          No active method
                        </p>
                        <p className="text-sm text-red-600 mt-1">
                          Please activate at least one attendance method
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Saved Configuration */}
                  {savedConfiguration.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-emerald-800 mb-3">
                        Current Configuration
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-emerald-50">
                              <th className="px-4 py-2 text-left text-emerald-800">
                                Method Type
                              </th>
                              <th className="px-4 py-2 text-left text-emerald-800">
                                Status
                              </th>
                              <th className="px-4 py-2 text-left text-emerald-800">
                                Priority
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {savedConfiguration.map((config, index) => (
                              <tr
                                key={index}
                                className="border-b border-emerald-100">
                                <td className="px-4 py-2">{config.type}</td>
                                <td className="px-4 py-2">
                                  {config.active ? (
                                    <span className="text-emerald-600">
                                      Active
                                    </span>
                                  ) : (
                                    <span className="text-red-600">
                                      Inactive
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-2">
                                  {config.priority === 1
                                    ? "Primary"
                                    : config.priority === 2
                                    ? "Secondary"
                                    : "Tertiary"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Settings Section */}
            {activeSection === "settings" && (
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold text-emerald-800 mb-6">
                  System Settings
                </h2>
                <div className="space-y-6">
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-emerald-800 mb-4">
                      General Settings
                    </h3>
                    {/* Add settings content here */}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
