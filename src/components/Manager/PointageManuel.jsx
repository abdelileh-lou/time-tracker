import React, { useState } from "react";
import axios from "axios";

const PointageManuel = () => {
  const [formData, setFormData] = useState({
    employeeId: "",
    employeeName: "",
    startTime: "",
    endTime: "",
    status: "PRESENT",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
          timestamp: new Date(formData.startTime).toISOString(),
          endTime: formData.endTime ? new Date(formData.endTime).toISOString() : null,
          status: formData.status,
        }
      );

      if (response.data) {
        setSuccess(true);
        setFormData({
          employeeId: "",
          employeeName: "",
          startTime: "",
          endTime: "",
          status: "PRESENT",
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error recording attendance");
    } finally {
      setLoading(false);
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

      <form onSubmit={handleSubmit} className="space-y-6">
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
              Heure d'arrivée
            </label>
            <input
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Heure de départ
            </label>
            <input
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
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
              required
            >
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
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "Enregistrement..." : "Enregistrer le pointage"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PointageManuel;
