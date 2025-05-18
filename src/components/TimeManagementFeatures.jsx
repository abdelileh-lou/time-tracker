import React from "react";
import { Clock, List, Calendar, Target } from "lucide-react";

const TimeManagementFeatures = () => {
  const features = [
    {
      icon: <Clock />,
      title: "Timer",
      description: "Track work hours in real time."
    },
    {
      icon: <List />,
      title: "Timesheet",
      description: "Enter time in a weekly timesheet."
    },
    {
      icon: <Calendar />,
      title: "Calendar",
      description: "Visually block out and manage time."
    },
    {
      icon: <Target />,
      title: "Auto tracker",
      description: "Track apps and websites you use."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row">
        {/* Left side - Timekeeping features */}
        <div className="w-full lg:w-1/2 p-4 md:p-8 border-b lg:border-b-0 lg:border-r border-emerald-200">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-10 text-emerald-800">Timekeeping</h1>
          
          <div className="space-y-4 md:space-y-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white p-5 md:p-6 rounded-xl border border-emerald-200 shadow-md hover:bg-emerald-50 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="p-3 rounded-full bg-emerald-100 self-start">
                    {React.cloneElement(feature.icon, { 
                      className: "h-5 w-5 md:h-6 md:w-6 text-emerald-600" 
                    })}
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold text-emerald-800 mb-1">{feature.title}</h2>
                    <p className="text-emerald-600 text-base md:text-lg">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Features from original component */}
        <div className="w-full lg:w-1/2 p-4 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-10 text-emerald-800">Features</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {["Budgeting", "Planning", "Attendance", "Reporting", "Payroll"].map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-5 rounded-lg border border-emerald-200 shadow-md hover:bg-emerald-50 transition-all duration-300 transform hover:-translate-y-1"
              >
                <h2 className="text-xl font-semibold mb-3 text-emerald-800">{feature}</h2>
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 text-emerald-500 mt-0.5 mr-2 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-emerald-600">
                    {index === 0 && "Set project estimates and track progress."}
                    {index === 1 && "Schedule team capacity and assign work."}
                    {index === 2 && "Track employee hours and time off."}
                    {index === 3 && "Analyze and export tracked time data."}
                    {index === 4 && "Calculate wages and process payments."}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {/* More use cases section */}
          <div className="mt-8 md:mt-10">
            <h3 className="text-xl font-semibold mb-4 text-emerald-800">More use cases</h3>
            <div className="flex flex-wrap gap-2">
              {[
                "Time Clock",
                "Work Hours Tracker",
                "Employee Time Tracker",
                "Attendance Tracker",
                "Task Timer"
              ].map((item, index) => (
                <span
                  key={index}
                  className="bg-emerald-100 hover:bg-emerald-200 px-3 py-1 rounded-full text-sm font-medium text-emerald-700 transition-all duration-300"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeManagementFeatures;