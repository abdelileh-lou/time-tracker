// import React, { useState, useEffect } from "react";
// import { User, Calendar, Clock, Settings, Edit, LogOut } from "lucide-react";

// // Main Employee Dashboard Component
// const EmployeeDashboard = () => {
//   const [activeTab, setActiveTab] = useState("planning");
//   const [employee, setEmployee] = useState(null);
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Fetch the current employee data (assuming we have the ID from auth context)
//   useEffect(() => {
//     const employeeId = 1; // This would come from authentication context

//     const fetchEmployeeData = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(
//           `http://localhost:8092/api/employee/${employeeId}`,
//         );

//         if (!response.ok) {
//           throw new Error("Failed to fetch employee data");
//         }

//         const data = await response.json();
//         setEmployee(data);
//         setLoading(false);
//       } catch (err) {
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     fetchEmployeeData();
//   }, []);

//   // Fetch all employees for the planning view
//   useEffect(() => {
//     if (activeTab === "planning") {
//       const fetchAllEmployees = async () => {
//         try {
//           setLoading(true);
//           const response = await fetch("http://localhost:8092/api/employees");

//           if (!response.ok) {
//             throw new Error("Failed to fetch employees");
//           }

//           const data = await response.json();
//           setEmployees(data);
//           setLoading(false);
//         } catch (err) {
//           setError(err.message);
//           setLoading(false);
//         }
//       };

//       fetchAllEmployees();
//     }
//   }, [activeTab]);

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Sidebar */}
//       <div className="w-64 bg-gray-800 text-white">
//         <div className="p-4 text-xl font-bold border-b border-gray-700">
//           Employee Dashboard
//         </div>

//         <div className="p-4">
//           {employee && (
//             <div className="flex items-center mb-6">
//               <div className="bg-gray-600 rounded-full p-2">
//                 <User size={24} />
//               </div>
//               <div className="ml-3">
//                 <div className="font-medium">{employee.name}</div>
//                 <div className="text-sm text-gray-400">{employee.email}</div>
//               </div>
//             </div>
//           )}

//           <nav>
//             <button
//               onClick={() => setActiveTab("planning")}
//               className={`flex items-center w-full p-3 mb-2 rounded ${
//                 activeTab === "planning" ? "bg-gray-700" : "hover:bg-gray-700"
//               }`}>
//               <Calendar size={20} />
//               <span className="ml-3">Consulter Planning</span>
//             </button>

//             <button
//               onClick={() => setActiveTab("pointage")}
//               className={`flex items-center w-full p-3 mb-2 rounded ${
//                 activeTab === "pointage" ? "bg-gray-700" : "hover:bg-gray-700"
//               }`}>
//               <Clock size={20} />
//               <span className="ml-3">Consulter Pointage</span>
//             </button>

//             <div className="mt-6 mb-2 text-sm font-medium text-gray-400 uppercase">
//               Gérer Profile
//             </div>

//             <button
//               onClick={() => setActiveTab("profile")}
//               className={`flex items-center w-full p-3 mb-2 rounded ${
//                 activeTab === "profile" ? "bg-gray-700" : "hover:bg-gray-700"
//               }`}>
//               <User size={20} />
//               <span className="ml-3">Consulter Profile</span>
//             </button>

//             <button
//               onClick={() => setActiveTab("editProfile")}
//               className={`flex items-center w-full p-3 mb-2 rounded ${
//                 activeTab === "editProfile"
//                   ? "bg-gray-700"
//                   : "hover:bg-gray-700"
//               }`}>
//               <Edit size={20} />
//               <span className="ml-3">Modifier Profile</span>
//             </button>
//           </nav>

//           <div className="absolute bottom-4 left-4 right-4">
//             <button className="flex items-center w-full p-3 text-red-400 hover:bg-gray-700 rounded">
//               <LogOut size={20} />
//               <span className="ml-3">Déconnexion</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 overflow-auto">
//         {loading ? (
//           <div className="flex items-center justify-center h-full">
//             <div className="text-lg">Chargement...</div>
//           </div>
//         ) : error ? (
//           <div className="flex items-center justify-center h-full">
//             <div className="text-lg text-red-500">{error}</div>
//           </div>
//         ) : (
//           <div className="p-6">
//             {activeTab === "planning" && <PlanningView employees={employees} />}
//             {activeTab === "pointage" && <PointageView employee={employee} />}
//             {activeTab === "profile" && <ProfileView employee={employee} />}
//             {activeTab === "editProfile" && (
//               <EditProfileView employee={employee} setEmployee={setEmployee} />
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // Planning View - Shows all employees
// const PlanningView = ({ employees }) => {
//   return (
//     <div>
//       <h2 className="text-2xl font-bold mb-6">Planning des Employés</h2>
//       <div className="bg-white shadow rounded-lg overflow-hidden">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 ID
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Nom
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Email
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Nom d'utilisateur
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Action
//               </th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {employees.map((emp) => (
//               <tr key={emp.id}>
//                 <td className="px-6 py-4 whitespace-nowrap">{emp.id}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">{emp.name}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">{emp.email}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">{emp.username}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   {emp.action || "N/A"}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// // Pointage View - Shows work days for the current employee
// const PointageView = ({ employee }) => {
//   // This is a mock data, in a real app you would fetch attendance data from an API
//   const currentMonth = new Date().getMonth();
//   const currentYear = new Date().getFullYear();
//   const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

//   // Mock attendance data - in real app this would come from API
//   const attendanceData = Array.from({ length: daysInMonth }, (_, i) => ({
//     day: i + 1,
//     status: Math.random() > 0.2 ? "present" : "absent",
//     hours: Math.random() > 0.2 ? 7 + Math.floor(Math.random() * 3) : 0,
//   }));

//   return (
//     <div>
//       <h2 className="text-2xl font-bold mb-6">Pointage de {employee.name}</h2>

//       <div className="bg-white shadow rounded-lg overflow-hidden">
//         <div className="p-4 border-b">
//           <h3 className="text-lg font-medium">
//             {new Date(currentYear, currentMonth).toLocaleString("default", {
//               month: "long",
//             })}{" "}
//             {currentYear}
//           </h3>
//         </div>

//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Jour
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Status
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Heures
//               </th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {attendanceData.map((day) => (
//               <tr key={day.day}>
//                 <td className="px-6 py-4 whitespace-nowrap">{day.day}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <span
//                     className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                       day.status === "present"
//                         ? "bg-green-100 text-green-800"
//                         : "bg-red-100 text-red-800"
//                     }`}>
//                     {day.status === "present" ? "Présent" : "Absent"}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   {day.hours} heures
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// // Profile View - Shows employee profile
// const ProfileView = ({ employee }) => {
//   return (
//     <div>
//       <h2 className="text-2xl font-bold mb-6">Profile</h2>

//       <div className="bg-white shadow rounded-lg overflow-hidden">
//         <div className="p-6">
//           <div className="flex items-center justify-center mb-6">
//             <div className="bg-gray-200 rounded-full p-4">
//               <User size={64} />
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="space-y-2">
//               <p className="text-sm text-gray-500">Nom</p>
//               <p className="text-lg font-medium">{employee.name}</p>
//             </div>

//             <div className="space-y-2">
//               <p className="text-sm text-gray-500">Email</p>
//               <p className="text-lg font-medium">{employee.email}</p>
//             </div>

//             <div className="space-y-2">
//               <p className="text-sm text-gray-500">Nom d'utilisateur</p>
//               <p className="text-lg font-medium">{employee.username}</p>
//             </div>

//             <div className="space-y-2">
//               <p className="text-sm text-gray-500">Action</p>
//               <p className="text-lg font-medium">{employee.action || "N/A"}</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Edit Profile View - Edit employee profile
// const EditProfileView = ({ employee, setEmployee }) => {
//   const [formData, setFormData] = useState({
//     name: employee.name,
//     email: employee.email,
//     username: employee.username,
//     password: "",
//   });
//   const [saving, setSaving] = useState(false);
//   const [saveError, setSaveError] = useState(null);
//   const [saveSuccess, setSaveSuccess] = useState(false);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     setSaveError(null);
//     setSaveSuccess(false);

//     try {
//       // In a real app, you would send this to your API
//       // For this example, we'll simulate a successful update
//       await new Promise((resolve) => setTimeout(resolve, 1000));

//       // Update the employee state with new data (in a real app this would come from API response)
//       setEmployee({
//         ...employee,
//         name: formData.name,
//         email: formData.email,
//         username: formData.username,
//         // Note: typically you wouldn't return the password from the API
//       });

//       setSaveSuccess(true);
//     } catch (err) {
//       setSaveError("Failed to update profile. Please try again.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div>
//       <h2 className="text-2xl font-bold mb-6">Modifier Profile</h2>

//       <div className="bg-white shadow rounded-lg overflow-hidden">
//         <form onSubmit={handleSubmit} className="p-6">
//           {saveSuccess && (
//             <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
//               Profile mis à jour avec succès!
//             </div>
//           )}

//           {saveError && (
//             <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
//               {saveError}
//             </div>
//           )}

//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Nom
//             </label>
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>

//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Email
//             </label>
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>

//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Nom d'utilisateur
//             </label>
//             <input
//               type="text"
//               name="username"
//               value={formData.username}
//               onChange={handleChange}
//               className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>

//           <div className="mb-6">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Nouveau mot de passe (laisser vide pour ne pas changer)
//             </label>
//             <input
//               type="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           <div>
//             <button
//               type="submit"
//               className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//               disabled={saving}>
//               {saving ? "Enregistrement..." : "Enregistrer les modifications"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default EmployeeDashboard;

// EmployeeDashboard.js
import React, { useState, useEffect } from "react";
import { User, Calendar, Clock, Settings, Edit, LogOut } from "lucide-react";
import { getUserData, logout } from "../../Auth/auth";
import { useNavigate } from "react-router-dom";
import PlanningView from "./PlanningView ";
import PointageView from "./PointageView ";
import ProfileView from "./ProfileView ";
import EditProfileView from "./EditProfileView ";

const EmployeeDashboard = () => {
  const [activeTab, setActiveTab] = useState("planning");
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  console.log(employee);
  // Get the current employee data from auth
  console.log("Employee data:", employee);
  ///gggggggg
  useEffect(() => {
    const currentUser = getUserData();
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setEmployee(currentUser);
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white">
        <div className="p-4 text-xl font-bold border-b border-gray-700">
          Employee Dashboard
        </div>

        <div className="p-4">
          {employee && (
            <div className="flex items-center mb-6">
              <div className="bg-gray-600 rounded-full p-2">
                <User size={24} />
              </div>
              <div className="ml-3">
                <div className="font-medium">{employee.name}</div>
                <div className="text-sm text-gray-400">{employee.email}</div>
              </div>
            </div>
          )}

          <nav>
            <button
              onClick={() => setActiveTab("planning")}
              className={`flex items-center w-full p-3 mb-2 rounded ${
                activeTab === "planning" ? "bg-gray-700" : "hover:bg-gray-700"
              }`}>
              <Calendar size={20} />
              <span className="ml-3">Mon Planning</span>
            </button>

            <button
              onClick={() => setActiveTab("pointage")}
              className={`flex items-center w-full p-3 mb-2 rounded ${
                activeTab === "pointage" ? "bg-gray-700" : "hover:bg-gray-700"
              }`}>
              <Clock size={20} />
              <span className="ml-3">Mes Pointages</span>
            </button>

            <button
              onClick={() => navigate("/scan-pointage")} // Using navigate instead of setActiveTab since it's a separate page
              className="flex items-center w-full p-3 mb-2 rounded hover:bg-gray-700">
              <Clock size={20} />
              <span className="ml-3">Scanner Pointage</span>
            </button>

            <div className="mt-6 mb-2 text-sm font-medium text-gray-400 uppercase">
              Gérer Profile
            </div>

            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center w-full p-3 mb-2 rounded ${
                activeTab === "profile" ? "bg-gray-700" : "hover:bg-gray-700"
              }`}>
              <User size={20} />
              <span className="ml-3">Consulter Profile</span>
            </button>

            <button
              onClick={() => setActiveTab("editProfile")}
              className={`flex items-center w-full p-3 mb-2 rounded ${
                activeTab === "editProfile"
                  ? "bg-gray-700"
                  : "hover:bg-gray-700"
              }`}>
              <Edit size={20} />
              <span className="ml-3">Modifier Profile</span>
            </button>
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-3 text-red-400 hover:bg-gray-700 rounded">
              <LogOut size={20} />
              <span className="ml-3">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-lg">Chargement...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-lg text-red-500">{error}</div>
          </div>
        ) : (
          <div className="p-6">
            {activeTab === "planning" && <PlanningView employee={employee} />}
            {activeTab === "pointage" && <PointageView employee={employee} />}
            {activeTab === "profile" && <ProfileView employee={employee} />}
            {activeTab === "editProfile" && (
              <EditProfileView employee={employee} setEmployee={setEmployee} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
