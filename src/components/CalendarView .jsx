import React from "react";

const CalendarView = () => {
  return (
    <div className="absolute right-8 top-1/2 transform -translate-y-1/2 w-3/4 bg-white p-4 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-3 text-sky-900">Calendar View</h3>
      <div className="bg-sky-50 p-4 rounded-lg">
        {/* Calendar Header */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="p-2 bg-sky-100 rounded-md text-center font-semibold text-sky-700">
            <div className="text-xs">Wednesday</div>
            <div className="text-base">Sep 16</div>
          </div>
          <div className="p-2 bg-sky-100 rounded-md text-center font-semibold text-sky-700">
            <div className="text-xs">Thursday</div>
            <div className="text-base">Sep 17</div>
          </div>
          <div className="p-2 bg-sky-100 rounded-md text-center font-semibold text-sky-700">
            <div className="text-xs">Friday</div>
            <div className="text-base">Sep 18</div>
          </div>
        </div>

        {/* Calendar Body */}
        <div className="grid grid-cols-3 gap-2 h-80 bg-white p-3 border border-sky-200 rounded-lg">
          {/* Day 1 */}
          <div className="relative space-y-2">
            <div className="absolute top-0 left-0 right-0 bg-sky-50 border-l-4 border-sky-500 rounded-r p-2 h-24">
              <div className="font-bold text-sm text-sky-900">Time-off</div>
              <div className="text-xs text-sky-600">Vacation</div>
              <div className="text-xs mt-1 text-sky-600">8:00 AM - 2:00 PM</div>
              <div className="absolute bottom-1 right-1 text-xs font-medium text-sky-700">
                6h
              </div>
            </div>
            <div className="absolute top-28 left-0 right-0 bg-sky-100 border-l-4 border-sky-600 rounded-r p-2 h-16">
              <div className="font-bold text-sm text-sky-900">Meeting</div>
              <div className="text-xs text-sky-600">Client Call</div>
              <div className="absolute bottom-1 right-1 text-xs font-medium text-sky-700">
                1h
              </div>
            </div>
          </div>

          {/* Day 2 */}
          <div className="relative space-y-2">
            <div className="absolute top-16 left-0 right-0 bg-sky-50 border-l-4 border-sky-500 rounded-r p-2 h-20">
              <div className="font-bold text-sm text-sky-900">UI/UX</div>
              <div className="text-xs text-sky-600">Project X</div>
              <div className="text-xs mt-1 text-sky-600">1:00 PM - 4:00 PM</div>
              <div className="absolute bottom-1 right-1 text-xs font-medium text-sky-700">
                3h
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-sky-100 border-l-4 border-sky-600 rounded-r p-2 h-16">
              <div className="font-bold text-sm text-sky-900">Lunch</div>
              <div className="text-xs text-sky-600">Break</div>
              <div className="absolute bottom-1 right-1 text-xs font-medium text-sky-700">
                1h
              </div>
            </div>
          </div>

          {/* Day 3 */}
          <div className="relative">
            <div className="absolute top-0 left-0 right-0 bg-sky-50 border-l-4 border-sky-500 rounded-r p-2 h-40">
              <div className="font-bold text-sm text-sky-900">Invoicing</div>
              <div className="text-xs text-sky-600">Admin Work</div>
              <div className="text-xs mt-2 text-sky-600">9:00 AM - 4:00 PM</div>
              <div className="absolute bottom-1 right-1 text-xs font-medium text-sky-700">
                7h
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-sky-100 border-l-4 border-sky-600 rounded-r p-2 h-16">
              <div className="font-bold text-sm text-sky-900">Review</div>
              <div className="text-xs text-sky-600">Team Sync</div>
              <div className="absolute bottom-1 right-1 text-xs font-medium text-sky-700">
                1h
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Legend */}
        <div className="flex justify-center mt-3 space-x-3">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-sky-500 rounded-full mr-1"></div>
            <span className="text-xs text-sky-600">Work</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-sky-600 rounded-full mr-1"></div>
            <span className="text-xs text-sky-600">Projects</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-sky-400 rounded-full mr-1"></div>
            <span className="text-xs text-sky-600">Break</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-sky-500 rounded-full mr-1"></div>
            <span className="text-xs text-sky-600">Meetings</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
