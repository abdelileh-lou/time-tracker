import React from "react";

const FeaturesSection = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Heading */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-sky-900 mb-4">
          Why track time with Clockify
        </h1>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Feature Cards - using map for DRY code */}
        {[
          {
            title: "Timekeeping",
            description:
              "Track time using a timer, clock-in kiosk, or timesheet.",
          },
          {
            title: "Budgeting",
            description: "Set project estimates and track progress.",
          },
          {
            title: "Planning",
            description: "Schedule team capacity and assign work.",
          },
          {
            title: "Attendance",
            description: "Track employee hours and time off.",
          },
          {
            title: "Reporting",
            description: "Analyze and export tracked time data.",
          },
          {
            title: "Payroll",
            description: "Calculate wages and process payments.",
          },
        ].map((feature, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-md border border-sky-200">
            <h2 className="text-xl font-semibold mb-4 text-sky-800">
              {feature.title}
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-sky-500 mt-0.5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-sky-700">{feature.description}</span>
              </li>
            </ul>
            <a
              href="#"
              className="mt-4 inline-flex items-center text-sky-600 hover:text-sky-800 font-medium">
              Learn more
              <svg
                className="w-4 h-4 ml-1"
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
            </a>
          </div>
        ))}
      </div>

      {/* More use cases section */}
      <div className="mt-16 text-center">
        <h3 className="text-xl font-semibold mb-6 text-sky-800">
          More use cases
        </h3>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            "Time Clock",
            "Work Hours Tracker",
            "Employee Time Tracker",
            "Attendance Tracker",
            "Task Timer",
            "Time Card Calculator",
          ].map((item, index) => (
            <span
              key={index}
              className="bg-sky-100 hover:bg-sky-200 px-4 py-2 rounded-full text-sky-700 
                font-medium transition-colors">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
