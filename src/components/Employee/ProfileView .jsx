/*
import React from "react";
import { User } from "lucide-react";

const ProfileView = ({ employee }) => {
  if (!employee) return <div>No employee data available</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Mon Profil</h2>

      <div className="space-y-6">
        <div className="flex items-center">
          <div className="bg-gray-200 rounded-full p-6">
            <User size={48} />
          </div>
          <div className="ml-4">
            <h3 className="text-xl font-semibold">{employee.name}</h3>
            <p className="text-gray-600">{employee.role || "Employee"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Informations Personnelles
            </h4>
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <div className="mb-3">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{employee.email}</p>
              </div>
              <div className="mb-3">
                <p className="text-sm text-gray-500">Téléphone</p>
                <p className="font-medium">
                  {employee.phone || "Non renseigné"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Adresse</p>
                <p className="font-medium">
                  {employee.address || "Non renseignée"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Informations Professionnelles
            </h4>
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <div className="mb-3">
                <p className="text-sm text-gray-500">Département</p>
                <p className="font-medium">
                  {employee.department || "Non renseigné"}
                </p>
              </div>
              <div className="mb-3">
                <p className="text-sm text-gray-500">Position</p>
                <p className="font-medium">
                  {employee.position || "Non renseignée"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date d'embauche</p>
                <p className="font-medium">
                  {employee.hireDate
                    ? new Date(employee.hireDate).toLocaleDateString("fr-FR")
                    : "Non renseignée"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfileView;
*/
import React from "react";
import { User } from "lucide-react";

const ProfileView = ({ employee }) => {
  if (!employee) return <div>No employee data available</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Mon Profil</h2>

      <div className="space-y-6">
        <div className="flex items-center">
          <div className="bg-gray-200 rounded-full p-6">
            <User size={48} />
          </div>
          <div className="ml-4">
            <h3 className="text-xl font-semibold">{employee.name}</h3>
            <p className="text-gray-600">{employee.username}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Account Information
            </h4>
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <div className="mb-3">
                <p className="text-sm text-gray-500">Username</p>
                <p className="font-medium">{employee.username}</p>
              </div>
              <div className="mb-3">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{employee.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Action</p>
                <p className="font-medium">
                  {employee.action || "Not specified"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Security
            </h4>
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <div className="mb-3">
                <p className="text-sm text-gray-500">Password</p>
                <p className="font-medium">••••••••</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">User ID</p>
                <p className="font-medium">{employee.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
