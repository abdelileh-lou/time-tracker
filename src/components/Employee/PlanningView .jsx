// import React, { useState, useEffect } from "react";

// export default function PlanningView() {
//   const [planningData, setPlanningData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [employeeId, setEmployeeId] = useState(1);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(
//           `http://localhost:8092/api/planning/employee/${employeeId}`,
//         );

//         if (!response.ok) {
//           throw new Error(`API request failed with status ${response.status}`);
//         }

//         const data = await response.json();
//         setPlanningData(data);
//         setLoading(false);
//       } catch (err) {
//         setError(`Failed to fetch planning data: ${err.message}`);
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [employeeId]);

//   const handleEmployeeChange = (e) => {
//     const value = parseInt(e.target.value);
//     if (!isNaN(value) && value > 0) {
//       setEmployeeId(value);
//     }
//   };

//   if (loading)
//     return <div className="p-4">Loading employee planning data...</div>;
//   if (error) return <div className="p-4 text-red-500">{error}</div>;
//   if (!planningData)
//     return <div className="p-4">No planning data available</div>;

//   const planData = JSON.parse(planningData.planJson);
//   const dayNames = [
//     "Monday",
//     "Tuesday",
//     "Wednesday",
//     "Thursday",
//     "Friday",
//     "Saturday",
//     "Sunday",
//   ];

//   return (
//     <div className="p-4 max-w-lg mx-auto">
//       <h1 className="text-2xl font-bold mb-4">
//         Employee #{employeeId} Planning: {planData.name}
//       </h1>

//       <div className="flex flex-col gap-2 mb-6">
//         {planData.days.map((day, index) => {
//           const dayName = day.day || dayNames[index];

//           return (
//             <div
//               key={index}
//               className={`p-4 rounded-lg shadow ${
//                 day.isWorkDay
//                   ? "bg-green-100 border-l-4 border-green-500"
//                   : "bg-gray-100"
//               }`}>
//               <div className="font-bold">{dayName}</div>
//               {day.isWorkDay ? (
//                 <div className="mt-2">
//                   <span className="text-green-700">
//                     Working hours: {day.from} - {day.to}
//                   </span>
//                 </div>
//               ) : (
//                 <div className="text-gray-500 mt-2">Day off</div>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       <div className="bg-blue-50 p-4 rounded-lg shadow">
//         <label className="block mb-2 font-medium">Employee ID:</label>
//         <div className="flex gap-2">
//           <input
//             type="number"
//             value={employeeId}
//             onChange={handleEmployeeChange}
//             className="border p-2 rounded flex-grow"
//             min="1"
//           />
//           <button
//             className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
//             onClick={() => setEmployeeId(employeeId)}>
//             Load
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
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
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        {employee.name}'s Planning: {planData.name}
      </h1>

      <div className="flex flex-col gap-2 mb-6">
        {planData.days.map((day, index) => {
          const dayName = day.day || dayNames[index];

          return (
            <div
              key={index}
              className={`p-4 rounded-lg shadow ${
                day.isWorkDay
                  ? "bg-green-100 border-l-4 border-green-500"
                  : "bg-gray-100"
              }`}>
              <div className="font-bold">{dayName}</div>
              {day.isWorkDay ? (
                <div className="mt-2">
                  <span className="text-green-700">
                    Working hours: {day.from} - {day.to}
                  </span>
                </div>
              ) : (
                <div className="text-gray-500 mt-2">Day off</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
