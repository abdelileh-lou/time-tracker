import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";

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

        if (response.status === 404) {
          // No planning exists for this employee - treat as no data case
          setPlanningData(null);
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        setPlanningData(data);
        setLoading(false);
      } catch (err) {
        // Only show error for non-404 cases
        if (err.message.includes('404')) {
          setPlanningData(null);
        } else {
          setError(`Failed to fetch planning data: ${err.message}`);
        }
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

  // Calculate dates for the current week
  const getCurrentWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const diff = currentDay === 0 ? 6 : currentDay - 1; // Adjust for our Monday start

    const monday = new Date(today);
    monday.setDate(today.getDate() - diff);

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      weekDates.push(day);
    }

    return weekDates;
  };

  // Calculate working hours from a schedule
  const calculateWeeklyHours = (days) => {
    let totalHours = 0;

    days.forEach((day) => {
      if (day.isWorkDay && day.from && day.to) {
        const fromParts = day.from.split(":").map(Number);
        const toParts = day.to.split(":").map(Number);

        const fromHours = fromParts[0] + fromParts[1] / 60;
        const toHours = toParts[0] + toParts[1] / 60;

        totalHours += toHours - fromHours;
      }
    });

    return totalHours.toFixed(1);
  };

  // Calculate monthly hours (approximated as 4 times weekly hours)
  const calculateMonthlyHours = (days) => {
    const weeklyHours = parseFloat(calculateWeeklyHours(days));
    const monthlyHours = weeklyHours * 4.33; // Average weeks in a month
    return monthlyHours.toFixed(1);
  };

  if (loading)
    return <div className="p-4">Loading employee planning data...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!planningData)
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-rose-100 rounded-full p-3">
              <Calendar size={24} className="text-rose-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-rose-800 text-center mb-2">
            Aucun Planning Disponible
          </h3>
          <p className="text-rose-600 text-center">
            Vous n'avez pas encore de planning assigné. Veuillez contacter votre chef de service.
          </p>
        </div>
      </div>
    );

  const planData = JSON.parse(planningData.planJson);
  const weekDates = getCurrentWeekDates();
  const formatDate = (date) => {
    return date.getDate() + "/" + (date.getMonth() + 1);
  };

  return (
    <div className="p-4 mx-auto">
      {/* Planning name at top */}
      <h1 className="text-2xl font-bold mb-2 text-center text-sky-800">
        Planning : {planData.name}
      </h1>

      {/* Employee info and hours summary */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-lg font-medium">
          <span className="text-sky-600">Employee: </span>
          <span className="text-sky-800">{employee.username}</span>
        </div>
        <div className="flex gap-6">
          <div>
            <span className="text-sky-600">Weekly Hours: </span>
            <span className="font-medium text-sky-800">
              {calculateWeeklyHours(planData.days)} hrs
            </span>
          </div>
          <div>
            <span className="text-sky-600">Monthly Hours: </span>
            <span className="font-medium text-sky-800">
              {calculateMonthlyHours(planData.days)} hrs
            </span>
          </div>
        </div>
      </div>

      {/* Horizontal layout */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {planData.days.map((day, index) => {
          const dayName = day.day || dayNames[index];
          const date = weekDates[index];

          return (
            <div
              key={index}
              className={`p-3 rounded-lg shadow h-full flex flex-col ${
                day.isWorkDay
                  ? "bg-teal-50 border-t-4 border-teal-500"
                  : "bg-rose-50 border-t-4 border-rose-300"
              }`}>
              <div className="font-bold text-center mb-1 text-sky-800">{dayName}</div>
              <div className="text-xs text-center text-sky-600 mb-2">
                {formatDate(date)}
              </div>
              {day.isWorkDay ? (
                <div className="mt-auto text-center">
                  <span className="text-teal-700 text-sm">
                    {day.from} - {day.to}
                  </span>
                </div>
              ) : (
                <div className="text-rose-500 mt-auto text-center text-sm">
                  Day off
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm mt-4 text-sky-800">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-teal-50 border border-teal-500 mr-2"></div>
          <span>Working day</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-rose-50 border border-rose-300 mr-2"></div>
          <span>Day off</span>
        </div>
      </div>
    </div>
  );
}