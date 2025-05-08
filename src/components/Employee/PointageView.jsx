/*
import { useEffect, useState } from "react";
import React from "react";

const PointageView = ({ employee }) => {
  const [timeRecords, setTimeRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTimeRecords = async () => {
      try {
        setLoading(true);
        // Replace with your actual API endpoint
        const response = await fetch(
          `http://localhost:8092/api/timerecords/${employee.id}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch time records");
        }

        const data = await response.json();
        setTimeRecords(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (employee && employee.id) {
      fetchTimeRecords();
    }
  }, [employee]);

  if (loading) return <div>Chargement des pointages...</div>;
  if (error) return <div className="text-red-500">Erreur: {error}</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Mes Pointages</h2>

      {timeRecords.length === 0 ? (
        <p>Aucun pointage enregistré.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 border-b text-left">Date</th>
                <th className="py-3 px-4 border-b text-left">
                  Heure d'arrivée
                </th>
                <th className="py-3 px-4 border-b text-left">
                  Heure de départ
                </th>
                <th className="py-3 px-4 border-b text-left">
                  Heures travaillées
                </th>
              </tr>
            </thead>
            <tbody>
              {timeRecords.map((record) => {
                // Calculate hours worked
                const startTime = new Date(record.timeIn);
                const endTime = record.timeOut
                  ? new Date(record.timeOut)
                  : null;
                const hoursWorked = endTime
                  ? ((endTime - startTime) / (1000 * 60 * 60)).toFixed(2)
                  : "En cours";

                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 border-b">
                      {new Date(record.date).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="py-3 px-4 border-b">
                      {new Date(record.timeIn).toLocaleTimeString("fr-FR")}
                    </td>
                    <td className="py-3 px-4 border-b">
                      {record.timeOut
                        ? new Date(record.timeOut).toLocaleTimeString("fr-FR")
                        : "Non pointé"}
                    </td>
                    <td className="py-3 px-4 border-b">{hoursWorked}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default PointageView;
*/
import { useEffect, useState } from "react";
import React from "react";

const PointageView = ({ employee }) => {
  const [timeRecords, setTimeRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTimeRecords = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:8092/api/timerecords/${employee.id}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch time records");
        }

        const data = await response.json();
        setTimeRecords(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (employee && employee.id) {
      fetchTimeRecords();
    }
  }, [employee]);

  if (loading) return <div>Chargement des pointages...</div>;
  if (error) return <div className="text-red-500">Erreur: {error}</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Mes Pointages</h2>

      {timeRecords.length === 0 ? (
        <p>Aucun pointage enregistré.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 border-b text-left">Date</th>
                <th className="py-3 px-4 border-b text-left">
                  Heure d'arrivée
                </th>
                <th className="py-3 px-4 border-b text-left">
                  Heure de départ
                </th>
                <th className="py-3 px-4 border-b text-left">
                  Heures travaillées
                </th>
              </tr>
            </thead>
            <tbody>
              {timeRecords.map((record) => {
                const startTime = new Date(record.timeIn);
                const endTime = record.timeOut
                  ? new Date(record.timeOut)
                  : null;
                const hoursWorked = endTime
                  ? ((endTime - startTime) / (1000 * 60 * 60)).toFixed(2)
                  : "En cours";

                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 border-b">
                      {new Date(record.date).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="py-3 px-4 border-b">
                      {new Date(record.timeIn).toLocaleTimeString("fr-FR")}
                    </td>
                    <td className="py-3 px-4 border-b">
                      {record.timeOut
                        ? new Date(record.timeOut).toLocaleTimeString("fr-FR")
                        : "Non pointé"}
                    </td>
                    <td className="py-3 px-4 border-b">{hoursWorked}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default PointageView;
