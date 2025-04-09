import React, { useState, useEffect } from "react";
import axios from "axios";
import QRCode from "qrcode";

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
  });

  // States for attendance type management
  const [attendanceTypes, setAttendanceTypes] = useState([]);
  const [newAttendanceType, setNewAttendanceType] = useState({
    name: "",
    description: "",
  });
  const [qrCodes, setQrCodes] = useState({}); // Stores generated QR codes

  const [loading, setLoading] = useState(false);

  // Generate QR code for an attendance type
  const generateQrCode = async (typeId, typeName) => {
    try {
      const url = `http://localhost:8092/api/attendance/scan/${typeId}`;
      const qrCodeData = await QRCode.toDataURL(url);
      setQrCodes((prev) => ({ ...prev, [typeId]: qrCodeData }));
      return qrCodeData;
    } catch (err) {
      console.error("Error generating QR code:", err);
      return null;
    }
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

  // Fetch all attendance types and generate QR codes
  const fetchAttendanceTypes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:8092/api/attendance-types",
      );
      const types = response.data || [];
      setAttendanceTypes(types);

      // Generate QR codes for each type
      const newQrCodes = {};
      for (const type of types) {
        const qrCode = await generateQrCode(type.id, type.name);
        if (qrCode) {
          newQrCodes[type.id] = qrCode;
        }
      }
      setQrCodes(newQrCodes);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching attendance types:", error);
      setLoading(false);
    }
  };

  // Add a new employee
  const addEmployee = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8092/api/employee",
        newEmployee,
      );
      setEmployees([...employees, response.data]);
      setNewEmployee({ name: "", email: "", username: "", password: "" });
      alert("Employee added successfully!");
    } catch (error) {
      console.error("Error adding employee:", error);
      alert("Failed to add employee.");
    }
  };

  // Delete an employee
  const deleteEmployee = async (id) => {
    try {
      await axios.delete(`http://localhost:8092/api/employee/${id}`);
      setEmployees(employees.filter((employee) => employee.id !== id));
      alert("Employee deleted successfully!");
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("Failed to delete employee.");
    }
  };

  // Add a new attendance type and generate QR code
  const addAttendanceType = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8092/api/attendance-type",
        newAttendanceType,
      );
      const newType = response.data;

      // Generate QR code for the new type
      const qrCode = await generateQrCode(newType.id, newType.name);

      setAttendanceTypes([...attendanceTypes, newType]);
      if (qrCode) {
        setQrCodes((prev) => ({ ...prev, [newType.id]: qrCode }));
      }

      setNewAttendanceType({ name: "", description: "" });
      alert("Attendance type added successfully!");
    } catch (error) {
      console.error("Error adding attendance type:", error);
      alert("Failed to add attendance type.");
    }
  };

  // Delete an attendance type
  const deleteAttendanceType = async (id) => {
    try {
      await axios.delete(`http://localhost:8092/api/attendance-type/${id}`);
      setAttendanceTypes(attendanceTypes.filter((type) => type.id !== id));

      // Remove the QR code from state
      setQrCodes((prev) => {
        const newQrCodes = { ...prev };
        delete newQrCodes[id];
        return newQrCodes;
      });

      alert("Attendance type deleted successfully!");
    } catch (error) {
      console.error("Error deleting attendance type:", error);
      alert("Failed to delete attendance type.");
    }
  };

  // Regenerate QR code for a specific attendance type
  const regenerateQrCode = async (typeId, typeName) => {
    try {
      const qrCode = await generateQrCode(typeId, typeName);
      if (qrCode) {
        alert("QR code regenerated successfully!");
      }
    } catch (error) {
      console.error("Error regenerating QR code:", error);
      alert("Failed to regenerate QR code.");
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
                  <button
                    type="submit"
                    className="bg-[#123458] text-white px-4 py-2 rounded hover:bg-[#02aafd] transition-colors">
                    Ajouter
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

              {/* Add Attendance Type Form */}
              <div className="bg-white p-6 rounded shadow-md mb-6">
                <h3 className="text-xl font-semibold mb-4">
                  Ajouter un type de pointage
                </h3>
                <form onSubmit={addAttendanceType}>
                  <div className="mb-4">
                    <label className="block text-gray-700">Nom</label>
                    <input
                      type="text"
                      value={newAttendanceType.name}
                      onChange={(e) =>
                        setNewAttendanceType({
                          ...newAttendanceType,
                          name: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded p-2"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700">Description</label>
                    <textarea
                      value={newAttendanceType.description}
                      onChange={(e) =>
                        setNewAttendanceType({
                          ...newAttendanceType,
                          description: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded p-2"
                      rows="3"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#123458] text-white px-4 py-2 rounded hover:bg-[#02aafd] transition-colors">
                    Ajouter
                  </button>
                </form>
              </div>

              {/* Attendance Type List */}
              <div className="bg-white p-6 rounded shadow-md">
                <h3 className="text-xl font-semibold mb-4">
                  Liste des types de pointage
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
                            QR Code
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
                              {qrCodes[type.id] ? (
                                <div className="flex flex-col items-center">
                                  <img
                                    src={qrCodes[type.id]}
                                    alt={`QR Code for ${type.name}`}
                                    className="w-16 h-16"
                                  />
                                  <button
                                    onClick={() =>
                                      regenerateQrCode(type.id, type.name)
                                    }
                                    className="mt-2 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors">
                                    Regénérer
                                  </button>
                                </div>
                              ) : (
                                <p className="text-gray-500">Génération...</p>
                              )}
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
