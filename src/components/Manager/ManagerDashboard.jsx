// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Facile from "./Facile";
// import QrCodeGenerator from "./QrCodeGenerator"; // Import QrCodeGenerator component
// import PointageManuel from "./PointageManuel";
// import ProfileView from "../Employee/ProfileView";
// import EditProfileView from "../Employee/EditProfileView";
// import {
//   loadModels,
//   detectFaces,
//   compareFaces,
// } from "../../FacialRecognition/facialRecognition";
// import { getUserData, logout } from "../../Auth/auth"; // Import the auth utilities

// const ManagerDashboard = () => {
//   // States
//   const [attendanceRecords, setAttendanceRecords] = useState([]);
//   const [activeView, setActiveView] = useState("attendance");
//   const [loading, setLoading] = useState(true);
//   const [employeeId, setEmployeeId] = useState("");
//   const [verificationStatus, setVerificationStatus] = useState(null);
//   const [verificationMessage, setVerificationMessage] = useState("");
//   const [storedFacialData, setStoredFacialData] = useState(null);
//   const [isSendingReport, setIsSendingReport] = useState(false);
//   const [manager, setManager] = useState(null);
//   // Add this state at the top of ManagerDashboard
//   const [primaryMethod, setPrimaryMethod] = useState("facial");

//   // Get manager data from localStorage instead of API
//   useEffect(() => {
//     const currentManager = getUserData();
//     if (!currentManager) {
//       navigate("/login");
//       return;
//     }
//     setManager(currentManager);
//     setLoading(false);
//   }, []);

//   // Add this useEffect to fetch the active method
//   useEffect(() => {
//     const fetchActiveMethod = async () => {
//       try {
//         const response = await axios.get(
//           "http://localhost:8092/api/attendance-methods",
//         );
//         const methods = response.data;
//         setPrimaryMethod(methods.qrCode.priority === 1 ? "qr" : "facial");
//       } catch (error) {
//         console.error("Error fetching active method:", error);
//       }
//     };
//     fetchActiveMethod();
//   }, []);

//   // Fetch attendance records - all records without department filtering
//   useEffect(() => {
//     const fetchAttendanceRecords = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.get(
//           `http://localhost:8092/api/attendance/record/today`,
//         );
//         console.log("Fetched attendance records:", response.data);
//         setAttendanceRecords(response.data);
//       } catch (error) {
//         console.error("Error fetching attendance records:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAttendanceRecords();
//     const intervalId = setInterval(fetchAttendanceRecords, 5 * 60 * 1000);
//     return () => clearInterval(intervalId);
//   }, []);

//   // Fetch facial data for employee ID
//   useEffect(() => {
//     const fetchFacialData = async () => {
//       if (!employeeId) {
//         setStoredFacialData(null);
//         return;
//       }

//       try {
//         const response = await axios.get(
//           `http://localhost:8092/api/employee/${employeeId}/facial-data`,
//         );

//         console.log("Fetched facial data:", response.data);
//         setStoredFacialData(response.data);
//       } catch (error) {
//         console.error("Error fetching facial data:", error);
//         setStoredFacialData(null);
//         setVerificationStatus("error");
//         setVerificationMessage("No facial data found for this employee");
//       }
//     };

//     fetchFacialData();
//   }, [employeeId]);

//   // Handle facial data capture and attendance recording
//   const handleFacialDataCapture = async (liveDescriptor) => {
//     if (!employeeId) {
//       setVerificationStatus("error");
//       setVerificationMessage("Please enter Employee ID first");
//       return;
//     }

//     if (!storedFacialData) {
//       setVerificationStatus("error");
//       setVerificationMessage("No registered facial data for this employee");
//       return;
//     }

//     setVerificationStatus("pending");
//     setVerificationMessage("Verifying face...");

//     try {
//       const liveArray = Array.from(liveDescriptor);
//       const storedDescriptor = storedFacialData[0].descriptor;

//       // compareFaces should return a similarity score (0.0 - 1.0)
//       const similarity = compareFaces(liveArray, storedDescriptor);

//       if (similarity > 0.8) {
//         setVerificationStatus("success");
//         setVerificationMessage("Verification successful!");

//         try {
//           // Create attendance record that properly links to Employee entity
//           const response = await axios.post(
//             "http://localhost:8092/api/attendance/record",
//             {
//               employeeId: parseInt(employeeId),
//               timestamp: new Date().toISOString(),
//               status: "PRESENT",
//             },
//           );

//           // Add the new record to the existing records instead of fetching all again
//           if (response.data) {
//             setAttendanceRecords((prevRecords) => [
//               ...prevRecords,
//               response.data,
//             ]);
//           }
//         } catch (error) {
//           console.error("Recording error:", error);
//           setVerificationStatus("error");
//           setVerificationMessage(
//             "Failed to record attendance: " +
//               (error.response?.data?.message || error.message),
//           );
//         }
//       } else {
//         setVerificationStatus("error");
//         setVerificationMessage("Verification failed - Face mismatch");
//       }
//     } catch (error) {
//       console.error("Verification error:", error);
//       setVerificationStatus("error");
//       setVerificationMessage("Error processing verification");
//     }
//   };

//   // Handle employee ID change
//   const handleEmployeeIdChange = (e) => {
//     setEmployeeId(e.target.value);
//     // Reset verification status when ID changes
//     setVerificationStatus(null);
//     setVerificationMessage("");
//   };

//   // Handle sending report to chef service
//   const handleSendReport = async () => {
//     if (attendanceRecords.length === 0) {
//       alert("No attendance records to report");
//       return;
//     }

//     try {
//       setIsSendingReport(true);
//       await axios.post("http://localhost:8092/api/attendance/report-to-chef", {
//         date: new Date().toISOString(),
//         records: attendanceRecords,
//         reportedChef: true,
//       });

//       // Mark all records as reported in the UI
//       setAttendanceRecords((records) =>
//         records.map((record) => ({ ...record, reportedChef: true })),
//       );

//       alert("Report sent successfully to chef service!");
//     } catch (error) {
//       console.error("Error sending report:", error);
//       alert("Error sending report. Please try again.");
//     } finally {
//       setIsSendingReport(false);
//     }
//   };

//   // Handle logout
//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//   };

//   // Get verification status class
//   const getVerificationStatusClass = () => {
//     switch (verificationStatus) {
//       case "success":
//         return "bg-green-100 text-green-700 border-green-300";
//       case "error":
//         return "bg-red-100 text-red-700 border-red-300";
//       case "pending":
//         return "bg-yellow-100 text-yellow-700 border-yellow-300";
//       default:
//         return "hidden";
//     }
//   };

//   return (
//     <div className="flex flex-col h-screen bg-gray-100">
//       <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
//         <h1 className="text-2xl font-semibold text-gray-800">
//           Tableau de bord
//         </h1>
//         <button
//           onClick={handleLogout}
//           className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
//           Déconnexion
//         </button>
//       </header>

//       <div className="flex-1 p-6">
//         {/* Navigation Tabs */}
//         <div className="mb-6 border-b">
//           <div className="flex space-x-4">
//             <button
//               className={`py-2 px-4 ${
//                 activeView === "attendance"
//                   ? "border-b-2 border-blue-500 text-blue-600"
//                   : "text-gray-600 hover:text-blue-500"
//               }`}
//               onClick={() => setActiveView("attendance")}>
//               Pointage en temps réel
//             </button>
//             <button
//               className={`py-2 px-4 ${
//                 activeView === "manual"
//                   ? "border-b-2 border-blue-500 text-blue-600"
//                   : "text-gray-600 hover:text-blue-500"
//               }`}
//               onClick={() => setActiveView("manual")}>
//               Pointage Manuel
//             </button>
//             <button
//               className={`py-2 px-4 ${
//                 activeView === "history"
//                   ? "border-b-2 border-blue-500 text-blue-600"
//                   : "text-gray-600 hover:text-blue-500"
//               }`}
//               onClick={() => setActiveView("history")}>
//               Historique
//             </button>
//             <button
//               className={`py-2 px-4 ${
//                 activeView === "planning"
//                   ? "border-b-2 border-blue-500 text-blue-600"
//                   : "text-gray-600 hover:text-blue-500"
//               }`}
//               onClick={() => setActiveView("planning")}>
//               Planning
//             </button>
//             <button
//               className={`py-2 px-4 ${
//                 activeView === "profile"
//                   ? "border-b-2 border-blue-500 text-blue-600"
//                   : "text-gray-600 hover:text-blue-500"
//               }`}
//               onClick={() => setActiveView("profile")}>
//               Consulter Profile
//             </button>
//             <button
//               className={`py-2 px-4 ${
//                 activeView === "editProfile"
//                   ? "border-b-2 border-blue-500 text-blue-600"
//                   : "text-gray-600 hover:text-blue-500"
//               }`}
//               onClick={() => setActiveView("editProfile")}>
//               Gérer Profile
//             </button>
//           </div>
//         </div>

//         {/* Attendance View */}
//         {activeView === "attendance" && (
//           <div className="space-y-6">
//             {/* Main Attendance Section */}
//             <div className="grid grid-cols-12 gap-6">
//               {/* Left Side - Employee ID Input */}
//               <div className="col-span-3 bg-white p-4 rounded-lg shadow-md">
//                 <h3 className="text-lg font-semibold mb-4">Vérification</h3>
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       ID Employé
//                     </label>
//                     <input
//                       type="text"
//                       value={employeeId}
//                       onChange={handleEmployeeIdChange}
//                       className="w-full p-2 border border-gray-300 rounded-md text-sm"
//                       placeholder="Entrez l'ID"
//                     />
//                   </div>

//                   {/* Verification Status Message */}
//                   {verificationStatus && (
//                     <div
//                       className={`p-3 border rounded-md mt-4 ${getVerificationStatusClass()}`}>
//                       {verificationMessage}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Center - QR Code or Facial Recognition */}
//               <div className="col-span-6">
//                 {primaryMethod === "qr" ? (
//                   <QrCodeGenerator />
//                 ) : (
//                   <div className="bg-white p-4 rounded-lg shadow-md">
//                     <h3 className="text-lg font-semibold mb-4 text-center">
//                       Capture Faciale
//                     </h3>
//                     <div className="flex justify-center">
//                       <Facile onCapture={handleFacialDataCapture} />
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Right Side - Quick Stats */}
//               <div className="col-span-3 bg-white p-4 rounded-lg shadow-md">
//                 <h3 className="text-lg font-semibold mb-4">Statistiques</h3>
//                 <div className="space-y-4">
//                   <div>
//                     <p className="text-sm text-gray-500">
//                       Pointages aujourd'hui
//                     </p>
//                     <p className="text-2xl font-bold text-blue-600">
//                       {attendanceRecords.length}
//                     </p>
//                   </div>
//                   <button
//                     onClick={handleSendReport}
//                     disabled={isSendingReport || attendanceRecords.length === 0}
//                     className={`w-full px-4 py-2 text-white rounded-md text-sm ${
//                       isSendingReport || attendanceRecords.length === 0
//                         ? "bg-gray-400 cursor-not-allowed"
//                         : "bg-green-600 hover:bg-green-700"
//                     }`}>
//                     {isSendingReport
//                       ? "Envoi en cours..."
//                       : "Envoyer au Chef de Service"}
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Attendance Records Table */}
//             <div className="bg-white p-6 rounded-lg shadow-md">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-lg font-semibold">Pointages du jour</h3>
//                 <div className="flex space-x-2">
//                   <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
//                     Exporter PDF
//                   </button>
//                 </div>
//               </div>

//               <div className="overflow-x-auto">
//                 <table className="min-w-full bg-white">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         ID
//                       </th>
//                       <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Nom
//                       </th>
//                       <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Heure
//                       </th>
//                       <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Statut
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {loading ? (
//                       <tr>
//                         <td
//                           colSpan="4"
//                           className="py-4 text-center text-gray-500">
//                           Chargement...
//                         </td>
//                       </tr>
//                     ) : attendanceRecords.length > 0 ? (
//                       attendanceRecords.map((record, index) => (
//                         <tr key={index}>
//                           <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-900">
//                             {record.employeeId}
//                           </td>
//                           <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-900">
//                             {record.employeeName}
//                           </td>
//                           <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-900">
//                             {new Date(record.timestamp).toLocaleTimeString()}
//                           </td>
//                           <td className="py-2 px-3 whitespace-nowrap text-sm">
//                             <span
//                               className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                                 record.reportedChef
//                                   ? "bg-blue-100 text-blue-800"
//                                   : "bg-green-100 text-green-800"
//                               }`}>
//                               {record.status}
//                               {record.reportedChef && " ✓"}
//                             </span>
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td
//                           colSpan="4"
//                           className="py-4 text-center text-gray-500">
//                           Aucun pointage enregistré aujourd'hui
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Manual Attendance View */}
//         {activeView === "manual" && <PointageManuel />}

//         {/* History View */}
//         {activeView === "history" && (
//           <div className="bg-white p-6 rounded-lg shadow-md">
//             <h3 className="text-lg font-semibold mb-4">
//               Historique des pointages
//             </h3>
//             <div className="text-center text-gray-500 py-8">
//               Cette fonctionnalité sera disponible prochainement
//             </div>
//           </div>
//         )}

//         {/* Planning View */}
//         {activeView === "planning" && (
//           <div className="bg-white p-6 rounded-lg shadow-md">
//             <h3 className="text-lg font-semibold mb-4">Planning</h3>
//             <div className="text-center text-gray-500 py-8">
//               Cette fonctionnalité sera disponible prochainement
//             </div>
//           </div>
//         )}

//         {/* Profile View */}
//         {activeView === "profile" && manager && (
//           <ProfileView employee={manager} />
//         )}

//         {/* Edit Profile View */}
//         {activeView === "editProfile" && manager && (
//           <EditProfileView employee={manager} setEmployee={setManager} />
//         )}
//       </div>
//     </div>
//   );
// };

// export default ManagerDashboard;

import React, { useState, useEffect } from "react";
import axios from "axios";
import Facile from "./Facile";
import QrCodeGenerator from "./QrCodeGenerator"; // Import QrCodeGenerator component
import PointageManuel from "./PointageManuel";
import ProfileView from "../Employee/ProfileView";
import EditProfileView from "../Employee/EditProfileView";
import {
  loadModels,
  detectFaces,
  compareFaces,
} from "../../FacialRecognition/facialRecognition";
import { getUserData, logout } from "../../Auth/auth"; // Import the auth utilities

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
  // Add this state at the top of ManagerDashboard
  const [primaryMethod, setPrimaryMethod] = useState("facial");
  // Add state to control camera activation
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Get manager data from localStorage instead of API
  useEffect(() => {
    const currentManager = getUserData();
    if (!currentManager) {
      window.location.href = "/login"; // Using window.location since navigate isn't defined
      return;
    }
    setManager(currentManager);
    setLoading(false);
  }, []);

  // Add this useEffect to fetch the active method
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

  // Effect to control camera activation based on activeView and primaryMethod
  useEffect(() => {
    // Only activate camera if we're on attendance view AND using facial recognition
    const shouldActivateCamera =
      activeView === "attendance" && primaryMethod === "facial";
    setIsCameraActive(shouldActivateCamera);
  }, [activeView, primaryMethod]);

  // Fetch attendance records - all records without department filtering
  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8092/api/attendance/record/today`,
        );
        console.log("Fetched attendance records:", response.data);
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

  // Fetch facial data for employee ID
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

        console.log("Fetched facial data:", response.data);
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

  // Handle facial data capture and attendance recording
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

      // compareFaces should return a similarity score (0.0 - 1.0)
      const similarity = compareFaces(liveArray, storedDescriptor);

      if (similarity > 0.8) {
        setVerificationStatus("success");
        setVerificationMessage("Verification successful!");

        try {
          // Create attendance record that properly links to Employee entity
          const response = await axios.post(
            "http://localhost:8092/api/attendance/record",
            {
              employeeId: parseInt(employeeId),
              timestamp: new Date().toISOString(),
              status: "PRESENT",
            },
          );

          // Add the new record to the existing records instead of fetching all again
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

  // Handle employee ID change
  const handleEmployeeIdChange = (e) => {
    setEmployeeId(e.target.value);
    // Reset verification status when ID changes
    setVerificationStatus(null);
    setVerificationMessage("");
  };

  // Handle sending report to chef service
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

      // Mark all records as reported in the UI
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

  // Handle tab change
  const handleTabChange = (view) => {
    setActiveView(view);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    window.location.href = "/login"; // Using window.location since navigate isn't defined
  };

  // Get verification status class
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
        {/* Navigation Tabs */}
        <div className="mb-6 border-b">
          <div className="flex space-x-4">
            <button
              className={`py-2 px-4 ${
                activeView === "attendance"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-blue-500"
              }`}
              onClick={() => handleTabChange("attendance")}>
              Pointage en temps réel
            </button>
            <button
              className={`py-2 px-4 ${
                activeView === "manual"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-blue-500"
              }`}
              onClick={() => handleTabChange("manual")}>
              Pointage Manuel
            </button>
            <button
              className={`py-2 px-4 ${
                activeView === "history"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-blue-500"
              }`}
              onClick={() => handleTabChange("history")}>
              Historique
            </button>
            <button
              className={`py-2 px-4 ${
                activeView === "planning"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-blue-500"
              }`}
              onClick={() => handleTabChange("planning")}>
              Planning
            </button>
            <button
              className={`py-2 px-4 ${
                activeView === "profile"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-blue-500"
              }`}
              onClick={() => handleTabChange("profile")}>
              Consulter Profile
            </button>
            <button
              className={`py-2 px-4 ${
                activeView === "editProfile"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-blue-500"
              }`}
              onClick={() => handleTabChange("editProfile")}>
              Gérer Profile
            </button>
          </div>
        </div>

        {/* Attendance View */}
        {activeView === "attendance" && (
          <div className="space-y-6">
            {/* Main Attendance Section */}
            <div className="grid grid-cols-12 gap-6">
              {/* Left Side - Employee ID Input */}
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

                  {/* Verification Status Message */}
                  {verificationStatus && (
                    <div
                      className={`p-3 border rounded-md mt-4 ${getVerificationStatusClass()}`}>
                      {verificationMessage}
                    </div>
                  )}
                </div>
              </div>

              {/* Center - QR Code or Facial Recognition */}
              <div className="col-span-6">
                {primaryMethod === "qr" ? (
                  <QrCodeGenerator />
                ) : (
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4 text-center">
                      {isCameraActive
                        ? "Capture Faciale"
                        : "Caméra désactivée - Retournez à la page Pointage en temps réel"}
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

              {/* Right Side - Quick Stats */}
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

            {/* Attendance Records Table */}
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

        {/* Manual Attendance View */}
        {activeView === "manual" && <PointageManuel />}

        {/* History View */}
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

        {/* Planning View */}
        {activeView === "planning" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Planning</h3>
            <div className="text-center text-gray-500 py-8">
              Cette fonctionnalité sera disponible prochainement
            </div>
          </div>
        )}

        {/* Profile View */}
        {activeView === "profile" && manager && (
          <ProfileView employee={manager} />
        )}

        {/* Edit Profile View */}
        {activeView === "editProfile" && manager && (
          <EditProfileView employee={manager} setEmployee={setManager} />
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
