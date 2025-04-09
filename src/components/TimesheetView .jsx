import React from "react";

const TimesheetView = () => {
  return (
    <div className="absolute right-8 top-1/2 transform -translate-y-1/2 w-4/5 bg-white p-6 rounded-xl shadow-xl">
      <h3 className="text-2xl font-bold mb-4">Timesheet View</h3>
      <div className="bg-blue-50 p-6 rounded-xl">
        {/* Week Navigation */}
        <div className="flex justify-between items-center mb-6">
          <button className="text-blue-600 hover:text-blue-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="text-lg font-semibold text-gray-700">
            Week of September 13 - 19, 2023
          </div>
          <button className="text-blue-600 hover:text-blue-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Timesheet Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left p-3 text-gray-700 font-semibold">
                  Project / Task
                </th>
                <th className="p-3 text-center text-gray-700 font-semibold">
                  Mon 13
                </th>
                <th className="p-3 text-center text-gray-700 font-semibold">
                  Tue 14
                </th>
                <th className="p-3 text-center text-gray-700 font-semibold">
                  Wed 15
                </th>
                <th className="p-3 text-center text-gray-700 font-semibold">
                  Thu 16
                </th>
                <th className="p-3 text-center text-gray-700 font-semibold">
                  Fri 17
                </th>
                <th className="p-3 text-right text-gray-700 font-semibold">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Office Work */}
              <tr className="hover:bg-blue-100 transition-colors">
                <td className="text-left p-3">
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="font-medium">Office Work</span>
                  </div>
                </td>
                <td className="p-3 text-center">
                  <input
                    type="text"
                    className="w-16 text-center bg-white border border-gray-300 rounded py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value="8:00"
                    readOnly
                  />
                </td>
                <td className="p-3 text-center text-gray-400">-</td>
                <td className="p-3 text-center text-gray-400">-</td>
                <td className="p-3 text-center">
                  <input
                    type="text"
                    className="w-16 text-center bg-white border border-gray-300 rounded py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value="6:30"
                    readOnly
                  />
                </td>
                <td className="p-3 text-center">
                  <input
                    type="text"
                    className="w-16 text-center bg-white border border-gray-300 rounded py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value="7:15"
                    readOnly
                  />
                </td>
                <td className="p-3 text-right font-medium">21:45</td>
              </tr>

              {/* Project X */}
              <tr className="hover:bg-pink-50 transition-colors">
                <td className="text-left p-3">
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-pink-500 rounded-full mr-3"></div>
                    <span className="font-medium">Project X</span>
                  </div>
                  <div className="text-sm text-gray-500 ml-6">UI/UX Design</div>
                </td>
                <td className="p-3 text-center text-gray-400">-</td>
                <td className="p-3 text-center">
                  <input
                    type="text"
                    className="w-16 text-center bg-white border border-gray-300 rounded py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value="4:00"
                    readOnly
                  />
                </td>
                <td className="p-3 text-center">
                  <input
                    type="text"
                    className="w-16 text-center bg-white border border-gray-300 rounded py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value="4:00"
                    readOnly
                  />
                </td>
                <td className="p-3 text-center">
                  <input
                    type="text"
                    className="w-16 text-center bg-white border border-gray-300 rounded py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value="5:30"
                    readOnly
                  />
                </td>
                <td className="p-3 text-center text-gray-400">-</td>
                <td className="p-3 text-right font-medium">13:30</td>
              </tr>

              {/* Project Y */}
              <tr className="hover:bg-purple-50 transition-colors">
                <td className="text-left p-3">
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-purple-500 rounded-full mr-3"></div>
                    <span className="font-medium">Project Y</span>
                  </div>
                  <div className="text-sm text-gray-500 ml-6">
                    Frontend Development
                  </div>
                </td>
                <td className="p-3 text-center text-gray-400">-</td>
                <td className="p-3 text-center">
                  <input
                    type="text"
                    className="w-16 text-center bg-white border border-gray-300 rounded py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value="3:15"
                    readOnly
                  />
                </td>
                <td className="p-3 text-center text-gray-400">-</td>
                <td className="p-3 text-center text-gray-400">-</td>
                <td className="p-3 text-center">
                  <input
                    type="text"
                    className="w-16 text-center bg-white border border-gray-300 rounded py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value="6:45"
                    readOnly
                  />
                </td>
                <td className="p-3 text-right font-medium">10:00</td>
              </tr>

              {/* Add New Project */}
              <tr className="hover:bg-blue-50 transition-colors">
                <td className="text-left p-3">
                  <div className="flex items-center text-blue-600">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                    <span className="font-medium">Add Project</span>
                  </div>
                </td>
                <td className="p-3 text-center text-gray-400">-</td>
                <td className="p-3 text-center text-gray-400">-</td>
                <td className="p-3 text-center text-gray-400">-</td>
                <td className="p-3 text-center text-gray-400">-</td>
                <td className="p-3 text-center text-gray-400">-</td>
                <td className="p-3 text-right text-gray-400">0:00</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-300">
          <div className="text-gray-600">
            Showing <span className="font-medium">3</span> projects
          </div>
          <div className="flex space-x-4">
            <div className="text-gray-700">
              <span className="font-medium">Total:</span> 45:15 hours
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
              Submit Timesheet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimesheetView;
