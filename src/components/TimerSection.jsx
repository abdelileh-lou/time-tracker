import React from "react";
import { Play, Square } from "lucide-react";

const TimerSection = ({ seconds }) => {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 md:space-y-6 px-4 md:px-0">
      {/* Timer Card - Ready State */}
      <div className="bg-light p-4 md:p-6 rounded-xl border border-accent shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4 md:space-x-6 w-full md:w-auto">
          <div className="text-secondary text-base md:text-lg">Currently tracking:</div>
          <div className="flex items-center space-x-2 md:space-x-3">
            <button className="p-2 rounded-full bg-accent hover:bg-secondary hover:text-light transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 md:h-5 md:w-5"
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
              <select className="appearance-none bg-light border border-accent rounded-lg pl-3 pr-6 py-1 md:pl-4 md:pr-8 md:py-2 text-secondary font-medium focus:outline-none focus:ring-2 focus:ring-secondary text-sm md:text-base">
                <option>Select project</option>
                <option>Project X</option>
                <option>Project Y</option>
                <option>Office Work</option>
                <option>Meeting</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg
                  className="h-4 w-4 md:h-5 md:w-5 text-accent"
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
        <div className="flex items-center space-x-4 md:space-x-6 w-full md:w-auto justify-between md:justify-end">
          <div className="text-xl md:text-2xl font-mono font-medium">00:00:00</div>
          <button className="bg-secondary hover:bg-primary text-light rounded-full p-2 md:p-3 shadow-md transition-colors transform hover:scale-105">
            <Play className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <button className="text-accent hover:text-secondary p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 md:h-6 md:w-6"
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
      <div className="bg-light p-4 md:p-6 rounded-xl border border-accent shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4 md:space-x-6 w-full md:w-auto">
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="relative">
              <div className="absolute -left-1 -top-1 w-2 h-2 md:w-3 md:h-3 bg-primary rounded-full animate-ping"></div>
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-primary rounded-full"></div>
            </div>
            <div>
              <div className="text-secondary text-xs md:text-sm">CURRENTLY TRACKING</div>
              <div className="text-base md:text-lg font-medium">Project X - UI Design</div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4 md:space-x-6 w-full md:w-auto justify-between md:justify-end">
          <div className="text-xl md:text-2xl font-mono font-medium">00:0{seconds}</div>
          <button className="bg-primary hover:bg-secondary text-light rounded-full p-2 md:p-3 shadow-md transition-colors transform hover:scale-105">
            <Square className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <div className="flex flex-col items-center space-y-1">
            <div className="w-1 h-1 bg-accent rounded-full"></div>
            <div className="w-1 h-1 bg-accent rounded-full"></div>
            <div className="w-1 h-1 bg-accent rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Timer Notes Section */}
      <div className="bg-light p-4 md:p-6 rounded-xl border border-accent shadow-md">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className="text-base md:text-lg font-medium">Notes</h3>
          <button className="text-secondary hover:text-primary text-sm font-medium">
            Add Note
          </button>
        </div>
        <textarea
          className="w-full border border-accent rounded-lg p-2 md:p-3 focus:outline-none focus:ring-2 focus:ring-secondary text-sm md:text-base"
          rows="3"
          placeholder="Add notes about what you're working on..."></textarea>
      </div>
    </div>
  );
};

export default TimerSection;