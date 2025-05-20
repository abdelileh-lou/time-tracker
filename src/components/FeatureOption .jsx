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
      className={`bg-white p-6 rounded-lg mb-4 border border-sky-200 shadow-sm ${
        hoverable ? "cursor-pointer hover:bg-sky-50 transition-colors" : ""
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}>
      <div className="flex items-center mb-2">
        <div className="p-2 rounded-full bg-sky-100 mr-3">{icon}</div>
        <h2 className="text-xl font-semibold text-sky-900">{title}</h2>
      </div>
      <p className="text-sky-600 ml-11">{description}</p>
    </div>
  );
};

export default FeatureOption;
