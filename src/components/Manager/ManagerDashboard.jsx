import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Facile from "./Facile";
import QrCodeGenerator from "./QrCodeGenerator";
import PointageManuel from "./PointageManuel";
import ProfileView from "../Employee/ProfileView";
import EditProfileView from "../Employee/EditProfileView";
import {
  Monitor,
  CalendarClock,
  Users,
  Settings,
  LogOut,
  ClipboardList,
  History,
  User,
} from "lucide-react";
import { useSnackbar } from "notistack";
import {
  loadModels,
  detectFaces,
  compareFaces,
} from "../../FacialRecognition/facialRecognition";
import { getUserData, logout } from "../../Auth/auth";

const ManagerDashboard = () => {
  const { enqueueSnackbar } = useSnackbar();
  
  // Define getActiveMethod at the top of the component
  const getActiveMethod = () => {
    const methods = Object.entries(attendanceMethods)
      .filter(([_, config]) => config.active)
      .sort((a, b) => a[1].priority - b[1].priority);
    return methods.length > 0 ? methods[0][0] : null;
  };

  // Add missing refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // States
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [activeView, setActiveView] = useState("attendance");
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState("");
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [storedFacialData, setStoredFacialData] = useState(null);
  const [isSendingReport, setIsSendingReport] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [confirmationType, setConfirmationType] = useState("");
  const [manager, setManager] = useState(null);
  const [primaryMethod, setPrimaryMethod] = useState("facial");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [planningData, setPlanningData] = useState([]);
  const [planningLoading, setPlanningLoading] = useState(false);
  const [planningError, setPlanningError] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [expandedDates, setExpandedDates] = useState({});
  const [attendanceMethods, setAttendanceMethods] = useState({
    qrCode: { active: true, priority: 1 },
    facialRecognition: { active: true, priority: 2 },
    pinCode: { active: true, priority: 3 },
  });
  const [pinAttendance, setPinAttendance] = useState({
    employeeId: "",
    pinCode: "",
  });
  const [pinError, setPinError] = useState("");
  const [pinSuccess, setPinSuccess] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [detections, setDetections] = useState([]);
  const [showManualEntry, setShowManualEntry] = useState(false);

  // Initialize facial recognition models
  useEffect(() => {
    const initializeFacialRecognition = async () => {
      try {
        await loadModels();
        console.log("Facial recognition models loaded successfully");
      } catch (error) {
        console.error("Error loading facial recognition models:", error);
      }
    };

    initializeFacialRecognition();
  }, []);

  // Update the useEffect for camera setup to use attendanceMethods instead of getActiveMethod
  useEffect(() => {
    const setupCamera = async () => {
      const activeMethod = Object.entries(attendanceMethods)
        .filter(([_, config]) => config.active)
        .sort((a, b) => a[1].priority - b[1].priority)[0]?.[0];

      if (videoRef.current && activeMethod === "facialRecognition") {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: 640,
              height: 480,
              facingMode: "user",
            },
          });
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          setIsCameraActive(true);
        } catch (error) {
          console.error("Error accessing camera:", error);
          setIsCameraActive(false);
          enqueueSnackbar("Error accessing camera", {
            variant: "error",
            anchorOrigin: {
              vertical: "top",
              horizontal: "right",
            },
          });
        }
      }
    };

    setupCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [attendanceMethods]); // Use attendanceMethods instead of getActiveMethod

  useEffect(() => {
    const fetchAttendanceHistory = async () => {
      if (activeView === "history") {
        try {
          setHistoryLoading(true);
          setHistoryError(null);
          const response = await axios.get(
            "http://localhost:8092/api/attendance/history",
          );
          setAttendanceHistory(response.data);
        } catch (error) {
          console.error("Error fetching attendance history:", error);
          setHistoryError("Failed to load attendance history");
        } finally {
          setHistoryLoading(false);
        }
      }
    };

    fetchAttendanceHistory();
  }, [activeView]);

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
    const shouldActivateCamera = activeView === "attendance" && 
      (primaryMethod === "facial" || getActiveMethod() === "facialRecognition");
    setIsCameraActive(shouldActivateCamera);
  }, [activeView, primaryMethod]);

  useEffect(() => {
    const fetchAttendanceMethods = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8092/api/attendance-methods",
        );
        setAttendanceMethods(response.data);
      } catch (error) {
        console.error("Error fetching attendance methods:", error);
      }
    };
    fetchAttendanceMethods();
  }, []);

  const reloadAttendanceRecords = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8092/api/attendance/record/today"
      );
      setAttendanceRecords(response.data);
    } catch (error) {
      console.error("Error reloading attendance records:", error);
      enqueueSnackbar("Error refreshing attendance records", {
        variant: "error",
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      });
    }
  };

  // Update the camera setup function
  const startVideo = async () => {
    try {
      await loadModels();
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setIsCameraActive(true);
        };
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
      enqueueSnackbar("Error accessing camera. Please check permissions.", {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        },
      });
    }
  };

  const stopVideo = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      setIsCameraActive(false);
    }
  };

  // Update the detect faces function
  const handleDetectFaces = async () => {
    if (!isCameraActive) {
      enqueueSnackbar("Please activate the camera first", {
        variant: 'warning',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        },
      });
      return;
    }

    setIsDetecting(true);
    try {
      const faces = await detectFaces(videoRef.current);
      setDetections(faces);

      if (faces.length > 0) {
        if (employeeId) {
          await handleFacialDataCapture(faces[0].descriptor);
          await reloadAttendanceRecords();
        }
        enqueueSnackbar("Face detected successfully!", {
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        });
      } else {
        enqueueSnackbar("No face detected. Please try again.", {
          variant: 'warning',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        });
      }
    } catch (error) {
      console.error("Detection error:", error);
      enqueueSnackbar("Error detecting face. Please try again.", {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        },
      });
    } finally {
      setIsDetecting(false);
    }
  };

  const handleFacialDataCapture = async (liveDescriptor) => {
    if (!employeeId) {
      enqueueSnackbar("Please enter Employee ID first", {
        variant: "error",
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      });
      return;
    }

    if (!storedFacialData) {
      enqueueSnackbar("No registered facial data for this employee", {
        variant: "error",
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      });
      return;
    }

    setVerificationStatus("pending");
    setVerificationMessage("Verifying face...");

    try {
      const liveArray = Array.from(liveDescriptor);
      const storedDescriptor = storedFacialData[0].descriptor;
      const similarity = compareFaces(liveArray, storedDescriptor);
      console.log("Face similarity score:", similarity);

      if (similarity > 0.9) {
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
            await reloadAttendanceRecords();
            enqueueSnackbar("Attendance recorded successfully!", {
              variant: "success",
              anchorOrigin: {
                vertical: "top",
                horizontal: "right",
              },
            });
          }
        } catch (error) {
          console.error("Recording error:", error);
          setVerificationStatus("error");
          setVerificationMessage(
            "Failed to record attendance: " +
              (error.response?.data?.message || error.message),
          );
          enqueueSnackbar("Failed to record attendance", {
            variant: "error",
            anchorOrigin: {
              vertical: "top",
              horizontal: "right",
            },
          });
        }
      } else {
        setVerificationStatus("error");
        setVerificationMessage(
          "Verification failed - Face mismatch. Please try again.",
        );
        enqueueSnackbar("Face verification failed", {
          variant: "error",
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationStatus("error");
      setVerificationMessage(
        "Error processing verification. Please try again.",
      );
      enqueueSnackbar("Error processing verification", {
        variant: "error",
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      });
    }
  };

  const handleEmployeeIdChange = (e) => {
    setEmployeeId(e.target.value);
    setVerificationStatus(null);
    setVerificationMessage("");
  };

  const handleSendReport = async () => {
    if (attendanceRecords.length === 0) {
      enqueueSnackbar("No attendance records to report", {
        variant: "error",
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      });
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
      enqueueSnackbar("Report sent successfully to chef service!", {
        variant: "success",
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      });
    } catch (error) {
      console.error("Error sending report:", error);
      enqueueSnackbar("Error sending report. Please try again.", {
        variant: "error",
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      });
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

  const handlePinAttendance = async (e) => {
    e.preventDefault();
    setPinError("");
    setPinSuccess("");

    if (!pinAttendance.employeeId) {
      enqueueSnackbar("Please enter Employee ID first", {
        variant: "error",
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      });
      return;
    }

    if (!pinAttendance.pinCode) {
      enqueueSnackbar("Please enter PIN code", {
        variant: "error",
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      });
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:8092/api/employee/${pinAttendance.employeeId}/code-pin`,
      );

      if (!response.data) {
        enqueueSnackbar("No data received from server", {
          variant: "error",
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        });
        return;
      }

      const enteredPin = String(pinAttendance.pinCode).trim();
      const storedPin = String(response.data).trim();

      const isPinValid = enteredPin === storedPin;

      if (isPinValid) {
        try {
          const attendanceResponse = await axios.post(
            "http://localhost:8092/api/attendance/record",
            {
              employeeId: parseInt(pinAttendance.employeeId),
              timestamp: new Date().toISOString(),
              status: "PRESENT",
            },
          );

          if (attendanceResponse.data) {
            await reloadAttendanceRecords();
            setPinAttendance({ employeeId: "", pinCode: "" });
            enqueueSnackbar("Attendance recorded successfully!", {
              variant: "success",
              anchorOrigin: {
                vertical: "top",
                horizontal: "right",
              },
            });
          }
        } catch (error) {
          console.error("Recording error:", error);
          enqueueSnackbar("Failed to record attendance", {
            variant: "error",
            anchorOrigin: {
              vertical: "top",
              horizontal: "right",
            },
          });
        }
      } else {
        enqueueSnackbar("Verification failed - PIN code mismatch", {
          variant: "error",
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      if (error.response?.status === 404) {
        enqueueSnackbar("No registered PIN code for this employee", {
          variant: "error",
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        });
      } else {
        enqueueSnackbar("Error processing verification", {
          variant: "error",
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        });
      }
    }
  };

  const shouldShowPinCode = () => {
    const pinCodeConfig = attendanceMethods.pinCode;
    return (
      pinCodeConfig && pinCodeConfig.active && pinCodeConfig.priority === 1
    );
  };

  const handleQrCodeScan = async (employeeId) => {
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
        await reloadAttendanceRecords();
        enqueueSnackbar("Attendance recorded successfully!", {
          variant: "success",
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        });
      }
    } catch (error) {
      console.error("Error recording QR code attendance:", error);
      enqueueSnackbar("Failed to record attendance", {
        variant: "error",
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      });
    }
  };

  return (
    <div className="flex h-screen bg-sky-50">
      {/* Sidebar - Only change width from w-64 to w-80 */}
      <div className="w-80 bg-white shadow-lg">
        <div className="p-6 border-b border-sky-100">
          <div className="flex items-center gap-2 mb-4">
            <Monitor size="2rem" className="text-sky-600" />
            <CalendarClock size="2rem" className="text-sky-600" />
          </div>
          <h1 className="text-2xl font-bold text-sky-800">Manager</h1>
          <p className="text-sm text-sky-600">NTIC Management</p>
        </div>

        <div className="p-4">
          {manager && (
            <div className="flex items-center mb-6 p-4 bg-sky-50 rounded-lg">
              <div className="bg-sky-100 rounded-full p-2">
                <User size={24} className="text-sky-600" />
              </div>
              <div className="ml-3">
                <div className="font-medium text-sky-800">{manager.name}</div>
                <div className="text-sm text-sky-600">{manager.email}</div>
              </div>
            </div>
          )}

          <nav>
            <button
              onClick={() => {
                setActiveView("attendance");
                setShowManualEntry(false);
              }}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-300 ${
                activeView === "attendance" && !showManualEntry
                  ? "bg-sky-100 text-sky-800"
                  : "text-sky-600 hover:bg-sky-50"
              }`}>
              <span>Attendance Management</span>
            </button>

            <button
              onClick={() => {
                setActiveView("attendance");
                setShowManualEntry(true);
              }}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-300 ${
                showManualEntry
                  ? "bg-sky-100 text-sky-800"
                  : "text-sky-600 hover:bg-sky-50"
              }`}>
              <span>Manual Entry</span>
            </button>

            <button
              onClick={() => {
                setActiveView("history");
                setShowManualEntry(false);
              }}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-300 ${
                activeView === "history"
                  ? "bg-sky-100 text-sky-800"
                  : "text-sky-600 hover:bg-sky-50"
              }`}>
              <span>Attendance History</span>
            </button>

            <div className="mt-6 mb-2 text-sm font-medium text-sky-600 uppercase">
              Profile Management
            </div>

            <button
              onClick={() => {
                setActiveView("profile");
                setShowManualEntry(false);
              }}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-300 ${
                activeView === "profile"
                  ? "bg-sky-100 text-sky-800"
                  : "text-sky-600 hover:bg-sky-50"
              }`}>
              <span>View Profile</span>
            </button>

            <button
              onClick={() => {
                setActiveView("editProfile");
                setShowManualEntry(false);
              }}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-300 ${
                activeView === "editProfile"
                  ? "bg-sky-100 text-sky-800"
                  : "text-sky-600 hover:bg-sky-50"
              }`}>
              <span>Edit Profile</span>
            </button>
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={handleLogout}
              className="w-50 flex items-center px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-all duration-300">
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        {/* Confirmation Slide */}
        {showConfirmation && (
          <div
            className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg transform transition-transform duration-300 ${
              confirmationType === "success"
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
            style={{
              animation: "slideIn 0.3s ease-out",
            }}>
            <div className="flex items-center gap-2">
              {confirmationType === "success" ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
              <span>{confirmationMessage}</span>
            </div>
          </div>
        )}

        {/* Add this style block at the top of your component */}
        <style>
          {`
            @keyframes slideIn {
              from {
                transform: translateX(100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
          `}
        </style>

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-lg text-sky-600">Loading...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {activeView === "attendance" && (
              <div>
                <h2 className="text-2xl font-bold text-sky-800 mb-6">
                  {showManualEntry ? "Manual Attendance Entry" : "Attendance Management"}
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  {showManualEntry ? (
                    <div className="bg-white p-6 rounded-xl shadow-md">
                      <PointageManuel onAttendanceRecorded={reloadAttendanceRecords} />
                    </div>
                  ) : (
                    <>
                      {/* PIN Code Attendance Section */}
                      {shouldShowPinCode() && (
                        <div className="bg-white p-6 rounded-xl shadow-md">
                          <h3 className="text-lg font-semibold text-sky-800 mb-4">
                            PIN Code Attendance
                          </h3>
                          <form
                            onSubmit={handlePinAttendance}
                            className="space-y-4">
                            <div>
                              <label
                                htmlFor="employeeId"
                                className="block text-sm font-medium text-sky-700 mb-1">
                                Employee ID
                              </label>
                              <input
                                type="text"
                                id="employeeId"
                                value={pinAttendance.employeeId}
                                onChange={(e) =>
                                  setPinAttendance((prev) => ({
                                    ...prev,
                                    employeeId: e.target.value,
                                  }))
                                }
                                className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                                placeholder="Enter Employee ID"
                              />
                            </div>
                            <div>
                              <label
                                htmlFor="pinCode"
                                className="block text-sm font-medium text-sky-700 mb-1">
                                PIN Code
                              </label>
                              <input
                                type="password"
                                id="pinCode"
                                value={pinAttendance.pinCode}
                                onChange={(e) =>
                                  setPinAttendance((prev) => ({
                                    ...prev,
                                    pinCode: e.target.value,
                                  }))
                                }
                                className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                                placeholder="Enter PIN Code"
                              />
                            </div>
                            <button
                              type="submit"
                              className="w-full px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors">
                              Record Attendance
                            </button>
                          </form>
                          {pinError && (
                            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                              {pinError}
                            </div>
                          )}
                          {pinSuccess && (
                            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg">
                              {pinSuccess}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Facial Recognition Section */}
                      {getActiveMethod() === "facialRecognition" && (
                        <div className="bg-white p-6 rounded-xl shadow-md">
                          <h3 className="text-lg font-semibold text-sky-800 mb-4">
                            Facial Recognition
                          </h3>
                          <div className="space-y-4">
                            <div className="relative">
                              <video
                                ref={videoRef}
                                autoPlay
                                muted
                                className="w-full h-64 bg-sky-100 rounded-lg mb-4"
                              />
                              <canvas
                                ref={canvasRef}
                                className="absolute top-0 left-0 w-full h-64"
                              />
                              {!isCameraActive && (
                                <div className="absolute inset-0 flex items-center justify-center bg-sky-100 bg-opacity-75 rounded-lg">
                                  <p className="text-sky-600 font-medium">Camera is inactive</p>
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={employeeId}
                                onChange={handleEmployeeIdChange}
                                placeholder="Enter Employee ID"
                                className="w-full px-4 py-2 border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    if (isCameraActive) {
                                      stopVideo();
                                    } else {
                                      startVideo();
                                    }
                                  }}
                                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                                    isCameraActive 
                                      ? "bg-red-600 hover:bg-red-700 text-white" 
                                      : "bg-sky-600 hover:bg-sky-700 text-white"
                                  }`}>
                                  {isCameraActive ? "Stop Camera" : "Start Camera"}
                                </button>
                                <button
                                  onClick={handleDetectFaces}
                                  disabled={!isCameraActive || isDetecting}
                                  className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                                    !isCameraActive
                                      ? "bg-gray-400 cursor-not-allowed"
                                      : isDetecting
                                      ? "bg-sky-500"
                                      : "bg-sky-600 hover:bg-sky-700"
                                  } text-white`}>
                                  {isDetecting ? (
                                    <>
                                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      Detecting...
                                    </>
                                  ) : (
                                    "Detect Face"
                                  )}
                                </button>
                              </div>
                            </div>
                            {verificationStatus && (
                              <div className={`p-4 rounded-lg border ${getVerificationStatusClass()}`}>
                                {verificationMessage}
                              </div>
                            )}
                            {detections.length > 0 && (
                              <div className="bg-sky-100 text-sky-800 px-3 py-2 rounded-lg flex items-center">
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

                      {/* QR Code Section */}
                      {getActiveMethod() === "qrCode" && (
                        <div className="bg-white p-6 rounded-xl shadow-md">
                          <h3 className="text-lg font-semibold text-sky-800 mb-4">
                            QR Code Scanner
                          </h3>
                          <QrCodeGenerator onScan={handleQrCodeScan} />
                        </div>
                      )}

                      {/* Attendance Records - Only show when not in manual entry mode */}
                      <div className="bg-white p-6 rounded-xl shadow-md">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-cyan-800">
                            Today's Records
                          </h3>
                          <button
                            onClick={handleSendReport}
                            disabled={isSendingReport}
                            className={`px-4 py-2 bg-cyan-600 text-white rounded-lg transition-colors ${
                              isSendingReport
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-cyan-700"
                            }`}>
                            {isSendingReport ? "Sending..." : "Send Report to Chef"}
                          </button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-cyan-200">
                                <th className="text-center p-2 text-cyan-800">
                                  Employee ID
                                </th>
                                <th className="text-center p-2 text-cyan-800">
                                  Name
                                </th>
                                <th className="text-center p-2 text-cyan-800">
                                  Time
                                </th>
                                <th className="text-center p-2 text-cyan-800">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {attendanceRecords.map((record, index) => (
                                <tr
                                  key={index}
                                  className="border-b border-cyan-100 hover:bg-cyan-50">
                                  <td className="p-2 text-cyan-700 text-center">
                                    {record.employeeId}
                                  </td>
                                  <td className="p-2 text-cyan-700 text-center">
                                    {record.employeeName}
                                  </td>
                                  <td className="p-2 text-cyan-700 text-center">
                                    {new Date(record.timestamp).toLocaleTimeString()}
                                  </td>
                                  <td className="p-2 text-center">
                                    <span
                                      className={`px-2 py-1 rounded text-sm ${
                                        record.status === "PRESENT"
                                          ? "bg-cyan-100 text-cyan-800"
                                          : "bg-red-100 text-red-800"
                                      }`}>
                                      {record.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {activeView === "history" && (
              <div>
                <h2 className="text-2xl font-bold text-sky-800 mb-6">
                  Attendance History
                </h2>
                <div className="bg-white p-6 rounded-xl shadow-md">
                  {historyLoading ? (
                    <div className="text-center py-4 text-sky-600">
                      Loading history...
                    </div>
                  ) : historyError ? (
                    <div className="text-center py-4 text-red-500">
                      {historyError}
                    </div>
                  ) : attendanceHistory.length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(
                        attendanceHistory.reduce((acc, record) => {
                          const date = new Date(
                            record.timestamp,
                          ).toLocaleDateString();
                          if (!acc[date]) acc[date] = [];
                          acc[date].push(record);
                          return acc;
                        }, {}),
                      )
                        .sort(
                          ([dateA], [dateB]) =>
                            new Date(dateB) - new Date(dateA),
                        )
                        .map(([date, records]) => (
                          <div
                            key={date}
                            className="border border-sky-200 rounded-lg overflow-hidden">
                            <div
                              className="flex items-center justify-between p-4 bg-sky-50 hover:bg-sky-100 cursor-pointer"
                              onClick={() =>
                                setExpandedDates((prev) => ({
                                  ...prev,
                                  [date]: !prev[date],
                                }))
                              }>
                              <div className="flex items-center gap-3">
                                <span className="text-sky-600 text-xl">
                                  📅
                                </span>
                                <div>
                                  <h3 className="font-semibold text-sky-800">
                                    {date}
                                  </h3>
                                  <p className="text-sm text-sky-600">
                                    {records.length} record
                                    {records.length > 1 ? "s" : ""}
                                  </p>
                                </div>
                              </div>
                              <span
                                className={`transform transition-transform ${
                                  expandedDates[date] ? "rotate-90" : ""
                                }`}>
                                ▸
                              </span>
                            </div>

                            {expandedDates[date] && (
                              <div className="border-t border-sky-200">
                                <div className="overflow-x-auto">
                                  <table className="w-full">
                                    <thead>
                                      <tr className="bg-sky-50">
                                        <th className="text-center p-2 text-sky-800">
                                          Employee ID
                                        </th>
                                        <th className="text-center p-2 text-sky-800">
                                          Name
                                        </th>
                                        <th className="text-center p-2 text-sky-800">
                                          Time
                                        </th>
                                        <th className="text-center p-2 text-sky-800">
                                          Status
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {records.map((record, index) => (
                                        <tr
                                          key={index}
                                          className="border-b border-sky-100 hover:bg-sky-50">
                                          <td className="p-2 text-sky-700 text-center">
                                            {record.employeeId}
                                          </td>
                                          <td className="p-2 text-sky-700 text-center">
                                            {record.employeeName}
                                          </td>
                                          <td className="p-2 text-sky-700 text-center">
                                            {new Date(
                                              record.timestamp,
                                            ).toLocaleTimeString()}
                                          </td>
                                          <td className="p-2 text-center">
                                            <span
                                              className={`px-2 py-1 rounded text-sm ${
                                                record.status === "PRESENT"
                                                  ? "bg-sky-100 text-sky-800"
                                                  : "bg-red-100 text-red-800"
                                              }`}>
                                              {record.status}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-sky-600">
                      No attendance history found
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
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
