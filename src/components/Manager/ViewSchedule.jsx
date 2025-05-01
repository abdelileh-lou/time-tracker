import React from "react";

const ViewSchedule = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">View Employee Schedules</h1>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Employee Name</th>
            <th className="py-2 px-4 border-b">Schedule</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Sample data, replace with dynamic data from API */}
          <tr>
            <td className="py-2 px-4 border-b">John Doe</td>
            <td className="py-2 px-4 border-b">9 AM - 5 PM</td>
            <td className="py-2 px-4 border-b">
              <button className="text-blue-500 hover:underline">View</button>
            </td>
          </tr>
          <tr>
            <td className="py-2 px-4 border-b">Jane Smith</td>
            <td className="py-2 px-4 border-b">10 AM - 6 PM</td>
            <td className="py-2 px-4 border-b">
              <button className="text-blue-500 hover:underline">View</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ViewSchedule;
