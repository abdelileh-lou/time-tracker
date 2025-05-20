import React, { useEffect, useState } from "react";
import { Calendar, Clock } from "lucide-react";

const PointageView = ({ employee }) => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState("daily");
  const [weeklyStats, setWeeklyStats] = useState({});
  const [monthlyStats, setMonthlyStats] = useState({});

  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      if (!employee || !employee.id) return;

      try {
        setLoading(true);
        const response = await fetch(
          `http://127.0.0.1:8092/api/attendance/employee/${employee.id}/records`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch attendance records");
        }

        const data = await response.json();

        // Process raw data into daily attendance records
        const groupedByDate = data.reduce((acc, record) => {
          const date = new Date(record.timestamp);
          const dateKey = date.toISOString().split("T")[0];

          if (!acc[dateKey]) {
            acc[dateKey] = [];
          }
          acc[dateKey].push(date.getTime());
          return acc;
        }, {});

        const processedRecords = Object.entries(groupedByDate).map(
          ([date, timestamps]) => {
            timestamps.sort((a, b) => a - b);
            const timeIn = new Date(timestamps[0]);
            const timeOut =
              timestamps.length > 1
                ? new Date(timestamps[timestamps.length - 1])
                : null;

            return {
              id: date,
              date: date,
              timeIn: timeIn.toISOString(),
              timeOut: timeOut?.toISOString() || null,
            };
          },
        );

        setAttendanceRecords(processedRecords);
        calculateWeeklyStats(processedRecords);
        calculateMonthlyStats(processedRecords);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching attendance:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAttendanceRecords();
  }, [employee]);

  // Calculate total hours worked by week
  const calculateWeeklyStats = (records) => {
    const weeklyData = {};

    records.forEach((record) => {
      const date = new Date(record.date);
      // Get the week number (ISO week: starts on Monday)
      const weekStart = new Date(date);
      weekStart.setDate(
        date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1),
      );
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekKey = `${weekStart.toLocaleDateString(
        "fr-FR",
      )} - ${weekEnd.toLocaleDateString("fr-FR")}`;

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          totalHours: 0,
          days: 0,
          startDate: weekStart,
          endDate: weekEnd,
        };
      }

      const hoursWorked = record.timeOut
        ? (new Date(record.timeOut) - new Date(record.timeIn)) /
          (1000 * 60 * 60)
        : 0;

      weeklyData[weekKey].totalHours += hoursWorked;
      weeklyData[weekKey].days += 1;
    });

    setWeeklyStats(weeklyData);
  };

  // Calculate total hours worked by month
  const calculateMonthlyStats = (records) => {
    const monthlyData = {};

    records.forEach((record) => {
      const date = new Date(record.date);
      const monthYear = `${date.toLocaleString("fr-FR", {
        month: "long",
      })} ${date.getFullYear()}`;

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          totalHours: 0,
          days: 0,
        };
      }

      const hoursWorked = record.timeOut
        ? (new Date(record.timeOut) - new Date(record.timeIn)) /
          (1000 * 60 * 60)
        : 0;

      monthlyData[monthYear].totalHours += hoursWorked;
      monthlyData[monthYear].days += 1;
    });

    setMonthlyStats(monthlyData);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        Chargement des pointages...
      </div>
    );
  if (error) return <div className="text-red-500 p-4">Erreur: {error}</div>;

  // Sort records by date (most recent first)
  const sortedRecords = [...attendanceRecords].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  // Utility function to format week range
  const getWeekRange = (date) => {
    const weekStart = new Date(date);
    weekStart.setDate(
      date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1),
    );
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return `${weekStart.toLocaleDateString(
      "fr-FR",
    )} - ${weekEnd.toLocaleDateString("fr-FR")}`;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-sky-800">Mes Pointages</h2>
        <p className="text-slate-600 mt-1">
          Consultez vos pointages et heures travaillées
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-slate-50">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center text-sky-600 mb-2">
            <Clock size={20} />
            <span className="ml-2 font-semibold">Total des pointages</span>
          </div>
          <div className="text-2xl font-bold text-sky-800">{attendanceRecords.length}</div>
          <div className="text-sm text-slate-500">Jours pointés</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center text-teal-600 mb-2">
            <Clock size={20} />
            <span className="ml-2 font-semibold">Cette semaine</span>
          </div>
          {Object.keys(weeklyStats).length > 0 ? (
            <>
              <div className="text-2xl font-bold text-teal-800">
                {Object.values(weeklyStats)[0].totalHours.toFixed(2)}h
              </div>
              <div className="text-sm text-slate-500">
                Heures travaillées cette semaine
              </div>
            </>
          ) : (
            <div className="text-slate-500">Aucune donnée</div>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center text-sky-600 mb-2">
            <Calendar size={20} />
            <span className="ml-2 font-semibold">Ce mois</span>
          </div>
          {Object.keys(monthlyStats).length > 0 ? (
            <>
              <div className="text-2xl font-bold text-sky-800">
                {Object.values(monthlyStats)[0].totalHours.toFixed(2)}h
              </div>
              <div className="text-sm text-slate-500">
                Heures travaillées ce mois
              </div>
            </>
          ) : (
            <div className="text-slate-500">Aucune donnée</div>
          )}
        </div>
      </div>

      {/* View Selector */}
      <div className="px-6 py-3 border-b border-slate-200">
        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedView("daily")}
            className={`py-2 px-4 font-medium rounded-md ${
              selectedView === "daily"
                ? "bg-sky-100 text-sky-700"
                : "text-slate-600 hover:bg-slate-100"
            }`}>
            Pointages journaliers
          </button>
          <button
            onClick={() => setSelectedView("weekly")}
            className={`py-2 px-4 font-medium rounded-md ${
              selectedView === "weekly"
                ? "bg-teal-100 text-teal-700"
                : "text-slate-600 hover:bg-slate-100"
            }`}>
            Résumé hebdomadaire
          </button>
          <button
            onClick={() => setSelectedView("monthly")}
            className={`py-2 px-4 font-medium rounded-md ${
              selectedView === "monthly"
                ? "bg-sky-100 text-sky-700"
                : "text-slate-600 hover:bg-slate-100"
            }`}>
            Résumé mensuel
          </button>
        </div>
      </div>

      {/* Content based on selected view */}
      <div className="p-6">
        {selectedView === "daily" && (
          <>
            {sortedRecords.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Aucun pointage enregistré.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-slate-200">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="py-3 px-4 border-b text-left font-semibold text-sky-800">
                        Date
                      </th>
                      <th className="py-3 px-4 border-b text-left font-semibold text-sky-800">
                        Heure d'arrivée
                      </th>
                      <th className="py-3 px-4 border-b text-left font-semibold text-sky-800">
                        Heure de départ
                      </th>
                      <th className="py-3 px-4 border-b text-left font-semibold text-sky-800">
                        Heures travaillées
                      </th>
                      <th className="py-3 px-4 border-b text-left font-semibold text-sky-800">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRecords.map((record) => {
                      const startTime = new Date(record.timeIn);
                      const endTime = record.timeOut
                        ? new Date(record.timeOut)
                        : null;
                      const hoursWorked = endTime
                        ? ((endTime - startTime) / (1000 * 60 * 60)).toFixed(2)
                        : "-";

                      return (
                        <tr key={record.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 border-b text-slate-700">
                            {new Date(record.date).toLocaleDateString("fr-FR")}
                          </td>
                          <td className="py-3 px-4 border-b text-slate-700">
                            {startTime.toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-3 px-4 border-b text-slate-700">
                            {endTime
                              ? endTime.toLocaleTimeString("fr-FR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Non pointé"}
                          </td>
                          <td className="py-3 px-4 border-b text-slate-700">
                            {hoursWorked !== "-" ? `${hoursWorked}h` : "-"}
                          </td>
                          <td className="py-3 px-4 border-b">
                            {!endTime ? (
                              <span className="px-2 py-1 rounded-full text-xs bg-sky-100 text-sky-800">
                                En cours
                              </span>
                            ) : hoursWorked >= 8 ? (
                              <span className="px-2 py-1 rounded-full text-xs bg-teal-100 text-teal-800">
                                Complète
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-800">
                                Partielle
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {selectedView === "weekly" && (
          <>
            {Object.keys(weeklyStats).length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Aucune donnée hebdomadaire disponible.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-slate-200">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="py-3 px-4 border-b text-left font-semibold text-teal-800">
                        Semaine
                      </th>
                      <th className="py-3 px-4 border-b text-left font-semibold text-teal-800">
                        Jours travaillés
                      </th>
                      <th className="py-3 px-4 border-b text-left font-semibold text-teal-800">
                        Heures totales
                      </th>
                      <th className="py-3 px-4 border-b text-left font-semibold text-teal-800">
                        Moyenne quotidienne
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(weeklyStats)
                      .sort((a, b) => b[1].startDate - a[1].startDate)
                      .map(([week, data]) => (
                        <tr key={week} className="hover:bg-slate-50">
                          <td className="py-3 px-4 border-b font-medium text-slate-700">
                            {week}
                          </td>
                          <td className="py-3 px-4 border-b text-slate-700">
                            {data.days} jours
                          </td>
                          <td className="py-3 px-4 border-b text-slate-700">
                            {data.totalHours.toFixed(2)}h
                          </td>
                          <td className="py-3 px-4 border-b text-slate-700">
                            {data.days > 0
                              ? (data.totalHours / data.days).toFixed(2)
                              : "0"}
                            h/jour
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {selectedView === "monthly" && (
          <>
            {Object.keys(monthlyStats).length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Aucune donnée mensuelle disponible.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-slate-200">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="py-3 px-4 border-b text-left font-semibold text-sky-800">
                        Mois
                      </th>
                      <th className="py-3 px-4 border-b text-left font-semibold text-sky-800">
                        Jours travaillés
                      </th>
                      <th className="py-3 px-4 border-b text-left font-semibold text-sky-800">
                        Heures totales
                      </th>
                      <th className="py-3 px-4 border-b text-left font-semibold text-sky-800">
                        Moyenne quotidienne
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(monthlyStats)
                      .sort((a, b) => {
                        const [monthA, yearA] = a[0].split(" ");
                        const [monthB, yearB] = b[0].split(" ");
                        if (yearA !== yearB) return yearB - yearA;

                        const months = [
                          "janvier",
                          "février",
                          "mars",
                          "avril",
                          "mai",
                          "juin",
                          "juillet",
                          "août",
                          "septembre",
                          "octobre",
                          "novembre",
                          "décembre",
                        ];
                        return months.indexOf(monthB) - months.indexOf(monthA);
                      })
                      .map(([month, data]) => (
                        <tr key={month} className="hover:bg-slate-50">
                          <td className="py-3 px-4 border-b font-medium text-slate-700">
                            {month}
                          </td>
                          <td className="py-3 px-4 border-b text-slate-700">
                            {data.days} jours
                          </td>
                          <td className="py-3 px-4 border-b text-slate-700">
                            {data.totalHours.toFixed(2)}h
                          </td>
                          <td className="py-3 px-4 border-b text-slate-700">
                            {data.days > 0
                              ? (data.totalHours / data.days).toFixed(2)
                              : "0"}
                            h/jour
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PointageView;
