import React from "react";

const TimesheetView = () => {
  return (
    <div className="absolute right-8 top-1/2 transform -translate-y-1/2 w-2/3 bg-white p-4 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-sky-900 mb-3">Timesheet View</h3>
      <div className="bg-sky-50 p-4 rounded-lg">
        {/* Week Navigation */}
        <div className="flex justify-between items-center mb-4">
          <button className="text-sky-600 hover:text-sky-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
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
          <div className="text-base font-semibold text-sky-700">
            Week of September 13 - 19, 2023
          </div>
          <button className="text-sky-600 hover:text-sky-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
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
              <tr className="border-b border-sky-200">
                <th className="text-left p-2 text-sky-700 font-semibold text-sm">
                  Project / Task
                </th>
                <th className="p-2 text-center text-sky-700 font-semibold text-sm">
                  Mon 13
                </th>
                <th className="p-2 text-center text-sky-700 font-semibold text-sm">
                  Tue 14
                </th>
                <th className="p-2 text-center text-sky-700 font-semibold text-sm">
                  Wed 15
                </th>
                <th className="p-2 text-center text-sky-700 font-semibold text-sm">
                  Thu 16
                </th>
                <th className="p-2 text-center text-sky-700 font-semibold text-sm">
                  Fri 17
                </th>
                <th className="p-2 text-right text-sky-700 font-semibold text-sm">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-200">
              {/* Office Work */}
              <tr className="hover:bg-sky-100 transition-colors">
                <td className="text-left p-2">
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-sky-500 rounded-full mr-2"></div>
                    <span className="font-medium text-sky-900 text-sm">
                      Office Work
                    </span>
                  </div>
                </td>
                <td className="p-2 text-center">
                  <input
                    type="text"
                    className="w-14 text-center bg-white border border-sky-300 rounded py-1 px-2 
                      focus:outline-none focus:ring-1 focus:ring-sky-500 text-sm"
                    value="8:00"
                    readOnly
                  />
                </td>
                <td className="p-2 text-center text-sky-400">-</td>
                <td className="p-2 text-center text-sky-400">-</td>
                <td className="p-2 text-center">
                  <input
                    type="text"
                    className="w-14 text-center bg-white border border-sky-300 rounded py-1 px-2 focus:outline-none focus:ring-1 focus:ring-sky-500 text-sm"
                    value="6:30"
                    readOnly
                  />
                </td>
                <td className="p-2 text-center">
                  <input
                    type="text"
                    className="w-14 text-center bg-white border border-sky-300 rounded py-1 px-2 focus:outline-none focus:ring-1 focus:ring-sky-500 text-sm"
                    value="7:15"
                    readOnly
                  />
                </td>
                <td className="p-2 text-right font-medium text-sky-900">
                  21:45
                </td>
              </tr>

              {/* Project X */}
              <tr className="hover:bg-pink-50 transition-colors">
                <td className="text-left p-2">
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-pink-500 rounded-full mr-2"></div>
                    <span className="font-medium">Project X</span>
                  </div>
                  <div className="text-sm text-gray-500 ml-6">UI/UX Design</div>
                </td>
                <td className="p-2 text-center text-gray-400">-</td>
                <td className="p-2 text-center">
                  <input
                    type="text"
                    className="w-14 text-center bg-white border border-gray-300 rounded py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                    value="4:00"
                    readOnly
                  />
                </td>
                <td className="p-2 text-center">
                  <input
                    type="text"
                    className="w-14 text-center bg-white border border-gray-300 rounded py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                    value="4:00"
                    readOnly
                  />
                </td>
                <td className="p-2 text-center">
                  <input
                    type="text"
                    className="w-14 text-center bg-white border border-gray-300 rounded py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                    value="5:30"
                    readOnly
                  />
                </td>
                <td className="p-2 text-center text-gray-400">-</td>
                <td className="p-2 text-right font-medium">13:30</td>
              </tr>

              {/* Project Y */}
              <tr className="hover:bg-purple-50 transition-colors">
                <td className="text-left p-2">
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-purple-500 rounded-full mr-2"></div>
                    <span className="font-medium">Project Y</span>
                  </div>
                  <div className="text-sm text-gray-500 ml-6">
                    Frontend Development
                  </div>
                </td>
                <td className="p-2 text-center text-gray-400">-</td>
                <td className="p-2 text-center">
                  <input
                    type="text"
                    className="w-14 text-center bg-white border border-gray-300 rounded py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                    value="3:15"
                    readOnly
                  />
                </td>
                <td className="p-2 text-center text-gray-400">-</td>
                <td className="p-2 text-center text-gray-400">-</td>
                <td className="p-2 text-center">
                  <input
                    type="text"
                    className="w-14 text-center bg-white border border-gray-300 rounded py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                    value="6:45"
                    readOnly
                  />
                </td>
                <td className="p-2 text-right font-medium">10:00</td>
              </tr>

              {/* Add New Project */}
              <tr className="hover:bg-sky-50 transition-colors">
                <td className="text-left p-2">
                  <div className="flex items-center text-sky-600">
                    <div className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center mr-2">
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
                <td className="p-2 text-center text-sky-400">-</td>
                <td className="p-2 text-center text-sky-400">-</td>
                <td className="p-2 text-center text-sky-400">-</td>
                <td className="p-2 text-center text-sky-400">-</td>
                <td className="p-2 text-center text-sky-400">-</td>
                <td className="p-2 text-right text-sky-400">0:00</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-sky-200">
          <div className="text-sky-600 text-sm">
            Showing <span className="font-medium">3</span> projects
          </div>
          <div className="flex space-x-3">
            <div className="text-sky-700 text-sm">
              <span className="font-medium">Total:</span> 45:15 hours
            </div>
            <button
              className="bg-sky-600 hover:bg-sky-700 text-white font-medium 
              py-1.5 px-4 rounded-md transition-colors text-sm">
              Submit Timesheet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimesheetView;
