import React from "react";
import { Play, Square } from "lucide-react";

const TimerSection = ({ seconds }) => {
  return (
    <div className="w-full max-w-2xl space-y-6">
      {/* Timer Card - Ready State */}
      <div className="bg-white p-6 rounded-xl border border-sky-200 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="text-sky-600 text-lg">Currently tracking:</div>
          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-full bg-sky-100 hover:bg-sky-200 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-sky-600"
                viewBox="0 0 20 20"
                fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <div className="relative">
              <select className="appearance-none bg-white border border-sky-300 rounded-lg pl-4 pr-8 py-2 text-sky-600 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500">
                <option>Select project</option>
                <option>Project X</option>
                <option>Project Y</option>
                <option>Office Work</option>
                <option>Meeting</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg
                  className="h-5 w-5 text-sky-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-2xl font-mono font-medium text-sky-900">
            00:00:00
          </div>
          <button className="bg-sky-600 hover:bg-sky-700 text-white rounded-full p-3 shadow-md transition-colors transform hover:scale-105">
            <Play className="h-6 w-6" />
          </button>
          <button className="text-sky-400 hover:text-sky-600 p-1">
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
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Active Timer Card */}
      <div className="bg-white p-6 rounded-xl border border-sky-200 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute -left-1 -top-1 w-3 h-3 bg-sky-500 rounded-full animate-ping"></div>
              <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
            </div>
            <div>
              <div className="text-sky-500 text-sm">CURRENTLY TRACKING</div>
              <div className="text-lg font-medium text-sky-900">
                Project X - UI Design
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-2xl font-mono font-medium text-sky-900">
            00:0{seconds}
          </div>
          <button className="bg-sky-600 hover:bg-sky-700 text-white rounded-full p-3 shadow-md transition-colors transform hover:scale-105">
            <Square className="h-6 w-6" />
          </button>
          <div className="flex flex-col items-center space-y-1">
            <div className="w-1 h-1 bg-sky-400 rounded-full"></div>
            <div className="w-1 h-1 bg-sky-400 rounded-full"></div>
            <div className="w-1 h-1 bg-sky-400 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Timer Notes Section */}
      <div className="bg-white p-6 rounded-xl border border-sky-200 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-sky-900">Notes</h3>
          <button className="text-sky-600 hover:text-sky-800 text-sm font-medium">
            Add Note
          </button>
        </div>
        <textarea
          className="w-full border border-sky-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
          rows="3"
          placeholder="Add notes about what you're working on..."></textarea>
      </div>
    </div>
  );
};

export default TimerSection;
