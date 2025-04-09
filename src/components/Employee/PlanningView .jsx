/*
import React from "react";

const PlanningView = ({ employees }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Planning des Employés</h2>

      {employees.length === 0 ? (
        <p>Aucun employé disponible.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 border-b text-left">Nom</th>
                <th className="py-3 px-4 border-b text-left">Email</th>
                <th className="py-3 px-4 border-b text-left">Département</th>
                <th className="py-3 px-4 border-b text-left">Horaire</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 border-b">{emp.name}</td>
                  <td className="py-3 px-4 border-b">{emp.email}</td>
                  <td className="py-3 px-4 border-b">
                    {emp.department || "N/A"}
                  </td>
                  <td className="py-3 px-4 border-b">
                    {emp.schedule
                      ? `${emp.schedule.start} - ${emp.schedule.end}`
                      : "Non défini"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default PlanningView;
*/
import React from "react";

const PlanningView = ({ employee }) => {
  if (!employee) return <div>Aucun employé disponible.</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Mon Planning</h2>

      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Nom</p>
              <p className="font-medium">{employee.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Département</p>
              <p className="font-medium">{employee.department || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Horaire</p>
              <p className="font-medium">
                {employee.schedule
                  ? `${employee.schedule.start} - ${employee.schedule.end}`
                  : "Non défini"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Jours de travail</p>
              <p className="font-medium">
                {employee.workingDays
                  ? employee.workingDays.join(", ")
                  : "Non défini"}
              </p>
            </div>
          </div>
        </div>

        {/* Add weekly schedule display if available */}
        {employee.weeklySchedule && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">
              Planning Hebdomadaire
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b text-left">Jour</th>
                    <th className="py-2 px-4 border-b text-left">Heures</th>
                    <th className="py-2 px-4 border-b text-left">Tâches</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(employee.weeklySchedule).map(
                    ([day, schedule]) => (
                      <tr key={day} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b capitalize">{day}</td>
                        <td className="py-2 px-4 border-b">
                          {schedule.start} - {schedule.end}
                        </td>
                        <td className="py-2 px-4 border-b">
                          {schedule.tasks?.join(", ") || "Aucune tâche"}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanningView;
