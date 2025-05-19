import React, { useState, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { enqueueSnackbar } from "notistack";

const PointageManuel = () => {
  const [formData, setFormData] = useState({
    employeeId: "",
    employeeName: "",
    time: "",
    status: "PRESENT",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [isSendingReport, setIsSendingReport] = useState(false);

  // Fetch attendance records - all records without department filtering
  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      try {
        setLoadingRecords(true);
        const response = await axios.get(
          `http://localhost:8092/api/attendance/record/today`,
        );
        console.log("Fetched attendance records:", response.data);
        setAttendanceRecords(response.data);
      } catch (error) {
        console.error("Error fetching attendance records:", error);
      } finally {
        setLoadingRecords(false);
      }
    };

    fetchAttendanceRecords();
    const intervalId = setInterval(fetchAttendanceRecords, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axios.post(
        "http://localhost:8092/api/attendance/record",
        {
          employeeId: parseInt(formData.employeeId),
          employeeName: formData.employeeName,
          timestamp: new Date(formData.time).toISOString(),
          status: formData.status,
        },
      );

      if (response.data) {
        setSuccess(true);
        setFormData({
          employeeId: "",
          employeeName: "",
          time: "",
          status: "PRESENT",
        });
        // Refresh the attendance records after successful submission
        const fetchAttendanceRecords = async () => {
          try {
            const response = await axios.get(
              `http://localhost:8092/api/attendance/record/today`,
            );
            setAttendanceRecords(response.data);
          } catch (error) {
            console.error("Error fetching attendance records:", error);
          }
        };
        fetchAttendanceRecords();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error recording attendance");
    } finally {
      setLoading(false);
    }
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

      // Mark all records as reported in the UI
      setAttendanceRecords((records) =>
        records.map((record) => ({ ...record, reportedChef: true })),
      );
      enqueueSnackbar("Report sent successfully to chef service!", {
        variant: 'success',
      });
    } catch (error) {
      console.error("Error sending report:", error);
      enqueueSnackbar("Error sending report. Please try again.", {
        variant: 'error',
      });
    } finally {
      setIsSendingReport(false);
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const today = new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Add title and date
      doc.setFontSize(16);
      doc.text("Rapport de Pointage", 14, 15);
      doc.setFontSize(12);
      doc.text(`Date: ${today}`, 14, 25);

      // Prepare table data
      const tableData = attendanceRecords.map(record => [
        record.employeeId,
        record.employeeName,
        new Date(record.timestamp).toLocaleTimeString('fr-FR'),
        translateStatus(record.status),
        record.reportedChef ? "Oui" : "Non"
      ]);

      // Add table using autoTable
      autoTable(doc, {
        startY: 35,
        head: [['ID Employé', 'Nom', 'Heure', 'Statut', 'Signalé au Chef']],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontSize: 11,
          fontStyle: 'bold',
        },
      });

      // Save the PDF
      doc.save(`pointage_${today.replace(/\//g, '-')}.pdf`);
      
      enqueueSnackbar("PDF exporté avec succès!", {
        variant: 'success',
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      enqueueSnackbar("Erreur lors de l'exportation du PDF", {
        variant: 'error',
      });
    }
  };

  const handleDeleteRecord = async (id) => {
    try {
      await axios.delete(`http://localhost:8092/api/attendance/record/${id}`);
      
      // Update the attendance records list after successful deletion
      setAttendanceRecords(prevRecords => prevRecords.filter(record => record.id !== id));
      
      enqueueSnackbar("Pointage supprimé avec succès!", {
        variant: 'success',
      });
    } catch (error) {
      console.error("Error deleting attendance record:", error);
      enqueueSnackbar("Erreur lors de la suppression du pointage", {
        variant: 'error',
      });
    }
  };

  // Translate status codes to French for display
  const translateStatus = (status) => {
    switch (status) {
      case "PRESENT":
        return "Présent";
      case "ABSENT":
        return "Absent";
      case "LATE":
        return "En retard";
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Pointage Manuel</h2>

      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          Pointage enregistré avec succès!
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          Erreur: {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID Employé
            </label>
            <input
              type="text"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom Employé
            </label>
            <input
              type="text"
              name="employeeName"
              value={formData.employeeName}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Heure
            </label>
            <input
              type="datetime-local"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required>
              <option value="PRESENT">Présent</option>
              <option value="ABSENT">Absent</option>
              <option value="LATE">En retard</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50">
            {loading ? "Enregistrement..." : "Enregistrer le pointage"}
          </button>
        </div>
      </form>

      {/* Daily Attendance Records Table */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Pointages du jour</h3>
          <div className="space-x-2">
            <button
              onClick={handleSendReport}
              disabled={isSendingReport || attendanceRecords.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50">
              {isSendingReport ? "Envoi..." : "Signaler au Chef"}
            </button>
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
              Exporter PDF
            </button>
          </div>
        </div>

        {loadingRecords ? (
          <div className="text-center py-4">Chargement...</div>
        ) : attendanceRecords.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            Aucun pointage enregistré aujourd'hui
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 border-b text-left">ID</th>
                  <th className="py-3 px-4 border-b text-left">Nom</th>
                  <th className="py-3 px-4 border-b text-left">Heure</th>
                  <th className="py-3 px-4 border-b text-left">Statut</th>
                  <th className="py-3 px-4 border-b text-left">Signalé au Chef</th>
                  <th className="py-3 px-4 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((record, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                    <td className="py-2 px-4 border-b">{record.employeeId}</td>
                    <td className="py-2 px-4 border-b">{record.employeeName}</td>
                    <td className="py-2 px-4 border-b">
                      {new Date(record.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {translateStatus(record.status)}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {record.reportedChef ? "Oui" : "Non"}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="text-red-600 hover:text-red-800 focus:outline-none"
                        title="Supprimer le pointage">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
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
  );
};

export default PointageManuel;
