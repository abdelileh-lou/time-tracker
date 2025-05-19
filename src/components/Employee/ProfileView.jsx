import React, { useState, useEffect } from "react";
import { User, Mail, Building, Key } from "lucide-react";
import axios from "axios";

const ProfileView = ({ employee }) => {
  const [pinCode, setPinCode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPinCode = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8092/api/employee/${employee.id}/code-pin`,
        );
        console.log("PIN code response:", response.data);
        setPinCode(response.data); // Directly use response.data
        setLoading(false);
      } catch (error) {
        console.error("Error fetching PIN code:", error);
        setLoading(false);
      }
    };

    if (employee?.id) {
      fetchPinCode();
    }
  }, [employee?.id]);

  if (!employee) return <div>No employee data available</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Profile Header */}
        <div className="bg-emerald-600 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-full p-3">
              <User size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{employee.name}</h2>
              <p className="text-emerald-100">{employee.email}</p>
              {employee.username && (
                <p className="text-emerald-100">@{employee.username}</p>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-emerald-800 mb-4">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                <Mail className="text-emerald-600" size={20} />
                <div>
                  <p className="text-sm text-emerald-600">Email</p>
                  <p className="font-medium text-emerald-800">
                    {employee.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                <Building className="text-emerald-600" size={20} />
                <div>
                  <p className="text-sm text-emerald-600">Department</p>
                  <p className="font-medium text-emerald-800">
                    {employee.department?.name || "Not assigned"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* PIN Code Section */}
          <div>
            <h3 className="text-lg font-semibold text-emerald-800 mb-4">
              Security PIN Code
            </h3>
            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg">
              <Key className="text-emerald-600" size={20} />
              <div className="flex-1">
                <p className="text-sm text-emerald-600">Your Unique PIN</p>
                <div className="flex items-center gap-2">
                  {loading ? (
                    <p className="text-emerald-600">Loading PIN code...</p>
                  ) : (
                    <>
                      <p className="font-medium text-emerald-800">
                        {pinCode || "Not available"}
                      </p>
                      <span className="text-xs text-emerald-600">
                        (Confidential security identifier)
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-semibold text-emerald-800 mb-4">
              Additional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                <div>
                  <p className="text-sm text-emerald-600">Employee ID</p>
                  <p className="font-medium text-emerald-800">{employee.id}</p>
                </div>
              </div>
              {employee.username && (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                  <div>
                    <p className="text-sm text-emerald-600">Username</p>
                    <p className="font-medium text-emerald-800">
                      @{employee.username}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
