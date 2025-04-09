import React from "react";

const AutoTrackerView = () => {
  return (
    <div className="absolute right-8 top-1/2 transform -translate-y-1/2 w-4/5 bg-white p-6 rounded-xl shadow-xl">
      <h3 className="text-2xl font-bold mb-4">Auto Tracker View</h3>
      <div className="bg-blue-50 p-6 rounded-xl">
        {/* Time Summary Section */}
        <div className="flex justify-between text-gray-600 mb-6">
          <div className="text-center">
            <div className="text-sm">Started</div>
            <span className="text-2xl font-bold text-gray-800">10:00 AM</span>
          </div>
          <div className="text-center">
            <div className="text-sm">Finished</div>
            <span className="text-2xl font-bold text-gray-800">04:00 PM</span>
          </div>
          <div className="text-center">
            <div className="text-sm">Duration</div>
            <span className="text-2xl font-bold text-gray-800">06:00</span>
          </div>
        </div>

        {/* Timeline Visualization */}
        <div className="relative mb-8">
          <div className="h-5 bg-gray-200 rounded-full">
            <div
              className="h-5 bg-blue-500 rounded-full absolute left-1/4"
              style={{ width: "50%" }}></div>
          </div>
          <div className="flex justify-between text-gray-500 text-sm mt-2">
            <div>8 AM</div>
            <div>10 AM</div>
            <div>12 PM</div>
            <div>2 PM</div>
            <div>4 PM</div>
            <div>6 PM</div>
          </div>
        </div>

        {/* Applications Table Header */}
        <div className="grid grid-cols-5 text-gray-600 font-medium mb-3 pb-3 border-b">
          <div className="pl-2">Application</div>
          <div>URL/Document</div>
          <div className="text-center">Idle</div>
          <div className="text-center">Time</div>
          <div className="text-center">Action</div>
        </div>

        {/* Application Rows */}
        <div className="space-y-3">
          {/* Row 1 */}
          <div className="grid grid-cols-5 items-center py-3 border-b">
            <div className="flex items-center pl-2">
              <div className="bg-blue-100 p-1 rounded mr-3">
                <img
                  src="https://www.google.com/chrome/static/images/chrome-logo.svg"
                  alt="Chrome"
                  className="h-5 w-5"
                />
              </div>
              <span>Chrome</span>
            </div>
            <div className="text-blue-600 truncate pr-2">
              https://app.asana.com/...
            </div>
            <div className="text-center text-orange-500">30%</div>
            <div className="text-center font-medium">1:15</div>
            <div className="flex justify-center">
              <button className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors">
                ✓
              </button>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-5 items-center py-3 border-b">
            <div className="flex items-center pl-2">
              <div className="bg-blue-100 p-1 rounded mr-3">
                <img
                  src="https://www.google.com/gmail/about/static-2.0/images/logo-gmail.png"
                  alt="Gmail"
                  className="h-5 w-5"
                />
              </div>
              <span>Gmail</span>
            </div>
            <div className="text-blue-600 truncate pr-2">
              https://mail.google.com/...
            </div>
            <div className="text-center text-orange-500">25%</div>
            <div className="text-center font-medium">2:30</div>
            <div className="flex justify-center">
              <button className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors">
                +
              </button>
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-5 items-center py-3">
            <div className="flex items-center pl-2">
              <div className="bg-blue-100 p-1 rounded mr-3">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/a/af/Adobe_Photoshop_CC_icon.svg"
                  alt="Photoshop"
                  className="h-5 w-5"
                />
              </div>
              <span>Photoshop</span>
            </div>
            <div className="text-gray-400">design.psd</div>
            <div className="text-center text-green-500">0%</div>
            <div className="text-center font-medium">3:45</div>
            <div className="flex justify-center">
              <button className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors">
                +
              </button>
            </div>
          </div>
        </div>

        {/* Recording Status */}
        <div className="mt-6 py-3 px-4 bg-red-50 border border-red-200 text-red-600 text-center rounded-lg font-semibold flex items-center justify-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
          Recording active - 06:12:45
        </div>
      </div>
    </div>
  );
};

export default AutoTrackerView;
