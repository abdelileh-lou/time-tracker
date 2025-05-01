import React, { useState, useEffect } from "react";
// import { getEmployees, addEmployee, deleteEmployee } from "../../utils/api";

const ManageEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({ name: "", role: "" });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const data = await getEmployees();
    setEmployees(data);
  };

  const handleAddEmployee = async () => {
    if (newEmployee.name && newEmployee.role) {
      await addEmployee(newEmployee);
      setNewEmployee({ name: "", role: "" });
      fetchEmployees();
    }
  };

  const handleDeleteEmployee = async (id) => {
    await deleteEmployee(id);
    fetchEmployees();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Employees</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Employee Name"
          value={newEmployee.name}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, name: e.target.value })
          }
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Employee Role"
          value={newEmployee.role}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, role: e.target.value })
          }
          className="border p-2 mr-2"
        />
        <button
          onClick={handleAddEmployee}
          className="bg-blue-500 text-white p-2">
          Add Employee
        </button>
      </div>
      <ul>
        {employees.map((employee) => (
          <li
            key={employee.id}
            className="flex justify-between items-center mb-2">
            <span>
              {employee.name} - {employee.role}
            </span>
            <button
              onClick={() => handleDeleteEmployee(employee.id)}
              className="bg-red-500 text-white p-1">
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageEmployees;
