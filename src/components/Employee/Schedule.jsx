import React from "react";

const Schedule = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Schedule</h1>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Date</th>
            <th className="py-2 px-4 border-b">Start Time</th>
            <th className="py-2 px-4 border-b">End Time</th>
            <th className="py-2 px-4 border-b">Status</th>
          </tr>
        </thead>
        <tbody>
          {/* Sample data, replace with dynamic data from API */}
          <tr>
            <td className="py-2 px-4 border-b">2023-10-01</td>
            <td className="py-2 px-4 border-b">09:00 AM</td>
            <td className="py-2 px-4 border-b">05:00 PM</td>
            <td className="py-2 px-4 border-b">Scheduled</td>
          </tr>
          <tr>
            <td className="py-2 px-4 border-b">2023-10-02</td>
            <td className="py-2 px-4 border-b">09:00 AM</td>
            <td className="py-2 px-4 border-b">05:00 PM</td>
            <td className="py-2 px-4 border-b">Scheduled</td>
          </tr>
          {/* Add more rows as needed */}
        </tbody>
      </table>
    </div>
  );
};

export default Schedule;
