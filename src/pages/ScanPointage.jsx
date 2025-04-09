// ScanPointage.jsx
import React, { useState, useEffect } from "react";
import { ArrowLeft, Clock, CheckCircle, XCircle } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router";
import { getUserData } from "../Auth/auth"; // Adjust path as needed

const ScanPointage = () => {
  const [attendanceTypes, setAttendanceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [scanStatus, setScanStatus] = useState(null); // null, 'success', 'error'
  const [statusMessage, setStatusMessage] = useState("");
  const [activeQRType, setActiveQRType] = useState(null);

  const navigate = useNavigate();

  // Fetch the employee data on component mount
  useEffect(() => {
    const currentUser = getUserData();
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setEmployee(currentUser);
  }, [navigate]);

  // Fetch available attendance types and their QR codes
  useEffect(() => {
    const fetchAttendanceTypes = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:8092/api/attendance-types",
        );
        setAttendanceTypes(response.data || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching attendance types:", err);
        setError(
          "Impossible de charger les types de pointage. Veuillez réessayer plus tard.",
        );
        setLoading(false);
      }
    };

    fetchAttendanceTypes();
  }, []);

  // Function to handle scanning/clicking a QR code
  const handleScan = async (typeId) => {
    if (!employee || !employee.id) {
      setStatusMessage("Erreur: Informations d'employé non disponibles");
      setScanStatus("error");
      return;
    }

    try {
      setScanStatus(null);
      setStatusMessage("Enregistrement du pointage en cours...");
      setActiveQRType(typeId);

      const response = await axios.post(
        `http://localhost:8092/api/attendance/record`,
        {
          employeeId: employee.id,
          attendanceTypeId: typeId,
          timestamp: new Date().toISOString(),
        },
      );

      if (response.status === 200 || response.status === 201) {
        setScanStatus("success");
        setStatusMessage("Pointage enregistré avec succès!");
      } else {
        throw new Error("Réponse inattendue du serveur");
      }
    } catch (err) {
      console.error("Error details:", err.response?.data || err.message);
      setScanStatus("error");
      setStatusMessage(
        err.response?.data?.message ||
          "Erreur lors de l'enregistrement. Veuillez réessayer.",
      );
    } finally {
      setTimeout(() => {
        setScanStatus(null);
        setStatusMessage("");
        setActiveQRType(null);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with back button */}
      <div className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex items-center">
          <button
            onClick={() => navigate("/employee-dashboard")}
            className="mr-4 p-2 rounded-full hover:bg-gray-700">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Scanner Pointage</h1>
        </div>
      </div>

      <div className="container mx-auto p-4">
        {/* Status Message */}
        {statusMessage && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              scanStatus === "success"
                ? "bg-green-100 text-green-800"
                : scanStatus === "error"
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
            } flex items-center`}>
            {scanStatus === "success" && (
              <CheckCircle className="mr-2" size={20} />
            )}
            {scanStatus === "error" && <XCircle className="mr-2" size={20} />}
            {!scanStatus && <Clock className="mr-2 animate-spin" size={20} />}
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-800 text-white p-4">
            <h2 className="text-lg font-semibold">
              Types de Pointage Disponibles
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <Clock className="mx-auto animate-spin mb-2" size={32} />
              <p>Chargement des QR codes...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              <p>{error}</p>
            </div>
          ) : attendanceTypes.length === 0 ? (
            <div className="p-8 text-center">
              <p>Aucun type de pointage disponible.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {attendanceTypes.map((type) => (
                <div
                  key={type.id}
                  className={`border rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow ${
                    activeQRType === type.id ? "ring-2 ring-blue-500" : ""
                  }`}>
                  <div className="bg-gray-50 p-3 border-b">
                    <h3 className="font-semibold">{type.name}</h3>
                    {type.description && (
                      <p className="text-sm text-gray-600">
                        {type.description}
                      </p>
                    )}
                  </div>

                  <div className="p-4 flex flex-col items-center">
                    {/* Display QR Code */}
                    // Replace the QR code image part with this:
                    <img
                      src={`http://localhost:8092/api/attendance-type/${type.id}/qrcode`}
                      alt={`QR Code pour ${type.name}`}
                      className="w-40 h-40 object-contain mb-3"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder-qr.png"; // Make sure you have this fallback
                      }}
                    />
                    <button
                      onClick={() => handleScan(type.id)}
                      className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition"
                      disabled={scanStatus !== null}>
                      Scanner {type.name}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScanPointage;
