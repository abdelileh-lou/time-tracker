// ChefProfileView.jsx
import React from "react";
import { User } from "lucide-react";

const ChefProfileView = ({ chef }) => {
  if (!chef) return <div>No profile data available</div>;

  const passwordDots = "•".repeat(12);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-sky-800 mb-6">Mon Profil</h2>

      <div className="space-y-6">
        <div className="flex items-center">
          <div className="bg-sky-100 rounded-full p-6">
            <User size={48} className="text-sky-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-xl font-semibold text-sky-800">{chef.name}</h3>
            <p className="text-sky-600">{chef.username}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-sky-600 uppercase mb-2">
              Account Information
            </h4>
            <div className="bg-sky-50 p-4 rounded border border-sky-200">
              <div className="mb-3">
                <p className="text-sm text-sky-600">Username</p>
                <p className="font-medium text-sky-800">{chef.username}</p>
              </div>
              <div className="mb-3">
                <p className="text-sm text-sky-600">Email</p>
                <p className="font-medium text-sky-800">{chef.email}</p>
              </div>
              <div>
                <p className="text-sm text-sky-600">Service</p>
                <p className="font-medium text-sky-800">
                  {chef.service?.name || "Not specified"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-sky-600 uppercase mb-2">
              Security
            </h4>
            <div className="bg-sky-50 p-4 rounded border border-sky-200">
              <div className="mb-3">
                <p className="text-sm text-sky-600">Password</p>
                <p className="font-medium text-sky-800">{passwordDots}</p>
              </div>
              <div>
                <p className="text-sm text-sky-600">User ID</p>
                <p className="font-medium text-sky-800">{chef.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChefProfileView;
