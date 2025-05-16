import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
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
    const otherMethod = Object.keys(attendanceMethods).find(
      (m) => m !== method,
    );
    setAttendanceMethods((prev) => ({
      [method]: { ...prev[method], priority: newPriority },
      [otherMethod]: {
        ...prev[otherMethod],
        priority: newPriority === 1 ? 2 : 1,
      },
    }));
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
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-[#123458] text-white p-4">
          <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>
          <nav>
            <ul>
              <li className="mb-2">
                <button
                  onClick={() => setActiveSection("dashboard")}
                  className={`w-full text-left p-2 rounded ${
                    activeSection === "dashboard"
                      ? "bg-[#02aafd]"
                      : "hover:bg-[#02aafd]"
                  }`}>
                  Dashboard
                </button>
              </li>
              <li className="mb-2">
                <button
                  onClick={() => setActiveSection("employees")}
                  className={`w-full text-left p-2 rounded ${
                    activeSection === "employees"
                      ? "bg-[#02aafd]"
                      : "hover:bg-[#02aafd]"
                  }`}>
                  Gérer des employés
                </button>
              </li>
              <li className="mb-2">
                <button
                  onClick={() => setActiveSection("attendance")}
                  className={`w-full text-left p-2 rounded ${
                    activeSection === "attendance"
                      ? "bg-[#02aafd]"
                      : "hover:bg-[#02aafd]"
                  }`}>
                  Gérer type pointage
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-auto">
          {activeSection === "dashboard" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Tableau de bord</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded shadow-md">
                  <h3 className="text-xl font-semibold mb-4">Employés</h3>
                  <p className="text-4xl font-bold">{employees.length}</p>
                  <button
                    onClick={() => setActiveSection("employees")}
                    className="mt-4 bg-[#123458] text-white px-4 py-2 rounded hover:bg-[#02aafd] transition-colors">
                    Gérer les employés
                  </button>
                </div>

                <div className="bg-white p-6 rounded shadow-md">
                  <h3 className="text-xl font-semibold mb-4">
                    Types de pointage
                  </h3>
                  <p className="text-4xl font-bold">{attendanceTypes.length}</p>
                  <button
                    onClick={() => setActiveSection("attendance")}
                    className="mt-4 bg-[#123458] text-white px-4 py-2 rounded hover:bg-[#02aafd] transition-colors">
                    Gérer les types de pointage
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === "employees" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Gestion des employés</h2>

              <div className="bg-white p-6 rounded shadow-md mb-6">
                <h3 className="text-xl font-semibold mb-4">
                  Ajouter un employé
                </h3>
                <form onSubmit={addEmployee}>
                  <div className="mb-4">
                    <label className="block text-gray-700">Nom</label>
                    <input
                      type="text"
                      value={newEmployee.name}
                      onChange={(e) =>
                        setNewEmployee({ ...newEmployee, name: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded p-2"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700">Email</label>
                    <input
                      type="email"
                      value={newEmployee.email}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          email: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded p-2"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700">
                      Nom d'utilisateur
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
                      className="mt-1 block w-full border border-gray-300 rounded p-2"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700">Mot de passe</label>
                    <input
                      type="password"
                      value={newEmployee.password}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          password: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded p-2"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700">Rôle</label>
                    <select
                      value={newEmployee.role}
                      onChange={(e) =>
                        setNewEmployee({ ...newEmployee, role: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded p-2"
                      required>
                      {employeeRoles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700">Service</label>
                    <select
                      value={newEmployee.service}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          service: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded p-2"
                      required>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium">
                        Reconnaissance faciale
                      </h4>
                      <button
                        type="button"
                        onClick={() =>
                          setShowFacialRecognition(!showFacialRecognition)
                        }
                        className="bg-[#02aafd] text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors">
                        {showFacialRecognition
                          ? "Cacher"
                          : "Ajouter reconnaissance faciale"}
                      </button>
                    </div>

                    {showFacialRecognition && (
                      <div className="border p-4 rounded">
                        <div className="relative">
                          <video
                            ref={videoRef}
                            width={videoDimensions.width}
                            height={videoDimensions.height}
                            autoPlay
                            muted
                            className="w-full h-64 bg-gray-200 rounded mb-4"
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
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                            disabled={loading}>
                            {loading ? "Détection..." : "Détecter le visage"}
                          </button>

                          {detections.length > 0 && (
                            <div className="bg-green-100 text-green-800 px-3 py-2 rounded flex items-center">
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
                                ? "Visage détecté avec succès!"
                                : `${detections.length} visages détectés`}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="bg-[#123458] text-white px-4 py-2 rounded hover:bg-[#02aafd] transition-colors">
                    Ajouter employé
                  </button>
                </form>
              </div>

              <div className="bg-white p-6 rounded shadow-md">
                <h3 className="text-xl font-semibold mb-4">
                  Liste des employés
                </h3>
                {loading ? (
                  <p>Chargement des employés...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="border border-gray-300 px-4 py-2">
                            ID
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Nom
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Email
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Rôle
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Service
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Facial
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {employees.map((employee) => (
                          <tr key={employee.id}>
                            <td className="border border-gray-300 px-4 py-2">
                              {employee.id}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {employee.name}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {employee.email}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {employee.role === "manager"
                                ? "Manager"
                                : employee.role === "chef"
                                ? "Chef de service"
                                : "Employé"}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {employee.service}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              {employee.facialData ? (
                                <span className="text-green-600">✓</span>
                              ) : (
                                <span className="text-red-600">✗</span>
                              )}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              <button
                                onClick={() => deleteEmployee(employee.id)}
                                className="bg-[#88304E] text-white px-2 py-1 rounded hover:bg-[#522546] transition-colors">
                                Supprimer
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === "attendance" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Gestion des types de pointage
              </h2>

              <div className="bg-white p-6 rounded shadow-md mb-6">
                <h3 className="text-xl font-semibold mb-4">
                  Configuration des méthodes de pointage
                </h3>

                <div className="mb-4 flex items-center">
                  <input
                    type="checkbox"
                    checked={attendanceMethods.qrCode?.active}
                    onChange={() => handleMethodToggle("qrCode")}
                    className="mr-2"
                  />
                  <span className="mr-4">QR Code</span>
                  <select
                    value={attendanceMethods.qrCode?.priority}
                    onChange={(e) =>
                      handlePriorityChange("qrCode", parseInt(e.target.value))
                    }
                    disabled={!attendanceMethods.qrCode?.active}
                    className="px-2 py-1 border border-gray-300 rounded">
                    <option value={1}>Primaire</option>
                    <option value={2}>Secondaire</option>
                  </select>
                </div>

                <div className="mb-4 flex items-center">
                  <input
                    type="checkbox"
                    checked={attendanceMethods.facialRecognition?.active}
                    onChange={() => handleMethodToggle("facialRecognition")}
                    className="mr-2"
                  />
                  <span className="mr-4">Reconnaissance faciale</span>
                  <select
                    value={attendanceMethods.facialRecognition?.priority}
                    onChange={(e) =>
                      handlePriorityChange(
                        "facialRecognition",
                        parseInt(e.target.value),
                      )
                    }
                    disabled={!attendanceMethods.facialRecognition?.active}
                    className="px-2 py-1 border border-gray-300 rounded">
                    <option value={1}>Primaire</option>
                    <option value={2}>Secondaire</option>
                  </select>
                </div>

                <button
                  onClick={saveMethodsConfig}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                  Sauvegarder la configuration
                </button>
              </div>

              {/* Manager View Section */}
              <div className="mt-6 bg-white p-6 rounded shadow-md">
                <h3 className="text-xl font-semibold mb-4">
                  Vue manager - Méthode de pointage prioritaire
                </h3>
                {getHighestPriorityMethod() ? (
                  <div className="p-4 border-l-4 border-green-500 bg-green-50">
                    <p className="font-medium">
                      Méthode active:{" "}
                      <span className="font-bold">
                        {getHighestPriorityMethod().name}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Cette méthode sera affichée pour les managers
                    </p>
                  </div>
                ) : (
                  <div className="p-4 border-l-4 border-red-500 bg-red-50">
                    <p className="font-medium">Aucune méthode active</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Veuillez activer au moins une méthode de pointage
                    </p>
                  </div>
                )}
              </div>

              {/* Saved Configuration */}
              {savedConfiguration.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-3">
                    Configuration actuelle
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-2">
                            Type de pointage
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Statut
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Priorité
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {savedConfiguration.map((config, index) => (
                          <tr key={index}>
                            <td className="border border-gray-300 px-4 py-2">
                              {config.type}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {config.active ? (
                                <span className="text-green-600">Activé</span>
                              ) : (
                                <span className="text-red-600">Désactivé</span>
                              )}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {config.priority === 1
                                ? "Primaire"
                                : "Secondaire"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

export default Admin;
