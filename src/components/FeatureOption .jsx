import React from "react";

const FeatureOption = ({
  icon,
  title,
  description,
  onMouseEnter,
  onMouseLeave,
  hoverable,
}) => {
  return (
    <div
      className={`bg-white p-6 rounded-lg mb-4 border border-gray-200 shadow-sm ${
        hoverable ? "cursor-pointer hover:bg-blue-50 transition-colors" : ""
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}>
      <div className="flex items-center mb-2">
        <div className="p-2 rounded-full bg-blue-100 mr-3">{icon}</div>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <p className="text-gray-600 ml-11">{description}</p>
    </div>
  );
};

export default FeatureOption;
