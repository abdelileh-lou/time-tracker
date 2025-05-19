import React, { useState } from "react";
import { Clock, Calendar, List, Target, Play, Square } from "lucide-react";
import FeaturesSection from "../components/FeaturesSection";
import TimesheetView from "../components/TimesheetView ";
import CalendarView from "../components/CalendarView ";
import AutoTrackerView from "../components/AutoTrackerView ";
import TimerSection from "../components/TimerSection ";
import FeatureOption from "../components/FeatureOption ";

import Hero from "../components/Hero";

const Landing = () => {
  // const [activeTimer, setActiveTimer] = useState(false);
  const [seconds, setSeconds] = useState(1);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Handle hover states
  const handleMouseEnter = (item) => {
    setHoveredItem(item);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  // Get the appropriate view based on the hovered item
  const getHoverView = () => {
    if (!hoveredItem) return null;

    switch (hoveredItem) {
      case "timesheet":
        return <TimesheetView />;
      case "calendar":
        return <CalendarView />;
      case "autotracker":
        return <AutoTrackerView />;
      default:
        return null;
    }
  };

  // Feature options data
  const featureOptions = [
    {
      id: "timer",
      icon: <Clock className="h-5 w-5 text-blue-500" />,
      title: "Timer",
      description: "Track work hours in real time.",
      hoverable: false,
    },
    {
      id: "timesheet",
      icon: <List className="h-5 w-5 text-blue-500" />,
      title: "Timesheet",
      description: "Enter time in a weekly timesheet.",
      hoverable: true,
    },
    {
      id: "calendar",
      icon: <Calendar className="h-5 w-5 text-blue-500" />,
      title: "Calendar",
      description: "Visually block out and manage time.",
      hoverable: true,
    },
    {
      id: "autotracker",
      icon: <Target className="h-5 w-5 text-blue-500" />,
      title: "Auto tracker",
      description: "Track apps and websites you use.",
      hoverable: true,
    },
  ];

  return (
    <>
      <Hero />
      <div className="w-auto flex flex-col items-center justify-center py-[85px]">
        <h1 className="font-black text-[38px]">Time management features</h1>
        <p className="pt-10 text-lg">
          Track productivity, attendance, and billable hours with a simple time
          tracker and timesheet.
        </p>
      </div>
      <div className="flex h-screen bg-gray-50">
        {/* Left Panel */}
        <div className="w-1/3 p-8 border-r border-gray-200">
          <h1 className="text-3xl font-bold mb-8">Timekeeping</h1>

          {/* Feature Options */}
          {featureOptions.map((option) => (
            <FeatureOption
              key={option.id}
              icon={option.icon}
              title={option.title}
              description={option.description}
              onMouseEnter={
                option.hoverable ? () => handleMouseEnter(option.id) : undefined
              }
              onMouseLeave={option.hoverable ? handleMouseLeave : undefined}
              hoverable={option.hoverable}
            />
          ))}
        </div>

        {/* Right Panel */}
        <div className="w-2/3 bg-blue-50 p-8 flex items-center justify-center relative">
          {/* Show the hovered item preview */}
          {getHoverView()}

          {/* Default View (Timer UI) */}
          {!hoveredItem && <TimerSection seconds={seconds} />}
        </div>
      </div>
      <FeaturesSection />
    </>
  );
};

export default Landing;
