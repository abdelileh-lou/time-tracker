import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  loadModels,
  detectFaces,
} from "../../FacialRecognition/facialRecognition";

const Admin = () => {
  // State for navigation
  const [activeSection, setActiveSection] = useState("dashboard");

  // States for employee management
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role: "employee", // Default role
    service: "IT", // Default service
  });

  // Available roles for employees
  const employeeRoles = [
    { id: "employee", label: "Employee" },
    { id: "manager", label: "Manager" },
    { id: "chef", label: "Chef de service" },
  ];

  // Available services
  const services = [
    { id: "IT", label: "IT" },
    { id: "TLS", label: "TLS" },
  ];

  // States for attendance type management
  const [attendanceTypes, setAttendanceTypes] = useState([]);

  const [loading, setLoading] = useState(false);

  // States for attendance methods
  const [activeMethod, setActiveMethod] = useState("QrCode");
  const [priority, setPriority] = useState({
    first: "QR Code",
    second: "Facial Recognition",
  });

  // Modified state for attendance methods
  const [attendanceMethods, setAttendanceMethods] = useState({
    qrCode: { active: true, priority: 1 },
    facialRecognition: { active: true, priority: 2 },
  });

  // Available attendance methods
  const attendanceMethodOptions = [
    { id: "QrCode", label: "QR Code" },
    { id: "FacialRecognition", label: "Facial Recognition" },
    { id: "Both", label: "Les deux" },
  ];

  // Facial Recognition States
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [detections, setDetections] = useState([]);
  const [showFacialRecognition, setShowFacialRecognition] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [facialData, setFacialData] = useState(null);

  // Fetch method configuration from backend
  useEffect(() => {
    fetchMethodConfig();
  }, []);

  // Facial Recognition useEffect
  useEffect(() => {
    if (showFacialRecognition) {
      const startVideo = async () => {
        try {
          await loadModels();
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });

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

      startVideo();

      return () => {
        if (videoRef.current?.srcObject) {
          videoRef.current.srcObject
            .getTracks()
            .forEach((track) => track.stop());
        }
      };
    }
  }, [showFacialRecognition]);

  const fetchMethodConfig = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8092/api/attendance-methods",
      );
      setAttendanceMethods(response.data);

      // Set the active methods and priorities
      const activeMethods = [];
      if (response.data.qrCode.active) activeMethods.push("QrCode");
      if (response.data.facialRecognition.active)
        activeMethods.push("FacialRecognition");

      // Set active method based on priority
      if (activeMethods.length > 0) {
        const primaryMethod =
          response.data.qrCode.priority === 1 ? "QrCode" : "FacialRecognition";
        setActiveMethod(primaryMethod);
      }

      // Set priority based on the configuration
      setPriority({
        first:
          response.data.qrCode.priority === 1
            ? "QR Code"
            : "Facial Recognition",
        second:
          response.data.facialRecognition.priority === 1
            ? "Facial Recognition"
            : "QR Code",
      });
    } catch (error) {
      console.error("Error fetching methods:", error);
      // Set defaults if there's an error
      setAttendanceMethods({
        qrCode: { active: true, priority: 1 },
        facialRecognition: { active: true, priority: 2 },
      });
      setPriority({ first: "QR Code", second: "Facial Recognition" });
      setActiveMethod("QrCode");
    }
  };

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

  // Fetch all employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8092/api/employees");
      setEmployees(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setLoading(false);
    }
  };

  // Fetch all attendance types
  const fetchAttendanceTypes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:8092/api/attendance-types",
      );
      const types = response.data || [];
      setAttendanceTypes(types);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching attendance types:", error);
      setLoading(false);
    }
  };

  const handleDetectFaces = async () => {
    setLoading(true);
    try {
      const faces = await detectFaces(videoRef.current);
      console.log("Face Detection Results:", faces); // Added console log to show detection results
      setDetections(faces);
      drawDetections(faces);

      if (faces.length > 0) {
        // Store the facial data to be saved with employee
        const faceData = faces.map((detection) => ({
          descriptor: Array.from(detection.descriptor),
          landmarks: detection.landmarks.positions.map((pos) => ({
            x: pos.x,
            y: pos.y,
          })),
          box: detection.detection.box,
        }));

        console.log("Processed Facial Data:", faceData); // Added console log for processed data
        setFacialData(faceData);
      }
    } catch (error) {
      console.error("Detection error:", error);
    }
    setLoading(false);
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

  const addEmployee = async (e) => {
    e.preventDefault();
    try {
      let endpoint = "http://localhost:8092/api/employee";
      if (newEmployee.role === "chef") {
        endpoint = "http://localhost:8092/api/chef-service";
      } else if (newEmployee.role === "manager") {
        endpoint = "http://localhost:8092/api/manager";
      }

      // Convert facialData to JSON string if it exists
      const employeeData = {
        ...newEmployee,
        facialData: facialData ? JSON.stringify(facialData) : null,
      };

      const response = await axios.post(endpoint, employeeData);
      setEmployees([...employees, response.data]);

      // Reset states
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

  // Delete an employee
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

  // Delete an attendance type
  const deleteAttendanceType = async (id) => {
    try {
      await axios.delete(`http://localhost:8092/api/attendance-types/${id}`);
      setAttendanceTypes(attendanceTypes.filter((type) => type.id !== id));
      alert("Type de pointage supprimé avec succès!");
    } catch (error) {
      console.error("Error deleting attendance type:", error);
      alert("Échec de la suppression du type de pointage.");
    }
  };

  // Save methods configuration and refresh attendance types
  const saveMethodsConfig = async () => {
    try {
      setLoading(true);
      await axios.post(
        "http://localhost:8092/api/attendance-methods",
        attendanceMethods,
      );

      // Refresh the attendance types after saving the configuration
      await fetchAttendanceTypes();

      setLoading(false);
      alert("Configuration sauvegardée avec succès!");
    } catch (error) {
      console.error("Error saving methods:", error);
      setLoading(false);
      alert("Échec de l'enregistrement de la configuration.");
    }
  };

  useEffect(() => {
    if (activeSection === "employees" || activeSection === "dashboard") {
      fetchEmployees();
    }
    if (activeSection === "attendance" || activeSection === "dashboard") {
      fetchAttendanceTypes();
    }
  }, [activeSection]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="flex h-screen">
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
          {/* Dashboard Overview */}
          {activeSection === "dashboard" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Tableau de bord</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Employee Summary Card */}
                <div className="bg-white p-6 rounded shadow-md">
                  <h3 className="text-xl font-semibold mb-4">Employés</h3>
                  <p className="text-4xl font-bold">{employees.length}</p>
                  <button
                    onClick={() => setActiveSection("employees")}
                    className="mt-4 bg-[#123458] text-white px-4 py-2 rounded hover:bg-[#02aafd] transition-colors">
                    Gérer les employés
                  </button>
                </div>

                {/* Attendance Types Summary Card */}
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

          {/* Employee Management */}
          {activeSection === "employees" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Gestion des employés</h2>

              {/* Add Employee Form */}
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
                        setNewEmployee({
                          ...newEmployee,
                          role: e.target.value,
                        })
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

                  {/* Facial Recognition Section */}
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

              {/* Employee List */}
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

          {/* Attendance Type Management */}
          {activeSection === "attendance" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Gestion des types de pointage
              </h2>

              {/* Attendance Methods Configuration */}
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

              {/* Attendance Types List */}
              <div className="bg-white p-6 rounded shadow-md">
                <h3 className="text-xl font-semibold mb-4">
                  Types de pointage existants
                </h3>
                {loading ? (
                  <p>Chargement des types de pointage...</p>
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
                            Description
                          </th>
                          <th className="border border-gray-300 px-4 py-2">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceTypes.map((type) => (
                          <tr key={type.id}>
                            <td className="border border-gray-300 px-4 py-2">
                              {type.id}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {type.name}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {type.description}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              <button
                                onClick={() => deleteAttendanceType(type.id)}
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
        </div>
      </div>
    </div>
  );
};

export default Admin;
