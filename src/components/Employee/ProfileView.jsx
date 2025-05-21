import React, { useState, useEffect } from "react";
import { User, Mail, Building, Key } from "lucide-react";
import axios from "axios";

const ProfileView = ({ employee }) => {
  const [pinCode, setPinCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serviceInfo, setServiceInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Current employee data:", employee); // Debug log

        // Fetch PIN code with error handling
        try {
          const pinResponse = await axios.get(
            `http://localhost:8092/api/employee/${employee.id}/code-pin`,
          );
          if (pinResponse.data) {
            setPinCode(pinResponse.data);
          }
        } catch (pinError) {
          console.log("PIN code not available for this user");
          setPinCode(null);
        }

        // Determine the appropriate API endpoint based on user role
        let serviceEndpoint;
        console.log("Employee role:", employee.role); // Debug log

        // Add employee ID to the endpoint
        if (employee.role === "MANAGER") {
          serviceEndpoint = `http://localhost:8092/api/managers/${employee.id}/service-email`;
        } else if (employee.role === "CHEF_SERVICE") {
          serviceEndpoint = `http://localhost:8092/api/chef-services/${employee.id}/service-email`;
        } else {
          serviceEndpoint = `http://localhost:8092/api/employees/${employee.id}/service-email`;
        }

        console.log("Using service endpoint:", serviceEndpoint); // Debug log

        // Fetch service information with better error handling
        try {
          const serviceResponse = await axios.get(serviceEndpoint);
          console.log("Service response:", serviceResponse.data); // Debug log
          if (serviceResponse.data) {
            setServiceInfo(serviceResponse.data);
          } else {
            console.log("No service data received");
            setServiceInfo(null);
          }
        } catch (serviceError) {
          console.error(
            "Service API error:",
            serviceError.response || serviceError,
          );
          if (serviceError.response) {
            console.error("Error status:", serviceError.response.status);
            console.error("Error data:", serviceError.response.data);
          }
          setServiceInfo(null);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setError("Failed to load profile information");
      } finally {
        setLoading(false);
      }
    };

    if (employee?.id) {
      console.log("Fetching data for employee ID:", employee.id); // Debug log
      fetchData();
    } else {
      console.log("No employee ID available"); // Debug log
    }
  }, [employee?.id]);

  // Add debug log for serviceInfo
  useEffect(() => {
    console.log("Current service info:", serviceInfo);
  }, [serviceInfo]);

  if (!employee) {
    console.log("No employee data available"); // Debug log
    return <div>No employee data available</div>;
  }
  if (loading) return <div>Loading profile information...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Profile Header */}
        <div className="bg-cyan-600 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-full p-3">
              <User size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{employee.name}</h2>
              <p className="text-cyan-100">{employee.email}</p>
              {employee.username && (
                <p className="text-cyan-100">{employee.username}</p>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-cyan-800 mb-4">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {serviceInfo?.email && (
                <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-lg">
                  <Mail className="text-cyan-600" size={20} />
                  <div>
                    <p className="text-sm text-cyan-600">Email</p>
                    <p className="font-medium text-cyan-800">
                      {serviceInfo.email}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-lg">
                <div>
                  <p className="text-sm text-cyan-600">Employee ID</p>
                  <p className="font-medium text-cyan-800">{employee.id}</p>
                </div>
              </div>
              {employee.username && (
                <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-lg">
                  <div>
                    <p className="text-sm text-cyan-600">Username</p>
                    <p className="font-medium text-cyan-800">
                      {employee.username}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Service Information */}
          {/* {serviceInfo ? (
            <div>
              <h3 className="text-lg font-semibold text-cyan-800 mb-4">
                Service Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-lg">
                  <Building className="text-cyan-600" size={20} />
                  <div>
                    <p className="text-sm text-cyan-600">Service</p>
                    <p className="font-medium text-cyan-800">
                      {serviceInfo.service || "Not assigned"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-cyan-600 text-center p-4">
              Service information not available
            </div>
          )} */}

          {/* PIN Code Section - Only show if PIN code is available */}
          {pinCode && (
            <div>
              <h3 className="text-lg font-semibold text-cyan-800 mb-4">
                Security PIN Code
              </h3>
              <div className="flex items-center gap-3 p-4 bg-cyan-50 rounded-lg">
                <Key className="text-cyan-600" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-cyan-600">Your Unique PIN</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-cyan-800">{pinCode}</p>
                    <span className="text-xs text-cyan-600">
                      (Confidential security identifier)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
