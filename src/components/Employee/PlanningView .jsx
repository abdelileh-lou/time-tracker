import React, { useState, useEffect } from "react";

export default function PlanningView({ employee }) {
  const [planningData, setPlanningData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!employee?.id) return;

        setLoading(true);
        const response = await fetch(
          `http://localhost:8092/api/planning/employee/${employee.id}`,
        );

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        setPlanningData(data);
        setLoading(false);
      } catch (err) {
        setError(`Failed to fetch planning data: ${err.message}`);
        setLoading(false);
      }
    };

    fetchData();
  }, [employee?.id]); // Fetch data when employee ID changes

  const dayNames = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  if (loading)
    return <div className="p-4">Loading employee planning data...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!planningData)
    return <div className="p-4">No planning data available</div>;

  const planData = JSON.parse(planningData.planJson);

  return (
    <div className="p-4 mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        {employee.name}'s Planning: {planData.name}
      </h1>

      {/* Horizontal layout */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {planData.days.map((day, index) => {
          const dayName = day.day || dayNames[index];

          return (
            <div
              key={index}
              className={`p-3 rounded-lg shadow h-full flex flex-col ${
                day.isWorkDay
                  ? "bg-green-100 border-t-4 border-green-500"
                  : "bg-gray-100"
              }`}>
              <div className="font-bold text-center mb-2">{dayName}</div>
              {day.isWorkDay ? (
                <div className="mt-auto text-center">
                  <span className="text-green-700 text-sm">
                    {day.from} - {day.to}
                  </span>
                </div>
              ) : (
                <div className="text-gray-500 mt-auto text-center text-sm">
                  Day off
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm mt-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-100 border border-green-500 mr-2"></div>
          <span>Working day</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300 mr-2"></div>
          <span>Day off</span>
        </div>
      </div>
    </div>
  );
}
