import React from "react";

const AutoTrackerView = () => {
  return (
    <div className="absolute right-8 top-1/2 transform -translate-y-1/2 w-2/3 bg-white p-4 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-sky-900 mb-3">Auto Tracker View</h3>
      <div className="bg-sky-50 p-4 rounded-lg">
        {/* Time Summary Section */}
        <div className="flex justify-between text-sky-600 mb-4">
          <div className="text-center">
            <div className="text-xs">Started</div>
            <span className="text-lg font-bold text-sky-800">10:00 AM</span>
          </div>
          <div className="text-center">
            <div className="text-xs">Finished</div>
            <span className="text-lg font-bold text-sky-800">04:00 PM</span>
          </div>
          <div className="text-center">
            <div className="text-xs">Duration</div>
            <span className="text-lg font-bold text-sky-800">06:00</span>
          </div>
        </div>

        {/* Timeline Visualization */}
        <div className="relative mb-4">
          <div className="h-4 bg-sky-200 rounded-full">
            <div
              className="h-4 bg-sky-500 rounded-full absolute left-1/4"
              style={{ width: "50%" }}></div>
          </div>
          <div className="flex justify-between text-sky-500 text-xs mt-1">
            <div>8 AM</div>
            <div>10 AM</div>
            <div>12 PM</div>
            <div>2 PM</div>
            <div>4 PM</div>
            <div>6 PM</div>
          </div>
        </div>

        {/* Applications Table Header */}
        <div className="grid grid-cols-5 text-sky-600 text-sm font-medium mb-2 pb-2 border-b border-sky-200">
          <div className="pl-2">Application</div>
          <div>URL/Document</div>
          <div className="text-center">Idle</div>
          <div className="text-center">Time</div>
          <div className="text-center">Action</div>
        </div>

        {/* Application Rows */}
        <div className="space-y-2">
          {/* Row 1 */}
          <div className="grid grid-cols-5 items-center py-2 border-b border-sky-200">
            <div className="flex items-center pl-2">
              <div className="bg-sky-100 p-1 rounded mr-2">
                <img
                  src="https://www.google.com/chrome/static/images/chrome-logo.svg"
                  alt="Chrome"
                  className="h-4 w-4"
                />
              </div>
              <span className="text-sm text-sky-700">Chrome</span>
            </div>
            <div className="text-xs text-sky-600 truncate pr-2">
              https://app.asana.com/...
            </div>
            <div className="text-center text-xs text-sky-500">30%</div>
            <div className="text-center text-sm font-medium text-sky-700">
              1:15
            </div>
            <div className="flex justify-center">
              <button className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center hover:bg-sky-200 transition-colors text-sm">
                ✓
              </button>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-5 items-center py-2 border-b border-sky-200">
            <div className="flex items-center pl-2">
              <div className="bg-sky-100 p-1 rounded mr-2">
                <img
                  src="https://www.google.com/gmail/about/static-2.0/images/logo-gmail.png"
                  alt="Gmail"
                  className="h-4 w-4"
                />
              </div>
              <span className="text-sm text-sky-700">Gmail</span>
            </div>
            <div className="text-xs text-sky-600 truncate pr-2">
              https://mail.google.com/...
            </div>
            <div className="text-center text-xs text-sky-500">25%</div>
            <div className="text-center text-sm font-medium text-sky-700">
              2:30
            </div>
            <div className="flex justify-center">
              <button className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center hover:bg-sky-200 transition-colors text-sm">
                +
              </button>
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-5 items-center py-2">
            <div className="flex items-center pl-2">
              <div className="bg-sky-100 p-1 rounded mr-2">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/a/af/Adobe_Photoshop_CC_icon.svg"
                  alt="Photoshop"
                  className="h-4 w-4"
                />
              </div>
              <span className="text-sm text-sky-700">Photoshop</span>
            </div>
            <div className="text-sky-400">design.psd</div>
            <div className="text-center text-sky-500">0%</div>
            <div className="text-center text-sm font-medium text-sky-700">
              3:45
            </div>
            <div className="flex justify-center">
              <button className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center hover:bg-sky-200 transition-colors text-sm">
                +
              </button>
            </div>
          </div>
        </div>

        {/* Recording Status */}
        <div className="mt-4 py-2 px-3 bg-sky-50 border border-sky-200 text-sky-600 text-sm text-center rounded-lg font-semibold flex items-center justify-center">
          <div className="w-2 h-2 bg-sky-500 rounded-full mr-2 animate-pulse"></div>
          Recording active - 06:12:45
        </div>
      </div>
    </div>
  );
};

export default AutoTrackerView;
