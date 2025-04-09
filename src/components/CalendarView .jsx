import React from "react";

const CalendarView = () => {
  return (
    <div className="absolute right-8 top-1/2 transform -translate-y-1/2 w-4/5 bg-white p-6 rounded-xl shadow-xl">
      <h3 className="text-2xl font-bold mb-4">Calendar View</h3>
      <div className="bg-blue-50 p-6 rounded-xl">
        {/* Calendar Header */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3 bg-gray-100 rounded-lg text-center font-semibold text-gray-700">
            <div className="text-sm">Wednesday</div>
            <div className="text-lg">Sep 16</div>
          </div>
          <div className="p-3 bg-gray-100 rounded-lg text-center font-semibold text-gray-700">
            <div className="text-sm">Thursday</div>
            <div className="text-lg">Sep 17</div>
          </div>
          <div className="p-3 bg-gray-100 rounded-lg text-center font-semibold text-gray-700">
            <div className="text-sm">Friday</div>
            <div className="text-lg">Sep 18</div>
          </div>
        </div>

        {/* Calendar Body */}
        <div className="grid grid-cols-3 gap-3 h-96 bg-white p-4 border border-gray-200 rounded-xl">
          {/* Day 1 */}
          <div className="relative space-y-3">
            <div className="absolute top-0 left-0 right-0 bg-orange-100 border-l-4 border-orange-500 rounded-r-lg p-3 h-28">
              <div className="font-bold text-gray-800">Time-off</div>
              <div className="text-orange-600">Vacation</div>
              <div className="text-sm mt-2 text-gray-600">
                8:00 AM - 2:00 PM
              </div>
              <div className="absolute bottom-2 right-2 text-sm font-medium">
                6h
              </div>
            </div>
            <div className="absolute top-32 left-0 right-0 bg-blue-100 border-l-4 border-blue-500 rounded-r-lg p-3 h-20">
              <div className="font-bold text-gray-800">Meeting</div>
              <div className="text-blue-600">Client Call</div>
              <div className="absolute bottom-2 right-2 text-sm font-medium">
                1h
              </div>
            </div>
          </div>

          {/* Day 2 */}
          <div className="relative space-y-3">
            <div className="absolute top-16 left-0 right-0 bg-pink-100 border-l-4 border-pink-500 rounded-r-lg p-3 h-20">
              <div className="font-bold text-gray-800">UI/UX</div>
              <div className="text-pink-600">Project X</div>
              <div className="text-sm mt-1 text-gray-600">
                1:00 PM - 4:00 PM
              </div>
              <div className="absolute bottom-2 right-2 text-sm font-medium">
                3h
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-green-100 border-l-4 border-green-500 rounded-r-lg p-3 h-16">
              <div className="font-bold text-gray-800">Lunch</div>
              <div className="text-green-600">Break</div>
              <div className="absolute bottom-2 right-2 text-sm font-medium">
                1h
              </div>
            </div>
          </div>

          {/* Day 3 */}
          <div className="relative">
            <div className="absolute top-0 left-0 right-0 bg-orange-100 border-l-4 border-orange-500 rounded-r-lg p-3 h-40">
              <div className="font-bold text-gray-800">Invoicing</div>
              <div className="text-orange-600">Admin Work</div>
              <div className="text-sm mt-2 text-gray-600">
                9:00 AM - 4:00 PM
              </div>
              <div className="absolute bottom-2 right-2 text-sm font-medium">
                7h
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-purple-100 border-l-4 border-purple-500 rounded-r-lg p-3 h-16">
              <div className="font-bold text-gray-800">Review</div>
              <div className="text-purple-600">Team Sync</div>
              <div className="absolute bottom-2 right-2 text-sm font-medium">
                1h
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Legend */}
        <div className="flex justify-center mt-4 space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Work</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-pink-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Projects</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Break</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Meetings</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
